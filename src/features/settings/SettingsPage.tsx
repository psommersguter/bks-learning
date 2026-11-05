import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { ROUTES } from "../../app/routes";
import { useDiacriticsBarEnabled, useSettingsStore } from "../../settings/settingsStore";
import styles from "./SettingsPage.module.css";

export function SettingsPage() {
  const { t } = useTranslation();
  const diacriticsBarEnabled = useDiacriticsBarEnabled();
  const setDiacriticsBar = useSettingsStore((state) => state.setDiacriticsBar);
  const hintId = useId();

  return (
    <section className={styles.card}>
      <h1 className={styles.heading}>{t("settings.heading")}</h1>

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
