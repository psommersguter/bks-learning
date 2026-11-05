import { useTranslation } from "react-i18next";
import { CROATIAN_SPECIAL_LETTERS } from "../../domain/diacritics";
import styles from "./DiacriticsBar.module.css";

interface DiacriticsBarProps {
  onInsert: (letter: string) => void;
}

/** Buttons for the Croatian special letters, for keyboards without them. */
export function DiacriticsBar({ onInsert }: DiacriticsBarProps) {
  const { t } = useTranslation();

  return (
    <fieldset className={styles.bar} aria-label={t("learn.diacritics.label")}>
      {CROATIAN_SPECIAL_LETTERS.map((letter) => (
        <button
          key={letter}
          type="button"
          className={styles.letter}
          lang="hr"
          aria-label={t("learn.diacritics.insert", { letter })}
          // Keep the focus (and the caret) in the text field.
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onInsert(letter)}
          tabIndex={-1}
        >
          {letter}
        </button>
      ))}
    </fieldset>
  );
}
