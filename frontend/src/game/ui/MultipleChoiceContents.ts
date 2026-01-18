// src/game/ui/MultipleChoiceContents.ts
import * as Phaser from "phaser";

export default class MultipleChoiceContents {
  private scene: Phaser.Scene;
  private root: Phaser.GameObjects.Container;
  private contentW: number;

  private objects: Phaser.GameObjects.GameObject[] = [];
  private optionRects: Phaser.GameObjects.Rectangle[] = [];
  private selectedIndex: number | null = null;

  constructor(scene: Phaser.Scene, root: Phaser.GameObjects.Container, contentW: number) {
    this.scene = scene;
    this.root = root;
    this.contentW = contentW;
  }

  mount() {
    const s = this.scene;

    const questionText = "Question";
    const answers = ["Answer1", "Answer2", "Answer3", "Answer4"];

    const q = s.add.text(0, 0, questionText, {
      fontFamily: "monospace",
      fontSize: "20px",
      color: "#000000",
      wordWrap: { width: this.contentW },
    });

    this.root.add(q);
    this.objects.push(q);

    const startY = 70;
    const gap = 46;

    answers.forEach((label, i) => {
      const y = startY + i * gap;

      const rect = s.add
        .rectangle(0, y, this.contentW, 34, 0x000000, 0.08)
        .setOrigin(0, 0.5)
        .setInteractive({ useHandCursor: true });

      const txt = s.add
        .text(14, y, label, {
          fontFamily: "monospace",
          fontSize: "18px",
          color: "#000000",
        })
        .setOrigin(0, 0.5);

      rect.on("pointerover", () => {
        if (this.selectedIndex !== i) rect.setFillStyle(0x000000, 0.12);
      });

      rect.on("pointerout", () => {
        if (this.selectedIndex !== i) rect.setFillStyle(0x000000, 0.08);
      });

      rect.on("pointerdown", () => this.select(i));

      this.root.add(rect);
      this.root.add(txt);

      this.optionRects.push(rect);
      this.objects.push(rect, txt);
    });
  }

  unmount() {
    this.objects.forEach((o) => {
        o.destroy();
    });

    this.objects = [];
    this.optionRects = [];
    this.selectedIndex = null;
  }

  private select(i: number) {
    this.selectedIndex = i;

    for (const r of this.optionRects) {
      r.setFillStyle(0x000000, 0.08);
    }
    this.optionRects[i].setFillStyle(0x000000, 0.25);

    console.log("Selected answer:", i);
  }
}