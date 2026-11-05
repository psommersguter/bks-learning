import { describe, expect, it } from "vitest";
import { parseVocabulary, VocabularyError } from "./vocabulary";

const ID_1 = "6d45605e-21cf-447d-9539-2c8202307c01";
const ID_2 = "28cb71a9-51d9-4166-a528-fdbcff856e9b";

/** Runs the parser and returns the reported issues (empty if the input is valid). */
function issuesOf(input: unknown): readonly string[] {
  try {
    parseVocabulary(input);
    return [];
  } catch (error) {
    if (error instanceof VocabularyError) return error.issues;
    throw error;
  }
}

describe("parseVocabulary", () => {
  it("accepts an empty word list", () => {
    expect(parseVocabulary({ words: [] })).toEqual([]);
  });

  it("allows a $schema property at the root", () => {
    expect(parseVocabulary({ $schema: "./vocabulary.schema.json", words: [] })).toEqual([]);
  });

  it("normalises a minimal word", () => {
    expect(parseVocabulary({ words: [{ id: ID_1, hr: " kuća ", de: "das Haus" }] })).toEqual([
      { id: ID_1, hr: ["kuća"], de: ["das Haus"], tags: [] },
    ]);
  });

  it("keeps all optional fields", () => {
    const [word] = parseVocabulary({
      words: [
        {
          id: ID_1.toUpperCase(),
          hr: ["pisati"],
          de: ["schreiben", "aufschreiben"],
          pos: "verb",
          aspect: "ipf",
          note: "pf: napisati",
          example: { hr: "Pišem pismo.", de: "Ich schreibe einen Brief." },
          tags: ["L01", "Alltag"],
        },
      ],
    });

    expect(word).toEqual({
      id: ID_1,
      hr: ["pisati"],
      de: ["schreiben", "aufschreiben"],
      pos: "verb",
      aspect: "ipf",
      note: "pf: napisati",
      example: { hr: "Pišem pismo.", de: "Ich schreibe einen Brief." },
      tags: ["L01", "Alltag"],
    });
  });

  it("preserves the order of words in the file", () => {
    const words = parseVocabulary({
      words: [
        { id: ID_2, hr: "b", de: "b" },
        { id: ID_1, hr: "a", de: "a" },
      ],
    });
    expect(words.map((word) => word.id)).toEqual([ID_2, ID_1]);
  });

  it("rejects a root that is not an object", () => {
    expect(issuesOf([])).toEqual(["root: expected an object"]);
  });

  it("rejects a missing word list", () => {
    expect(issuesOf({})).toEqual(["words: expected an array"]);
  });

  it("rejects ids that are not UUIDs", () => {
    expect(issuesOf({ words: [{ id: "kuca", hr: "kuća", de: "das Haus" }] })).toEqual([
      'words[0] ("kuća").id: expected a UUID like "3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e"',
    ]);
  });

  it("rejects duplicate ids, ignoring case", () => {
    expect(
      issuesOf({
        words: [
          { id: ID_1, hr: "kuća", de: "das Haus" },
          { id: ID_1.toUpperCase(), hr: "jabuka", de: "der Apfel" },
        ],
      }),
    ).toEqual(['words[1] ("jabuka").id: duplicate id, already used by words[0] ("kuća")']);
  });

  it("rejects unknown properties, e.g. typos", () => {
    expect(issuesOf({ words: [{ id: ID_1, hr: "kuća", de: "das Haus", gendre: "f" }] })).toEqual([
      'words[0] ("kuća"): unknown property "gendre"',
    ]);
  });

  it("rejects empty terms", () => {
    expect(issuesOf({ words: [{ id: ID_1, hr: "  ", de: [] }] })).toEqual([
      "words[0].hr: expected a non-empty string",
      "words[0].de: expected a non-empty string or a non-empty array of strings",
    ]);
  });

  it("rejects values outside the allowed enums", () => {
    expect(issuesOf({ words: [{ id: ID_1, hr: "kuća", de: "das Haus", pos: "Nomen" }] })).toEqual([
      'words[0] ("kuća").pos: expected one of "noun", "verb", "adj", "adv", "phrase", "other"',
    ]);
  });

  it("only allows gender on nouns and aspect on verbs", () => {
    expect(
      issuesOf({
        words: [
          { id: ID_1, hr: "pisati", de: "schreiben", pos: "verb", gender: "m" },
          { id: ID_2, hr: "kuća", de: "das Haus", aspect: "pf" },
        ],
      }),
    ).toEqual([
      'words[0] ("pisati").gender: only allowed when pos is "noun"',
      'words[1] ("kuća").aspect: only allowed when pos is "verb"',
    ]);
  });

  it("rejects duplicate and empty tags", () => {
    expect(
      issuesOf({ words: [{ id: ID_1, hr: "kuća", de: "das Haus", tags: ["L01", "", "L01"] }] }),
    ).toEqual([
      'words[0] ("kuća").tags[1]: expected a non-empty string',
      'words[0] ("kuća").tags[2]: duplicate tag "L01"',
    ]);
  });

  it("rejects incomplete example sentences", () => {
    expect(
      issuesOf({
        words: [{ id: ID_1, hr: "kuća", de: "das Haus", example: { hr: "Moja kuća." } }],
      }),
    ).toEqual(['words[0] ("kuća").example.de: expected a non-empty string']);
  });

  it("reports all issues at once", () => {
    const issues = issuesOf({
      words: [{ id: "x", hr: "a", de: "a" }, "not a word", { id: ID_2, hr: "b" }],
    });
    expect(issues).toHaveLength(3);
  });
});
