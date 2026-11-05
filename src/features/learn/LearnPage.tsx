import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { sessionRoute } from "../../app/routes";
import type { SessionMode } from "../../domain/studySession";
import { StudySession } from "./StudySession";
import { useStudyQueue } from "./useStudyQueue";

interface LearnPageProps {
  mode: SessionMode;
}

/**
 * Runs study sessions of one mode. "Continue" in the same mode starts a new round (fresh data,
 * new card selection); another mode switches the route, replacing the history entry.
 */
export function LearnPage({ mode }: LearnPageProps) {
  const [round, setRound] = useState(0);
  const [, navigate] = useLocation();

  function handleContinue(nextMode: SessionMode) {
    if (nextMode === mode) {
      setRound((current) => current + 1);
    } else {
      navigate(sessionRoute(nextMode), { replace: true });
    }
  }

  return <SessionRound key={round} mode={mode} onContinue={handleContinue} />;
}

interface SessionRoundProps {
  mode: SessionMode;
  onContinue: (mode: SessionMode) => void;
}

function SessionRound({ mode, onContinue }: SessionRoundProps) {
  const { t } = useTranslation();
  const queueState = useStudyQueue();

  switch (queueState.status) {
    case "loading":
      return <p>{t("common.loading")}</p>;
    case "error":
      return <p role="alert">{t("common.loadError")}</p>;
    case "ready":
      return <StudySession mode={mode} queue={queueState.queue} onContinue={onContinue} />;
  }
}
