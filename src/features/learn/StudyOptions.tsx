import { useTranslation } from "react-i18next";
import type { StudyQueue } from "../../domain/scheduling";
import { EXTRA_ROUND_SIZE, hasSessionCards, type SessionMode } from "../../domain/studySession";
import { Button } from "../../ui/Button";
import styles from "./StudyOptions.module.css";

interface StudyOptionsProps {
  queue: StudyQueue;
  /** Modes to offer (if they have cards), in this order. The first one is highlighted. */
  modes: readonly SessionMode[];
  onSelect: (mode: SessionMode) => void;
  /** Whether the first available option is the page's main action. Defaults to true. */
  highlightFirst?: boolean;
}

/** Buttons to start a (further) session: regular, review ahead, free practice. */
export function StudyOptions({ queue, modes, onSelect, highlightFirst }: StudyOptionsProps) {
  const { t } = useTranslation();
  const available = modes.filter((mode) => hasSessionCards(mode, queue));
  if (available.length === 0) return null;

  function label(mode: SessionMode): string {
    switch (mode) {
      case "regular":
        return t("learn.continue.regular");
      case "ahead":
        return t("learn.continue.ahead", {
          count: Math.min(EXTRA_ROUND_SIZE, queue.upcoming.length),
        });
      case "practice":
        return t("learn.continue.practice");
    }
  }

  return (
    <div className={styles.options}>
      {available.map((mode, index) => (
        <Button
          key={mode}
          variant={(highlightFirst ?? true) && index === 0 ? "primary" : "secondary"}
          onClick={() => onSelect(mode)}
        >
          {label(mode)}
        </Button>
      ))}
    </div>
  );
}
