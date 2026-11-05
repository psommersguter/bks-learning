import { useTranslation } from "react-i18next";
import { vocabulary } from "../../data/vocabulary";
import styles from "./HomePage.module.css";

export function HomePage() {
  const { t } = useTranslation();

  return (
    <section className={styles.card}>
      <h2 className={styles.heading}>{t("home.heading")}</h2>
      <p>{t("home.intro")}</p>
      <p>{t("home.wordCount", { count: vocabulary.length })}</p>
      <p className={styles.muted}>{t("home.comingSoon")}</p>
    </section>
  );
}
