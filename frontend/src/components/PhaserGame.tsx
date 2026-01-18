"use client";

import { useEffect, useRef } from "react";
import type Phaser from "phaser";
import { createGameConfig } from "@/game/config";

export default function PhaserGame() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (gameRef.current) return;

    let destroyed = false;

    (async () => {
      const PhaserModule = await import("phaser");
      if (destroyed || !containerRef.current) return;

      const PhaserNS = PhaserModule as unknown as typeof PhaserModule;

      gameRef.current = new PhaserNS.Game(
        createGameConfig(containerRef.current)
      );
    })();

    return () => {
      destroyed = true;
      gameRef.current?.destroy?.(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        ref={containerRef}
        className="shrink-0 w-[90vw] max-w-[1400px] aspect-[16/9]"
      />

    </div>
  );
}