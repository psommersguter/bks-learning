import type { Messages } from "./de";

export const en: Messages = {
  app: {
    title: "BKS Vocabulary Trainer",
    languageSwitch: {
      label: "Language",
    },
  },
  common: {
    loading: "Loading …",
    loadError: "The data could not be loaded.",
    saveError: "Your answer could not be saved. Please try again.",
  },
  home: {
    heading: "Dobrodošli!",
    wordCount_one: "{{count}} word in your collection",
    wordCount_other: "{{count}} words in your collection",
    due: "Due",
    new: "New",
    start: "Start learning",
    nothingToStudy: "There's nothing to study right now.",
  },
  learn: {
    direction: {
      "hr-de": "Croatian → German",
      "de-hr": "German → Croatian",
    },
    progress: "Done: {{done}} · Left: {{remaining}}",
    quit: "Quit",
    reveal: "Reveal",
    answerLabel: "Your answer in Croatian",
    check: "Check",
    verdict: {
      correct: "Correct!",
      diacritics: "Almost – watch the special characters:",
      wrong: "Not quite.",
    },
    yourAnswer: "Your answer:",
    correctAnswer: "Correct would be:",
    alsoCorrect: "Also correct: {{terms}}",
    rating: {
      again: "Again",
      hard: "Hard",
      good: "Good",
      easy: "Easy",
      override: "I was right",
    },
    ratingHint: "How well did you know it?",
    keyboardHint: "Keyboard: Space/Enter to reveal, 1–4 to rate, Enter = suggestion",
    gender: {
      m: "masculine",
      f: "feminine",
      n: "neuter",
    },
    aspect: {
      ipf: "imperfective",
      pf: "perfective",
    },
    done: {
      heading: "Well done!",
      summary_one: "You gave {{count}} answer.",
      summary_other: "You gave {{count}} answers.",
      empty: "There's nothing to study right now.",
      back: "Back to start",
    },
  },
};
