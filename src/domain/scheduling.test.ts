import { beforeAll, describe, expect, it } from "vitest";
import {
  buildStudyQueue,
  type CardProgress,
  createScheduler,
  Rating,
  reviewCard,
  type Scheduler,
} from "./scheduling";
import type { Word } from "./vocabulary";

const NOW = new Date("2026-11-05T10:00:00Z");
const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

const kuca: Word = { id: "id-kuca", hr: ["kuća"], de: ["das Haus"], tags: [] };
const pas: Word = { id: "id-pas", hr: ["pas"], de: ["der Hund"], tags: [] };

let scheduler: Scheduler;

beforeAll(async () => {
  scheduler = await createScheduler({ enableFuzz: false });
});

/** Progress for a card that was reviewed once, due at the given time. */
function progressDueAt(word: Word, direction: CardProgress["direction"], dueAt: Date) {
  const { progress } = reviewCard(scheduler, { wordId: word.id, direction }, Rating.Good, NOW);
  return { ...progress, fsrs: { ...progress.fsrs, dueAt } };
}

describe("reviewCard", () => {
  it("creates progress for a new card", () => {
    const { progress, review } = reviewCard(
      scheduler,
      { wordId: kuca.id, direction: "hr-de" },
      Rating.Good,
      NOW,
    );

    expect(progress.wordId).toBe(kuca.id);
    expect(progress.direction).toBe("hr-de");
    expect(progress.fsrs.reps).toBe(1);
    expect(progress.fsrs.dueAt.getTime()).toBeGreaterThan(NOW.getTime());

    expect(review).toMatchObject({
      wordId: kuca.id,
      direction: "hr-de",
      rating: Rating.Good,
      reviewedAt: NOW,
    });
  });

  it("schedules a forgotten card much sooner than a remembered one", () => {
    const key = { wordId: kuca.id, direction: "hr-de" } as const;
    const again = reviewCard(scheduler, key, Rating.Again, NOW).progress.fsrs.dueAt.getTime();
    const good = reviewCard(scheduler, key, Rating.Good, NOW).progress.fsrs.dueAt.getTime();
    const easy = reviewCard(scheduler, key, Rating.Easy, NOW).progress.fsrs.dueAt.getTime();

    expect(again - NOW.getTime()).toBeLessThan(DAY);
    expect(good).toBeGreaterThan(again);
    expect(easy).toBeGreaterThan(good);
  });

  it("continues from existing progress", () => {
    const key = { wordId: kuca.id, direction: "de-hr" } as const;
    const first = reviewCard(scheduler, key, Rating.Good, NOW).progress;
    const second = reviewCard(scheduler, first, Rating.Good, first.fsrs.dueAt).progress;

    expect(second.fsrs.reps).toBe(2);
    expect(second.fsrs.dueAt.getTime() - first.fsrs.dueAt.getTime()).toBeGreaterThan(
      first.fsrs.dueAt.getTime() - NOW.getTime(),
    );
  });

  it("does not modify the given progress", () => {
    const first = reviewCard(
      scheduler,
      { wordId: kuca.id, direction: "hr-de" },
      Rating.Good,
      NOW,
    ).progress;
    const snapshot = structuredClone(first);
    reviewCard(scheduler, first, Rating.Again, first.fsrs.dueAt);
    expect(first).toEqual(snapshot);
  });

  it("works with progress that went through structured cloning (as IndexedDB does)", () => {
    const first = reviewCard(
      scheduler,
      { wordId: kuca.id, direction: "hr-de" },
      Rating.Good,
      NOW,
    ).progress;
    const restored = structuredClone(first);
    const second = reviewCard(scheduler, restored, Rating.Good, restored.fsrs.dueAt).progress;
    expect(second.fsrs.reps).toBe(2);
  });
});

describe("buildStudyQueue", () => {
  it("treats cards without progress as new, in file order and both directions", () => {
    const queue = buildStudyQueue([kuca, pas], [], NOW);

    expect(queue.due).toEqual([]);
    expect(queue.new.map((item) => [item.wordId, item.direction])).toEqual([
      [kuca.id, "hr-de"],
      [kuca.id, "de-hr"],
      [pas.id, "hr-de"],
      [pas.id, "de-hr"],
    ]);
  });

  it("returns due cards, most overdue first, and leaves out cards that aren't due yet", () => {
    const progress = [
      progressDueAt(kuca, "hr-de", new Date(NOW.getTime() - MINUTE)),
      progressDueAt(kuca, "de-hr", new Date(NOW.getTime() + DAY)),
      progressDueAt(pas, "hr-de", new Date(NOW.getTime() - DAY)),
      progressDueAt(pas, "de-hr", NOW),
    ];

    const queue = buildStudyQueue([kuca, pas], progress, NOW);

    expect(queue.due.map((item) => [item.wordId, item.direction])).toEqual([
      [pas.id, "hr-de"],
      [kuca.id, "hr-de"],
      [pas.id, "de-hr"],
    ]);
    expect(queue.new).toEqual([]);
  });

  it("lists learned cards that aren't due yet as upcoming, soonest first", () => {
    const progress = [
      progressDueAt(kuca, "hr-de", new Date(NOW.getTime() + 3 * DAY)),
      progressDueAt(kuca, "de-hr", new Date(NOW.getTime() + MINUTE)),
      progressDueAt(pas, "hr-de", new Date(NOW.getTime() - DAY)),
    ];

    const queue = buildStudyQueue([kuca, pas], progress, NOW);

    expect(queue.upcoming.map((item) => [item.wordId, item.direction])).toEqual([
      [kuca.id, "de-hr"],
      [kuca.id, "hr-de"],
    ]);
    expect(queue.due.map((item) => item.wordId)).toEqual([pas.id]);
    expect(queue.new.map((item) => [item.wordId, item.direction])).toEqual([[pas.id, "de-hr"]]);
  });

  it("attaches the word and progress to each item", () => {
    const progress = [progressDueAt(kuca, "hr-de", NOW)];
    const [item] = buildStudyQueue([kuca], progress, NOW).due;

    expect(item?.word).toBe(kuca);
    expect(item?.fsrs).toBe(progress[0]?.fsrs);
  });

  it("ignores progress of words that were removed from the vocabulary", () => {
    const progress = [progressDueAt(pas, "hr-de", NOW)];
    const queue = buildStudyQueue([kuca], progress, NOW);

    expect(queue.due).toEqual([]);
    expect(queue.new).toHaveLength(2);
  });
});
