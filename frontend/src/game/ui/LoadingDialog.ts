// src/game/ui/LoadingDialog.ts
import * as Phaser from "phaser";

export default class LoadingDialog {
  private root!: Phaser.GameObjects.Container;
  private loadingText!: Phaser.GameObjects.Text;
  private dotTimer!: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene) {
    const W = 550;
    const H = 250;

    const cx = scene.scale.width / 2;
    const cy = scene.scale.height / 2;

    // Root container
    this.root = scene.add.container(cx, cy).setDepth(10_000);

    // -------------------------
    // Dim overlay
    // -------------------------
    const overlay = scene.add
      .rectangle(
        0,
        0,
        scene.scale.width,
        scene.scale.height,
        0x000000,
        0.35
      )
      .setOrigin(0.5);

    // -------------------------
    // Panel (flat rectangle)
    // -------------------------
    const panel = scene.add.rectangle(0, 0, W, H, 0xf3e9d9);

    // -------------------------
    // Animated "Loading..." text
    // -------------------------
    this.loadingText = scene.add
      .text(0, -40, "Loading", {
        fontFamily: "Silkscreen, monospace",
        fontSize: "50px",
        color: "#4A3F35",
      })
      .setOrigin(0.5)
      .setResolution(2);

    // Subtitle (static)
    const subtitle = scene.add
      .text(0, 45, "Preparing your minigame", {
        fontFamily: "Silkscreen, monospace",
        fontSize: "30px",
        color: "#4A3F35",
      })
      .setOrigin(0.5)
      .setResolution(2);

    this.root.add([overlay, panel, this.loadingText, subtitle]);

    // -------------------------
    // Animate dots: Loading → Loading...
    // -------------------------
    let dots = 0;
    this.dotTimer = scene.time.addEvent({
      delay: 450,
      loop: true,
      callback: () => {
        dots = (dots + 1) % 4;
        this.loadingText.setText("Loading" + ".".repeat(dots));
      },
    });

    // -------------------------
    // Fade in
    // -------------------------
    this.root.setAlpha(0);
    scene.tweens.add({
      targets: this.root,
      alpha: 1,
      duration: 140,
      ease: "Linear",
    });
  }

  destroy() {
    this.dotTimer?.remove(false);
    this.root.destroy(true);
  }
}