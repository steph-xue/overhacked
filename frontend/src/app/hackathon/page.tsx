"use client";

import PhaserGame from "@/components/PhaserGame";

// Full-screen page that hosts the Phaser game
export default function HackathonPage() {
  return (
    <main className="w-screen h-screen overflow-hidden">
      <PhaserGame />
    </main>
  );
}