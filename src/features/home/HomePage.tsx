import { useTranslation } from "../../i18n/useTranslation";
import styles from "./HomePage.module.css";

export function HomePage() {
  const { t } = useTranslation();

  return (
    <section className={styles.card}>
      <h2 className={styles.heading}>{t("home.heading")}</h2>
      <p>{t("home.intro")}</p>
      <p className={styles.muted}>{t("home.comingSoon")}</p>
    </section>
  );
}
