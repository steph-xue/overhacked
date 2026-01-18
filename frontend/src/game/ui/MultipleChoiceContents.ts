// src/game/ui/MultipleChoiceContents.ts
import * as Phaser from "phaser";
import { useNpcStore } from "@/stores/useNpcStore";

type QuestionData = {
  question: string;
  choices: string[];
  answer: number;
  hints?: string[];
};

export default class MultipleChoiceContents {
  private scene: Phaser.Scene;
  private root: Phaser.GameObjects.Container;
  private contentW: number;

  private objects: Phaser.GameObjects.GameObject[] = [];
  private optionRects: Phaser.GameObjects.Rectangle[] = [];
  private optionTexts: Phaser.GameObjects.Text[] = [];

  private selectedIndex: number | null = null;
  private correctIndex = 0;
  private submitted = false;

  private submitRect?: Phaser.GameObjects.Rectangle;
  private submitText?: Phaser.GameObjects.Text;

  private onAnswered: (correct: boolean) => void;
  

  constructor(
    scene: Phaser.Scene,
    root: Phaser.GameObjects.Container,
    contentW: number,
    onAnswered: (correct: boolean) => void
    ) {
    this.scene = scene;
    this.root = root;
    this.contentW = contentW;
    this.onAnswered = onAnswered;
    }


  mount() {
    const s = this.scene;

    // -------------------------
    // DATA SOURCE (API or fallback)
    // -------------------------
    const { data, loading, error } = useNpcStore.getState();

    const fallback: QuestionData = {
      question: "Which OOP principle allows a class to inherit behavior from another class?",
      choices: [
        "Encapsulation",
        "Abstraction",
        "Inheritance",
        "Polymorphism",
      ],
      answer: 3,
    };

    if (loading) {
      const txt = s.add.text(0, 0, "Loading question...", {
        fontFamily: "Silkscreen",
        fontSize: "32px",
        color: "#4A3F35",
      });
      this.root.add(txt);
      this.objects.push(txt);
      return;
    }

    const questionData: QuestionData = error || !data ? fallback : data;

    const { question, choices, answer } = questionData;
    this.correctIndex = Phaser.Math.Clamp(answer - 1, 0, choices.length - 1);

    // -------------------------
    // QUESTION TITLE + TEXT
    // -------------------------
    const title = s.add.text(0, 0, "Question", {
      fontFamily: "Silkscreen",
      fontStyle: "bold",
      fontSize: "50px",
      color: "#4A3F35",
    });

    const q = s.add.text(0, 100, question, {
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
    const startY = 270;
    const gap = 100;

    choices.forEach((label, i) => {
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
        if (this.submitted || this.selectedIndex === i) return;
        rect.setFillStyle(0x000000, 0.12);
      });

      rect.on("pointerout", () => {
        if (this.submitted || this.selectedIndex === i) return;
        rect.setFillStyle(0x000000, 0.08);
      });

      rect.on("pointerdown", () => {
        if (this.submitted) return;
        this.select(i);
      });

      this.root.add(rect);
      this.root.add(txt);

      this.optionRects.push(rect);
      this.optionTexts.push(txt);
      this.objects.push(rect, txt);
    });

    // -------------------------
    // SUBMIT BUTTON
    // -------------------------
    const submitY = startY + choices.length * gap + 40;

    this.submitRect = s.add
      .rectangle(this.contentW / 2, submitY, 320, 76, 0x000000, 0.14)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.submitText = s.add
      .text(this.contentW / 2, submitY, "Submit", {
        fontFamily: "Silkscreen",
        fontStyle: "bold",
        fontSize: "28px",
        color: "#4A3F35",
      })
      .setOrigin(0.5);

    this.submitRect.on("pointerover", () => {
      if (!this.submitted) this.submitRect?.setFillStyle(0x000000, 0.2);
    });

    this.submitRect.on("pointerout", () => {
      if (!this.submitted) this.submitRect?.setFillStyle(0x000000, 0.14);
    });

    this.submitRect.on("pointerdown", () => {
      if (!this.submitted) this.submit();
    });

    this.root.add(this.submitRect);
    this.root.add(this.submitText);
    this.objects.push(this.submitRect, this.submitText);
  }

  unmount() {
    this.objects.forEach((o) => o.destroy());
    this.objects = [];
    this.optionRects = [];
    this.optionTexts = [];
    this.selectedIndex = null;
    this.submitted = false;
  }

  private select(i: number) {
    this.selectedIndex = i;

    this.optionRects.forEach((r) => r.setFillStyle(0x000000, 0.08));
    this.optionRects[i].setFillStyle(0x000000, 0.25);
  }

  private submit() {
    if (this.selectedIndex === null) return;

    this.submitted = true;
    this.submitRect?.disableInteractive();

    const GREEN = 0x668c69;
    const RED = 0xb34747;

    // Reset visuals
    this.optionRects.forEach((r) => r.setFillStyle(0x000000, 0.08));
    this.optionTexts.forEach((t) => t.setColor("#4A3F35"));

    const isCorrect = this.selectedIndex === this.correctIndex;

    // Always highlight correct
    this.optionRects[this.correctIndex].setFillStyle(GREEN, 0.35);
    this.optionTexts[this.correctIndex].setColor("#FFFFFF");

    // Highlight wrong only if incorrect
    if (!isCorrect) {
        this.optionRects[this.selectedIndex].setFillStyle(RED, 0.35);
        this.optionTexts[this.selectedIndex].setColor("#FFFFFF");
    }

    this.onAnswered(isCorrect);
    }
}