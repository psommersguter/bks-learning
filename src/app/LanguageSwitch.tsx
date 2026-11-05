import { LOCALES } from "../i18n/locales";
import { useTranslation } from "../i18n/useTranslation";
import { useSettingsStore } from "../settings/settingsStore";
import styles from "./LanguageSwitch.module.css";

export function LanguageSwitch() {
  const { t, locale } = useTranslation();
  const setLocale = useSettingsStore((state) => state.setLocale);

  return (
    <fieldset className={styles.switch} aria-label={t("app.languageSwitch.label")}>
      {LOCALES.map((option) => (
        <button
          key={option}
          type="button"
          className={styles.option}
          aria-pressed={option === locale}
          onClick={() => setLocale(option)}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </fieldset>
  );
}
