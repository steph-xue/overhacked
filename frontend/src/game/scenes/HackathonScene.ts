import * as Phaser from "phaser";
import MiniGameDialog from "@/game/ui/MiniGameDialog";
import { useNpcStore } from "@/stores/useNpcStore";
import { useCodingQuizStore } from "@/stores/useCodingQuizStore";
import { useDragDropStore } from "@/stores/useDragDropStore";
import ScoreBoard from "@/game/ui/ScoreBoard";
import GameOverDialog from "@/game/ui/GameOverDialog";
import MentorGuide from "@/game/ui/MentorGuide";
import LoadingDialog from "@/game/ui/LoadingDialog";
import WinningDialog from "@/game/ui/WinningDialog";

import useUserStore from "@/stores/useUserStore";

/**
 * HackathonScene
 * ---------------
 * Main playable scene:
 * - Player movement (4-directional)
 * - NPCs with proximity interaction
 * - Collision with tables / walls / NPCs
 * - Name tag above player
 * - "Press E to talk" prompt
 * - Opens a Dialog with specified content type
 */

type MinigameType = "multipleChoice" | "dragAndDrop";

export default class HackathonScene extends Phaser.Scene {
  // =========================
  // Core scene objects
  // =========================
  private bg!: Phaser.GameObjects.Image;

  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  private playerName!: Phaser.GameObjects.Text;

  // Testing to see if the music works
  private bgm?: Phaser.Sound.BaseSound;

  // =========================
  // Interaction / UI
  // =========================
  private keyE!: Phaser.Input.Keyboard.Key;
  private talkPrompt!: Phaser.GameObjects.Text;

  // =========================
  // NPC tracking
  // =========================
  private npcs: { sprite: Phaser.GameObjects.Sprite; game: MinigameType }[] =
    [];
  private nearNpc: {
    sprite: Phaser.GameObjects.Sprite;
    game: MinigameType;
  } | null = null;
  private npcFetchToken = 0;

  // NPC alert / marker state - FOR TESTING
  private alertedNpc: Phaser.GameObjects.Sprite | null = null;
  private npcAlertIcon = new Map<Phaser.GameObjects.Sprite, Phaser.GameObjects.Sprite>();
  private npcIconTween?: Phaser.Tweens.Tween;

  // =========================
  // Dialog system
  // =========================
  private dialog!: MiniGameDialog;
  private loadingDialog?: LoadingDialog;

  // =========================
  // Score board
  // =========================
  private scoreBoard!: ScoreBoard;
  private progress = 0; 
  private readonly MCQ_PROGRESS = 0.25;
  private readonly DND_PROGRESS = 0.5;
  

  // =========================
  // Game over/win dialogs
  // =========================
  private gameOver?: GameOverDialog;
  private winDialog?: WinningDialog;
  private hasWon = false;

  // =========================
    // Player state / alerts - For TESTING
    // =========================
    private lastActiveAt = 0;
    private lastIdleNudgeAt = 0;
    private lastRandomAlertAt = 0;

    // tune these
    private readonly IDLE_THRESHOLD_MS = 15_000;       // idle for 15s
    private readonly IDLE_NUDGE_COOLDOWN_MS = 15_000;  // don't spam

    private readonly ALERT_MIN_MS = 5_000;            // random alert window
    private readonly ALERT_MAX_MS = 35_000;
    private readonly RANDOM_ALERT_CHANCE = 0.80;       // chance per roll
    private readonly RANDOM_ALERT_COOLDOWN_MS = 20_000;

    private randomAlertTimer?: Phaser.Time.TimerEvent;

  // =========================
  // Mentor guide
  // =========================
  private mentorGuide!: MentorGuide;

  // Track last facing direction (future-proofing for directional idle)
  private lastDir: "down" | "left" | "right" | "up" = "down";

  constructor() {
    super("HackathonScene");
  }

  // =========================
  // Asset loading
  // =========================
  preload() {
    this.load.image(
      "hackathon-background",
      "/assets/backgrounds/hackathon-background.png",
    );

    this.load.spritesheet("player", "/assets/sprites/player.png", {
      frameWidth: 24,
      frameHeight: 24,
    });

    this.load.spritesheet("npc1", "/assets/sprites/npc1.png", {
      frameWidth: 24,
      frameHeight: 24,
    });
    this.load.spritesheet("npc2", "/assets/sprites/npc2.png", {
      frameWidth: 24,
      frameHeight: 24,
    });
    this.load.spritesheet("npc3", "/assets/sprites/npc3.png", {
      frameWidth: 24,
      frameHeight: 24,
    });
    this.load.spritesheet("npc4", "/assets/sprites/npc4.png", {
      frameWidth: 24,
      frameHeight: 24,
    });
    this.load.spritesheet("npc5", "/assets/sprites/npc5.png", {
      frameWidth: 24,
      frameHeight: 24,
    });

    this.load.spritesheet("mentor", "/assets/sprites/mentor.png", {
      frameWidth: 24,
      frameHeight: 24,
    });

    // Load the audio
    this.load.audio("bgm", "/assets/audio/hackathon-audio.wav");

    // FOR TESTING
    this.load.spritesheet("npc-exclaim", "/assets/sprites/exclaim_alert.png", {
        frameWidth: 16,
        frameHeight: 16
    });
  }

  // =========================
  // Scene setup
  // =========================
  create() {
    // --- Reset per-run state (important for scene.restart)
    this.loadingDialog?.destroy();
    this.loadingDialog = undefined;

    this.winDialog?.unmount();
    this.winDialog = undefined;

    this.gameOver?.unmount();
    this.gameOver = undefined;

    this.progress = 0;
    this.hasWon = false;
    
    this.npcFetchToken = 0;

    // IMPORTANT: prevent stacking listeners across restarts
    this.events.off("mcq-answered");
    this.events.off("dnd-answered");

    // Ensure crisp pixel rendering
    this.textures.get("player").setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.textures.get("npc1").setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.textures.get("npc2").setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.textures.get("npc3").setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.textures.get("npc4").setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.textures.get("npc5").setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.textures.get("mentor").setFilter(Phaser.Textures.FilterMode.NEAREST);

    // FOR TESTING
    this.textures.get("npc-exclaim").setFilter(Phaser.Textures.FilterMode.NEAREST);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keyE = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // =========================
    // Background
    // =========================
    const w = this.scale.width;
    const h = this.scale.height;

    this.bg = this.add
      .image(w / 2, h / 2, "hackathon-background")
      .setOrigin(0.5)
      .setDepth(0);

    this.fitBackground();
    this.scale.on("resize", this.fitBackground, this);

    // =========================
    // Animations
    // =========================
    this.createPlayerAnims();
    this.createNpcAnims();
    this.createMentorAnims();

    this.textures
      .get("npc-exclaim")
      .setFilter(Phaser.Textures.FilterMode.NEAREST);

    if (!this.anims.exists("npc-exclaim-anim")) {
        this.anims.create({
          key: "npc-exclaim-anim",
          frames: this.anims.generateFrameNumbers("npc-exclaim", { start: 0, end: 3 }),
          frameRate: 10,
          repeat: -1,
        });
      }

    // =========================
    // Music
    // =========================
    // Prevents double music on restart
    this.sound.stopByKey("bgm");
    this.bgm?.stop();
    this.bgm?.destroy();
    this.bgm = undefined;

    this.bgm = this.sound.add("bgm", { loop: true, volume: 0.5 });
    this.bgm.play();

    // =========================
    // Player setup
    // =========================
    this.player = this.physics.add.sprite(w / 2, h - 130, "player", 0);
    this.player.setScale(6);
    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(0);
    this.player.setDepth(1);
    this.player.anims.play("player-idle", true);

    const { name } = useUserStore.getState();

    // Player name tag
    this.playerName = this.add
      .text(this.player.x, this.player.y, name || "Player", {
        fontFamily: "monospace",
        fontSize: "22px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 5,
      })
      .setOrigin(0.5, 1)
      .setDepth(11);

    this.playerName.setResolution(2);

    // =========================
    // World collisions
    // =========================
    const solids = this.physics.add.staticGroup();

    const addSolidRect = (x: number, y: number, w: number, h: number) => {
      const r = this.add.rectangle(x, y, w, h, 0x00ff00, 0);
      this.physics.add.existing(r, true);
      solids.add(r);
    };

    // Tables
    addSolidRect(440, 350, 200, 70);
    addSolidRect(1050, 350, 200, 70);
    addSolidRect(420, 600, 220, 70);
    addSolidRect(1100, 600, 220, 70);

    // Walls / planters
    addSolidRect(0, 0, 3000, 200);
    addSolidRect(750, 0, 220, 300);
    addSolidRect(0, 0, 200, 500);
    addSolidRect(0, 300, 100, 200);
    addSolidRect(1500, 0, 200, 500);
    addSolidRect(1500, 300, 100, 200);
    addSolidRect(0, 970, 700, 200);
    addSolidRect(1500, 970, 750, 200);

    this.physics.add.collider(this.player, solids);

    // =========================
    // NPCs
    // =========================
    this.npcs = [
      { sprite: this.spawnNpc(250, 300, "npc1"), game: "multipleChoice" },
      { sprite: this.spawnNpc(800, 600, "npc2"), game: "dragAndDrop" },
      { sprite: this.spawnNpc(1250, 300, "npc3"), game: "multipleChoice" },
      { sprite: this.spawnNpc(200, 800, "npc4"), game: "multipleChoice" },
      { sprite: this.spawnNpc(1350, 730, "npc5"), game: "multipleChoice" },
    ];

    // FOR TESTING
    for (const npc of this.npcs) {
        const icon = this.add
          .sprite(npc.sprite.x, npc.sprite.y, "npc-exclaim", 0)
          .setOrigin(0.5, 1)
          .setDepth(999)
          .setVisible(false);
      
        // Scale icon to match your world (NPCs are scale 6)
        const SCALE_FACTOR = npc.sprite.scaleX * 0.75; // tweak: 0.6–1.0
        icon.setDisplaySize(10 * SCALE_FACTOR, 10 * SCALE_FACTOR);
      
        icon.play("npc-exclaim-anim");
      
        const HEAD_OFFSET = 6 * npc.sprite.scaleY;
        const GAP = 8 * npc.sprite.scaleY;
      
        icon.setPosition(npc.sprite.x, npc.sprite.y - HEAD_OFFSET - GAP);
      
        this.npcAlertIcon.set(npc.sprite, icon);
    }

    // Tiny collision boxes near NPC feet
    addSolidRect(250, 245, 10, 10);
    addSolidRect(800, 545, 10, 10);
    addSolidRect(1250, 245, 10, 10);
    addSolidRect(200, 745, 10, 10);
    addSolidRect(1350, 675, 10, 10);

    // =========================
    // Talk prompt
    // =========================
    this.talkPrompt = this.add
      .text(0, 0, "Press E to talk", {
        fontFamily: "monospace",
        fontSize: "22px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 5,
      })
      .setOrigin(0.5, 1)
      .setVisible(false)
      .setDepth(999);

    this.talkPrompt.setResolution(2);

    // =========================
    // Dialog system
    // =========================
    this.dialog = new MiniGameDialog(this, { bgHex: "#F3E9D9" });
    useNpcStore.getState().fetchNpcData();
    useCodingQuizStore.getState().fetchCodingQuiz();

    // -------------------------
    // ScoreBoard + GameOver
    // -------------------------
    this.scoreBoard = new ScoreBoard(this);
    this.scoreBoard.mount({
      onTimeUp: () => {
        if (this.gameOver) return;

        this.gameOver = new GameOverDialog(this);
        this.gameOver.mount({
          onRestart: () => {
            this.gameOver?.unmount();
            this.gameOver = undefined;
            this.scene.restart();
          },
          onQuit: () => {
            this.gameOver?.unmount();
            this.gameOver = undefined;
            window.location.href = "/"; // Next.js landing page
          },
        });
      },
    });

    // Start timer + progress
    this.scoreBoard.start(120); // 2 minutes
    this.scoreBoard.setProgress(0);

    // Drag-and-Drop
    useDragDropStore.getState().fetchDragDropData();

    // Mentor guide at beginning of game
    this.mentorGuide = new MentorGuide(this);

    this.mentorGuide.show({
      message:
        "Welcome to OVERHACKED!\n\nTalk to teammates to help them with their coding problems. Fill the progress bar before time runs out!",
      durationMs: 20000,
    });

    // FOR TESTING
    this.lastActiveAt = Date.now();

    // Start random alerts AFTER the intro finishes
    this.time.delayedCall(20_000, () => {
        this.scheduleRandomNpcAlerts();

        this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => this.tryIdleNudge(),
          });
    });

    // Add progress for multiple choice answers
    this.events.on("mcq-answered", (correct: boolean) => {
      if (!correct) return;
      this.addProgress(this.MCQ_PROGRESS);
    });

    // Add progress for drag and drop answers
    this.events.on("dnd-answered", (correct: boolean) => {
      if (!correct) return;
      this.addProgress(this.DND_PROGRESS);
    });

    this.scoreBoard.setProgress(this.progress);
  }

  private addProgress(delta: number) {
    if (this.hasWon) return;

    this.progress = Phaser.Math.Clamp(this.progress + delta, 0, 1);
    this.scoreBoard.setProgress(this.progress);

    if (this.progress < 1) return;

    this.hasWon = true;
    window.dispatchEvent(new CustomEvent("game-win"));

    this.winDialog = new WinningDialog(this);
    this.winDialog.mount({
      onPlayAgain: () => {
        this.winDialog?.unmount();
        this.winDialog = undefined;
        this.scene.restart();
      },
      onQuit: () => {
        this.winDialog?.unmount();
        this.winDialog = undefined;
        window.location.href = "/";
      },
    });
  }

  // =========================
  // Frame update
  // =========================
  update() {
    if (!this.dialog) return;

    // Freeze player while ANY overlay is open
    if (this.dialog.isOpen() || this.loadingDialog || this.winDialog) {
      this.player.setVelocity(0, 0);
      return;
    }

    // -------------------------
    // Movement
    // -------------------------
    const speed = 300;
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown) vx--;
    if (this.cursors.right.isDown) vx++;
    if (this.cursors.up.isDown) vy--;
    if (this.cursors.down.isDown) vy++;

    // Normalize diagonal movement
    if (vx !== 0 && vy !== 0) {
      const inv = 1 / Math.sqrt(2);
      vx *= inv;
      vy *= inv;
    }

    // ✅ Mark activity if player is actually moving
    if (vx !== 0 || vy !== 0) {
        this.markActive();
    }

    this.player.setVelocity(vx * speed, vy * speed);

    // -------------------------
    // Animations
    // -------------------------
    if (vx < 0) {
      this.player.setFlipX(true);
      this.player.anims.play("player-walk-left", true);
    } else if (vx > 0) {
      this.player.setFlipX(false);
      this.player.anims.play("player-walk-right", true);
    } else if (vy !== 0) {
      this.player.anims.play("player-walk-right", true);
    } else {
      this.player.anims.play("player-idle", true);
    }

    // -------------------------
    // Player name positioning
    // -------------------------
    const HEAD_OFFSET = 6 * this.player.scaleY;
    this.playerName.setPosition(this.player.x, this.player.y - HEAD_OFFSET);

    // -------------------------
    // NPC interaction
    // -------------------------
    this.updateNpcInteraction();

    // -------------------------
    // NPC alert markers
    // -------------------------
    for (const npc of this.npcs) {
        const icon = this.npcAlertIcon.get(npc.sprite);
        if (!icon) continue;
  
    icon.setPosition(npc.sprite.x, npc.sprite.y - 160);
    }

    // Keep markers positioned above NPC heads
    for (const npc of this.npcs) {
        const icon = this.npcAlertIcon.get(npc.sprite);
        if (!icon) continue;
        icon.setPosition(npc.sprite.x, npc.sprite.y - 160);
    }
  }

  // =========================
  // Helpers
  // =========================

  //   private async fetchNpcData() {
  //     const { name, yearsOfExperience, favouriteLanguage } =
  //       useUserStore.getState();

  //     const response = await fetch("http://127.0.0.1:8000/mcq", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         username: name,
  //         experience: yearsOfExperience,
  //         language: favouriteLanguage,
  //       }),
  //     });

  //     const data = await response.json();
  //     console.log(data);
  //   }

  private spawnNpc(x: number, y: number, key: string) {
    const npc = this.add.sprite(x, y, key, 0).setOrigin(0.5, 1).setScale(6);
    npc.setDepth(5);
    npc.play({ key: `${key}-idle`, delay: Phaser.Math.Between(0, 800) });
    return npc;
  }

  private updateNpcInteraction() {
    const TALK_RADIUS = 200;
    let closest: {
      sprite: Phaser.GameObjects.Sprite;
      game: MinigameType;
    } | null = null;
    let closestDist = Infinity;


    for (const npc of this.npcs) {
      const d = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        npc.sprite.x,
        npc.sprite.y,
      );

      if (d < TALK_RADIUS && d < closestDist) {
        closest = npc;
        closestDist = d;
      }
    }

    this.nearNpc = closest;

    if (!this.nearNpc) {
      this.talkPrompt.setVisible(false);
      this.cancelNpcLoading();
      return;
    }

    // show prompt while near
    this.talkPrompt.setVisible(true);
    this.talkPrompt.setPosition(this.nearNpc.sprite.x, this.nearNpc.sprite.y - 125);

    // only act on key press
    if (!Phaser.Input.Keyboard.JustDown(this.keyE)) return;

 
      const { data, loading, error } = useNpcStore.getState();

      if (error) {
        console.log("NPC error:", error);
        return;
      }

      // If already fetching, just show loading UI
      if (loading) {
        this.showLoading();
        return;
      }

      // If we don't have data yet, fetch it (and show loading immediately)
      if (!data) {
        void this.openNpcMinigame(); // open loading -> await fetch -> swap to multipleChoice
        return;
      }

      this.dialog.show(this.nearNpc.game);
  }

  // Helper for creating randomized alerts - FOR TESTING
  private markActive() {
    this.lastActiveAt = Date.now();
  }
  
  private scheduleRandomNpcAlerts() {
    const delay = Phaser.Math.Between(this.ALERT_MIN_MS, this.ALERT_MAX_MS);
  
    this.randomAlertTimer = this.time.delayedCall(delay, () => {
      this.tryRandomNpcAlert();
      this.scheduleRandomNpcAlerts(); // loop forever
    });
  }
  
  // FOR TESTING - Set up the NPC marker animation   
  private setNpcMarker(npc: Phaser.GameObjects.Sprite) {
    // Hide previous marker
    if (this.alertedNpc) {
      this.npcAlertIcon.get(this.alertedNpc)?.setVisible(false);
    }
  
    // Stop previous tween
    this.npcIconTween?.stop();
    this.npcIconTween = undefined;
  
    // Show new marker
    this.alertedNpc = npc;
    const icon = this.npcAlertIcon.get(npc);
    if (!icon) return;
  
    icon.setVisible(true);
  
    this.npcIconTween = this.tweens.add({
      targets: icon,
      y: icon.y - 8,
      duration: 220,
      yoyo: true,
      repeat: -1,
    });
  }

  private canInterruptPlayer(): boolean {
    // keep it polite — don't pop alerts over modal/dialog states
    if (this.dialog?.isOpen()) return false;
    if (this.loadingDialog) return false;
    if (this.winDialog) return false;
    if (this.gameOver) return false;
    return true;
  }
  
  private pickRandomNpc(): Phaser.GameObjects.Sprite | null {
    if (!this.npcs.length) return null;
    const i = Phaser.Math.Between(0, this.npcs.length - 1);
    return this.npcs[i].sprite;
  }
  
  private tryRandomNpcAlert() {
    const now = Date.now();
    if (!this.canInterruptPlayer()) return;
    if (now - this.lastRandomAlertAt < this.RANDOM_ALERT_COOLDOWN_MS) return;
    if (Math.random() > this.RANDOM_ALERT_CHANCE) return;
  
    const npc = this.pickRandomNpc();
    if (!npc) return;
  
    this.lastRandomAlertAt = now;
  
    // Optional: visually ping the NPC (tiny + cheap)
    this.tweens.add({
      targets: npc,
      y: npc.y - 10,
      duration: 140,
      yoyo: true,
      repeat: 2,
    });

    this.setNpcMarker(npc);
  
    this.mentorGuide.show({
      message: "⚠️ Teammate alert!\nSomeone has a blocker — go talk to them (Press E).",
      durationMs: 6000,
    });
  }
  
  private tryIdleNudge() {
    const now = Date.now();
    if (!this.canInterruptPlayer()) return;
  
    const idleFor = now - this.lastActiveAt;
    if (idleFor < this.IDLE_THRESHOLD_MS) return;
    if (now - this.lastIdleNudgeAt < this.IDLE_NUDGE_COOLDOWN_MS) return;
  
    this.lastIdleNudgeAt = now;
  
    this.mentorGuide.show({
      message: "😮‍💨 Stuck?\nTry helping another person for a quick win.",
      durationMs: 5000,
    });
  }   

  // =========================
  // Animations
  // =========================

  private createPlayerAnims() {
    this.anims.create({
      key: "player-idle",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 7 }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: "player-walk-right",
      frames: this.anims.generateFrameNumbers("player", { start: 9, end: 12 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "player-walk-left",
      frames: this.anims.generateFrameNumbers("player", { start: 9, end: 12 }),
      frameRate: 10,
      repeat: -1,
    });
  }

  private createNpcAnims() {
    ["npc1", "npc2", "npc3", "npc4", "npc5"].forEach((key) => {
      this.anims.create({
        key: `${key}-idle`,
        frames: this.anims.generateFrameNumbers(key, { start: 0, end: 7 }),
        frameRate: 8,
        repeat: -1,
      });
    });
  }

  private createMentorAnims() {
    if (this.anims.exists("mentor-idle")) return;

    this.anims.create({
      key: "mentor-idle",
      frames: this.anims.generateFrameNumbers("mentor", {
        start: 0,
        end: 7,
      }),
      frameRate: 6, // gentle idle motion
      repeat: -1, // loop forever
    });
  }

  private async openNpcMinigame() {
    this.showLoading();

    const myToken = ++this.npcFetchToken; // token for THIS request
    const npcStore = useNpcStore.getState();

    try {
      await npcStore.fetchNpcData();

      // if user canceled / walked away, ignore
      if (myToken !== this.npcFetchToken) return;

      this.hideLoading();
      this.dialog.show("multipleChoice");
    } catch (e) {
      if (myToken !== this.npcFetchToken) return;

      console.error(e);
      this.hideLoading();
      this.dialog.hide();
    }
  }

  private showLoading() {
    if (this.loadingDialog) return;

    this.loadingDialog = new LoadingDialog(this, () => {
      // X pressed
      this.cancelNpcLoading();
    });
  }

  private cancelNpcLoading() {
    this.npcFetchToken++; // invalidate in-flight fetch
    this.hideLoading(); // close UI + unfreeze movement
  }

  private hideLoading() {
    this.loadingDialog?.destroy();
    this.loadingDialog = undefined;
  }

  // =========================
  // Background scaling
  // =========================
  private fitBackground() {
    const w = this.scale.width;
    const h = this.scale.height;
    const img = this.textures
      .get("hackathon-background")
      .getSourceImage() as HTMLImageElement;

    this.bg.setPosition(w / 2, h / 2);
    this.bg.setScale(Math.min(w / img.width, h / img.height));
  }

  shutdown() {
    this.scoreBoard?.unmount();
    this.gameOver?.unmount();
    this.winDialog?.unmount();

    this.sound.stopByKey("bgm");
    this.bgm?.stop();
    this.bgm?.destroy();
    this.bgm = undefined;

    this.scale.off("resize", this.fitBackground, this);
  }
}