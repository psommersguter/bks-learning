/**
 * Vocabulary model and validation of the hand-maintained vocabulary file
 * (src/data/vocabulary.json, documented in docs/vocabulary-format.md).
 *
 * The JSON schema (src/data/vocabulary.schema.json) gives editor support; this module is the
 * authoritative check at runtime and in tests. Keep both in sync.
 */

export const PARTS_OF_SPEECH = ["noun", "verb", "adj", "adv", "phrase", "other"] as const;
export const GENDERS = ["m", "f", "n"] as const;
export const ASPECTS = ["ipf", "pf"] as const;

export type PartOfSpeech = (typeof PARTS_OF_SPEECH)[number];
export type Gender = (typeof GENDERS)[number];
export type Aspect = (typeof ASPECTS)[number];

/** One or more accepted forms of a term. The first entry is the canonical form shown in the UI. */
export type Terms = readonly [string, ...string[]];

export interface ExampleSentence {
  hr: string;
  de: string;
}

export interface Word {
  /** Lower-case UUID. Learning progress is stored under this id, so it must never change. */
  id: string;
  hr: Terms;
  de: Terms;
  pos?: PartOfSpeech;
  /** Only set for nouns. */
  gender?: Gender;
  /** Only set for verbs. */
  aspect?: Aspect;
  note?: string;
  example?: ExampleSentence;
  tags: readonly string[];
}

export class VocabularyError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Invalid vocabulary file:\n${issues.map((issue) => `  - ${issue}`).join("\n")}`);
    this.name = "VocabularyError";
    this.issues = issues;
  }
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ROOT_KEYS: ReadonlySet<string> = new Set(["$schema", "words"]);
/** All properties a word may have in the vocabulary file. */
export const WORD_PROPERTIES: ReadonlySet<string> = new Set([
  "id",
  "hr",
  "de",
  "pos",
  "gender",
  "aspect",
  "note",
  "example",
  "tags",
]);
const EXAMPLE_KEYS: ReadonlySet<string> = new Set(["hr", "de"]);

type JsonObject = Record<string, unknown>;

/**
 * Validates the parsed content of the vocabulary file and normalises it into `Word`s
 * (terms always as arrays, strings trimmed, ids lower-cased, tags defaulting to `[]`).
 *
 * All problems are collected and reported together.
 * @throws {VocabularyError} if the input is not a valid vocabulary file.
 */
export function parseVocabulary(input: unknown): Word[] {
  if (!isJsonObject(input)) {
    throw new VocabularyError(["root: expected an object"]);
  }

  const issues: string[] = [];
  reportUnknownKeys(input, ROOT_KEYS, "root", issues);

  if (!Array.isArray(input.words)) {
    throw new VocabularyError([...issues, "words: expected an array"]);
  }

  const words: Word[] = [];
  const pathsById = new Map<string, string>();

  input.words.forEach((rawWord: unknown, index) => {
    const path = describeWordPath(rawWord, index);
    const word = parseWord(rawWord, path, issues);
    if (!word) return;

    const firstPath = pathsById.get(word.id);
    if (firstPath) {
      issues.push(`${path}.id: duplicate id, already used by ${firstPath}`);
      return;
    }
    pathsById.set(word.id, path);
    words.push(word);
  });

  if (issues.length > 0) {
    throw new VocabularyError(issues);
  }
  return words;
}

function parseWord(raw: unknown, path: string, issues: string[]): Word | undefined {
  if (!isJsonObject(raw)) {
    issues.push(`${path}: expected an object`);
    return undefined;
  }

  const issueCountBefore = issues.length;
  reportUnknownKeys(raw, WORD_PROPERTIES, path, issues);

  const id = parseId(raw.id, `${path}.id`, issues);
  const hr = parseTerms(raw.hr, `${path}.hr`, issues);
  const de = parseTerms(raw.de, `${path}.de`, issues);
  const pos = parseOptionalEnum(raw.pos, PARTS_OF_SPEECH, `${path}.pos`, issues);
  const gender = parseOptionalEnum(raw.gender, GENDERS, `${path}.gender`, issues);
  const aspect = parseOptionalEnum(raw.aspect, ASPECTS, `${path}.aspect`, issues);
  const note = parseOptionalText(raw.note, `${path}.note`, issues);
  const example = parseOptionalExample(raw.example, `${path}.example`, issues);
  const tags = parseTags(raw.tags, `${path}.tags`, issues);

  if (gender !== undefined && pos !== "noun") {
    issues.push(`${path}.gender: only allowed when pos is "noun"`);
  }
  if (aspect !== undefined && pos !== "verb") {
    issues.push(`${path}.aspect: only allowed when pos is "verb"`);
  }

  if (issues.length > issueCountBefore || !id || !hr || !de) {
    return undefined;
  }

  return {
    id,
    hr,
    de,
    tags,
    ...(pos !== undefined && { pos }),
    ...(gender !== undefined && { gender }),
    ...(aspect !== undefined && { aspect }),
    ...(note !== undefined && { note }),
    ...(example !== undefined && { example }),
  };
}

function parseId(value: unknown, path: string, issues: string[]): string | undefined {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    issues.push(`${path}: expected a UUID like "3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e"`);
    return undefined;
  }
  return value.toLowerCase();
}

function parseTerms(value: unknown, path: string, issues: string[]): Terms | undefined {
  if (typeof value === "string") {
    const term = parseText(value, path, issues);
    return term === undefined ? undefined : [term];
  }
  if (!Array.isArray(value) || value.length === 0) {
    issues.push(`${path}: expected a non-empty string or a non-empty array of strings`);
    return undefined;
  }

  const terms: string[] = [];
  value.forEach((item: unknown, index) => {
    const term = parseText(item, `${path}[${index}]`, issues);
    if (term !== undefined) terms.push(term);
  });

  const [first, ...rest] = terms;
  return first !== undefined && terms.length === value.length ? [first, ...rest] : undefined;
}

function parseTags(value: unknown, path: string, issues: string[]): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    issues.push(`${path}: expected an array of strings`);
    return [];
  }

  const tags: string[] = [];
  value.forEach((item: unknown, index) => {
    const tag = parseText(item, `${path}[${index}]`, issues);
    if (tag === undefined) return;
    if (tags.includes(tag)) {
      issues.push(`${path}[${index}]: duplicate tag "${tag}"`);
      return;
    }
    tags.push(tag);
  });
  return tags;
}

function parseOptionalExample(
  value: unknown,
  path: string,
  issues: string[],
): ExampleSentence | undefined {
  if (value === undefined) return undefined;
  if (!isJsonObject(value)) {
    issues.push(`${path}: expected an object with "hr" and "de"`);
    return undefined;
  }

  reportUnknownKeys(value, EXAMPLE_KEYS, path, issues);
  const hr = parseText(value.hr, `${path}.hr`, issues);
  const de = parseText(value.de, `${path}.de`, issues);
  return hr !== undefined && de !== undefined ? { hr, de } : undefined;
}

function parseOptionalEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  path: string,
  issues: string[],
): T | undefined {
  if (value === undefined) return undefined;
  const match = allowed.find((option) => option === value);
  if (match === undefined) {
    issues.push(`${path}: expected one of ${allowed.map((option) => `"${option}"`).join(", ")}`);
  }
  return match;
}

function parseOptionalText(value: unknown, path: string, issues: string[]): string | undefined {
  return value === undefined ? undefined : parseText(value, path, issues);
}

/** A string with at least one non-whitespace character, returned trimmed. */
function parseText(value: unknown, path: string, issues: string[]): string | undefined {
  const text = typeof value === "string" ? value.trim() : "";
  if (text === "") {
    issues.push(`${path}: expected a non-empty string`);
    return undefined;
  }
  return text;
}

function reportUnknownKeys(
  object: JsonObject,
  allowed: ReadonlySet<string>,
  path: string,
  issues: string[],
): void {
  for (const key of Object.keys(object)) {
    if (!allowed.has(key)) {
      issues.push(`${path}: unknown property "${key}"`);
    }
  }
}

/** `words[3]` plus the Croatian term if available, so issues are easy to find in the file. */
function describeWordPath(rawWord: unknown, index: number): string {
  const path = `words[${index}]`;
  if (!isJsonObject(rawWord)) return path;
  const hr = Array.isArray(rawWord.hr) ? rawWord.hr[0] : rawWord.hr;
  return typeof hr === "string" && hr.trim() !== "" ? `${path} ("${hr.trim()}")` : path;
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
