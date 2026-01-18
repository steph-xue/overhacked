import * as Phaser from "phaser";
import { useCodingQuizStore } from "@/stores/useCodingQuizStore";

export default class DragAndDropContents {
  private scene: Phaser.Scene;
  private root: Phaser.GameObjects.Container;
  private contentW: number;

  private objects: Phaser.GameObjects.GameObject[] = [];
  private cardData: {
    label: string;
    rect: Phaser.GameObjects.Rectangle;
    inDropZone: boolean;
  }[] = [];

  // constructor(
  //   scene: Phaser.Scene,
  //   root: Phaser.GameObjects.Container,
  //   contentW: number
  // ) {
  //   this.scene = scene;
  //   this.root = root;
  //   this.contentW = contentW;
  // }



  private onAnswer?: (isCorrect: boolean) => void;

  constructor(
    scene: Phaser.Scene,
    root: Phaser.GameObjects.Container,
    contentW: number,
    onAnswer?: (isCorrect: boolean) => void
  ) {
    this.scene = scene;
    this.root = root;
    this.contentW = contentW;
    this.onAnswer = onAnswer;
  }

  mount() {
    const s = this.scene;

    const { data, loading, error } = useCodingQuizStore.getState();
    if (loading || !data) {
      const txt = s.add.text(0, 0, "Loading question...", {
        fontFamily: "Silkscreen",
        fontSize: "32px",
        color: "#4A3F35",
      });

      this.root.add(txt);
      this.objects.push(txt);
      return;
    }
    if (error) {
      const txt = s.add.text(0, 0, "Failed to load question", {
        fontFamily: "Silkscreen",
        fontSize: "32px",
        color: "#B00020",
      });

      this.root.add(txt);
      this.objects.push(txt);
      return;
    }

    const { question, answer } = data;

    // -------------------------
    // TITLE
    // -------------------------
    const title = s.add.text(0, 0, "Drag and Drop", {
      fontFamily: "Silkscreen",
      fontStyle: "bold",
      fontSize: "50px",
      color: "#4A3F35",
    });

    const body = s.add.text(
      0,
      80,
      question || "Drag cards from left to right.",
      {
        fontFamily: "Silkscreen",
        fontSize: "24px",
        color: "#4A3F35",
        wordWrap: { width: this.contentW },
      }
    );

    this.root.add(title);
    this.root.add(body);
    this.objects.push(title, body);

    // -------------------------
    // AREAS (side-by-side layout: left = start, right = destination)
    // -------------------------
    const startX = 25; // left column
    const startY = 200;

    const destX = 525; // right column
    const destY = startY;
    const areaW = 500;
    const areaH = 600;

    // Destination area
    const destArea = s.add
      .rectangle(destX, destY, areaW, areaH, 0x000000, 0.08)
      .setOrigin(0, 0);

    const destLabel = s.add
      .text(destX + 10, destY + 10, "DROP HERE", {
        fontFamily: "Silkscreen",
        fontSize: "18px",
        color: "#4A3F35",
      })
      .setOrigin(0, 0);

    this.root.add(destArea);
    this.root.add(destLabel);
    this.objects.push(destArea, destLabel);

    // -------------------------
    // SUBMIT BUTTON
    // -------------------------
    const submitY = destY + areaH + 30;
    const submitRect = s.add
      .rectangle(destX + areaW / 2, submitY, 250, 76, 0x000000, 0.14)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const submitText = s.add
      .text(destX + areaW / 2, submitY, "Submit", {
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

    // -------------------------
    // CARDS (vertical stack on the left)
    // -------------------------
    const originalCards = answer.map((label: string) => {
      // generate a pale color
      const r = 200 + Math.floor(Math.random() * 56); // 200-255
      const g = 200 + Math.floor(Math.random() * 56); // 200-255
      const b = 200 + Math.floor(Math.random() * 56); // 200-255

      const color = (r << 16) + (g << 8) + b; // convert RGB to hex number

      return { label, color };
    });

    const cards = this.shuffleArray(originalCards);

    const cardW = 450;
    const cardH = 30;
    const cardGap = 10;

    cards.forEach((card, i) => {
      const x = startX;
      const y = startY + i * (cardH + cardGap);

      const rect = s.add
        .rectangle(x, y, cardW, cardH, card.color, 1)
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true, draggable: true });

      const paddingX = 12;

      const label = s.add
        .text(x + paddingX, y + cardH / 2, card.label, {
          fontFamily: "Silkscreen",
          fontSize: "14px",
          color: "#000000",
        })
        .setOrigin(0, 0.5); // left, vertical center

      const originalX = x;
      const originalY = y;
      const cardInfo = { label: card.label, rect, inDropZone: false };
      this.cardData.push(cardInfo);

      rect.on("drag", (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        rect.x = dragX;
        rect.y = dragY;

        label.setPosition(rect.x + paddingX, rect.y + cardH / 2);
      });

      rect.on("dragend", () => {
        const cardCenterX = rect.x + cardW / 2;
        const cardCenterY = rect.y + cardH / 2;

        if (
          cardCenterX > destX &&
          cardCenterX < destX + areaW &&
          cardCenterY > destY &&
          cardCenterY < destY + areaH
        ) {
          cardInfo.inDropZone = true;
        } else {
          // Snap back
          rect.x = originalX;
          rect.y = originalY;
          label.setPosition(originalX + paddingX, originalY + cardH / 2);
          cardInfo.inDropZone = false;
        }
      });

      this.root.add(rect);
      this.root.add(label);
      this.objects.push(rect, label);
    });
  }

  getFinalOrder(): string[] {
    const sorted = [...this.cardData]
      .filter((c) => c.inDropZone)
      .sort((a, b) => a.rect.y - b.rect.y)
      .map((c) => c.label);

    return sorted;
  }

  private submit() {
    const finalOrder = this.getFinalOrder();
    console.log("Submitted order:", finalOrder);
    const { data } = useCodingQuizStore.getState();
    if (!data) {
      this.onAnswer?.(false)
      console.log("No quiz data available");
      return;
    }

    if (finalOrder.length === 0) {
      console.log("No cards in drop zone!");
    } else if (finalOrder.length < this.cardData.length) {
      console.log("Not all cards placed!");
    } else {
      const isCorrect = this.isCorrectOrder(finalOrder, data.answer);
      this.onAnswer?.(isCorrect);
      console.log("All cards submitted!");
      if (isCorrect) {
        console.log("Correct order!");
      } else {
        console.log("Incorrect order.");
      }
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private isCorrectOrder(submitted: string[], correct: string[]): boolean {
    if (submitted.length !== correct.length) return false;

    return submitted.every((value, index) => value === correct[index]);
  }

  unmount() {
    this.objects.forEach((obj) => obj.destroy());
    this.objects = [];
    this.cardData = [];
  }
}
