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

/** Where a BKS term is used: Croatia, Bosnia and Herzegovina, Serbia. */
export const BKS_REGIONS = ["hr", "bs", "sr"] as const;
/** Where a German term is used: Austria, Germany, Switzerland. */
export const GERMAN_REGIONS = ["at", "de", "ch"] as const;

export type BksRegion = (typeof BKS_REGIONS)[number];
export type GermanRegion = (typeof GERMAN_REGIONS)[number];

/** One accepted form of a word. */
export interface Term<Region extends string = string> {
  text: string;
  /** Regions where this form is used. Empty: used everywhere (no regional difference). */
  regions: readonly Region[];
}

/** One or more accepted forms. The first one is the main form (the one the course teaches). */
export type Terms<Region extends string = string> = readonly [Term<Region>, ...Term<Region>[]];

export interface ExampleSentence {
  bks: string;
  de: string;
}

export interface Word {
  /** Lower-case UUID. Learning progress is stored under this id, so it must never change. */
  id: string;
  /** The BKS (Bosnian/Croatian/Serbian) forms. */
  bks: Terms<BksRegion>;
  de: Terms<GermanRegion>;
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
  "bks",
  "de",
  "pos",
  "gender",
  "aspect",
  "note",
  "example",
  "tags",
]);
const EXAMPLE_KEYS: ReadonlySet<string> = new Set(["bks", "de"]);
/** Properties of a term written as an object (`{ "term": "juha", "regions": ["hr"] }`). */
export const TERM_PROPERTIES: ReadonlySet<string> = new Set(["term", "regions"]);

/** The texts of all forms, in order. */
export function termTexts<Region extends string>(
  terms: Terms<Region>,
): readonly [string, ...string[]] {
  const [first, ...rest] = terms;
  return [first.text, ...rest.map((term) => term.text)];
}

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
  const bks = parseTerms(raw.bks, BKS_REGIONS, `${path}.bks`, issues);
  const de = parseTerms(raw.de, GERMAN_REGIONS, `${path}.de`, issues);
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

  if (issues.length > issueCountBefore || !id || !bks || !de) {
    return undefined;
  }

  return {
    id,
    bks,
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

/**
 * A single string, or an array whose items are strings (used everywhere) or
 * `{ "term": "…", "regions": [...] }` objects.
 */
function parseTerms<Region extends string>(
  value: unknown,
  allowedRegions: readonly Region[],
  path: string,
  issues: string[],
): Terms<Region> | undefined {
  if (typeof value === "string") {
    const text = parseText(value, path, issues);
    return text === undefined ? undefined : [{ text, regions: [] }];
  }
  if (!Array.isArray(value) || value.length === 0) {
    issues.push(`${path}: expected a non-empty string or a non-empty array of terms`);
    return undefined;
  }

  const terms: Term<Region>[] = [];
  value.forEach((item: unknown, index) => {
    const term = parseTerm(item, allowedRegions, `${path}[${index}]`, issues);
    if (term === undefined) return;
    if (terms.some((existing) => existing.text === term.text)) {
      issues.push(`${path}[${index}]: duplicate term "${term.text}"`);
      return;
    }
    terms.push(term);
  });

  const [first, ...rest] = terms;
  return first !== undefined && terms.length === value.length ? [first, ...rest] : undefined;
}

function parseTerm<Region extends string>(
  value: unknown,
  allowedRegions: readonly Region[],
  path: string,
  issues: string[],
): Term<Region> | undefined {
  if (typeof value === "string") {
    const text = parseText(value, path, issues);
    return text === undefined ? undefined : { text, regions: [] };
  }
  if (!isJsonObject(value)) {
    issues.push(`${path}: expected a string or an object with "term" and "regions"`);
    return undefined;
  }

  reportUnknownKeys(value, TERM_PROPERTIES, path, issues);
  const text = parseText(value.term, `${path}.term`, issues);
  const regions = parseRegions(value.regions, allowedRegions, `${path}.regions`, issues);
  return text !== undefined && regions !== undefined ? { text, regions } : undefined;
}

/** A non-empty list of distinct regions (a term used everywhere is written as a plain string). */
function parseRegions<Region extends string>(
  value: unknown,
  allowedRegions: readonly Region[],
  path: string,
  issues: string[],
): Region[] | undefined {
  if (!Array.isArray(value) || value.length === 0) {
    issues.push(
      `${path}: expected a non-empty array (write terms used everywhere as plain strings)`,
    );
    return undefined;
  }

  const regions: Region[] = [];
  value.forEach((item: unknown, index) => {
    const region = parseOptionalEnum(item, allowedRegions, `${path}[${index}]`, issues);
    if (region === undefined) {
      if (item === undefined) issues.push(`${path}[${index}]: expected a region`);
      return;
    }
    if (regions.includes(region)) {
      issues.push(`${path}[${index}]: duplicate region "${region}"`);
      return;
    }
    regions.push(region);
  });
  return regions.length === value.length ? regions : undefined;
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
    issues.push(`${path}: expected an object with "bks" and "de"`);
    return undefined;
  }

  reportUnknownKeys(value, EXAMPLE_KEYS, path, issues);
  const bks = parseText(value.bks, `${path}.bks`, issues);
  const de = parseText(value.de, `${path}.de`, issues);
  return bks !== undefined && de !== undefined ? { bks, de } : undefined;
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

/** `words[3]` plus the main BKS term if available, so issues are easy to find in the file. */
function describeWordPath(rawWord: unknown, index: number): string {
  const path = `words[${index}]`;
  if (!isJsonObject(rawWord)) return path;
  const first: unknown = Array.isArray(rawWord.bks) ? rawWord.bks[0] : rawWord.bks;
  const term = isJsonObject(first) ? first.term : first;
  return typeof term === "string" && term.trim() !== "" ? `${path} ("${term.trim()}")` : path;
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
