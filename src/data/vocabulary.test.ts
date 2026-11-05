import { describe, expect, it } from "vitest";
import {
  ASPECTS,
  GENDERS,
  PARTS_OF_SPEECH,
  parseVocabulary,
  WORD_PROPERTIES,
} from "../domain/vocabulary";
import vocabularyFile from "./vocabulary.json";
import schema from "./vocabulary.schema.json";

describe("vocabulary.json", () => {
  it("is valid", () => {
    // Throws a VocabularyError listing every problem if the file is invalid.
    expect(() => parseVocabulary(vocabularyFile)).not.toThrow();
  });
});

describe("vocabulary.schema.json", () => {
  const wordProperties = schema.definitions.word.properties;

  it("allows the same enum values as the validator", () => {
    expect(wordProperties.pos.enum).toEqual(PARTS_OF_SPEECH);
    expect(wordProperties.gender.enum).toEqual(GENDERS);
    expect(wordProperties.aspect.enum).toEqual(ASPECTS);
  });

  it("allows the same properties as the validator", () => {
    expect(Object.keys(wordProperties).sort()).toEqual([...WORD_PROPERTIES].sort());
  });
});
