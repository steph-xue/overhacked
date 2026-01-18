import { create } from "zustand";
import useUserStore from "./useUserStore";

type CodingQuizResponse = {
  question: string;
  answer: string[];
  hints: string[];
};

type CodingQuizStore = {
  data: CodingQuizResponse | null;
  loading: boolean;
  error: string | null;

  fetchCodingQuiz: () => Promise<void>;
  reset: () => void;
};

export const useCodingQuizStore = create<CodingQuizStore>((set) => ({
  data: null,
  loading: false,
  error: null,

  fetchCodingQuiz: async () => {
    const { name, yearsOfExperience, favouriteLanguage } =
      useUserStore.getState();

    set({ loading: true, error: null });

    try {
      const response = await fetch("http://127.0.0.1:8000/coding_quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: name,
          experience: yearsOfExperience,
          language: favouriteLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch coding quiz");
      }

      const data: CodingQuizResponse = await response.json();
      console.log({ data });

      set({
        data,
        loading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Unknown error",
        loading: false,
      });
    }
  },

  reset: () => {
    set({ data: null, loading: false, error: null });
  },
}));
