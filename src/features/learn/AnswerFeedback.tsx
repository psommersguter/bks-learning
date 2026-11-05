import { useTranslation } from "react-i18next";
import { type AnswerCheck, diffDiacritics } from "../../domain/answerCheck";
import type { Terms } from "../../domain/vocabulary";
import styles from "./AnswerFeedback.module.css";

interface AnswerFeedbackProps {
  input: string;
  check: AnswerCheck;
  accepted: Terms;
}

/** Result of a typed answer: verdict, the correct form and other accepted variants. */
export function AnswerFeedback({ input, check, accepted }: AnswerFeedbackProps) {
  const { t } = useTranslation();
  const otherTerms = accepted.filter((term) => term !== check.expected);
  const typed = input.trim();

  return (
    <div className={styles.feedback} role="status">
      <p className={styles[check.verdict]}>{t(`learn.verdict.${check.verdict}`)}</p>

      {check.verdict === "wrong" && typed !== "" && (
        <p className={styles.label}>
          {t("learn.yourAnswer")}{" "}
          <s className={styles.typed} lang="hr">
            {typed}
          </s>
        </p>
      )}
      {check.verdict === "wrong" && <p className={styles.label}>{t("learn.correctAnswer")}</p>}

      <p className={styles.expected} lang="hr">
        {check.verdict === "diacritics" ? (
          <DiacriticsDiff input={input} expected={check.expected} />
        ) : (
          check.expected
        )}
      </p>

      {otherTerms.length > 0 && (
        <p className={styles.label} lang="hr">
          {t("learn.alsoCorrect", { terms: otherTerms.join(", ") })}
        </p>
      )}
    </div>
  );
}

/** The expected term with the letters whose diacritics were wrong highlighted. */
function DiacriticsDiff({ input, expected }: { input: string; expected: string }) {
  let offset = 0;
  return diffDiacritics(input, expected).map((segment) => {
    const key = offset; // character offset: unique and stable for this term
    offset += segment.text.length;
    return segment.mismatch ? (
      <mark key={key} className={styles.mismatch}>
        {segment.text}
      </mark>
    ) : (
      <span key={key}>{segment.text}</span>
    );
  });
}
