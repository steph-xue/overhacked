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
  private keyD!: Phaser.Input.Keyboard.Key;
  private talkPrompt!: Phaser.GameObjects.Text;

  // =========================
  // NPC tracking
  // =========================
  private npcs: Phaser.GameObjects.Sprite[] = [];
  private nearNpc: Phaser.GameObjects.Sprite | null = null;
  private npcFetchToken = 0;

  // =========================
  // Dialog system
  // =========================
  private dialog!: MiniGameDialog;
  private loadingDialog?: LoadingDialog;

  // =========================
  // Score board
  // =========================
  private scoreBoard!: ScoreBoard;
  private completedChallenges = 0;
  private readonly TOTAL_CHALLENGES = 3;

  // =========================
  // Game over/win dialogs
  // =========================
  private gameOver?: GameOverDialog;
  private winDialog?: WinningDialog;
  private hasWon = false;

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
  }

  // =========================
  // Scene setup
  // =========================
  create() {
    // Ensure crisp pixel rendering
    this.textures.get("player").setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.textures.get("npc1").setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.textures.get("npc2").setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.textures.get("npc3").setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.textures.get("npc4").setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.textures.get("npc5").setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.textures.get("mentor").setFilter(Phaser.Textures.FilterMode.NEAREST);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keyE = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);

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

    // =========================
    // Music
    // =========================
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
    const npc1 = this.spawnNpc(250, 300, "npc1");
    const npc2 = this.spawnNpc(800, 600, "npc2");
    const npc3 = this.spawnNpc(1250, 300, "npc3");
    const npc4 = this.spawnNpc(200, 800, "npc4");
    const npc5 = this.spawnNpc(1350, 730, "npc5");

    this.npcs = [npc1, npc2, npc3, npc4, npc5];

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
    this.scoreBoard.start(180); // 3 minutes
    this.scoreBoard.setProgress(0);

    // Drag-and-Drop
    useDragDropStore.getState().fetchDragDropData();

    // Mentor guide at beginning of game
    this.mentorGuide = new MentorGuide(this);

    this.mentorGuide.show({
      message:
        "Welcome to OVERHACKED!\n\nTalk to judges to play coding minigames. Fill the progress bar before time runs out!",
      durationMs: 20000,
    });

    this.events.on("mcq-answered", (correct: boolean) => {
      if (!correct) return;

      this.completedChallenges++;

      this.scoreBoard.setProgressByCount(
        this.completedChallenges,
        this.TOTAL_CHALLENGES,
      );

      const progress = this.completedChallenges / this.TOTAL_CHALLENGES;

      if (!this.hasWon && progress >= 1) {
        this.hasWon = true;

        window.dispatchEvent(new CustomEvent("game-win"));

        this.winDialog = new WinningDialog(this);
        this.winDialog.mount({
          onPlayAgain: () => {
            this.winDialog?.unmount();
            this.winDialog = undefined;
            this.hasWon = false;
            this.scene.restart();
          },
          onQuit: () => {
            this.winDialog?.unmount();
            this.winDialog = undefined;
            this.hasWon = false;
            window.location.href = "/";
          },
        });
      }
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
    const TALK_RADIUS = 120;
    let closest: Phaser.GameObjects.Sprite | null = null;
    let closestDist = Infinity;

    for (const npc of this.npcs) {
      const d = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        npc.x,
        npc.y,
      );
      if (d < TALK_RADIUS && d < closestDist) {
        closest = npc;
        closestDist = d;
      }
    }

    this.nearNpc = closest;

    if (this.nearNpc) {
      this.talkPrompt.setVisible(true);
      this.talkPrompt.setPosition(this.nearNpc.x, this.nearNpc.y - 125);

      if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
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

        this.dialog.show("multipleChoice");
      } else if (Phaser.Input.Keyboard.JustDown(this.keyD)) {
        this.dialog.show("dragAndDrop");
      }
    } else {
      this.talkPrompt.setVisible(false);
      this.cancelNpcLoading();
    }
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
  }
}
