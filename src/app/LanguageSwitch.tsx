import { useTranslation } from "react-i18next";
import { LOCALES } from "../i18n/locales";
import { useSettingsStore } from "../settings/settingsStore";
import styles from "./LanguageSwitch.module.css";

export function LanguageSwitch() {
  const { t } = useTranslation();
  const locale = useSettingsStore((state) => state.locale);
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
