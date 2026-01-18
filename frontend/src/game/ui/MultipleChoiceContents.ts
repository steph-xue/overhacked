// src/game/ui/MultipleChoiceContents.ts
import * as Phaser from "phaser";

export default class MultipleChoiceContents {
  private scene: Phaser.Scene;
  private root: Phaser.GameObjects.Container;
  private contentW: number;

  private objects: Phaser.GameObjects.GameObject[] = [];
  private optionRects: Phaser.GameObjects.Rectangle[] = [];
  private selectedIndex: number | null = null;

  // hard-coded correct answer for now (Inheritance)
  private readonly correctIndex = 2;

  constructor(scene: Phaser.Scene, root: Phaser.GameObjects.Container, contentW: number) {
    this.scene = scene;
    this.root = root;
    this.contentW = contentW;
  }

  mount() {
    const s = this.scene;

    // -------------------------
    // QUESTION TITLE + TEXT
    // -------------------------
    const questionTitle = "Question";
    const questionText =
      "Which OOP principle allows a class to inherit behavior from another class?";

    const title = s.add.text(0, 0, questionTitle, {
      fontFamily: "Silkscreen",
      fontStyle: "bold",
      fontSize: "50px",
      color: "#4A3F35",
    });

    const q = s.add.text(0, 100, questionText, {
      fontFamily: "Silkscreen",
      fontSize: "30px",
      color: "#4A3F35",
      wordWrap: { width: this.contentW },
    });

    this.root.add(title);
    this.root.add(q);
    this.objects.push(title, q);

    // -------------------------
    // ANSWERS
    // -------------------------
    const answers = ["Encapsulation", "Abstraction", "Inheritance", "Polymorphism"];

    const startY = 270;
    const gap = 100;

    answers.forEach((label, i) => {
      const y = startY + i * gap;

      const rect = s.add
        .rectangle(0, y, this.contentW, 70, 0x000000, 0.08)
        .setOrigin(0, 0.5)
        .setInteractive({ useHandCursor: true });

      const txt = s.add
        .text(14, y, label, {
          fontFamily: "Silkscreen",
          fontSize: "25px",
          color: "#4A3F35",
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

    // -------------------------
    // SUBMIT BUTTON (MAIN PANEL)
    // -------------------------
    const submitY = startY + answers.length * gap + 40;

    const submitRect = s.add
      .rectangle(this.contentW / 2, submitY, 320, 76, 0x000000, 0.14)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const submitText = s.add
      .text(this.contentW / 2, submitY, "Submit", {
        fontFamily: "Silkscreen",
        fontStyle: "bold",
        fontSize: "28px",
        color: "#4A3F35",
      })
      .setOrigin(0.5);

    submitRect.on("pointerover", () => submitRect.setFillStyle(0x000000, 0.2));
    submitRect.on("pointerout", () => submitRect.setFillStyle(0x000000, 0.14));
    submitRect.on("pointerdown", () => this.submit());

    this.root.add(submitRect);
    this.root.add(submitText);
    this.objects.push(submitRect, submitText);
  }

  unmount() {
    this.objects.forEach((o) => o.destroy());
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

  private submit() {
    if (this.selectedIndex === null) {
      console.log("No answer selected");
      return;
    }

    const isCorrect = this.selectedIndex === this.correctIndex;
    console.log("Submitted:", this.selectedIndex, "Correct?", isCorrect);

    // later: show feedback, notify Dialog, close dialog, etc.
  }
}