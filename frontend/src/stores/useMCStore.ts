import { create } from "zustand";
import useUserStore from "./useUserStore";
import { API_BASE_URL } from "@/lib/api";

export type MCQItem = {
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

const fallbackData: MCQResponse = {
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

async function requestMCQs(): Promise<MCQResponse> {
  const { name, yearsOfExperience, favouriteLanguage } =
    useUserStore.getState();

  const response = await fetch(`${API_BASE_URL}/mcq`, {
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

  return response.json();
}

export const useMCStore = create<MCStore>((set, get) => ({
  data: null,
  loading: false,
  error: null,
  currentIndex: 0,

  fetchMCQs: async () => {
    set({ loading: true, error: null });

    try {
      const data = await requestMCQs();
      set({ data, currentIndex: 0, loading: false });
    } catch (err) {
      console.error("Failed to fetch MCQs, using fallback quizzes:", err);

      set({
        data: fallbackData,
        currentIndex: 0,
        error: err instanceof Error ? err.message : "Unknown error",
        loading: false,
      });

      // Retry once in the background so the real, personalized questions
      // can replace the fallback without blocking gameplay on them.
      requestMCQs()
        .then((data) => set({ data, currentIndex: 0, error: null }))
        .catch(() => {
          // keep showing the fallback
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
