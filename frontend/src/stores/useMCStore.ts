import { create } from "zustand";
import useUserStore from "./useUserStore";

type MCQItem = {
  question: string;
  choices: string[];
  answer: number;
};

type MCQResponse = {
  quizzes: MCQItem[];
  hints: string[][];
};

type MCStore = {
  data: MCQResponse | null;
  loading: boolean;
  error: string | null;
  currentIndex: number;
  fetchMCQs: () => Promise<void>;
  nextQuiz: () => { quiz: MCQItem; hints: string[] } | null;
  resetQuizProgress: () => void;
};

const defaultData: MCQResponse = {
  quizzes: [
    {
      question: "What is Java primarily used for?",
      choices: [
        "Web development",
        "Mobile apps",
        "Game consoles",
        "Cooking recipes",
      ],
      answer: 1,
    },
    {
      question: "Which of these is a feature of Java?",
      choices: [
        "Memory management",
        "Automatic garbage collection",
        "No object orientation",
        "Uses Python syntax",
      ],
      answer: 1,
    },
    {
      question: "Which keyword is used to create a class in Java?",
      choices: ["function", "class", "struct", "def"],
      answer: 1,
    },
    {
      question: "What is the entry point of a Java application?",
      choices: ["main()", "start()", "run()", "init()"],
      answer: 0,
    },
  ],
  hints: [
    [
      "Java is widely used for mobile applications.",
      "Android apps often use Java.",
    ],
    [
      "Java automatically cleans up unused objects.",
      "Helps prevent memory leaks.",
    ],
    [
      "A class defines a blueprint for objects.",
      "Java is an object-oriented language.",
    ],
    [
      "Every Java app starts here.",
      "It must be 'public static void main(String[] args)'.",
    ],
  ],
};

export const useMCStore = create<MCStore>((set, get) => ({
  data: defaultData, // ← initialize with defaults
  loading: false,
  error: null,
  currentIndex: 0,

  fetchMCQs: async () => {
    const { name, yearsOfExperience, favouriteLanguage } =
      useUserStore.getState();

    set({ loading: true, error: null });

    try {
      const response = await fetch("http://127.0.0.1:8000/mcq2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: name,
          experience: yearsOfExperience,
          language: favouriteLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch MCQs");
      }

      const data: MCQResponse = await response.json();
      set({
        data,
        currentIndex: 0,
        loading: false,
      });
    } catch (err) {
      console.error("Fetch failed, using default quizzes:", err);

      set({
        data: defaultData, // ← fallback
        currentIndex: 0,
        error: err instanceof Error ? err.message : "Unknown error",
        loading: false,
      });
    }
  },

  nextQuiz: () => {
    const { data, currentIndex } = get();

    if (!data || data.quizzes.length === 0) return null;

    const quiz = data.quizzes[currentIndex];
    const hints = data.hints[currentIndex];

    const nextIndex = (currentIndex + 1) % data.quizzes.length;
    set({ currentIndex: nextIndex });

    return { quiz, hints };
  },

  resetQuizProgress: () => set({ currentIndex: 0 }),
}));
