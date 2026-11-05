import type { CardProgress, ReviewRecord } from "../domain/scheduling";
import type { LearningDatabase } from "./database";

export function loadAllProgress(database: LearningDatabase): Promise<CardProgress[]> {
  return database.getAll("progress");
}

/**
 * Stores the outcome of one answer: the card's new state and the history entry.
 * Both are written in one transaction, so they can't get out of sync.
 */
export async function saveReview(
  database: LearningDatabase,
  progress: CardProgress,
  review: ReviewRecord,
): Promise<void> {
  const transaction = database.transaction(["progress", "reviews"], "readwrite");
  await Promise.all([
    transaction.objectStore("progress").put(progress),
    transaction.objectStore("reviews").add(review),
    transaction.done,
  ]);
}

export function loadAllReviews(database: LearningDatabase): Promise<ReviewRecord[]> {
  return database.getAll("reviews");
}
