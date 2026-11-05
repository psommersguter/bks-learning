/**
 * Checks a typed answer against the accepted terms of a word.
 *
 * Deliberately strict: the only tolerated mistake is a wrong or missing diacritic
 * (č ć đ š ž). Case, surrounding/multiple spaces and sentence punctuation are ignored.
 */
/** The accepted answers; the first one is reported as expected when nothing matches. */
export type AcceptedAnswers = readonly [string, ...string[]];

export type AnswerVerdict = "correct" | "diacritics" | "wrong";

export interface AnswerCheck {
  verdict: AnswerVerdict;
  /** The accepted term the answer matched (or the first accepted term if it matched none). */
  expected: string;
}

export function checkAnswer(input: string, accepted: AcceptedAnswers): AnswerCheck {
  const answer = normalize(input);

  const exact = accepted.find((term) => normalize(term) === answer);
  if (exact !== undefined) {
    return { verdict: "correct", expected: exact };
  }

  const strippedAnswer = stripDiacritics(answer);
  const nearMiss = accepted.find((term) => stripDiacritics(normalize(term)) === strippedAnswer);
  if (nearMiss !== undefined && answer !== "") {
    return { verdict: "diacritics", expected: nearMiss };
  }

  return { verdict: "wrong", expected: accepted[0] };
}

export interface DiffSegment {
  text: string;
  /** True if the learner got this part wrong. */
  mismatch: boolean;
}

/**
 * Splits `expected` into segments, marking the letters whose diacritics differ from `input`.
 * Meant for answers with verdict "diacritics"; returns one unmarked segment if the
 * two can't be aligned letter by letter.
 */
export function diffDiacritics(input: string, expected: string): DiffSegment[] {
  const typed = [...normalize(input)];
  const target = [...expected.normalize("NFC")];
  const targetNormalized = [...normalize(expected)];

  // Letter-by-letter alignment only works if normalising didn't change the length
  // (e.g. no collapsed spaces or removed punctuation).
  if (typed.length !== target.length || targetNormalized.length !== target.length) {
    return [{ text: expected, mismatch: false }];
  }

  const segments: DiffSegment[] = [];
  target.forEach((char, index) => {
    const mismatch = typed[index] !== targetNormalized[index];
    const last = segments.at(-1);
    if (last && last.mismatch === mismatch) {
      last.text += char;
    } else {
      segments.push({ text: char, mismatch });
    }
  });
  return segments;
}

/** Lower-cases, trims, collapses whitespace and drops sentence punctuation. */
function normalize(text: string): string {
  return text
    .normalize("NFC")
    .toLocaleLowerCase("hr")
    .replace(/[.,!?;:"„“”]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Maps č→c, ć→c, š→s, ž→z, đ→d (and any other combining marks). */
function stripDiacritics(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "d");
}
