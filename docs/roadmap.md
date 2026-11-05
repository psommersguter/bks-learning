# Roadmap

## Done

- [x] Project scaffold: Vite, React, TypeScript (strict), Biome, Vitest, PWA, CI + GitHub Pages
  deploy, i18n (de/en), design tokens, docs.

## Next (Phase 1)

1. [ ] Agree on the vocabulary format ([vocabulary-format.md](vocabulary-format.md)), then add the
   file, its types and a validation test.
2. [ ] Vocabulary list screen: browse and filter by lesson.
3. [ ] Decide on the scheduling algorithm (own Leitner/SM-2 vs. `ts-fsrs`).
4. [ ] Progress storage in IndexedDB (`src/storage/`).
5. [ ] Learning session: flip cards (HR → DE) and typed answers (DE → HR), with lenient
   diacritic checking.
6. [ ] Home dashboard: due today, new words available, choice of lessons.
7. [ ] Export / import of progress as a JSON file.

## Later / ideas

- Multiple choice for new words, cloze sentences, gender and aspect drills
- Audio pronunciation (Web Speech API)
- Statistics and "leech" detection for words that are failed repeatedly
- Optional sync backend
