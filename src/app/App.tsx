import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, Route, Router, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { HomePage } from "../features/home/HomePage";
import { LearnPage } from "../features/learn/LearnPage";
import { SettingsPage } from "../features/settings/SettingsPage";
import { useSettingsStore } from "../settings/settingsStore";
import styles from "./App.module.css";
import { LanguageSwitch } from "./LanguageSwitch";
import { ROUTES } from "./routes";

export function App() {
  const { t } = useTranslation();
  const locale = useSettingsStore((state) => state.locale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = t("app.title");
  }, [locale, t]);

  return (
    <Router hook={useHashLocation}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <Link href={ROUTES.home} className={styles.title}>
            {t("app.title")}
          </Link>
          <div className={styles.headerActions}>
            <LanguageSwitch />
            <Link
              href={ROUTES.settings}
              className={styles.iconLink}
              aria-label={t("app.settingsLink")}
              title={t("app.settingsLink")}
            >
              <SettingsIcon />
            </Link>
          </div>
        </header>
        <main className={styles.main}>
          <Switch>
            <Route path={ROUTES.learn} component={LearnPage} />
            <Route path={ROUTES.settings} component={SettingsPage} />
            <Route component={HomePage} />
          </Switch>
        </main>
      </div>
    </Router>
  );
}

/** Gear icon: the "settings" icon from Feather Icons (https://feathericons.com, MIT License). */
function SettingsIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
