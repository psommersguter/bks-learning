import { useTranslation } from "react-i18next";
import { type AnswerCheck, diffDiacritics } from "../../domain/answerCheck";
import type { BksRegion, Terms } from "../../domain/vocabulary";
import styles from "./AnswerFeedback.module.css";
import { RegionBadge, TermList } from "./TermList";

interface AnswerFeedbackProps {
  input: string;
  check: AnswerCheck;
  accepted: Terms<BksRegion>;
}

/** Result of a typed answer: verdict, the correct form and other accepted forms with regions. */
export function AnswerFeedback({ input, check, accepted }: AnswerFeedbackProps) {
  const { t } = useTranslation();
  const expectedRegions = accepted.find((term) => term.text === check.expected)?.regions ?? [];
  const otherTerms = accepted.filter((term) => term.text !== check.expected);
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
        {expectedRegions.map((region) => (
          <RegionBadge key={region} region={region} />
        ))}
      </p>

      {otherTerms.length > 0 && (
        <p className={styles.label}>
          {t("learn.alsoCorrect")} <TermList terms={otherTerms} lang="hr" />
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
