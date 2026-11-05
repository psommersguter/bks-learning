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
    settingsLink: "Einstellungen",
    themeToggle: {
      toDark: "Zum dunklen Design wechseln",
      toLight: "Zum hellen Design wechseln",
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
    more: {
      heading: "Mehr üben",
      hint: "Vorlernen zählt für deinen Lernplan, Freies Üben wird nicht gespeichert.",
    },
  },
  regions: {
    hr: "gebräuchlich in Kroatien",
    bs: "gebräuchlich in Bosnien und Herzegowina",
    sr: "gebräuchlich in Serbien",
    at: "gebräuchlich in Österreich",
    de: "gebräuchlich in Deutschland",
    ch: "gebräuchlich in der Schweiz",
  },
  settings: {
    heading: "Einstellungen",
    theme: {
      label: "Design",
      system: "Wie Gerät",
      light: "Hell",
      dark: "Dunkel",
    },
    diacriticsBar: {
      label: "Sonderzeichen-Leiste beim Tippen anzeigen",
      hint: "Knöpfe für č, ć, đ, š und ž unter dem Eingabefeld. Standard: am Computer an, am Handy aus. Gilt nur für dieses Gerät.",
    },
    back: "Zur Startseite",
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
    diacritics: {
      label: "Sonderzeichen",
      insert: "{{letter}} einfügen",
    },
    verdict: {
      correct: "Richtig!",
      diacritics: "Fast – achte auf die Sonderzeichen:",
      wrong: "Leider falsch.",
    },
    yourAnswer: "Deine Antwort:",
    correctAnswer: "Richtig wäre:",
    alsoCorrect: "Auch richtig:",
    rating: {
      again: "Nochmal",
      hard: "Schwer",
      good: "Gut",
      easy: "Leicht",
      override: "Ich lag richtig",
    },
    ratingHint: "Wie gut wusstest du es?",
    keyboardHint:
      "Tastatur: Leertaste/Enter zum Aufdecken, 1–4 zum Bewerten, Enter = Vorschlag, Alt+. macht aus c/s/z/d ein Sonderzeichen (c → č → ć)",
    gender: {
      m: "maskulin",
      f: "feminin",
      n: "neutrum",
    },
    aspect: {
      ipf: "imperfektiv",
      pf: "perfektiv",
    },
    mode: {
      ahead: "Vorlernen",
      practice: "Freies Üben · wird nicht gespeichert",
    },
    continue: {
      regular: "Weiter lernen",
      ahead_one: "{{count}} Karte vorlernen",
      ahead_other: "{{count}} Karten vorlernen",
      practice: "Freies Üben",
    },
    done: {
      heading: "Geschafft!",
      practiced_one: "Du hast {{count}} Antwort geübt.",
      practiced_other: "Du hast {{count}} Antworten geübt.",
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
