import { create } from "zustand";
import useUserStore from "./useUserStore";
import { API_BASE_URL } from "@/lib/api";

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

const fallbackData: CodingQuizResponse = {
  question:
    "Arrange the lines to define a simple 'Car' class with a constructor and a method that displays its info.",
  answer: [
    "public class Car {",
    "    String make;",
    "    String model;",
    "    public Car(String make, String model) {",
    "        this.make = make;",
    "        this.model = model;",
    "    }",
    "    public void displayInfo() {",
    "        System.out.println(make + \" \" + model);",
    "    }",
    "}",
  ],
  hints: [
    "Start with the class definition.",
    "The constructor initializes instance fields.",
    "Methods are defined inside the class body.",
  ],
};

// Fetch a personalized coding quiz from the backend
async function requestCodingQuiz(): Promise<CodingQuizResponse> {
  const { name, yearsOfExperience, favouriteLanguage } =
    useUserStore.getState();

  const response = await fetch(`${API_BASE_URL}/coding_quiz`, {
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

  return response.json();
}

export const useCodingQuizStore = create<CodingQuizStore>((set) => ({
  data: null,
  loading: false,
  error: null,

  // Fetch a coding quiz and fall back to a sample question on failure
  fetchCodingQuiz: async () => {
    set({ loading: true, error: null });

    try {
      const data = await requestCodingQuiz();
      set({ data, loading: false });
    } catch (err) {
      console.error("Failed to fetch coding quiz, using fallback:", err);

      set({
        data: fallbackData,
        error: err instanceof Error ? err.message : "Unknown error",
        loading: false,
      });

      // Retry once in the background so the real, personalized question
      // can replace the fallback without blocking gameplay on it
      requestCodingQuiz()
        .then((data) => set({ data, error: null }))
        .catch(() => {
          // Keep showing the fallback
        });
    }
  },

  // Clear the stored quiz data back to its initial state
  reset: () => {
    set({ data: null, loading: false, error: null });
  },
}));
