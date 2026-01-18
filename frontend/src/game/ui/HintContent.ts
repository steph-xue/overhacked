// src/game/ui/HintContent.ts
import * as Phaser from "phaser";

export default class HintContent {
  private scene: Phaser.Scene;
  private root: Phaser.GameObjects.Container;

  private objects: Phaser.GameObjects.GameObject[] = [];

  private width: number;
  private height: number;

  // Hint state
  private hintTextObj?: Phaser.GameObjects.Text;
  private hintIndex = 0;

  private readonly hints = [
    "Hint 1: Eliminate answers that describe hiding data (encapsulation) or simplifying details (abstraction).",
    "Hint 2: Inheritance is when a class reuses fields/methods from another (like extends in Java).",
  ];

  constructor(args: {
    scene: Phaser.Scene;
    root: Phaser.GameObjects.Container;
    width: number;
    height: number;
  }) {
    this.scene = args.scene;
    this.root = args.root;
    this.width = args.width;
    this.height = args.height;
  }

  mount() {
    const s = this.scene;

    const TOP_OFFSET = 20;

    // Panel background
    const bg = s.add
      .rectangle(0, TOP_OFFSET, this.width, this.height - TOP_OFFSET, 0x000000, 0.06)
      .setOrigin(0, 0);

    const border = s.add
      .rectangle(0, TOP_OFFSET, this.width, this.height - TOP_OFFSET, 0x000000, 0.12)
      .setOrigin(0, 0);

    // Title
    const title = s.add
      .text(this.width / 2, TOP_OFFSET + 12, "Mentor", {
        fontFamily: "Silkscreen",
        fontStyle: "bold",
        fontSize: "40px",
        color: "#4A3F35",
      })
      .setOrigin(0.5, 0);

    // Mentor sprite (animated). Assumes "mentor-idle" exists already.
    const mentorSprite = s.add
      .sprite(this.width / 2, 180, "mentor", 0)
      .setOrigin(0.5, 0.5);

    mentorSprite.play("mentor-idle");

    // Scale to fit panel (use single frame size, not the whole sheet)
    const maxImgW = this.width;
    const maxImgH = this.height;

    const frame0 = s.textures.get("mentor").get(0);
    const fw = frame0?.width ?? 1;
    const fh = frame0?.height ?? 1;

    const imgScale = Math.min(maxImgW / fw, maxImgH / fh);
    mentorSprite.setScale(imgScale);

    // Click prompt underneath mentor
    const clickPrompt = s.add
      .text(this.width / 2, mentorSprite.y + (fh * imgScale) / 2 + 40, "Click me for a hint!", {
        fontFamily: "Silkscreen",
        fontStyle: "bold",
        fontSize: "25px",
        color: "#4A3F35",
        align: "center",
        wordWrap: { width: this.width - 28 },
      })
      .setOrigin(0.5, 0);

    // Hint text (starts empty; appears when mentor is clicked)
    const hint = s.add
      .text(14, this.height - 14, "", {
        fontFamily: "Silkscreen",
        fontSize: "25px",
        color: "#4A3F35",
        wordWrap: { width: this.width - 28 },
      })
      .setOrigin(0, 1);

    this.hintTextObj = hint;

    // Make mentor clickable
    mentorSprite.setInteractive({ useHandCursor: true });
    mentorSprite.on("pointerdown", () => this.showNextHint());

    this.root.add([bg, border, title, mentorSprite, clickPrompt, hint]);
    this.objects.push(bg, border, title, mentorSprite, clickPrompt, hint);
  }

  private showNextHint() {
    if (!this.hintTextObj) return;

    this.hintTextObj.setText(this.hints[this.hintIndex]);

    // alternate 0 -> 1 -> 0 -> 1 ...
    this.hintIndex = (this.hintIndex + 1) % this.hints.length;
  }

  unmount() {
    this.objects.forEach((o) => o.destroy());
    this.objects = [];
    this.hintTextObj = undefined;
    this.hintIndex = 0;
  }
}