"use client";

import { useEffect, useRef, useState } from "react";
import type Phaser from "phaser";
import Confetti from "react-confetti";
import { createGameConfig } from "@/game/config";

export default function PhaserGame() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  // Track window size for Confetti
  useEffect(() => {
    const update = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    if (gameRef.current) return;

    let destroyed = false;

    (async () => {
      const PhaserModule = await import("phaser");
      if (destroyed || !containerRef.current) return;

      const PhaserNS = PhaserModule as unknown as typeof PhaserModule;

      gameRef.current = new PhaserNS.Game(createGameConfig(containerRef.current));
    })();

    return () => {
      destroyed = true;
      gameRef.current?.destroy?.(true);
      gameRef.current = null;
    };
  }, []);

  // Listen for Phaser win event
  useEffect(() => {
    let timeoutId: number | undefined;

    const handler = () => {
      setShowConfetti(true);
      if (timeoutId) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => setShowConfetti(false), 12000);
    };

    window.addEventListener("game-win", handler as EventListener);
    return () => {
      window.removeEventListener("game-win", handler as EventListener);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center">
      {showConfetti && size.w > 0 && size.h > 0 && (
        <Confetti
          width={size.w}
          height={size.h}
          recycle={false}
          numberOfPieces={350}
          gravity={0.22}
          colors={["#F3E9D9", "#4A3F35", "#668C69", "#917760", "#614F3F"]}
        />
      )}

      <div
        ref={containerRef}
        className="shrink-0 w-[90vw] max-w-[1400px] aspect-[16/9]"
      />
    </div>
  );
}