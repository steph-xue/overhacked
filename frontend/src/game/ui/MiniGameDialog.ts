// src/game/ui/Dialog.ts
import * as Phaser from "phaser";
import MultipleChoiceContents2 from "./MultipleChoiceContents2";
import DragAndDropContents from "./DragAndDropContents";
import HintContent from "./HintContent";
import { useCodingQuizStore } from "@/stores/useCodingQuizStore";
import type { MCQItem } from "@/stores/useMCStore";

type DialogPayload = {
  quiz?: MCQItem;
  hints?: string[];
};

export type DialogContentType = "multipleChoice" | "dragAndDrop";

/**
 * Dialog shell:
 * - 90% of screen, centered
 * - Close button (X) ONLY (no keyboard close)
 * - Two-column layout:
 *   - Left = main content (ratio)
 *   - Right = hint content (remaining width)
 */
export default class MiniGameDialog {
  private scene: Phaser.Scene;

  private ui!: Phaser.GameObjects.Container;

  // Left main area root
  private mainRoot!: Phaser.GameObjects.Container;

  // Right hint area root
  private hintRoot!: Phaser.GameObjects.Container;

  // Dialog size
  private panelW: number;
  private panelH: number;

  // Layout constants
  private readonly PAD = 24;
  private readonly GAP = 18;

  // Make hint smaller by increasing MAIN_RATIO
  // (e.g. 0.8 => 80/20)
  private readonly MAIN_RATIO = 0.78;

  private open = false;
  private currentType: DialogContentType | null = null;

  private activeContent: { mount: () => void; unmount: () => void } | null =
    null;
  private hintContent: HintContent | null = null;

  // Maps each dialog content type to a factory that builds its mountable content
  private registry: Record<
    DialogContentType,
    (payload?: DialogPayload) => { mount: () => void; unmount: () => void }
  > = {
    multipleChoice: (payload) => {
      if (!payload?.quiz) {
        throw new Error("multipleChoice dialog requires a quiz payload");
      }
      return new MultipleChoiceContents2(
        this.scene,
        this.mainRoot,
        this.getMainContentWidth(),
        (correct) => this.scene.events.emit("mcq-answered", correct),
        payload.quiz
      );
    },
    dragAndDrop: () =>
      new DragAndDropContents(
        this.scene,
        this.mainRoot,
        this.getMainContentWidth()
      ),
  };

  // Build the dialog shell and rebuild it whenever the game canvas is resized
  constructor(
    scene: Phaser.Scene,
    opts?: { width?: number; height?: number; depth?: number; bgHex?: string }
  ) {
    this.scene = scene;

    // 90% of screen by default
    this.panelW = opts?.width ?? Math.floor(scene.scale.width * 0.9);
    this.panelH = opts?.height ?? Math.floor(scene.scale.height * 0.9);

    this.buildShell(opts?.depth ?? 2000, opts?.bgHex ?? "#F3E9D9");
    this.hide();
    this.position();

    // SAFE resize: unmount -> destroy -> rebuild -> reopen
    this.scene.scale.on("resize", () => {
      const wasOpen = this.open;
      const typeToReopen = this.currentType;

      this.panelW = opts?.width ?? Math.floor(this.scene.scale.width * 0.9);
      this.panelH = opts?.height ?? Math.floor(this.scene.scale.height * 0.9);

      // IMPORTANT ORDER
      this.unmountAll();
      this.ui?.destroy(true);

      this.buildShell(opts?.depth ?? 2000, opts?.bgHex ?? "#F3E9D9");
      this.position();

      if (wasOpen && typeToReopen) this.show(typeToReopen);
      else this.hide();
    });
  }

  // Whether the dialog is currently visible
  isOpen() {
    return this.open;
  }

  // Mount the given minigame content and its matching hint panel, then reveal the dialog
  show(type: DialogContentType, payload?: DialogPayload) {
    this.currentType = type;

    this.unmountAll();

    const factory = this.registry[type];
    if (!factory)
      throw new Error(`Dialog content type "${type}" not registered`);

    this.activeContent = factory(payload);
    this.activeContent.mount();

    let hints: string[] = [];

    if (type === "multipleChoice") {
      hints = payload?.hints ?? [];
    } else {
      const { data } = useCodingQuizStore.getState();
      hints = data?.hints ?? [];
    }

    // Mount right hint content
    this.hintContent = new HintContent({
      scene: this.scene,
      root: this.hintRoot,
      width: this.getHintWidth(),
      height: this.getInnerHeight(),
      hints,
    });
    this.hintContent.mount();

    this.open = true;
    this.ui.setVisible(true);
    this.ui.setActive(true);
  }

  // Unmount the active content and hide the dialog
  hide() {
    this.unmountAll();

    this.open = false;
    this.ui.setVisible(false);
    this.ui.setActive(false);
  }

  // -------------------------
  // Build dialog shell UI
  // -------------------------
  private buildShell(depth: number, bgHex: string) {
    const s = this.scene;
    const bgColor = MiniGameDialog.hexToNumber(bgHex);

    const border = s.add
      .rectangle(0, 0, this.panelW + 6, this.panelH + 6, 0x3b3b3b, 1)
      .setOrigin(0.5);

    const bg = s.add
      .rectangle(0, 0, this.panelW, this.panelH, bgColor, 1)
      .setOrigin(0.5);

    // Close button (top-right)
    const btnW = 42;
    const btnH = 32;
    const btnX = this.panelW / 2 - btnW / 2;
    const btnY = -this.panelH / 2 + btnH / 2;

    const closeBg = s.add
      .rectangle(btnX, btnY, btnW, btnH, 0x000000, 0.12)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const closeText = s.add
      .text(btnX, btnY, "X", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#000000",
      })
      .setOrigin(0.5);

    closeBg.on("pointerover", () => closeBg.setFillStyle(0x000000, 0.18));
    closeBg.on("pointerout", () => closeBg.setFillStyle(0x000000, 0.12));
    closeBg.on("pointerdown", () => this.hide());

    // -------------------------
    // Inner layout: 2 columns
    // -------------------------
    const innerW = this.panelW - this.PAD * 2;
    const innerH = this.panelH - this.PAD * 2;

    const leftW = Math.floor(innerW * this.MAIN_RATIO);

    const innerLeftX = -this.panelW / 2 + this.PAD;
    const innerTopY = -this.panelH / 2 + this.PAD;

    // Roots are positioned at top-left of their panel
    this.mainRoot = s.add.container(innerLeftX, innerTopY);
    this.hintRoot = s.add.container(innerLeftX + leftW + this.GAP, innerTopY);

    // Divider line centered in the gap
    const dividerX = innerLeftX + leftW + Math.floor(this.GAP / 2);
    const divider = s.add
      .rectangle(dividerX, innerTopY, 2, innerH, 0x000000, 0.12)
      .setOrigin(0.5, 0);

    // NOTE: rightW is used by HintContent via getHintWidth(),
    // so nothing overflows off the panel anymore.

    this.ui = s.add.container(0, 0, [
      border,
      bg,
      divider,
      this.mainRoot,
      this.hintRoot,
      closeBg,
      closeText,
    ]);

    this.ui.setDepth(depth);
  }

  // Center the dialog shell within the current game canvas
  private position() {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    this.ui.setPosition(w / 2, h / 2);
  }

  // -------------------------
  // Layout helpers (MUST match buildShell math)
  // -------------------------
  private getInnerHeight() {
    return this.panelH - this.PAD * 2;
  }

  // Width of the left main content column
  private getMainContentWidth() {
    const innerW = this.panelW - this.PAD * 2;
    const leftW = Math.floor(innerW * this.MAIN_RATIO);
    return leftW;
  }

  // Width of the right hint column
  private getHintWidth() {
    const innerW = this.panelW - this.PAD * 2;
    const leftW = Math.floor(innerW * this.MAIN_RATIO);
    const rightW = innerW - leftW - this.GAP;
    return rightW;
  }

  // Unmount the active content and hint panel, then clear their containers
  private unmountAll() {
    if (this.activeContent) {
      this.activeContent.unmount();
      this.activeContent = null;
    }
    if (this.hintContent) {
      this.hintContent.unmount();
      this.hintContent = null;
    }

    // Root containers are recreated on rebuild; clear only if they exist
    this.mainRoot?.removeAll(true);
    this.hintRoot?.removeAll(true);
  }

  // Convert a "#RRGGBB" hex string to a numeric color value
  private static hexToNumber(hex: string): number {
    return parseInt(hex.replace("#", ""), 16);
  }
}
