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
  home: {
    heading: "Dobrodošli!",
    intro: "Hier entsteht dein Vokabeltrainer für Kroatisch.",
    wordCount_one: "{{count}} Vokabel in deiner Sammlung",
    wordCount_other: "{{count}} Vokabeln in deiner Sammlung",
    comingSoon: "Lernmodus und Vokabelliste folgen in Kürze.",
  },
} as const;

/** Same structure as `de`, with any string as value. */
type MessageTree<T> = { [K in keyof T]: T[K] extends string ? string : MessageTree<T[K]> };

export type Messages = MessageTree<typeof de>;
