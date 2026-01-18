import * as Phaser from "phaser";

export default class MentorGuide {
  private scene: Phaser.Scene;
  private root!: Phaser.GameObjects.Container;
  private objects: Phaser.GameObjects.GameObject[] = [];

  private onResizeBound = () => this.reposition();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  show(args: { message: string; durationMs?: number }) {
    const s = this.scene;

    // If already shown, remove first
    this.hide();

    const { width, height } = s.scale;

    const W = Math.min(520, Math.floor(width * 0.42));
    const H = 180;
    const PAD = 12;
    const R = 14;

    // Root container
    this.root = s.add.container(0, 0).setDepth(18000);

    // -------------------------
    // Panel (rounded)
    // -------------------------
    const panel = s.add.graphics();
    panel.fillStyle(0xf3e9d9, 1);
    panel.fillRoundedRect(0, 0, W, H, R);

    const border = s.add.graphics();
    border.lineStyle(3, 0x614f3f, 1);
    border.strokeRoundedRect(0, 0, W, H, R);

    // -------------------------
    // Mentor sprite
    // -------------------------
    const mentor = s.add
        .sprite(PAD + 50, H - 40, "mentor", 0)
        .setOrigin(0.5, 1);

    mentor.play("mentor-idle");
    mentor.setScale(5.2);

    // -------------------------
    // Message text
    // -------------------------
    const text = s.add.text(PAD + 110, PAD + 10, args.message, {
      fontFamily: "Silkscreen",
      fontSize: "18px",
      color: "#4A3F35",
      wordWrap: { width: W - (PAD + 90) - PAD },
      lineSpacing: 6,
    });

    // -------------------------
    // Click-to-dismiss hit area
    // -------------------------
    const hit = s.add
      .rectangle(0, 0, W, H, 0x000000, 0.001)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });

    hit.on("pointerdown", () => this.hide());

    // Add to container
    this.root.add([panel, border, mentor, text, hit]);
    this.objects.push(panel, border, mentor, text, hit);

    // Start slightly offscreen and pop up
    this.reposition(true);

    s.tweens.add({
      targets: this.root,
      y: this.root.y - 16,
      duration: 220,
      ease: "Back.Out",
    });

    // Auto-hide
    const duration = args.durationMs ?? 5200;
    s.time.delayedCall(duration, () => this.hide());

    // Reposition on resize
    s.scale.on("resize", this.onResizeBound);
  }

  hide() {
    if (!this.root) return;

    const s = this.scene;
    s.scale.off("resize", this.onResizeBound);

    s.tweens.add({
      targets: this.root,
      alpha: 0,
      y: this.root.y + 10,
      duration: 180,
      ease: "Quad.In",
      onComplete: () => {
        this.objects.forEach((o) => o.destroy());
        this.objects = [];
        this.root.destroy();
        // @ts-expect-error intentional clear
        this.root = undefined;
      },
    });
  }

  private reposition(startOffscreen = false) {
    if (!this.root) return;

    const { width, height } = this.scene.scale;
    const margin = 12;

    const W = Math.min(520, Math.floor(width * 0.42));
    const H = 140;

    const x = width - W - margin;
    const Y_OFFSET = 50; 
    const y = height - H - margin - Y_OFFSET + (startOffscreen ? 16 : 0);


    this.root.setPosition(x, y);
    this.root.setAlpha(1);
  }
}