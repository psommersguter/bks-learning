import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { ROUTES } from "../../app/routes";
import { useDiacriticsBarEnabled, useSettingsStore } from "../../settings/settingsStore";
import { THEME_PREFERENCES } from "../../settings/theme";
import styles from "./SettingsPage.module.css";

export function SettingsPage() {
  const { t } = useTranslation();
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const diacriticsBarEnabled = useDiacriticsBarEnabled();
  const setDiacriticsBar = useSettingsStore((state) => state.setDiacriticsBar);
  const hintId = useId();

  return (
    <section className={styles.card}>
      <h1 className={styles.heading}>{t("settings.heading")}</h1>

      <fieldset className={styles.choice}>
        <legend className={styles.legend}>{t("settings.theme.label")}</legend>
        <div className={styles.options}>
          {THEME_PREFERENCES.map((option) => (
            <label key={option} className={styles.option}>
              <input
                type="radio"
                name="theme"
                value={option}
                checked={theme === option}
                onChange={() => setTheme(option)}
              />
              <span>{t(`settings.theme.${option}`)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.setting}>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={diacriticsBarEnabled}
            onChange={(event) => setDiacriticsBar(event.target.checked)}
            aria-describedby={hintId}
          />
          <span>{t("settings.diacriticsBar.label")}</span>
        </label>
        <p id={hintId} className={styles.hint}>
          {t("settings.diacriticsBar.hint")}
        </p>
      </div>

      <Link href={ROUTES.home} className={styles.back}>
        {t("settings.back")}
      </Link>
    </section>
  );
}
