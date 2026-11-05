import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { ROUTES } from "../../app/routes";
import { vocabulary } from "../../data/vocabulary";
import { buttonClassName } from "../../ui/Button";
import { useStudyQueue } from "../learn/useStudyQueue";
import styles from "./HomePage.module.css";

export function HomePage() {
  const { t } = useTranslation();
  const queueState = useStudyQueue();

  return (
    <section className={styles.card}>
      <h1 className={styles.heading}>{t("home.heading")}</h1>
      <p className={styles.muted}>{t("home.wordCount", { count: vocabulary.length })}</p>

      {queueState.status === "loading" && <p>{t("common.loading")}</p>}
      {queueState.status === "error" && <p role="alert">{t("common.loadError")}</p>}
      {queueState.status === "ready" && (
        <>
          <dl className={styles.stats}>
            <div className={styles.stat}>
              <dt>{t("home.due")}</dt>
              <dd>{queueState.queue.due.length}</dd>
            </div>
            <div className={styles.stat}>
              <dt>{t("home.new")}</dt>
              <dd>{queueState.queue.new.length}</dd>
            </div>
          </dl>
          {queueState.queue.due.length + queueState.queue.new.length > 0 ? (
            <Link href={ROUTES.learn} className={buttonClassName("primary", styles.start)}>
              {t("home.start")}
            </Link>
          ) : (
            <p>{t("home.nothingToStudy")}</p>
          )}
        </>
      )}
    </section>
  );
}
