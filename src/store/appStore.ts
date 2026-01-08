import { create } from "zustand";

export interface Concept {
  id: string;
  topic: string;
  explanations: {
    simplest: string;
    standard: string;
    deepDive: string;
  };
  flashcards: Flashcard[];
  savedAt: Date;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  mastered: boolean;
}

interface AppState {
  // Current concept being viewed
  currentConcept: Concept | null;
  setCurrentConcept: (concept: Concept | null) => void;

  // Saved concepts library
  savedConcepts: Concept[];
  saveConcept: (concept: Concept) => void;
  removeConcept: (id: string) => void;

  // Usage tracking (for free tier)
  dailyExplanations: number;
  incrementDailyExplanations: () => void;
  resetDailyExplanations: () => void;

  // Premium status
  isPremium: boolean;
  setIsPremium: (status: boolean) => void;

  // Loading states
  isGenerating: boolean;
  setIsGenerating: (status: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentConcept: null,
  setCurrentConcept: (concept) => set({ currentConcept: concept }),

  savedConcepts: [],
  saveConcept: (concept) =>
    set((state) => ({
      savedConcepts: [concept, ...state.savedConcepts.filter((c) => c.id !== concept.id)],
    })),
  removeConcept: (id) =>
    set((state) => ({
      savedConcepts: state.savedConcepts.filter((c) => c.id !== id),
    })),

  dailyExplanations: 0,
  incrementDailyExplanations: () =>
    set((state) => ({ dailyExplanations: state.dailyExplanations + 1 })),
  resetDailyExplanations: () => set({ dailyExplanations: 0 }),

  isPremium: false,
  setIsPremium: (status) => set({ isPremium: status }),

  isGenerating: false,
  setIsGenerating: (status) => set({ isGenerating: status }),
}));
