# Learning method

The techniques the app is built on, in rough order of importance.

1. **Active recall.** The learner has to produce the answer before seeing it, which is much more
   effective than re-reading.
2. **Spaced repetition.** Each card is scheduled based on how well it was remembered: words you
   know well come back rarely, difficult words often. The candidate algorithms are
   - *Leitner / SM-2*: simple and easy to implement without dependencies.
   - *FSRS*: modern (used by Anki) and needs fewer reviews for the same retention. The
     `ts-fsrs` library would be a new dependency and needs approval.
   The decision is still open (see [roadmap.md](roadmap.md)).
3. **Both directions as separate cards.** Croatian → German (recognition) is easier than
   German → Croatian (production), so each direction is scheduled independently.
4. **Typed answers for production.** Typing the Croatian word trains spelling, including the
   diacritics č ć đ š ž. Answer checking should treat a missing diacritic as "almost right" and
   show the correct form, rather than counting it as a plain error.
5. **Small daily batches.** A limited number of new words per day, mixed with due reviews.

Ideas for later: multiple choice for brand-new words, cloze sentences (practising cases in
context), gender drills for nouns, aspect-pair drills for verbs, audio via the Web Speech API
(`hr-HR`).
