// src/game/ui/HintContent.ts
import * as Phaser from "phaser";

export default class HintContent {
  private scene: Phaser.Scene;
  private root: Phaser.GameObjects.Container;

  private objects: Phaser.GameObjects.GameObject[] = [];

  private width: number;
  private height: number;

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

    // Panel background
    const bg = s.add
      .rectangle(0, 0, this.width, this.height, 0x000000, 0.06)
      .setOrigin(0, 0);

    const border = s.add
      .rectangle(0, 0, this.width, this.height, 0x000000, 0.12)
      .setOrigin(0, 0);

    // Title (centered)
    const title = s.add
      .text(this.width / 2, 12, "Mentor", {
        fontFamily: "monospace",
        fontSize: "50px",
        color: "#000000",
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

    // Hint (hard-coded for now)
    const hint = s.add
      .text(14, this.height - 14, "Hint: Try eliminating obviously wrong answers first.", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#000000",
        wordWrap: { width: this.width - 28 },
      })
      .setOrigin(0, 1);

    this.root.add([bg, border, title, mentorSprite, hint]);
    this.objects.push(bg, border, title, mentorSprite, hint);
  }

  unmount() {
    this.objects.forEach((o) => o.destroy());
    this.objects = [];
  }
}