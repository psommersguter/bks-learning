import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { ROUTES } from "../../app/routes";
import type { SessionMode } from "../../domain/studySession";
import styles from "./SessionSummary.module.css";
import { StudyOptions } from "./StudyOptions";
import { useStudyQueue } from "./useStudyQueue";

interface SessionSummaryProps {
  mode: SessionMode;
  reviewedCount: number;
  onContinue: (mode: SessionMode) => void;
}

/** Shown when no cards are left in the session, with options to keep learning. */
export function SessionSummary({ mode, reviewedCount, onContinue }: SessionSummaryProps) {
  const { t } = useTranslation();
  // Loaded fresh: the answers of the session just finished changed what's due and upcoming.
  const queueState = useStudyQueue();

  return (
    <section className={styles.summary}>
      {reviewedCount > 0 ? (
        <>
          <h1 className={styles.heading}>{t("learn.done.heading")}</h1>
          <p>
            {mode === "practice"
              ? t("learn.done.practiced", { count: reviewedCount })
              : t("learn.done.summary", { count: reviewedCount })}
          </p>
        </>
      ) : (
        <p>{t("learn.done.empty")}</p>
      )}

      {queueState.status === "ready" && (
        <StudyOptions
          queue={queueState.queue}
          modes={["regular", "ahead", "practice"]}
          onSelect={onContinue}
        />
      )}

      <Link href={ROUTES.home} replace className={styles.back}>
        {t("learn.done.back")}
      </Link>
    </section>
  );
}
