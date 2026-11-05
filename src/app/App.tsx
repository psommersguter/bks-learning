import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, Route, Router, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { HomePage } from "../features/home/HomePage";
import { LearnPage } from "../features/learn/LearnPage";
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
          <LanguageSwitch />
        </header>
        <main className={styles.main}>
          <Switch>
            <Route path={ROUTES.learn} component={LearnPage} />
            <Route component={HomePage} />
          </Switch>
        </main>
      </div>
    </Router>
  );
}
