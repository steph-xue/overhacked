// src/game/ui/WinningDialog.ts
import * as Phaser from "phaser";

export default class WinningDialog {
  private scene: Phaser.Scene;
  private root!: Phaser.GameObjects.Container;

  private objects: Phaser.GameObjects.GameObject[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  mount(args?: { onPlayAgain?: () => void; onQuit?: () => void }) {
    const s = this.scene;
    const { width, height } = s.scale;

    // Root container centered
    this.root = s.add.container(width / 2, height / 2).setDepth(20000);

    const PANEL_W = Math.floor(width * 0.65);
    const PANEL_H = Math.floor(height * 0.45);
    const RADIUS = 18;

    // Overlay (blocks clicks behind)
    const overlay = s.add
      .rectangle(-width / 2, -height / 2, width, height, 0x000000, 0.55)
      .setOrigin(0, 0)
      .setInteractive();

    // Panel
    const panel = s.add.graphics();
    panel.fillStyle(0xf3e9d9, 1);
    panel.fillRoundedRect(-PANEL_W / 2, -PANEL_H / 2, PANEL_W, PANEL_H, RADIUS);

    const border = s.add.graphics();
    border.lineStyle(4, 0x614f3f, 1);
    border.strokeRoundedRect(
      -PANEL_W / 2,
      -PANEL_H / 2,
      PANEL_W,
      PANEL_H,
      RADIUS
    );

    // Text
    const title = s.add
      .text(0, -PANEL_H / 2 + 80, "Congrats!", {
        fontFamily: "Silkscreen",
        fontStyle: "bold",
        fontSize: "80px",
        color: "#4A3F35",
      })
      .setOrigin(0.5)
      .setResolution(2);

    const subtitle = s.add
      .text(0, -PANEL_H / 2 + 180, "You Won!", {
        fontFamily: "Silkscreen",
        fontSize: "50px",
        color: "#4A3F35",
      })
      .setOrigin(0.5)
      .setResolution(2);

    // Add base pieces first
    this.root.add([overlay, panel, border, title, subtitle]);
    this.objects.push(overlay, panel, border, title, subtitle);

    // Buttons
    const BUTTON_W = 260;
    const BUTTON_H = 70;
    const BUTTON_Y = PANEL_H / 2 - 90;
    const GAP = 34;

    const createButton = (x: number, label: string, onClick: () => void) => {
      const rect = s.add
        .rectangle(x, BUTTON_Y, BUTTON_W, BUTTON_H, 0x000000, 0.12)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      const txt = s.add
        .text(x, BUTTON_Y, label, {
          fontFamily: "Silkscreen",
          fontStyle: "bold",
          fontSize: "28px",
          color: "#4A3F35",
        })
        .setOrigin(0.5)
        .setResolution(2);

      rect.on("pointerover", () => rect.setFillStyle(0x000000, 0.18));
      rect.on("pointerout", () => rect.setFillStyle(0x000000, 0.12));
      rect.on("pointerdown", () => onClick());

      this.root.add([rect, txt]);
      this.objects.push(rect, txt);
    };

    createButton(-(BUTTON_W / 2 + GAP / 2), "Play Again", () =>
      args?.onPlayAgain?.()
    );
    createButton(BUTTON_W / 2 + GAP / 2, "Quit", () => args?.onQuit?.());

    // Keep centered on resize
    s.scale.on("resize", this.onResize, this);
  }

  unmount() {
    this.scene.scale.off("resize", this.onResize, this);

    this.objects.forEach((o) => o.destroy());
    this.objects = [];

    this.root?.destroy();
  }

  private onResize() {
    const { width, height } = this.scene.scale;
    if (this.root) this.root.setPosition(width / 2, height / 2);
  }
}