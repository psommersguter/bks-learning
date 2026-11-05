// Installs IndexedDB globals (IDBRequest, IDBKeyRange, …) that `idb` relies on in Node.
import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  type CardProgress,
  createScheduler,
  Rating,
  type ReviewRecord,
  reviewCard,
  type Scheduler,
} from "../domain/scheduling";
import { type LearningDatabase, openLearningDatabase } from "./database";
import { loadAllProgress, loadAllReviews, saveReview } from "./progressRepository";

const NOW = new Date("2026-11-05T10:00:00Z");

let scheduler: Scheduler;
let database: LearningDatabase;

beforeAll(async () => {
  scheduler = await createScheduler({ enableFuzz: false });
});

beforeEach(async () => {
  // A fresh in-memory IndexedDB for every test.
  globalThis.indexedDB = new IDBFactory();
  database = await openLearningDatabase();
});

afterEach(() => {
  database.close();
});

function answer(
  item: Parameters<typeof reviewCard>[1],
  rating: Parameters<typeof reviewCard>[2],
  now = NOW,
): { progress: CardProgress; review: ReviewRecord } {
  return reviewCard(scheduler, item, rating, now);
}

describe("progress repository", () => {
  it("starts empty", async () => {
    expect(await loadAllProgress(database)).toEqual([]);
    expect(await loadAllReviews(database)).toEqual([]);
  });

  it("stores progress and review, including dates", async () => {
    const { progress, review } = answer({ wordId: "w1", direction: "hr-de" }, Rating.Good);
    await saveReview(database, progress, review);

    const [storedProgress] = await loadAllProgress(database);
    const [storedReview] = await loadAllReviews(database);

    expect(storedProgress).toEqual(progress);
    expect(storedProgress?.fsrs.dueAt).toBeInstanceOf(Date);
    expect(storedReview).toEqual(review);
  });

  it("keeps one progress entry per word and direction, but every review", async () => {
    const first = answer({ wordId: "w1", direction: "hr-de" }, Rating.Good);
    await saveReview(database, first.progress, first.review);

    const second = answer(first.progress, Rating.Again, first.progress.fsrs.dueAt);
    await saveReview(database, second.progress, second.review);

    const otherDirection = answer({ wordId: "w1", direction: "de-hr" }, Rating.Good);
    await saveReview(database, otherDirection.progress, otherDirection.review);

    const progress = await loadAllProgress(database);
    expect(progress).toHaveLength(2);
    expect(progress).toContainEqual(second.progress);
    expect(progress).toContainEqual(otherDirection.progress);

    const reviews = await loadAllReviews(database);
    expect(reviews.map((review) => review.rating)).toEqual([
      Rating.Good,
      Rating.Again,
      Rating.Good,
    ]);
  });

  it("can continue scheduling from stored progress", async () => {
    const first = answer({ wordId: "w1", direction: "hr-de" }, Rating.Good);
    await saveReview(database, first.progress, first.review);

    const [stored] = await loadAllProgress(database);
    if (!stored) throw new Error("progress was not stored");
    const next = answer(stored, Rating.Good, stored.fsrs.dueAt);

    expect(next.progress.fsrs.reps).toBe(2);
  });

  it("persists across connections", async () => {
    const { progress, review } = answer({ wordId: "w1", direction: "hr-de" }, Rating.Good);
    await saveReview(database, progress, review);
    database.close();

    database = await openLearningDatabase();
    expect(await loadAllProgress(database)).toEqual([progress]);
  });
});
