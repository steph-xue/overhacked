import * as Phaser from "phaser";

export default class DragAndDropContents {
  private scene: Phaser.Scene;
  private root: Phaser.GameObjects.Container;
  private contentW: number;

  private objects: Phaser.GameObjects.GameObject[] = [];
  private cardData: { label: string; rect: Phaser.GameObjects.Rectangle; labelObj: Phaser.GameObjects.Text; index: number }[] = [];

  constructor(scene: Phaser.Scene, root: Phaser.GameObjects.Container, contentW: number) {
    this.scene = scene;
    this.root = root;
    this.contentW = contentW;
  }

  mount() {
    const s = this.scene;

    // -------------------------
    // TITLE
    // -------------------------
    const title = s.add.text(0, 0, "Coding Question", {
      fontFamily: "Silkscreen",
      fontStyle: "bold",
      fontSize: "50px",
      color: "#4A3F35",
    });

    const body = s.add.text(0, 80, "Drag the code pieces into correct order.", {
      fontFamily: "Silkscreen",
      fontSize: "24px",
      color: "#4A3F35",
      wordWrap: { width: this.contentW },
    });

    this.root.add(title);
    this.root.add(body);
    this.objects.push(title, body);

    // -------------------------
    // SUBMIT BUTTON
    // -------------------------
    const submitY = 800;
    const submitRect = s.add
      .rectangle(400, submitY, 250, 80, 0x000000, 0.14)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const submitText = s.add
      .text(400, submitY, "Submit", {
        fontFamily: "Silkscreen",
        fontStyle: "bold",
        fontSize: "20px",
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
    // CARDS
    // -------------------------
    const cards = [
      { label: "Array", color: 0x88cc88 },
      { label: "HashMap", color: 0x88aacc },
      { label: "LinkedList", color: 0xcc88aa },
      { label: "Stack", color: 0xccaa88 },
      { label: "Queue", color: 0xaa88cc },
    ];

    const cardW = 800;
    const cardH = 110;
    const cardGap = 10;
    const cardStartX = 0;
    const cardStartY = 130;

    cards.forEach((card, i) => {
      const x = cardStartX;
      const y = cardStartY + i * (cardH + cardGap);

      const rect = s.add
        .rectangle(x, y, cardW, cardH, card.color, 1)
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true, draggable: true });

      const label = s.add.text(x + cardW / 2, y + cardH / 2, card.label, {
        fontFamily: "Silkscreen",
        fontSize: "16px",
        color: "#000000",
      }).setOrigin(0.5);

      s.input.setDraggable(rect);

      const cardInfo = { label: card.label, rect, labelObj: label, index: i };
      this.cardData.push(cardInfo);

      rect.on("drag", (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        rect.x = cardStartX;
        rect.y = dragY;
        label.setPosition(cardStartX + cardW / 2, dragY + cardH / 2);
      });

      rect.on("dragend", () => {
        this.reorderCards(cardStartY, cardH, cardGap, cardStartX, cardW);
      });

      this.root.add(rect);
      this.root.add(label);
      this.objects.push(rect, label);
    });
  }

  private reorderCards(startY: number, cardH: number, cardGap: number, startX: number, cardW: number) {
    // Sort by current Y position
    this.cardData.sort((a, b) => a.rect.y - b.rect.y);

    // Snap each card to its new slot
    this.cardData.forEach((card, i) => {
      const newY = startY + i * (cardH + cardGap);
      card.rect.y = newY;
      card.labelObj.setPosition(startX + cardW / 2, newY + cardH / 2);
      card.index = i;
    });
  }

  getFinalOrder(): string[] {
    return this.cardData.map(c => c.label);
  }

  private submit() {
    const finalOrder = this.getFinalOrder();
    console.log("Submitted order:", finalOrder);
  }

  unmount() {
    this.objects.forEach((obj) => obj.destroy());
    this.objects = [];
    this.cardData = [];
  }
}