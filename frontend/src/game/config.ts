import type Phaser from "phaser";

export async function createGameConfig(
  parent: HTMLElement
): Promise<Phaser.Types.Core.GameConfig> {
  //  Load Phaser only in the browser
  const PhaserMod = await import("phaser");
  const PhaserNS = (PhaserMod.default ?? PhaserMod) as typeof PhaserMod;

  // Load the scene only in the browser (prevents SSR "navigator" crash)
  const { default: HackathonScene } = await import("@/game/scenes/HackathonScene");

  return {
    type: PhaserNS.AUTO,
    parent,

    width: 1500,
    height: 1000,

    backgroundColor: "#000000",

    scale: {
      mode: PhaserNS.Scale.FIT,
      autoCenter: PhaserNS.Scale.CENTER_BOTH,
    },

    physics: {
      default: "arcade",
      arcade: { debug: false },
    },

    render: {
      pixelArt: true,
      antialias: false,
    },

    scene: [HackathonScene],
  };
}