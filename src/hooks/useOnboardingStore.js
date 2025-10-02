// src/hooks/useOnboardingStore.js
import { create } from 'zustand';

export const useOnboardingStore = create((set) => ({
  currentStep: 0,
  onboardingData: {
    schoolDetails: null,
    classBookConfig: [], // Array of { class: {}, books: [] }
    principalDetails: null,
    teachers: [], // Array of teacher objects
    initialContent: null, // File object or URL
  },

  // Actions
  goToNextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  goToPreviousStep: () => set((state) => ({ currentStep: state.currentStep - 1 })),
  setCurrentStep: (step) => set({ currentStep: step }),

  updateOnboardingData: (key, data) =>
    set((state) => ({
      onboardingData: {
        ...state.onboardingData,
        [key]: data,
      },
    })),

  resetOnboarding: () => set({
    currentStep: 0,
    onboardingData: {
      schoolDetails: null,
      classBookConfig: [],
      principalDetails: null,
      teachers: [],
      initialContent: null,
    },
  }),
}));