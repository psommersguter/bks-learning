# Roadmap

## Done

- [x] Project scaffold: Vite, React, TypeScript (strict), Biome, Vitest, PWA, CI + GitHub Pages
  deploy, i18n (de/en), design tokens, docs.

## Next (Phase 1)

1. [x] Vocabulary format: `src/data/vocabulary.json`, JSON schema, types, validator and tests.
2. [ ] Vocabulary list screen: browse and filter by tag.
3. [x] Decide on the scheduling algorithm → `ts-fsrs` (FSRS), approved by the owner.
4. [x] Scheduling with `ts-fsrs` and progress storage in IndexedDB (`src/storage/`, via `idb`).
5. [ ] Learning session: flip cards (HR → DE) and typed answers (DE → HR), with lenient
   diacritic checking.
6. [ ] Home dashboard: due today, new words available, optional tag filter.
7. [ ] Export / import of progress as a JSON file.

## Later / ideas

- Multiple choice for new words, cloze sentences, gender and aspect drills
- Audio pronunciation (Web Speech API)
- Statistics and "leech" detection for words that are failed repeatedly
- Optional sync backend
