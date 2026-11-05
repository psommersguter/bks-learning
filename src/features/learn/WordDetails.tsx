import { useTranslation } from "react-i18next";
import type { Word } from "../../domain/vocabulary";
import styles from "./WordDetails.module.css";

/** Extra information shown after answering: gender/aspect, note and example sentence. */
export function WordDetails({ word }: { word: Word }) {
  const { t } = useTranslation();

  const facts = [
    word.gender && t(`learn.gender.${word.gender}`),
    word.aspect && t(`learn.aspect.${word.aspect}`),
  ].filter(Boolean);

  if (facts.length === 0 && !word.note && !word.example) return null;

  return (
    <div className={styles.details}>
      {facts.length > 0 && <p className={styles.facts}>{facts.join(" · ")}</p>}
      {word.note && <p className={styles.note}>{word.note}</p>}
      {word.example && (
        <figure className={styles.example}>
          <p lang="hr">{word.example.bks}</p>
          <p lang="de" className={styles.translation}>
            {word.example.de}
          </p>
        </figure>
      )}
    </div>
  );
}
