/**
 * A study session: the order of cards, the phase of the current card, and which ratings the
 * learner can choose. Pure state transitions, used with React's `useReducer`.
 *
 * Saving answers is not part of this module: the UI stores the review first and then
 * dispatches `answered` with the new progress.
 */
import { type AnswerCheck, checkAnswer } from "./answerCheck";
import {
  type CardProgress,
  DIRECTIONS,
  type Grade,
  Rating,
  type StudyItem,
  type StudyQueue,
} from "./scheduling";

/**
 * - `regular`: everything due now plus all new words. Answers are saved.
 * - `ahead`: the next cards that will be due ("review ahead"). Answers are saved; FSRS accounts
 *   for the early review.
 * - `practice`: random learned cards. Answers are NOT saved, the schedule stays untouched.
 */
export const SESSION_MODES = ["regular", "ahead", "practice"] as const;
export type SessionMode = (typeof SESSION_MODES)[number];

/** Number of cards in one "ahead" or "practice" round. */
export const EXTRA_ROUND_SIZE = 20;

/** New words are introduced in groups: first all of a group in hr-de, then the same in de-hr. */
export const NEW_WORD_GROUP_SIZE = 5;

/**
 * A card that is due again within this time (e.g. after "Again") is repeated in the session,
 * even if that means slightly ahead of time. Same as Anki's default "learn ahead limit".
 */
export const REPEAT_WITHIN_SESSION_MS = 20 * 60 * 1000;

export type SessionPhase =
  /** The prompt is shown; hr-de waits for "reveal", de-hr for a typed answer. */
  | { kind: "question" }
  /** hr-de: the answer is shown and the learner rates themselves. */
  | { kind: "revealed" }
  /** de-hr: the typed answer has been checked. */
  | { kind: "checked"; input: string; check: AnswerCheck };

export interface SessionState {
  /** Cards still to study; the first one is the current card. */
  queue: readonly StudyItem[];
  phase: SessionPhase;
  reviewedCount: number;
}

export type SessionAction =
  | { type: "reveal" }
  | { type: "submit"; input: string }
  | { type: "answered"; progress: CardProgress; now: Date };

export interface SessionCardsOptions {
  groupSize?: number;
  roundSize?: number;
  /** Source of randomness for `practice`; returns a number in [0, 1). */
  random?: () => number;
}

/** The cards a session of the given mode consists of, in study order. */
export function sessionCards(
  mode: SessionMode,
  queue: StudyQueue,
  options: SessionCardsOptions = {},
): StudyItem[] {
  const {
    groupSize = NEW_WORD_GROUP_SIZE,
    roundSize = EXTRA_ROUND_SIZE,
    random = Math.random,
  } = options;

  switch (mode) {
    case "regular":
      return [...queue.due, ...groupNewCards(queue.new, groupSize)];
    case "ahead":
      return queue.upcoming.slice(0, roundSize);
    case "practice":
      return shuffle([...queue.due, ...queue.upcoming], random).slice(0, roundSize);
  }
}

/** Whether a session of this mode would have any cards. */
export function hasSessionCards(mode: SessionMode, queue: StudyQueue): boolean {
  switch (mode) {
    case "regular":
      return queue.due.length + queue.new.length > 0;
    case "ahead":
      return queue.upcoming.length > 0;
    case "practice":
      return queue.due.length + queue.upcoming.length > 0;
  }
}

export function startSession(cards: readonly StudyItem[]): SessionState {
  return { queue: cards, phase: { kind: "question" }, reviewedCount: 0 };
}

export function currentCard(state: SessionState): StudyItem | undefined {
  return state.queue[0];
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  const card = currentCard(state);
  if (!card) return state;

  switch (action.type) {
    case "reveal": {
      if (state.phase.kind !== "question" || card.direction !== "hr-de") return state;
      return { ...state, phase: { kind: "revealed" } };
    }
    case "submit": {
      if (state.phase.kind !== "question" || card.direction !== "de-hr") return state;
      const check = checkAnswer(action.input, card.word.hr);
      return { ...state, phase: { kind: "checked", input: action.input, check } };
    }
    case "answered": {
      const { progress, now } = action;
      if (progress.wordId !== card.wordId || progress.direction !== card.direction) return state;

      const [, ...rest] = state.queue;
      const repeat = progress.fsrs.dueAt.getTime() - now.getTime() <= REPEAT_WITHIN_SESSION_MS;
      return {
        queue: repeat ? [...rest, { ...card, fsrs: progress.fsrs }] : rest,
        phase: { kind: "question" },
        reviewedCount: state.reviewedCount + 1,
      };
    }
  }
}

export interface RatingOption {
  rating: Grade;
  /** Chosen when the learner presses Enter. */
  isDefault: boolean;
  /** "I was right": accepts an answer the checker rejected (e.g. a synonym not in the file). */
  isOverride: boolean;
}

/** The ratings the learner can choose in the current phase (none while the prompt is shown). */
export function ratingOptions(phase: SessionPhase): RatingOption[] {
  switch (phase.kind) {
    case "question":
      return [];
    case "revealed":
      return options([Rating.Again, Rating.Hard, Rating.Good, Rating.Easy], Rating.Good);
    case "checked":
      switch (phase.check.verdict) {
        case "correct":
          return options([Rating.Hard, Rating.Good, Rating.Easy], Rating.Good);
        case "diacritics":
          return options([Rating.Again, Rating.Hard, Rating.Good], Rating.Hard);
        case "wrong":
          return [
            { rating: Rating.Again, isDefault: true, isOverride: false },
            { rating: Rating.Good, isDefault: false, isOverride: true },
          ];
      }
  }
}

function options(ratings: readonly Grade[], defaultRating: Grade): RatingOption[] {
  return ratings.map((rating) => ({
    rating,
    isDefault: rating === defaultRating,
    isOverride: false,
  }));
}

function groupNewCards(items: readonly StudyItem[], groupSize: number): StudyItem[] {
  const itemsByWord = new Map<string, StudyItem[]>();
  for (const item of items) {
    const wordItems = itemsByWord.get(item.wordId);
    if (wordItems) wordItems.push(item);
    else itemsByWord.set(item.wordId, [item]);
  }

  const words = [...itemsByWord.values()];
  const ordered: StudyItem[] = [];
  for (let start = 0; start < words.length; start += groupSize) {
    const group = words.slice(start, start + groupSize).flat();
    for (const direction of DIRECTIONS) {
      ordered.push(...group.filter((item) => item.direction === direction));
    }
  }
  return ordered;
}

/** Fisher–Yates shuffle, in place. */
function shuffle<T>(items: T[], random: () => number): T[] {
  for (let index = items.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    const current = items[index] as T;
    items[index] = items[other] as T;
    items[other] = current;
  }
  return items;
}
