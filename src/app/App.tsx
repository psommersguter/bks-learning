import { useEffect } from "react";
import { HomePage } from "../features/home/HomePage";
import { useTranslation } from "../i18n/useTranslation";
import styles from "./App.module.css";
import { LanguageSwitch } from "./LanguageSwitch";

export function App() {
  const { t, locale } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = t("app.title");
  }, [locale, t]);

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t("app.title")}</h1>
        <LanguageSwitch />
      </header>
      <main className={styles.main}>
        <HomePage />
      </main>
    </div>
  );
}
