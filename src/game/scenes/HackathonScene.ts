import * as Phaser from "phaser";

export default class HackathonScene extends Phaser.Scene {
  private bg!: Phaser.GameObjects.Image;
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  // Track last facing direction for idle
  private lastDir: "down" | "left" | "right" | "up" = "down";

  constructor() {
    super("HackathonScene");
  }

  preload() {
    // Background
    this.load.image("hackathon-background", "/assets/backgrounds/hackathon-background.png");

    // Player spritesheet (32x32 frames)
    this.load.spritesheet("player", "/assets/sprites/player.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    // Crisp pixel scaling
    this.textures.get("player").setFilter(Phaser.Textures.FilterMode.NEAREST);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Background
    const w = this.scale.width;
    const h = this.scale.height;

    this.bg = this.add
      .image(w / 2, h / 2, "hackathon-background")
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0);

    this.fitBackground();
    this.scale.on("resize", this.fitBackground, this);

    // Animations (assumes 4 columns per row, 8 rows total)
    this.createPlayerAnims();

    // Player (start center-bottom-ish)
    const spawnX = w / 2;
    const spawnY = h - 130;

    this.player = this.physics.add.sprite(spawnX, spawnY, "player", 0);
    this.player.setScale(4);
    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(0);

    // Start idle down
    this.player.anims.play("player-idle-down", true);
  }

  update() {
    const speed = 220;

    const left = !!this.cursors.left?.isDown;
    const right = !!this.cursors.right?.isDown;
    const up = !!this.cursors.up?.isDown;
    const down = !!this.cursors.down?.isDown;

    let vx = 0;
    let vy = 0;

    if (left) vx = -speed;
    else if (right) vx = speed;

    if (up) vy = -speed;
    else if (down) vy = speed;

    this.player.setVelocity(vx, vy);

    // Choose animation based on movement
    if (vx === 0 && vy === 0) {
      // idle in last direction
      this.player.anims.play(`player-idle-${this.lastDir}`, true);
      return;
    }

    // Prefer vertical anim if moving more vertically; otherwise horizontal
    if (Math.abs(vy) >= Math.abs(vx)) {
      if (vy < 0) {
        this.lastDir = "up";
        this.player.anims.play("player-walk-up", true);
      } else {
        this.lastDir = "down";
        this.player.anims.play("player-walk-down", true);
      }
    } else {
      if (vx < 0) {
        this.lastDir = "left";
        this.player.anims.play("player-walk-left", true);
      } else {
        this.lastDir = "right";
        this.player.anims.play("player-walk-right", true);
      }
    }
  }

  private createPlayerAnims() {
    const makeLoop = (key: string, start: number, end: number, frameRate: number) => {
      if (this.anims.exists(key)) return;
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers("player", { start, end }),
        frameRate,
        repeat: -1,
      });
    };

    // Idle rows (1–4): 0-3, 4-7, 8-11, 12-15
    makeLoop("player-idle-down", 0, 3, 4);
    makeLoop("player-idle-left", 4, 7, 4);
    makeLoop("player-idle-right", 8, 11, 4);
    makeLoop("player-idle-up", 12, 15, 4);

    // Walk rows (5–8): 16-19, 20-23, 24-27, 28-31
    makeLoop("player-walk-down", 16, 19, 10);
    makeLoop("player-walk-left", 20, 23, 10);
    makeLoop("player-walk-right", 24, 27, 10);
    makeLoop("player-walk-up", 28, 31, 10);
  }

  private fitBackground() {
    if (!this.bg) return;

    const w = this.scale.width;
    const h = this.scale.height;

    this.bg.setPosition(w / 2, h / 2);

    const img = this.textures
      .get("hackathon-background")
      .getSourceImage() as HTMLImageElement;

    // FIT: whole background visible, may letterbox
    const scale = Math.min(w / img.width, h / img.height);
    this.bg.setScale(scale);
  }
}