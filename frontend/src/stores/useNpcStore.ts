import { create } from "zustand";
import useUserStore from "./useUserStore";

type MCQResponse = {
  question: string;
  choices: string[];
  answer: number;
  hints: string[];
};

type NpcStore = {
  data: MCQResponse | null;
  loading: boolean;
  error: string | null;

  fetchNpcData: () => Promise<void>;
};

export const useNpcStore = create<NpcStore>((set) => ({
  data: null,
  loading: false,
  error: null,

  fetchNpcData: async () => {
    const { name, yearsOfExperience, favouriteLanguage } =
      useUserStore.getState();

    set({ loading: true, error: null });

    try {
      const response = await fetch("http://127.0.0.1:8000/mcq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: name,
          experience: yearsOfExperience,
          language: favouriteLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch NPC data");
      }

      const data = await response.json();
      console.log({ data });

      set({ data, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Unknown error",
        loading: false,
      });
    }
  },
}));
