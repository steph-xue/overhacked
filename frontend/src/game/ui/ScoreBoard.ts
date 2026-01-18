// src/game/ui/ScoreBoard.ts
import * as Phaser from "phaser";

/**
 * ScoreBoard (HUD)
 * - Top-left, tight to corner
 * - One-line layout: [progress bar] [timer]
 * - Brown background (#614F3F)
 * - Green progress fill
 * - Countdown timer (default 3:00)
 * - Calls onTimeUp() when timer hits 0
 */
export default class ScoreBoard {
  private scene: Phaser.Scene;
  private root!: Phaser.GameObjects.Container;

  // visuals
  private bg!: Phaser.GameObjects.Graphics;
  private barBg!: Phaser.GameObjects.Graphics;
  private barFill!: Phaser.GameObjects.Graphics;
  private timerText!: Phaser.GameObjects.Text;

  // timer/progress state
  private timerEvent?: Phaser.Time.TimerEvent;
  private totalSeconds = 180;
  private remainingSeconds = 180;
  private progress = 0;

  // callback
  private onTimeUp?: () => void;

  // layout
  private readonly X = 0; // tight to corner
  private readonly Y = 0;

  private readonly BOX_W = 330;
  private readonly BOX_H = 48;

  private readonly BAR_W = 220;
  private readonly BAR_H = 14;

  private readonly PAD = 6;      // internal padding
  private readonly GAP = 10;     // gap between bar and timer
  private readonly RADIUS = 10;  // rounded corners

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  mount(args?: { onTimeUp?: () => void }) {
    this.onTimeUp = args?.onTimeUp;

    const s = this.scene;

    // Root container
    this.root = s.add.container(0, 0).setDepth(9999);

    // Background (rounded)
    this.bg = s.add.graphics();
    this.bg.fillStyle(0x917760, 1);
    this.bg.fillRoundedRect(0, 0, this.BOX_W, this.BOX_H, this.RADIUS);

    // Bar background (rounded)
    this.barBg = s.add.graphics();
    this.barBg.fillStyle(0x000000, 0.25);
    this.barBg.fillRoundedRect(0, 0, this.BAR_W, this.BAR_H, Math.min(8, this.BAR_H / 2));

    // Bar fill (rounded)
    this.barFill = s.add.graphics();
    this.redrawBarFill();

    // Timer text
    this.timerText = s.add
      .text(0, 0, "3:00", {
        fontFamily: "Silkscreen",
        fontStyle: "bold",
        fontSize: "24px",
        color: "#F3E9D9",
      })
      .setOrigin(0, 0.5);

    this.timerText.setResolution(2);

    // One-line layout (center vertically)
    const centerY = Math.floor(this.BOX_H / 2);

    this.barBg.setPosition(this.PAD, centerY - Math.floor(this.BAR_H / 2));
    this.barFill.setPosition(this.PAD, centerY - Math.floor(this.BAR_H / 2));

    const timerX = this.PAD + this.BAR_W + this.GAP;
    this.timerText.setPosition(timerX, centerY);

    // Build
    this.root.add([this.bg, this.barBg, this.barFill, this.timerText]);

    // Place tight top-left + keep on resize
    this.reposition();
    s.scale.on("resize", this.reposition, this);

    // Initialize visuals
    this.updateTimerText();
    this.setProgress(this.progress);
  }

  unmount() {
    this.timerEvent?.remove(false);
    this.timerEvent = undefined;

    this.scene.scale.off("resize", this.reposition, this);

    this.root?.destroy(true);
  }

  // -------------------------
  // Public API
  // -------------------------

  /** Start countdown (seconds). Example: start(180) for 3:00 */
  start(seconds: number) {
    this.totalSeconds = seconds;
    this.remainingSeconds = seconds;
    this.updateTimerText();

    this.timerEvent?.remove(false);

    this.timerEvent = this.scene.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.remainingSeconds = Math.max(0, this.remainingSeconds - 1);
        this.updateTimerText();

        if (this.remainingSeconds === 0) {
          this.timerEvent?.remove(false);
          this.timerEvent = undefined;
          this.onTimeUp?.();
        }
      },
    });
  }

  stopTimer() {
    this.timerEvent?.remove(false);
    this.timerEvent = undefined;
  }

  /** Set progress from 0..1 */
  setProgress(p: number) {
    this.progress = Phaser.Math.Clamp(p, 0, 1);
    this.redrawBarFill();
  }

  /** Convenience: set progress by fraction of completed tasks */
  setProgressByCount(done: number, total: number) {
    if (total <= 0) {
      this.setProgress(0);
      return;
    }
    this.setProgress(done / total);
  }

  getRemainingSeconds() {
    return this.remainingSeconds;
  }

  // -------------------------
  // Internals
  // -------------------------

  private redrawBarFill() {
    // barFill is a graphics object positioned at (PAD, topOfBar) already
    // so draw at local (0, 0)
    this.barFill.clear();

    const fillW = Math.max(0, Math.floor(this.BAR_W * this.progress));
    const radius = Math.min(8, this.BAR_H / 2);

    this.barFill.fillStyle(0x668c69, 1);

    // If fill is tiny, clamp radius so it doesn't look weird
    const r = Math.min(radius, Math.floor(fillW / 2));
    if (fillW > 0) {
      this.barFill.fillRoundedRect(0, 0, fillW, this.BAR_H, r);
    }
  }

  private updateTimerText() {
    const m = Math.floor(this.remainingSeconds / 60);
    const s = this.remainingSeconds % 60;
    const ss = s < 10 ? `0${s}` : `${s}`;
    this.timerText.setText(`${m}:${ss}`);
  }

  private reposition() {
    // very tight corner
    this.root.setPosition(this.X, this.Y);
  }
}