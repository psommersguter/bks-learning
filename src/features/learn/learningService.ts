/**
 * Connects the pure scheduling logic with the stored progress. The only place the UI talks to
 * for loading cards and recording answers.
 */
import { vocabulary } from "../../data/vocabulary";
import {
  buildStudyQueue,
  type CardKey,
  type CardProgress,
  createScheduler,
  type FsrsCard,
  type Grade,
  reviewCard,
  type Scheduler,
  type StudyQueue,
} from "../../domain/scheduling";
import { getLearningDatabase } from "../../storage/database";
import { loadAllProgress, saveReview } from "../../storage/progressRepository";

let sharedScheduler: Promise<Scheduler> | undefined;

function getScheduler(): Promise<Scheduler> {
  sharedScheduler ??= createScheduler();
  return sharedScheduler;
}

export async function loadStudyQueue(now: Date = new Date()): Promise<StudyQueue> {
  // Also prepare the scheduler, so the first answer isn't delayed by its initialisation.
  const [database] = await Promise.all([getLearningDatabase(), getScheduler()]);
  const progress = await loadAllProgress(database);
  return buildStudyQueue(vocabulary, progress, now);
}

/** Schedules the card according to the rating, stores the result and returns the new progress. */
export async function recordAnswer(
  card: CardKey & { fsrs?: FsrsCard | undefined },
  rating: Grade,
  now: Date,
): Promise<CardProgress> {
  const [scheduler, database] = await Promise.all([getScheduler(), getLearningDatabase()]);
  const { progress, review } = reviewCard(scheduler, card, rating, now);
  await saveReview(database, progress, review);
  return progress;
}

/**
 * Like `recordAnswer`, but nothing is stored (free practice). The returned progress only lives
 * in the session, e.g. to repeat a forgotten card within it.
 */
export async function practiceAnswer(
  card: CardKey & { fsrs?: FsrsCard | undefined },
  rating: Grade,
  now: Date,
): Promise<CardProgress> {
  const scheduler = await getScheduler();
  return reviewCard(scheduler, card, rating, now).progress;
}
