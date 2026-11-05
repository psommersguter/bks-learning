/**
 * Spaced-repetition scheduling on top of ts-fsrs (FSRS-7).
 *
 * Every word has two independently scheduled cards, one per direction. A card only gets stored
 * progress once it has been reviewed for the first time; until then it counts as "new".
 */
import {
  DefaultScheduler,
  type DefaultSchedulerCard,
  type DefaultSchedulerRevlog,
  type Grade,
} from "ts-fsrs";
import type { Word } from "./vocabulary";

export { Rating } from "ts-fsrs";
export type { Grade };

export const DIRECTIONS = ["hr-de", "de-hr"] as const;

/** `hr-de`: Croatian prompt, German answer (recognition). `de-hr`: the other way (production). */
export type Direction = (typeof DIRECTIONS)[number];

export type Scheduler = DefaultScheduler;
export type FsrsCard = DefaultSchedulerCard;
export type FsrsReviewLog = DefaultSchedulerRevlog;

export interface CardKey {
  wordId: string;
  direction: Direction;
}

/** Stored learning state of one word in one direction. */
export interface CardProgress extends CardKey {
  fsrs: FsrsCard;
}

/** One answer, kept as history (statistics, future FSRS parameter optimisation). */
export interface ReviewRecord extends CardKey {
  rating: Grade;
  reviewedAt: Date;
  log: FsrsReviewLog;
}

export interface SchedulerOptions {
  /** Target probability of remembering a card when it is due (0–1). */
  desiredRetention?: number;
  /** Randomises longer intervals slightly so cards learned together don't stay clustered. */
  enableFuzz?: boolean;
}

export const DEFAULT_DESIRED_RETENTION = 0.9;

export function createScheduler(options: SchedulerOptions = {}): Promise<Scheduler> {
  return DefaultScheduler({
    desiredRetention: options.desiredRetention ?? DEFAULT_DESIRED_RETENTION,
    enableFuzz: options.enableFuzz ?? true,
  });
}

/** A card that can be studied: a word in one direction, with its progress if it has any. */
export interface StudyItem extends CardKey {
  word: Word;
  /** `undefined` for new cards that have never been reviewed. */
  fsrs?: FsrsCard;
}

export interface StudyQueue {
  /** Reviewed before and due now, most overdue first. */
  due: StudyItem[];
  /** Never reviewed, in vocabulary-file order (per word: `hr-de` before `de-hr`). */
  new: StudyItem[];
  /** Reviewed before but not due yet, soonest due first (for reviewing ahead / free practice). */
  upcoming: StudyItem[];
}

/**
 * Splits all cards into due, new and upcoming.
 * Progress of words that no longer exist in the vocabulary is ignored.
 */
export function buildStudyQueue(
  words: readonly Word[],
  progress: readonly CardProgress[],
  now: Date,
): StudyQueue {
  const progressByKey = new Map(progress.map((entry) => [cardKeyString(entry), entry.fsrs]));
  const due: StudyItem[] = [];
  const fresh: StudyItem[] = [];
  const upcoming: StudyItem[] = [];

  for (const word of words) {
    for (const direction of DIRECTIONS) {
      const fsrs = progressByKey.get(cardKeyString({ wordId: word.id, direction }));
      if (fsrs === undefined) {
        fresh.push({ wordId: word.id, direction, word });
      } else if (fsrs.dueAt.getTime() <= now.getTime()) {
        due.push({ wordId: word.id, direction, word, fsrs });
      } else {
        upcoming.push({ wordId: word.id, direction, word, fsrs });
      }
    }
  }

  const byDueTime = (a: StudyItem, b: StudyItem) => dueTime(a) - dueTime(b);
  due.sort(byDueTime);
  upcoming.sort(byDueTime);
  return { due, new: fresh, upcoming };
}

/** Applies an answer to a card and returns the new progress plus the history entry to store. */
export function reviewCard(
  scheduler: Scheduler,
  item: CardKey & { fsrs?: FsrsCard | undefined },
  rating: Grade,
  now: Date,
): { progress: CardProgress; review: ReviewRecord } {
  const card = item.fsrs ?? scheduler.newCard({ now });
  const result = scheduler.review({ card, grade: rating, now });
  const key = { wordId: item.wordId, direction: item.direction };

  return {
    progress: { ...key, fsrs: result.card },
    review: { ...key, rating, reviewedAt: now, log: result.revlog },
  };
}

function cardKeyString(key: CardKey): string {
  return `${key.wordId}|${key.direction}`;
}

function dueTime(item: StudyItem): number {
  return item.fsrs?.dueAt.getTime() ?? 0;
}
