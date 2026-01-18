import { create } from "zustand";
import useUserStore from "./useUserStore";

type DragDropQuestion = {
    question_type: "drag_drop";
    question_mode: "reorder";
    question_text: string;
    items_to_drag: string[];
    drop_zones: string[]; // ["1","2",...]
};

type DragDropStore = {
  data: DragDropQuestion | null;
  loading: boolean;
  error: string | null;

  fetchDragDropData: () => Promise<void>;
  reset: () => void;
};

export const useDragDropStore = create<DragDropStore>((set) => ({
    data: null,
    loading: false,
    error: null,

    fetchDragDropData: async () => {
        const { name, yearsOfExperience, favouriteLanguage } =
          useUserStore.getState();
    
        set({ loading: true, error: null });

        try {
            const response = await fetch("http://127.0.0.1:8000/drag_drop", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                username: name,
                experience: yearsOfExperience,
                language: favouriteLanguage,
              }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch drag-and-drop exercise");
            }

            const data: DragDropQuestion = await response.json();
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