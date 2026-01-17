module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/game/scenes/HackathonScene.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HackathonScene
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$phaser$2f$dist$2f$phaser$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/phaser/dist/phaser.esm.js [app-ssr] (ecmascript)");
;
class HackathonScene extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$phaser$2f$dist$2f$phaser$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Scene"] {
    bg;
    player;
    cursors;
    // Track last facing direction for idle
    lastDir = "down";
    constructor(){
        super("HackathonScene");
    }
    preload() {
        // Background
        this.load.image("hackathon-background", "/assets/backgrounds/hackathon-background.png");
        // Player spritesheet (32x32 frames)
        this.load.spritesheet("player", "/assets/sprites/player.png", {
            frameWidth: 32,
            frameHeight: 32
        });
    }
    create() {
        // Crisp pixel scaling
        this.textures.get("player").setFilter(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$phaser$2f$dist$2f$phaser$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Textures"].FilterMode.NEAREST);
        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        // Background
        const w = this.scale.width;
        const h = this.scale.height;
        this.bg = this.add.image(w / 2, h / 2, "hackathon-background").setOrigin(0.5, 0.5).setScrollFactor(0);
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
    createPlayerAnims() {
        const makeLoop = (key, start, end, frameRate)=>{
            if (this.anims.exists(key)) return;
            this.anims.create({
                key,
                frames: this.anims.generateFrameNumbers("player", {
                    start,
                    end
                }),
                frameRate,
                repeat: -1
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
    fitBackground() {
        if (!this.bg) return;
        const w = this.scale.width;
        const h = this.scale.height;
        this.bg.setPosition(w / 2, h / 2);
        const img = this.textures.get("hackathon-background").getSourceImage();
        // FIT: whole background visible, may letterbox
        const scale = Math.min(w / img.width, h / img.height);
        this.bg.setScale(scale);
    }
}
}),
"[project]/src/game/config.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createGameConfig",
    ()=>createGameConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$phaser$2f$dist$2f$phaser$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/phaser/dist/phaser.esm.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$game$2f$scenes$2f$HackathonScene$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/game/scenes/HackathonScene.ts [app-ssr] (ecmascript)");
;
;
function createGameConfig(parent) {
    return {
        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$phaser$2f$dist$2f$phaser$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AUTO"],
        parent,
        width: 1500,
        height: 1000,
        backgroundColor: "#000000",
        scale: {
            mode: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$phaser$2f$dist$2f$phaser$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Scale"].FIT,
            autoCenter: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$phaser$2f$dist$2f$phaser$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Scale"].CENTER_BOTH
        },
        physics: {
            default: "arcade",
            arcade: {
                debug: false
            }
        },
        scene: [
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$game$2f$scenes$2f$HackathonScene$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
        ]
    };
}
}),
"[project]/src/components/PhaserGame.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PhaserGame
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$game$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/game/config.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
function PhaserGame() {
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const gameRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!containerRef.current) return;
        if (gameRef.current) return;
        let destroyed = false;
        (async ()=>{
            const PhaserModule = await __turbopack_context__.A("[project]/node_modules/phaser/dist/phaser.esm.js [app-ssr] (ecmascript, async loader)");
            if (destroyed || !containerRef.current) return;
            const PhaserNS = PhaserModule;
            gameRef.current = new PhaserNS.Game((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$game$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createGameConfig"])(containerRef.current));
        })();
        return ()=>{
            destroyed = true;
            gameRef.current?.destroy?.(true);
            gameRef.current = null;
        };
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full h-full flex items-center justify-center",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            ref: containerRef,
            className: "shrink-0 w-[90vw] max-w-[1400px] aspect-[16/9]"
        }, void 0, false, {
            fileName: "[project]/src/components/PhaserGame.tsx",
            lineNumber: 37,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/PhaserGame.tsx",
        lineNumber: 36,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/hackathon/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HackathonPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$PhaserGame$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/PhaserGame.tsx [app-ssr] (ecmascript)");
"use client";
;
;
function HackathonPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "w-screen h-screen overflow-hidden",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$PhaserGame$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
            fileName: "[project]/src/app/hackathon/page.tsx",
            lineNumber: 8,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/hackathon/page.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4f2858f1._.js.map