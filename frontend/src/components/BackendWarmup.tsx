"use client";

import { useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";

// Render's free tier spins the backend down after inactivity. Pinging it as
// soon as the app loads gives it a head start waking up before the player
// reaches their first minigame.
export default function BackendWarmup() {
  useEffect(() => {
    fetch(API_BASE_URL).catch(() => {});
  }, []);

  return null;
}
