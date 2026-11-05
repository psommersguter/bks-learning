import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_LOCALE, type Locale } from "../i18n/locales";

interface SettingsState {
  locale: Locale;
  /**
   * Whether to show the bar with Croatian special characters below typed answers.
   * `null` means "not chosen": on by default on desktop, off on touch devices.
   */
  diacriticsBar: boolean | null;
  setLocale: (locale: Locale) => void;
  setDiacriticsBar: (enabled: boolean) => void;
}

/**
 * Small user preferences, persisted in localStorage (so they are per device).
 * Learning progress does NOT belong here — it goes to IndexedDB (see docs/architecture.md).
 *
 * New fields need no migration: `persist` merges stored values over these defaults.
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      diacriticsBar: null,
      setLocale: (locale) => set({ locale }),
      setDiacriticsBar: (enabled) => set({ diacriticsBar: enabled }),
    }),
    { name: "bks-learning.settings", version: 1 },
  ),
);

/**
 * Phones and tablets: no mouse-like pointer that can hover. Evaluated once, since the kind of
 * device doesn't change while the app runs.
 */
const isTouchDevice =
  typeof window !== "undefined" && window.matchMedia("(hover: none) and (pointer: coarse)").matches;

/** Whether the diacritics bar is shown, taking the device default into account. */
export function useDiacriticsBarEnabled(): boolean {
  const setting = useSettingsStore((state) => state.diacriticsBar);
  return setting ?? !isTouchDevice;
}
