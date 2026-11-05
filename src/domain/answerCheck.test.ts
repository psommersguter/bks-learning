import { describe, expect, it } from "vitest";
import { checkAnswer, diffDiacritics } from "./answerCheck";

describe("checkAnswer", () => {
  it("accepts the exact term", () => {
    expect(checkAnswer("kuća", ["kuća"])).toEqual({ verdict: "correct", expected: "kuća" });
  });

  it("ignores case, extra whitespace and punctuation", () => {
    expect(checkAnswer("  Dobar   DAN! ", ["dobar dan"]).verdict).toBe("correct");
  });

  it("treats precomposed and decomposed diacritics as equal", () => {
    expect(checkAnswer("kuća", ["kuća"]).verdict).toBe("correct");
  });

  it("accepts any variant and reports the matched one", () => {
    expect(checkAnswer("napisati", ["pisati", "napisati"])).toEqual({
      verdict: "correct",
      expected: "napisati",
    });
  });

  it.each([
    ["kuca", "kuća"],
    ["kuča", "kuća"],
    ["cokolada", "čokolada"],
    ["sesir", "šešir"],
    ["zena", "žena"],
    ["dak", "đak"],
  ])("flags %s for %s as a diacritics mistake", (input, expected) => {
    expect(checkAnswer(input, [expected])).toEqual({ verdict: "diacritics", expected });
  });

  it('does not accept "dj" for "đ" (different number of letters)', () => {
    expect(checkAnswer("djak", ["đak"]).verdict).toBe("wrong");
  });

  it("is strict about other typos", () => {
    expect(checkAnswer("kucha", ["kuća"])).toEqual({ verdict: "wrong", expected: "kuća" });
    expect(checkAnswer("kuć", ["kuća"]).verdict).toBe("wrong");
  });

  it("treats an empty answer as wrong", () => {
    expect(checkAnswer("   ", ["kuća"])).toEqual({ verdict: "wrong", expected: "kuća" });
  });

  it("reports the first term as expected when nothing matches", () => {
    expect(checkAnswer("x", ["pisati", "napisati"]).expected).toBe("pisati");
  });

  it("matches the variant closest to the answer for diacritics mistakes", () => {
    expect(checkAnswer("cuti", ["slušati", "čuti"])).toEqual({
      verdict: "diacritics",
      expected: "čuti",
    });
  });
});

describe("diffDiacritics", () => {
  it("marks the letters with wrong diacritics", () => {
    expect(diffDiacritics("kuca", "kuća")).toEqual([
      { text: "ku", mismatch: false },
      { text: "ć", mismatch: true },
      { text: "a", mismatch: false },
    ]);
  });

  it("marks several separate mistakes", () => {
    expect(diffDiacritics("sesir", "šešir")).toEqual([
      { text: "š", mismatch: true },
      { text: "e", mismatch: false },
      { text: "š", mismatch: true },
      { text: "ir", mismatch: false },
    ]);
  });

  it("ignores case when comparing but keeps the expected spelling", () => {
    expect(diffDiacritics("zagreb", "Zagreb")).toEqual([{ text: "Zagreb", mismatch: false }]);
  });

  it("falls back to an unmarked term if the strings can't be aligned", () => {
    expect(diffDiacritics("dobar dan", "Dobar dan!")).toEqual([
      { text: "Dobar dan!", mismatch: false },
    ]);
  });
});
