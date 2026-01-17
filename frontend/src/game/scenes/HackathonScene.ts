import * as Phaser from "phaser";

export default class HackathonScene extends Phaser.Scene {
  private bg!: Phaser.GameObjects.Image;

  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  private playerName!: Phaser.GameObjects.Text;

  private keyE!: Phaser.Input.Keyboard.Key;
  private talkPrompt!: Phaser.GameObjects.Text;

  private npcs: Phaser.GameObjects.Sprite[] = [];
  private nearNpc: Phaser.GameObjects.Sprite | null = null;

  // Track last facing direction for idle
  private lastDir: "down" | "left" | "right" | "up" = "down";

  constructor() {
    super("HackathonScene");
  }

  preload() {
    // Background
    this.load.image(
      "hackathon-background",
      "/assets/backgrounds/hackathon-background.png"
    );

    // Player spritesheet
    this.load.spritesheet("player", "/assets/sprites/player.png", {
      frameWidth: 24,
      frameHeight: 24,
    });

    // NPC spritesheets
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
  }

  create() {
    // Crisp pixel scaling (textures)
    this.textures.get("player").setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.textures.get("npc1").setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.textures.get("npc2").setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.textures.get("npc3").setFilter(Phaser.Textures.FilterMode.NEAREST);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keyE = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Background
    const w = this.scale.width;
    const h = this.scale.height;

    this.bg = this.add
      .image(w / 2, h / 2, "hackathon-background")
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(0);

    this.fitBackground();
    this.scale.on("resize", this.fitBackground, this);

    // Animations
    this.createPlayerAnims();
    this.createNpcAnims();

    // Player
    const spawnX = w / 2;
    const spawnY = h - 130;

    this.player = this.physics.add.sprite(spawnX, spawnY, "player", 0);
    this.player.setScale(6);
    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(0);
    this.player.setDepth(1);
    this.player.anims.play("player-idle", true);

    // Player name
    const nameStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: "monospace",
      fontSize: "22px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 5,
      align: "center",
    };

    this.playerName = this.add
      .text(this.player.x, this.player.y, "Player", nameStyle)
      .setOrigin(0.5, 1)
      .setDepth(11);

    this.playerName.setResolution(2);

    // -------------------------
    // SOLIDS (tables/walls/etc)
    // -------------------------
    const solids = this.physics.add.staticGroup();

    // Add invisible rectangle collider (STATIC)
    const addSolidRect = (x: number, y: number, rw: number, rh: number) => {
      const r = this.add.rectangle(x, y, rw, rh, 0x00ff00, 0); // alpha=0 invisible
      this.physics.add.existing(r, true); // true => static body
      solids.add(r);
      return r;
    };

    // Tables
    addSolidRect(440, 350, 200, 70);
    addSolidRect(1050, 350, 200, 70);
    addSolidRect(420, 600, 220, 70);
    addSolidRect(1100, 600, 220, 70);

    // Walls / planters
    addSolidRect(0, 0, 3000, 200);      // top wall
    addSolidRect(750, 0, 220, 300);     // top table / sign area
    addSolidRect(0, 0, 200, 500);       // left wall part 1
    addSolidRect(0, 300, 100, 200);     // left wall part 2
    addSolidRect(1500, 0, 200, 500);    // right wall part 1
    addSolidRect(1500, 300, 100, 200);  // right wall part 2
    addSolidRect(0, 970, 700, 200);     // bottom left planter
    addSolidRect(1500, 970, 750, 200);  // bottom right planter

    // Player collides with solids
    this.physics.add.collider(this.player, solids);

    // -------------------------
    // NPC SPRITES (visual) + NPC COLLIDERS (addSolidRect like before)
    // -------------------------
    // NPC sprites
    const npc1 = this.add.sprite(250, 300, "npc1", 0).setOrigin(0.5, 1).setScale(6);
    npc1.setDepth(5);
    npc1.play({ key: "npc1-idle", delay: Phaser.Math.Between(0, 800) });

    const npc2 = this.add.sprite(800, 600, "npc2", 0).setOrigin(0.5, 1).setScale(6);
    npc2.setDepth(5);
    npc2.play({ key: "npc2-idle", delay: Phaser.Math.Between(0, 800) });

    const npc3 = this.add.sprite(1300, 400, "npc3", 0).setOrigin(0.5, 1).setScale(6);
    npc3.setDepth(5);
    npc3.play({ key: "npc3-idle", delay: Phaser.Math.Between(0, 800) });

    this.npcs = [npc1, npc2, npc3];

    // NPC collision rectangles (tiny 10x10, like your original)
    // IMPORTANT: place near NPC "feet" so collision feels natural
    addSolidRect(250, 300 - 55, 10, 10);
    addSolidRect(800, 600 - 55, 10, 10);
    addSolidRect(1300, 400 - 55, 10, 10);

    // Player collides with solids (includes NPC tiny colliders)
    // (Already set up above; the npc colliders were added to the same 'solids' group.)

    // -------------------------
    // Talk prompt
    // -------------------------
    const promptStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: "monospace",
      fontSize: "22px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 5,
    };

    this.talkPrompt = this.add
      .text(0, 0, "Press E to talk", promptStyle)
      .setOrigin(0.5, 1)
      .setVisible(false)
      .setDepth(999);

    this.talkPrompt.setResolution(2);
  }

  update() {
    const speed = 300;

    const left = this.cursors.left.isDown;
    const right = this.cursors.right.isDown;
    const up = this.cursors.up.isDown;
    const down = this.cursors.down.isDown;

    let vx = 0;
    let vy = 0;

    if (left) vx -= 1;
    if (right) vx += 1;
    if (up) vy -= 1;
    if (down) vy += 1;

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
      // No up/down anims yet -> reuse side walk
      this.player.anims.play("player-walk-right", true);
      this.lastDir = vy < 0 ? "up" : "down";
    } else {
      this.player.anims.play("player-idle", true);
    }

    // Name above head
    const HEAD_OFFSET = 6 * this.player.scaleY;
    this.playerName.setPosition(this.player.x, this.player.y - HEAD_OFFSET);

    // -------------------------
    // Talk prompt logic (distance to NPC sprites)
    // -------------------------
    const TALK_RADIUS = 120;

    let closest: Phaser.GameObjects.Sprite | null = null;
    let closestDist = Infinity;

    for (const npc of this.npcs) {
      const d = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        npc.x,
        npc.y
      );
      if (d < TALK_RADIUS && d < closestDist) {
        closestDist = d;
        closest = npc;
      }
    }

    this.nearNpc = closest;

    if (this.nearNpc) {
      this.talkPrompt.setVisible(true);
      this.talkPrompt.setPosition(
        this.nearNpc.x,
        this.nearNpc.y - 125
      );

      if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
        this.talkToNpc(this.nearNpc);
      }
    } else {
      this.talkPrompt.setVisible(false);
    }
  }

  private talkToNpc(npc: Phaser.GameObjects.Sprite) {
    // Replace with your dialogue UI
    const id = npc.texture.key; // "npc1" / "npc2" / "npc3"
    console.log("Talk to:", id);
  }

  private createPlayerAnims() {
    // IDLE (0–7)
    if (!this.anims.exists("player-idle")) {
      this.anims.create({
        key: "player-idle",
        frames: this.anims.generateFrameNumbers("player", { start: 0, end: 7 }),
        frameRate: 6,
        repeat: -1,
      });
    }

    // WALK RIGHT (9–12)
    if (!this.anims.exists("player-walk-right")) {
      this.anims.create({
        key: "player-walk-right",
        frames: this.anims.generateFrameNumbers("player", { start: 9, end: 12 }),
        frameRate: 10,
        repeat: -1,
      });
    }

    // WALK LEFT (same frames, flipX in update)
    if (!this.anims.exists("player-walk-left")) {
      this.anims.create({
        key: "player-walk-left",
        frames: this.anims.generateFrameNumbers("player", { start: 9, end: 12 }),
        frameRate: 10,
        repeat: -1,
      });
    }
  }

  private createNpcAnims() {
    if (!this.anims.exists("npc1-idle")) {
      this.anims.create({
        key: "npc1-idle",
        frames: this.anims.generateFrameNumbers("npc1", { start: 0, end: 7 }),
        frameRate: 8,
        repeat: -1,
      });
    }

    if (!this.anims.exists("npc2-idle")) {
      this.anims.create({
        key: "npc2-idle",
        frames: this.anims.generateFrameNumbers("npc2", { start: 0, end: 7 }),
        frameRate: 8,
        repeat: -1,
      });
    }

    if (!this.anims.exists("npc3-idle")) {
      this.anims.create({
        key: "npc3-idle",
        frames: this.anims.generateFrameNumbers("npc3", { start: 0, end: 7 }),
        frameRate: 8,
        repeat: -1,
      });
    }
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