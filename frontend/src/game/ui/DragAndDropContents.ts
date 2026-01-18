import * as Phaser from "phaser";

export default class DragAndDropContents {
  private scene: Phaser.Scene;
  private root: Phaser.GameObjects.Container;
  private contentW: number;

  private objects: Phaser.GameObjects.GameObject[] = [];
  private cardData: { label: string; rect: Phaser.GameObjects.Rectangle; inDropZone: boolean }[] = [];

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
    const title = s.add.text(0, 0, "Drag and Drop", {
      fontFamily: "Silkscreen",
      fontStyle: "bold",
      fontSize: "50px",
      color: "#4A3F35",
    });

    const body = s.add.text(0, 80, "Drag cards from top to bottom.", {
      fontFamily: "Silkscreen",
      fontSize: "24px",
      color: "#4A3F35",
      wordWrap: { width: this.contentW },
    });

    this.root.add(title);
    this.root.add(body);
    this.objects.push(title, body);

    // -------------------------
    // AREAS (vertical layout: top = start, bottom = destination)
    // -------------------------
    const areaX = 0;
    const areaW = 1000;
    const areaH = 300;
    const areaGap = 30;

    // Starting area (top)
    const startX = 0;
    const startY = 130;
 
    // Destination area (bottom)
    const destY = startY + areaH + areaGap;
    const destArea = s.add
      .rectangle(areaX, destY, areaW, areaH, 0x000000, 0.08)
      .setOrigin(0, 0);

    const destLabel = s.add.text(areaX + 15, destY + 10, "DROP HERE", {
      fontFamily: "Silkscreen",
      fontSize: "18px",
      color: "#4A3F35",
    }).setOrigin(0, 0);
   
    this.root.add(destArea);
    this.root.add(destLabel);
    this.objects.push(destArea, destLabel);

    // -------------------------
    // SUBMIT BUTTON
    // -------------------------
    const submitY = destY + areaH + 30;
    const submitRect = s.add
      .rectangle(areaW / 2, submitY, 250, 76, 0x000000, 0.14)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const submitText = s.add
      .text(areaW / 2, submitY, "Submit", {
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
    // CARDS (horizontal row in start area, drag vertically)
    // -------------------------
    const cards = [
      { label: "Array", color: 0x88cc88 },
      { label: "HashMap", color: 0x88aacc },
      { label: "LinkedList", color: 0xcc88aa },
      { label: "Stack", color: 0xccaa88 },
      { label: "Queue", color: 0xaa88cc },
    ];

    const cardW = 1000;
    const cardH = 50;
    const cardGap = 10;
    const cardStartX = startX;
    const cardStartY = startY;

    cards.forEach((card, i) => {
      const x = cardStartX;
      const y = cardStartY + i * (cardH + cardGap);

      const rect = s.add
        .rectangle(x, y, cardW, cardH, card.color, 1)
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true, draggable: true });

      const label = s.add.text(x + cardW / 2, y + cardH / 2, card.label, {
        fontFamily: "Silkscreen",
        fontSize: "14px",
        color: "#000000",
      }).setOrigin(0.5);

      s.input.setDraggable(rect);

      const originalX = x;
      const originalY = y;
      const cardInfo = { label: card.label, rect, inDropZone: false };
      this.cardData.push(cardInfo);

      rect.on("drag", (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        // Only vertical movement
        rect.x = originalX;
        rect.y = dragY;
        label.setPosition(originalX + cardW / 2, dragY + cardH / 2);
      });

      rect.on("dragend", () => {
        const cardCenterY = rect.y + cardH / 2;

        if (cardCenterY > destY && cardCenterY < destY + areaH) {
          cardInfo.inDropZone = true;
        } else {
          // Snap back to original position
          rect.y = originalY;
          label.setPosition(originalX + cardW / 2, originalY + cardH / 2);
          cardInfo.inDropZone = false;
        }
      });

      this.root.add(rect);
      this.root.add(label);
      this.objects.push(rect, label);
    });
  }

  getFinalOrder(): string[] {
    // Returns cards in drop zone sorted by Y position (top to bottom)
    const sorted = [...this.cardData]
      .filter(c => c.inDropZone)
      .sort((a, b) => a.rect.y - b.rect.y)
      .map(c => c.label);
    
    return sorted;
  }

  private submit() {
    const finalOrder = this.getFinalOrder();
    console.log("Submitted order:", finalOrder);
    
    // You can add validation logic here
    if (finalOrder.length === 0) {
      console.log("No cards in drop zone!");
    } else if (finalOrder.length < this.cardData.length) {
      console.log("Not all cards placed!");
    } else {
      console.log("All cards submitted!");
    }
  }

  unmount() {
    this.objects.forEach((obj) => obj.destroy());
    this.objects = [];
    this.cardData = [];
  }
}