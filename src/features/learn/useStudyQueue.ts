import { useEffect, useState } from "react";
import type { StudyQueue } from "../../domain/scheduling";
import { loadStudyQueue } from "./learningService";

export type StudyQueueState =
  | { status: "loading" }
  | { status: "ready"; queue: StudyQueue }
  | { status: "error"; error: unknown };

/** Loads the cards that are due or new, once when the component mounts. */
export function useStudyQueue(): StudyQueueState {
  const [state, setState] = useState<StudyQueueState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    loadStudyQueue().then(
      (queue) => {
        if (!cancelled) setState({ status: "ready", queue });
      },
      (error: unknown) => {
        if (!cancelled) setState({ status: "error", error });
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
