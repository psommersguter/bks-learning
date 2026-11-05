import { describe, expect, it } from "vitest";
import {
  ASPECTS,
  BKS_REGIONS,
  GENDERS,
  GERMAN_REGIONS,
  PARTS_OF_SPEECH,
  parseVocabulary,
  TERM_PROPERTIES,
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
    expect(schema.definitions.bksRegion.enum).toEqual(BKS_REGIONS);
    expect(schema.definitions.germanRegion.enum).toEqual(GERMAN_REGIONS);
  });

  it("allows the same properties for regional terms as the validator", () => {
    for (const terms of [schema.definitions.bksTerms, schema.definitions.germanTerms]) {
      const regionalTerm = terms.oneOf[1]?.items?.oneOf[1];
      expect(Object.keys(regionalTerm?.properties ?? {}).sort()).toEqual(
        [...TERM_PROPERTIES].sort(),
      );
    }
  });

  it("allows the same properties as the validator", () => {
    expect(Object.keys(wordProperties).sort()).toEqual([...WORD_PROPERTIES].sort());
  });
});
