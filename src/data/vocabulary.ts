import { parseVocabulary, type Word } from "../domain/vocabulary";
import vocabularyFile from "./vocabulary.json";

/**
 * All words from the vocabulary file, validated once when the app starts.
 * An invalid file is caught earlier by `vocabulary.test.ts` in CI.
 */
export const vocabulary: readonly Word[] = parseVocabulary(vocabularyFile);
