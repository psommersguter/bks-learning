import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { ROUTES, sessionRoute } from "../../app/routes";
import { vocabulary } from "../../data/vocabulary";
import { hasSessionCards } from "../../domain/studySession";
import { buttonClassName } from "../../ui/Button";
import { StudyOptions } from "../learn/StudyOptions";
import { useStudyQueue } from "../learn/useStudyQueue";
import styles from "./HomePage.module.css";

export function HomePage() {
  const { t } = useTranslation();
  const queueState = useStudyQueue();
  const [, navigate] = useLocation();

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

          {hasSessionCards("regular", queueState.queue) ? (
            <Link href={ROUTES.learn} className={buttonClassName("primary")}>
              {t("home.start")}
            </Link>
          ) : (
            <p>{t("home.nothingToStudy")}</p>
          )}

          {(hasSessionCards("ahead", queueState.queue) ||
            hasSessionCards("practice", queueState.queue)) && (
            <div className={styles.more}>
              <h2 className={styles.moreHeading}>{t("home.more.heading")}</h2>
              <p className={styles.muted}>{t("home.more.hint")}</p>
              <StudyOptions
                queue={queueState.queue}
                modes={["ahead", "practice"]}
                onSelect={(mode) => navigate(sessionRoute(mode))}
                highlightFirst={!hasSessionCards("regular", queueState.queue)}
              />
            </div>
          )}
        </>
      )}
    </section>
  );
}
