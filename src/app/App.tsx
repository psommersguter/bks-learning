import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, Route, Router, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { HomePage } from "../features/home/HomePage";
import { LearnPage } from "../features/learn/LearnPage";
import { SettingsPage } from "../features/settings/SettingsPage";
import { useSettingsStore } from "../settings/settingsStore";
import { useApplyTheme } from "../settings/theme";
import { SettingsIcon } from "../ui/icons";
import styles from "./App.module.css";
import { LanguageSwitch } from "./LanguageSwitch";
import { ROUTES } from "./routes";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Sets up hash-based routing. Kept separate from the shell because wouter takes the location
 * hook as a prop, which React Compiler rejects ("hooks must be called") and therefore leaves
 * uncompiled. That way only this tiny component is skipped; `AppShell` is still optimised.
 */
export function App() {
  return (
    <Router hook={useHashLocation}>
      <AppShell />
    </Router>
  );
}

function AppShell() {
  const { t } = useTranslation();
  const locale = useSettingsStore((state) => state.locale);
  useApplyTheme();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = t("app.title");
  }, [locale, t]);

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href={ROUTES.home} className={styles.title}>
          {t("app.title")}
        </Link>
        <div className={styles.headerActions}>
          <LanguageSwitch />
          <ThemeToggle />
          <Link
            href={ROUTES.settings}
            className={styles.iconButton}
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
  );
}
