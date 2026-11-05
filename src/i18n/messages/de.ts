/**
 * German UI texts. This is the source of truth for message keys:
 * every other locale must provide exactly the same keys (enforced by the type checker).
 *
 * Placeholders use `{name}` syntax, see `interpolate` in ../translate.ts.
 */
export const de = {
  "app.title": "BKS Vokabeltrainer",
  "app.languageSwitch.label": "Sprache",
  "home.heading": "Dobrodošli!",
  "home.intro": "Hier entsteht dein Vokabeltrainer für Kroatisch.",
  "home.comingSoon": "Lernmodus und Vokabelliste folgen in Kürze.",
} as const satisfies Record<string, string>;

export type MessageKey = keyof typeof de;
export type Messages = Record<MessageKey, string>;
