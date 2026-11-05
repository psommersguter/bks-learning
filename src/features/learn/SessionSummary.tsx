import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { ROUTES } from "../../app/routes";
import { buttonClassName } from "../../ui/Button";
import styles from "./SessionSummary.module.css";

/** Shown when no cards are left in the session. */
export function SessionSummary({ reviewedCount }: { reviewedCount: number }) {
  const { t } = useTranslation();

  return (
    <section className={styles.summary}>
      {reviewedCount > 0 ? (
        <>
          <h1 className={styles.heading}>{t("learn.done.heading")}</h1>
          <p>{t("learn.done.summary", { count: reviewedCount })}</p>
        </>
      ) : (
        <p>{t("learn.done.empty")}</p>
      )}
      <Link href={ROUTES.home} replace className={buttonClassName("primary")}>
        {t("learn.done.back")}
      </Link>
    </section>
  );
}
