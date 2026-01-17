import * as Phaser from "phaser";
import HackathonScene from "@/game/scenes/HackathonScene";

export function createGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,

    width: 1500,
    height: 1000,

    backgroundColor: "#000000",

    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
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