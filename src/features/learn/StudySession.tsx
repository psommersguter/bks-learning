import { useEffect, useEffectEvent, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { ROUTES } from "../../app/routes";
import type { Grade, StudyQueue } from "../../domain/scheduling";
import {
  currentCard,
  ratingOptions,
  type SessionMode,
  sessionCards,
  sessionReducer,
  startSession,
} from "../../domain/studySession";
import { Button } from "../../ui/Button";
import { AnswerFeedback } from "./AnswerFeedback";
import { AnswerForm } from "./AnswerForm";
import { practiceAnswer, recordAnswer } from "./learningService";
import { RatingButtons } from "./RatingButtons";
import { SessionSummary } from "./SessionSummary";
import styles from "./StudySession.module.css";
import { TermList } from "./TermList";
import { WordDetails } from "./WordDetails";

interface StudySessionProps {
  mode: SessionMode;
  queue: StudyQueue;
  /** Starts another round, in the same or a different mode. */
  onContinue: (mode: SessionMode) => void;
}

export function StudySession({ mode, queue, onContinue }: StudySessionProps) {
  const { t } = useTranslation();
  // The initializer runs once, so a practice round keeps its random selection across renders.
  const [state, dispatch] = useReducer(sessionReducer, undefined, () =>
    startSession(sessionCards(mode, queue)),
  );
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const card = currentCard(state);
  const options = ratingOptions(state.phase);

  async function rate(rating: Grade) {
    if (!card || saving) return;
    setSaving(true);
    setSaveFailed(false);
    // Outside the `try`: React Compiler doesn't support conditionals inside try/catch yet.
    const answer = mode === "practice" ? practiceAnswer : recordAnswer;
    try {
      const now = new Date();
      const progress = await answer(card, rating, now);
      dispatch({ type: "answered", progress, now });
    } catch (error) {
      console.error("Failed to save answer", error);
      setSaveFailed(true);
    }
    // Not in a `finally` block: React Compiler doesn't support `try … finally` yet.
    setSaving(false);
  }

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (!card || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;

    const target = event.target instanceof HTMLElement ? event.target : null;
    if (target?.closest("input, textarea, select")) return;
    const isActivationKey = event.key === "Enter" || event.key === " ";
    // A focused button or link handles Enter/Space itself.
    if (isActivationKey && target?.closest("button, a")) return;

    if (state.phase.kind === "question") {
      if (card.direction === "hr-de" && isActivationKey) {
        event.preventDefault();
        dispatch({ type: "reveal" });
      }
      return;
    }

    const option =
      event.key === "Enter"
        ? options.find((candidate) => candidate.isDefault)
        : options[Number(event.key) - 1];
    if (option) {
      event.preventDefault();
      void rate(option.rating);
    }
  });

  useEffect(() => {
    const listener = (event: KeyboardEvent) => handleKeyDown(event);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  if (!card) {
    return (
      <SessionSummary mode={mode} reviewedCount={state.reviewedCount} onContinue={onContinue} />
    );
  }

  const isRecognition = card.direction === "hr-de";

  return (
    <section className={styles.session}>
      {mode !== "regular" && <p className={styles.mode}>{t(`learn.mode.${mode}`)}</p>}
      <div className={styles.toolbar}>
        <span>
          {t("learn.progress", { done: state.reviewedCount, remaining: state.queue.length })}
        </span>
        {/* `replace`: going back from the start page shouldn't return to an ended session. */}
        <Link href={ROUTES.home} replace className={styles.quit}>
          {t("learn.quit")}
        </Link>
      </div>

      {/* The key resets the card's local state (e.g. the typed answer) for every new card. */}
      <article
        key={`${card.wordId}:${card.direction}:${state.reviewedCount}`}
        className={styles.card}
      >
        <p className={styles.direction}>{t(`learn.direction.${card.direction}`)}</p>
        <p className={styles.prompt}>
          {isRecognition ? (
            <TermList terms={card.word.bks} lang="hr" />
          ) : (
            <TermList terms={card.word.de} lang="de" />
          )}
        </p>

        {state.phase.kind === "question" &&
          (isRecognition ? (
            <Button variant="primary" onClick={() => dispatch({ type: "reveal" })}>
              {t("learn.reveal")}
            </Button>
          ) : (
            <AnswerForm onSubmit={(input) => dispatch({ type: "submit", input })} />
          ))}

        {state.phase.kind === "revealed" && (
          <p className={styles.answer}>
            <TermList terms={card.word.de} lang="de" />
          </p>
        )}

        {state.phase.kind === "checked" && (
          <AnswerFeedback
            input={state.phase.input}
            check={state.phase.check}
            accepted={card.word.bks}
          />
        )}

        {state.phase.kind !== "question" && <WordDetails word={card.word} />}
      </article>

      {options.length > 0 && (
        <RatingButtons options={options} disabled={saving} onRate={(rating) => void rate(rating)} />
      )}
      {saveFailed && (
        <p role="alert" className={styles.error}>
          {t("common.saveError")}
        </p>
      )}

      <p className={styles.keyboardHint}>{t("learn.keyboardHint")}</p>
    </section>
  );
}
