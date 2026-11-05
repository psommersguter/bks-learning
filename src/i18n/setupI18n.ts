import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { useSettingsStore } from "../settings/settingsStore";
import { DEFAULT_LOCALE, LOCALES } from "./locales";
import { de } from "./messages/de";
import { en } from "./messages/en";

/**
 * Initialises i18next. Call once, before rendering the app.
 *
 * The selected locale is owned by the settings store (persisted in localStorage);
 * i18next follows it whenever it changes.
 */
export function setupI18n(): void {
  void i18n.use(initReactI18next).init({
    resources: {
      de: { translation: de },
      en: { translation: en },
    },
    lng: useSettingsStore.getState().locale,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: LOCALES,
    // Resources are bundled, so initialise synchronously and render translated text immediately.
    initAsync: false,
    interpolation: {
      // React already escapes rendered values.
      escapeValue: false,
    },
  });

  useSettingsStore.subscribe((state, previousState) => {
    if (state.locale !== previousState.locale) {
      void i18n.changeLanguage(state.locale);
    }
  });
}
