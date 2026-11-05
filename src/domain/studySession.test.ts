import { beforeAll, describe, expect, it } from "vitest";
import {
  createScheduler,
  type Direction,
  Rating,
  reviewCard,
  type Scheduler,
  type StudyItem,
  type StudyQueue,
} from "./scheduling";
import {
  currentCard,
  hasSessionCards,
  ratingOptions,
  type SessionState,
  sessionCards,
  sessionReducer,
  startSession,
} from "./studySession";
import type { Word } from "./vocabulary";

const NOW = new Date("2026-11-05T10:00:00Z");

let scheduler: Scheduler;

beforeAll(async () => {
  scheduler = await createScheduler({ enableFuzz: false });
});

function word(id: string, hr = `hr-${id}`): Word {
  return { id, hr: [hr], de: [`de-${id}`], tags: [] };
}

function item(w: Word, direction: Direction): StudyItem {
  return { wordId: w.id, direction, word: w };
}

function queue(parts: Partial<StudyQueue>): StudyQueue {
  return { due: [], new: [], upcoming: [], ...parts };
}

function cardKeys(cards: readonly StudyItem[]): string[] {
  return cards.map((entry) => `${entry.wordId}:${entry.direction}`);
}

function keys(state: SessionState): string[] {
  return cardKeys(state.queue);
}

function answer(state: SessionState, rating: Parameters<typeof reviewCard>[2]): SessionState {
  const card = currentCard(state);
  if (!card) throw new Error("no current card");
  const { progress } = reviewCard(scheduler, card, rating, NOW);
  return sessionReducer(state, { type: "answered", progress, now: NOW });
}

describe("sessionCards", () => {
  describe("regular", () => {
    it("puts due cards before new ones and leaves out upcoming ones", () => {
      const [a, b, c] = [word("a"), word("b"), word("c")];
      const cards = sessionCards(
        "regular",
        queue({ due: [item(a, "de-hr")], new: [item(b, "hr-de")], upcoming: [item(c, "hr-de")] }),
      );
      expect(cardKeys(cards)).toEqual(["a:de-hr", "b:hr-de"]);
    });

    it("introduces new words in groups: hr-de first, then de-hr", () => {
      const words = ["a", "b", "c"].map((id) => word(id));
      const fresh = words.flatMap((w) => [item(w, "hr-de"), item(w, "de-hr")]);

      const cards = sessionCards("regular", queue({ new: fresh }), { groupSize: 2 });

      expect(cardKeys(cards)).toEqual([
        "a:hr-de",
        "b:hr-de",
        "a:de-hr",
        "b:de-hr",
        "c:hr-de",
        "c:de-hr",
      ]);
    });

    it("handles words with only one new direction", () => {
      const [a, b] = [word("a"), word("b")];
      const cards = sessionCards("regular", queue({ new: [item(a, "de-hr"), item(b, "hr-de")] }));
      expect(cardKeys(cards)).toEqual(["b:hr-de", "a:de-hr"]);
    });
  });

  describe("ahead", () => {
    it("takes the upcoming cards in their order (soonest due first), up to the round size", () => {
      const upcoming = ["a", "b", "c"].map((id) => item(word(id), "hr-de"));
      const cards = sessionCards("ahead", queue({ upcoming }), { roundSize: 2 });
      expect(cardKeys(cards)).toEqual(["a:hr-de", "b:hr-de"]);
    });

    it("ignores due and new cards", () => {
      const cards = sessionCards(
        "ahead",
        queue({ due: [item(word("a"), "hr-de")], new: [item(word("b"), "hr-de")] }),
      );
      expect(cards).toEqual([]);
    });
  });

  describe("practice", () => {
    it("picks a random selection of learned cards (due and upcoming), never new ones", () => {
      const due = [item(word("a"), "hr-de")];
      const upcoming = ["b", "c", "d"].map((id) => item(word(id), "de-hr"));
      const fresh = [item(word("e"), "hr-de")];

      const cards = sessionCards("practice", queue({ due, upcoming, new: fresh }), {
        roundSize: 3,
        random: () => 0,
      });

      expect(cards).toHaveLength(3);
      expect(cardKeys(cards)).not.toContain("e:hr-de");
      // With random() = 0 every element swaps with the first one: a deterministic shuffle.
      expect(cardKeys(cards)).toEqual(["b:de-hr", "c:de-hr", "d:de-hr"]);
    });

    it("contains every learned card at most once", () => {
      const upcoming = ["a", "b", "c", "d", "e"].map((id) => item(word(id), "hr-de"));
      const cards = sessionCards("practice", queue({ upcoming }));
      expect(new Set(cardKeys(cards)).size).toBe(5);
    });
  });
});

describe("hasSessionCards", () => {
  const learned = item(word("a"), "hr-de");
  const fresh = item(word("b"), "hr-de");

  it.each([
    ["regular", queue({ new: [fresh] }), true],
    ["regular", queue({ upcoming: [learned] }), false],
    ["ahead", queue({ upcoming: [learned] }), true],
    ["ahead", queue({ due: [learned] }), false],
    ["practice", queue({ due: [learned] }), true],
    ["practice", queue({ new: [fresh] }), false],
  ] as const)("%s with %o → %s", (mode, studyQueue, expected) => {
    expect(hasSessionCards(mode, studyQueue)).toBe(expected);
  });
});

describe("startSession", () => {
  it("starts with the first card's question and no reviews", () => {
    const state = startSession([item(word("a"), "hr-de")]);
    expect(state.phase).toEqual({ kind: "question" });
    expect(state.reviewedCount).toBe(0);
  });
});

describe("sessionReducer", () => {
  it("reveals hr-de cards", () => {
    const state = startSession([item(word("a"), "hr-de")]);
    expect(sessionReducer(state, { type: "reveal" }).phase).toEqual({ kind: "revealed" });
  });

  it("checks typed answers of de-hr cards against the Croatian terms", () => {
    const state = startSession([item(word("a", "kuća"), "de-hr")]);

    const next = sessionReducer(state, { type: "submit", input: "kuca" });

    expect(next.phase).toEqual({
      kind: "checked",
      input: "kuca",
      check: { verdict: "diacritics", expected: "kuća" },
    });
  });

  it("ignores actions that don't fit the card or phase", () => {
    const hrDe = startSession([item(word("a"), "hr-de")]);
    expect(sessionReducer(hrDe, { type: "submit", input: "x" })).toBe(hrDe);

    const deHr = startSession([item(word("a"), "de-hr")]);
    expect(sessionReducer(deHr, { type: "reveal" })).toBe(deHr);

    const revealed = sessionReducer(hrDe, { type: "reveal" });
    expect(sessionReducer(revealed, { type: "reveal" })).toBe(revealed);
  });

  it("moves to the next card after a remembered answer", () => {
    const [a, b] = [word("a"), word("b")];
    const state = startSession([item(a, "hr-de"), item(b, "hr-de")]);

    const next = answer(state, Rating.Good);

    expect(keys(next)).toEqual(["b:hr-de"]);
    expect(next.phase).toEqual({ kind: "question" });
    expect(next.reviewedCount).toBe(1);
  });

  it("repeats a forgotten card at the end of the session, with its new progress", () => {
    const [a, b] = [word("a"), word("b")];
    const state = startSession([item(a, "hr-de"), item(b, "hr-de")]);

    const next = answer(state, Rating.Again);

    expect(keys(next)).toEqual(["b:hr-de", "a:hr-de"]);
    expect(next.queue[1]?.fsrs?.reps).toBe(1);
  });

  it("ends when the queue is empty", () => {
    const state = startSession([item(word("a"), "hr-de")]);
    const done = answer(state, Rating.Good);

    expect(currentCard(done)).toBeUndefined();
    expect(sessionReducer(done, { type: "reveal" })).toBe(done);
  });

  it("ignores progress that belongs to another card", () => {
    const [a, b] = [word("a"), word("b")];
    const state = startSession([item(a, "hr-de")]);
    const { progress } = reviewCard(scheduler, item(b, "hr-de"), Rating.Good, NOW);

    expect(sessionReducer(state, { type: "answered", progress, now: NOW })).toBe(state);
  });
});

describe("ratingOptions", () => {
  const ratings = (options: ReturnType<typeof ratingOptions>) =>
    options.map((option) => option.rating);
  const defaultRating = (options: ReturnType<typeof ratingOptions>) =>
    options.find((option) => option.isDefault)?.rating;

  it("offers nothing while the question is shown", () => {
    expect(ratingOptions({ kind: "question" })).toEqual([]);
  });

  it("offers all four ratings for self-graded cards, defaulting to Good", () => {
    const options = ratingOptions({ kind: "revealed" });
    expect(ratings(options)).toEqual([Rating.Again, Rating.Hard, Rating.Good, Rating.Easy]);
    expect(defaultRating(options)).toBe(Rating.Good);
  });

  it("offers Hard/Good/Easy for a correct typed answer, defaulting to Good", () => {
    const options = ratingOptions({
      kind: "checked",
      input: "kuća",
      check: { verdict: "correct", expected: "kuća" },
    });
    expect(ratings(options)).toEqual([Rating.Hard, Rating.Good, Rating.Easy]);
    expect(defaultRating(options)).toBe(Rating.Good);
  });

  it("defaults to Hard for a diacritics mistake", () => {
    const options = ratingOptions({
      kind: "checked",
      input: "kuca",
      check: { verdict: "diacritics", expected: "kuća" },
    });
    expect(ratings(options)).toEqual([Rating.Again, Rating.Hard, Rating.Good]);
    expect(defaultRating(options)).toBe(Rating.Hard);
  });

  it('defaults to Again for a wrong answer and offers an "I was right" override', () => {
    const options = ratingOptions({
      kind: "checked",
      input: "x",
      check: { verdict: "wrong", expected: "kuća" },
    });
    expect(options).toEqual([
      { rating: Rating.Again, isDefault: true, isOverride: false },
      { rating: Rating.Good, isDefault: false, isOverride: true },
    ]);
  });
});
