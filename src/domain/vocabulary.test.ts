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
    expect(parseVocabulary({ words: [{ id: ID_1, bks: " kuća ", de: "das Haus" }] })).toEqual([
      {
        id: ID_1,
        bks: [{ text: "kuća", regions: [] }],
        de: [{ text: "das Haus", regions: [] }],
        tags: [],
      },
    ]);
  });

  describe("regional terms", () => {
    it("reads terms with regions next to plain terms (used everywhere)", () => {
      const [word] = parseVocabulary({
        words: [
          {
            id: ID_1,
            bks: [
              { term: "supa", regions: ["bs", "sr"] },
              { term: "juha", regions: ["hr"] },
            ],
            de: ["die Tomate", { term: "der Paradeiser", regions: ["at"] }],
          },
        ],
      });

      expect(word?.bks).toEqual([
        { text: "supa", regions: ["bs", "sr"] },
        { text: "juha", regions: ["hr"] },
      ]);
      expect(word?.de).toEqual([
        { text: "die Tomate", regions: [] },
        { text: "der Paradeiser", regions: ["at"] },
      ]);
    });

    it("only allows BKS regions for BKS terms and German regions for German terms", () => {
      expect(
        issuesOf({
          words: [
            {
              id: ID_1,
              bks: [{ term: "supa", regions: ["at"] }],
              de: [{ term: "die Suppe", regions: ["hr"] }],
            },
          ],
        }),
      ).toEqual([
        'words[0] ("supa").bks[0].regions[0]: expected one of "hr", "bs", "sr"',
        'words[0] ("supa").de[0].regions[0]: expected one of "at", "de", "ch"',
      ]);
    });

    it("rejects empty or duplicate regions and unknown properties", () => {
      expect(
        issuesOf({
          words: [
            {
              id: ID_1,
              bks: [
                { term: "supa", regions: [] },
                { term: "juha", regions: ["hr", "hr"], region: "hr" },
              ],
              de: "die Suppe",
            },
          ],
        }),
      ).toEqual([
        'words[0] ("supa").bks[0].regions: expected a non-empty array (write terms used everywhere as plain strings)',
        'words[0] ("supa").bks[1]: unknown property "region"',
        'words[0] ("supa").bks[1].regions[1]: duplicate region "hr"',
      ]);
    });

    it("rejects the same term twice", () => {
      expect(
        issuesOf({
          words: [{ id: ID_1, bks: ["juha", { term: "juha", regions: ["hr"] }], de: "die Suppe" }],
        }),
      ).toEqual(['words[0] ("juha").bks[1]: duplicate term "juha"']);
    });
  });

  it("keeps all optional fields", () => {
    const [word] = parseVocabulary({
      words: [
        {
          id: ID_1.toUpperCase(),
          bks: ["pisati"],
          de: ["schreiben", "aufschreiben"],
          pos: "verb",
          aspect: "ipf",
          note: "pf: napisati",
          example: { bks: "Pišem pismo.", de: "Ich schreibe einen Brief." },
          tags: ["L01", "Alltag"],
        },
      ],
    });

    expect(word).toEqual({
      id: ID_1,
      bks: [{ text: "pisati", regions: [] }],
      de: [
        { text: "schreiben", regions: [] },
        { text: "aufschreiben", regions: [] },
      ],
      pos: "verb",
      aspect: "ipf",
      note: "pf: napisati",
      example: { bks: "Pišem pismo.", de: "Ich schreibe einen Brief." },
      tags: ["L01", "Alltag"],
    });
  });

  it("preserves the order of words in the file", () => {
    const words = parseVocabulary({
      words: [
        { id: ID_2, bks: "b", de: "b" },
        { id: ID_1, bks: "a", de: "a" },
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
    expect(issuesOf({ words: [{ id: "kuca", bks: "kuća", de: "das Haus" }] })).toEqual([
      'words[0] ("kuća").id: expected a UUID like "3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e"',
    ]);
  });

  it("rejects duplicate ids, ignoring case", () => {
    expect(
      issuesOf({
        words: [
          { id: ID_1, bks: "kuća", de: "das Haus" },
          { id: ID_1.toUpperCase(), bks: "jabuka", de: "der Apfel" },
        ],
      }),
    ).toEqual(['words[1] ("jabuka").id: duplicate id, already used by words[0] ("kuća")']);
  });

  it("rejects unknown properties, e.g. typos", () => {
    expect(issuesOf({ words: [{ id: ID_1, bks: "kuća", de: "das Haus", gendre: "f" }] })).toEqual([
      'words[0] ("kuća"): unknown property "gendre"',
    ]);
  });

  it("rejects empty terms", () => {
    expect(issuesOf({ words: [{ id: ID_1, bks: "  ", de: [] }] })).toEqual([
      "words[0].bks: expected a non-empty string",
      "words[0].de: expected a non-empty string or a non-empty array of terms",
    ]);
  });

  it("rejects values outside the allowed enums", () => {
    expect(issuesOf({ words: [{ id: ID_1, bks: "kuća", de: "das Haus", pos: "Nomen" }] })).toEqual([
      'words[0] ("kuća").pos: expected one of "noun", "verb", "adj", "adv", "phrase", "other"',
    ]);
  });

  it("only allows gender on nouns and aspect on verbs", () => {
    expect(
      issuesOf({
        words: [
          { id: ID_1, bks: "pisati", de: "schreiben", pos: "verb", gender: "m" },
          { id: ID_2, bks: "kuća", de: "das Haus", aspect: "pf" },
        ],
      }),
    ).toEqual([
      'words[0] ("pisati").gender: only allowed when pos is "noun"',
      'words[1] ("kuća").aspect: only allowed when pos is "verb"',
    ]);
  });

  it("rejects duplicate and empty tags", () => {
    expect(
      issuesOf({ words: [{ id: ID_1, bks: "kuća", de: "das Haus", tags: ["L01", "", "L01"] }] }),
    ).toEqual([
      'words[0] ("kuća").tags[1]: expected a non-empty string',
      'words[0] ("kuća").tags[2]: duplicate tag "L01"',
    ]);
  });

  it("rejects incomplete example sentences", () => {
    expect(
      issuesOf({
        words: [{ id: ID_1, bks: "kuća", de: "das Haus", example: { bks: "Moja kuća." } }],
      }),
    ).toEqual(['words[0] ("kuća").example.de: expected a non-empty string']);
  });

  it("reports all issues at once", () => {
    const issues = issuesOf({
      words: [{ id: "x", bks: "a", de: "a" }, "not a word", { id: ID_2, bks: "b" }],
    });
    expect(issues).toHaveLength(3);
  });
});
