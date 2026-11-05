import { useEffect, useEffectEvent, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { ROUTES } from "../../app/routes";
import type { Grade, StudyQueue } from "../../domain/scheduling";
import {
  currentCard,
  ratingOptions,
  sessionReducer,
  startSession,
} from "../../domain/studySession";
import { Button } from "../../ui/Button";
import { AnswerFeedback } from "./AnswerFeedback";
import { AnswerForm } from "./AnswerForm";
import { recordAnswer } from "./learningService";
import { RatingButtons } from "./RatingButtons";
import { SessionSummary } from "./SessionSummary";
import styles from "./StudySession.module.css";
import { WordDetails } from "./WordDetails";

interface StudySessionProps {
  queue: StudyQueue;
}

export function StudySession({ queue }: StudySessionProps) {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(sessionReducer, queue, startSession);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const card = currentCard(state);
  const options = ratingOptions(state.phase);

  async function rate(rating: Grade) {
    if (!card || saving) return;
    setSaving(true);
    setSaveFailed(false);
    try {
      const now = new Date();
      const progress = await recordAnswer(card, rating, now);
      dispatch({ type: "answered", progress, now });
    } catch (error) {
      console.error("Failed to save answer", error);
      setSaveFailed(true);
    } finally {
      setSaving(false);
    }
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
    return <SessionSummary reviewedCount={state.reviewedCount} />;
  }

  const isRecognition = card.direction === "hr-de";
  const promptTerms = isRecognition ? card.word.hr : card.word.de;

  return (
    <section className={styles.session}>
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
        <p className={styles.prompt} lang={isRecognition ? "hr" : "de"}>
          {promptTerms.join(" / ")}
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
          <p className={styles.answer} lang="de">
            {card.word.de.join(" / ")}
          </p>
        )}

        {state.phase.kind === "checked" && (
          <AnswerFeedback
            input={state.phase.input}
            check={state.phase.check}
            accepted={card.word.hr}
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
