import { useTranslation } from "react-i18next";
import { type Grade, Rating } from "../../domain/scheduling";
import type { RatingOption } from "../../domain/studySession";
import { Button } from "../../ui/Button";
import styles from "./RatingButtons.module.css";

const RATING_LABELS = {
  [Rating.Again]: "learn.rating.again",
  [Rating.Hard]: "learn.rating.hard",
  [Rating.Good]: "learn.rating.good",
  [Rating.Easy]: "learn.rating.easy",
} as const satisfies Record<Grade, string>;

interface RatingButtonsProps {
  options: readonly RatingOption[];
  disabled: boolean;
  onRate: (rating: Grade) => void;
}

/** One button per rating option; keys 1–n choose them on desktop (see StudySession). */
export function RatingButtons({ options, disabled, onRate }: RatingButtonsProps) {
  const { t } = useTranslation();

  return (
    <fieldset className={styles.ratings} aria-label={t("learn.ratingHint")}>
      {options.map((option, index) => {
        const shortcut = String(index + 1);
        return (
          <Button
            key={`${option.rating}-${option.isOverride}`}
            variant={option.isDefault ? "primary" : "secondary"}
            disabled={disabled}
            aria-keyshortcuts={shortcut}
            onClick={() => onRate(option.rating)}
            className={styles.rating}
          >
            <span className={styles.shortcut} aria-hidden="true">
              {shortcut}
            </span>
            {t(option.isOverride ? "learn.rating.override" : RATING_LABELS[option.rating])}
          </Button>
        );
      })}
    </fieldset>
  );
}
