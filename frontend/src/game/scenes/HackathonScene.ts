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
    // Load background
    this.load.image("hackathon-background", "/assets/backgrounds/hackathon-background.png");

    // Load player spritesheet 
    this.load.spritesheet("player", "/assets/sprites/player.png", {
      frameWidth: 24,
      frameHeight: 24,
    });

    // Load NPC 1
    this.load.spritesheet("npc1", "/assets/sprites/npc1.png", {
        frameWidth: 24,
        frameHeight: 24,
    });

    // Load NPC 2
    this.load.spritesheet("npc2", "/assets/sprites/npc2.png", {
        frameWidth: 24,
        frameHeight: 24,
    });

    // Load NPC 3
    this.load.spritesheet("npc3", "/assets/sprites/npc3.png", {
        frameWidth: 24,
        frameHeight: 24,
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

    // Animations 
    this.createPlayerAnims();

    // Player (start center-bottom-ish)
    const spawnX = w / 2;
    const spawnY = h - 130;

    this.player = this.physics.add.sprite(spawnX, spawnY, "player", 0);
    this.player.setScale(6);
    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(0);

    // Start idle
    this.player.anims.play("player-idle", true);


    // Group of invisible static colliders
    const solids = this.physics.add.staticGroup();

    // Add an invisible rectangle collider
    const addSolidRect = (x: number, y: number, w: number, h: number) => {
        // A rectangle GameObject (can be made invisible)
        const r = this.add.rectangle(x, y, w, h, 0x00ff00, 0); // alpha=0 => invisible
        this.physics.add.existing(r, true); // true => STATIC body
        solids.add(r);
        return r;
    };

    // Define collision rectangles
    // Top left table
    addSolidRect(440, 350, 200, 70);

    // Top right table
    addSolidRect(1050, 350, 200, 70);

    // Bottom left table
    addSolidRect(420, 620, 220, 70);

    // Bottom right table
    addSolidRect(1100, 620, 220, 70);

    // Top wall
    addSolidRect(0, 0, 3000, 200);

    // Top table
    addSolidRect(750, 0, 220, 350);

    // Left wall part 1
    addSolidRect(0, 0, 200, 500);

    // Left wall part 2
    addSolidRect(0, 300, 100, 200);

    // Right wall part 1
    addSolidRect(1500, 0, 200, 500);

    // Right wall part 2
    addSolidRect(1500, 300, 100, 200);

    // Bottom left planter
    addSolidRect(0, 970, 700, 200);

    // Bottom right planter 
    addSolidRect(1500, 970, 750, 200);

    this.physics.add.collider(this.player, solids);

    // Create idle animation for NPC 1
    if (!this.anims.exists("npc1-idle")) {
        this.anims.create({
        key: "npc1-idle",
        frames: this.anims.generateFrameNumbers("npc1", { start: 0, end: 7 }),
        frameRate: 8,
        repeat: -1,
        });
    }

    // Create idle animation for NPC 2
    if (!this.anims.exists("npc2-idle")) {
        this.anims.create({
        key: "npc2-idle",
        frames: this.anims.generateFrameNumbers("npc2", { start: 0, end: 7 }),
        frameRate: 8,
        repeat: -1,
        });
    }

    // Create idle animation for NPC 3
    if (!this.anims.exists("npc3-idle")) {
        this.anims.create({
        key: "npc3-idle",
        frames: this.anims.generateFrameNumbers("npc3", { start: 0, end: 7 }),
        frameRate: 8,
        repeat: -1,
        });
    }

    // Add NPCs at specific locations
    const npc1 = this.add.sprite(250, 300, "npc1", 0).setOrigin(0.5, 1).setScale(6);
    npc1.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    npc1.play({
        key: "npc1-idle",
        delay: Phaser.Math.Between(0, 800),
    });

    const npc2 = this.add.sprite(800, 600, "npc2", 0).setOrigin(0.5, 1).setScale(6);
    npc2.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    npc2.play("npc2-idle");
    npc2.play({
        key: "npc2-idle",
        delay: Phaser.Math.Between(0, 800),
    });

    const npc3 = this.add.sprite(1300, 400, "npc3", 0).setOrigin(0.5, 1).setScale(6);
    npc3.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    npc3.play({
        key: "npc3-idle",
        delay: Phaser.Math.Between(0, 800), 
    });

  }


  update() {
    const speed = 300;

    const left  = this.cursors.left.isDown;
    const right = this.cursors.right.isDown;
    const up    = this.cursors.up.isDown;
    const down  = this.cursors.down.isDown;

    let vx = 0;
    let vy = 0;

    if (left)  vx -= 1;
    if (right) vx += 1;
    if (up)    vy -= 1;
    if (down)  vy += 1;

    // Normalize diagonal so it's not faster
    if (vx !== 0 && vy !== 0) {
        const inv = 1 / Math.sqrt(2);
        vx *= inv;
        vy *= inv;
    }

    this.player.setVelocity(vx * speed, vy * speed);

    // Anim + facing
    if (vx < 0) {
        this.player.setFlipX(true);
        this.player.anims.play("player-walk-left", true);
        this.lastDir = "left";
    } else if (vx > 0) {
        this.player.setFlipX(false);
        this.player.anims.play("player-walk-right", true);
        this.lastDir = "right";
    } else if (vy !== 0) {
        // You don't have up/down animations yet, so just use idle while moving vertically
        this.player.anims.play("player-walk-right", true);
        this.lastDir = vy < 0 ? "up" : "down";
    } else {
        this.player.anims.play("player-idle", true);
    }
  }


  createPlayerAnims() {
    // ---------- IDLE (frames 0–7) ----------
    this.anims.create({
        key: "player-idle",
        frames: this.anims.generateFrameNumbers("player", {
        start: 0,
        end: 7,
        }),
        frameRate: 6,
        repeat: -1,
    });

    // ---------- WALK RIGHT (frames 10–13) ----------
    this.anims.create({
        key: "player-walk-right",
        frames: this.anims.generateFrameNumbers("player", {
        start: 9,
        end: 12,
        }),
        frameRate: 10,
        repeat: -1,
    });

    // ---------- WALK LEFT (same frames, flipped) ----------
    this.anims.create({
        key: "player-walk-left",
        frames: this.anims.generateFrameNumbers("player", {
        start: 9,
        end: 12,
        }),
        frameRate: 10,
        repeat: -1,
    });
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