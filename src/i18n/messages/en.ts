import type { Messages } from "./de";

export const en: Messages = {
  app: {
    title: "BKS Vocabulary Trainer",
    languageSwitch: {
      label: "Language",
    },
    settingsLink: "Settings",
    themeToggle: {
      toDark: "Switch to dark theme",
      toLight: "Switch to light theme",
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
    more: {
      heading: "Practise more",
      hint: "Reviewing ahead counts towards your schedule, Free practice isn't saved.",
    },
  },
  settings: {
    heading: "Settings",
    theme: {
      label: "Theme",
      system: "Like device",
      light: "Light",
      dark: "Dark",
    },
    diacriticsBar: {
      label: "Show special-character bar when typing",
      hint: "Buttons for č, ć, đ, š and ž below the input field. Default: on for computers, off for phones. Applies to this device only.",
    },
    back: "Back to start",
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
    diacritics: {
      label: "Special characters",
      insert: "Insert {{letter}}",
    },
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
    keyboardHint:
      "Keyboard: Space/Enter to reveal, 1–4 to rate, Enter = suggestion, Alt+. turns c/s/z/d into a special letter (c → č → ć)",
    gender: {
      m: "masculine",
      f: "feminine",
      n: "neuter",
    },
    aspect: {
      ipf: "imperfective",
      pf: "perfective",
    },
    mode: {
      ahead: "Reviewing ahead",
      practice: "Free practice · not saved",
    },
    continue: {
      regular: "Continue learning",
      ahead_one: "Review {{count}} card ahead",
      ahead_other: "Review {{count}} cards ahead",
      practice: "Free practice",
    },
    done: {
      heading: "Well done!",
      practiced_one: "You practised {{count}} answer.",
      practiced_other: "You practised {{count}} answers.",
      summary_one: "You gave {{count}} answer.",
      summary_other: "You gave {{count}} answers.",
      empty: "There's nothing to study right now.",
      back: "Back to start",
    },
  },
};
