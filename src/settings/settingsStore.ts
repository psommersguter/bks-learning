import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_LOCALE, type Locale } from "../i18n/locales";

interface SettingsState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

/**
 * Small user preferences, persisted in localStorage.
 * Learning progress does NOT belong here — it goes to IndexedDB (see docs/architecture.md).
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (locale) => set({ locale }),
    }),
    { name: "bks-learning.settings", version: 1 },
  ),
);
