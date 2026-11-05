/**
 * German UI texts. This is the source of truth for message keys:
 * every other locale must provide exactly the same keys (enforced by the `Messages` type).
 *
 * Syntax is i18next's: `{{name}}` for interpolation, `_one`/`_other` suffixes for plurals
 * (call `t("home.wordCount", { count })` without the suffix).
 */
export const de = {
  app: {
    title: "BKS Vokabeltrainer",
    languageSwitch: {
      label: "Sprache",
    },
  },
  common: {
    loading: "Lädt …",
    loadError: "Die Daten konnten nicht geladen werden.",
    saveError: "Die Antwort konnte nicht gespeichert werden. Bitte versuche es noch einmal.",
  },
  home: {
    heading: "Dobrodošli!",
    wordCount_one: "{{count}} Vokabel in deiner Sammlung",
    wordCount_other: "{{count}} Vokabeln in deiner Sammlung",
    due: "Fällig",
    new: "Neu",
    start: "Lernen starten",
    nothingToStudy: "Gerade gibt es nichts zu lernen.",
  },
  learn: {
    direction: {
      "hr-de": "Kroatisch → Deutsch",
      "de-hr": "Deutsch → Kroatisch",
    },
    progress: "Erledigt: {{done}} · Übrig: {{remaining}}",
    quit: "Beenden",
    reveal: "Aufdecken",
    answerLabel: "Deine Antwort auf Kroatisch",
    check: "Prüfen",
    verdict: {
      correct: "Richtig!",
      diacritics: "Fast – achte auf die Sonderzeichen:",
      wrong: "Leider falsch.",
    },
    yourAnswer: "Deine Antwort:",
    correctAnswer: "Richtig wäre:",
    alsoCorrect: "Auch richtig: {{terms}}",
    rating: {
      again: "Nochmal",
      hard: "Schwer",
      good: "Gut",
      easy: "Leicht",
      override: "Ich lag richtig",
    },
    ratingHint: "Wie gut wusstest du es?",
    keyboardHint: "Tastatur: Leertaste/Enter zum Aufdecken, 1–4 zum Bewerten, Enter = Vorschlag",
    gender: {
      m: "maskulin",
      f: "feminin",
      n: "neutrum",
    },
    aspect: {
      ipf: "imperfektiv",
      pf: "perfektiv",
    },
    done: {
      heading: "Geschafft!",
      summary_one: "Du hast {{count}} Antwort gegeben.",
      summary_other: "Du hast {{count}} Antworten gegeben.",
      empty: "Gerade gibt es nichts zu lernen.",
      back: "Zur Startseite",
    },
  },
} as const;

/** Same structure as `de`, with any string as value. */
type MessageTree<T> = { [K in keyof T]: T[K] extends string ? string : MessageTree<T[K]> };

export type Messages = MessageTree<typeof de>;
