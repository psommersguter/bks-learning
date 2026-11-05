# Learning method

The techniques the app is built on, in rough order of importance.

1. **Active recall.** The learner has to produce the answer before seeing it, which is much more
   effective than re-reading.
2. **Spaced repetition.** Each card is scheduled based on how well it was remembered: words you
   know well come back rarely, difficult words often. The app uses **FSRS** via the `ts-fsrs`
   library. FSRS is the modern algorithm Anki uses and needs fewer reviews for the same retention
   than Leitner or SM-2. It only uses each card's own review history; tags and file order play
   no role in scheduling.
3. **Both directions as separate cards.** Croatian → German (recognition) is easier than
   German → Croatian (production), so each direction is scheduled independently.
4. **Typed answers for production.** Typing the Croatian word trains spelling, including the
   diacritics č ć đ š ž. The check is strict: only a wrong or missing diacritic counts as
   "almost" (highlighted, default rating _Hard_). Anything else is wrong (_Again_), with an
   "I was right" override for valid answers that aren't in the vocabulary file.
5. **The learner sets the pace.** There's no daily limit for new words: due reviews come first,
   then new words in file order (roughly the order they came up in class), for as long as the
   learner wants. Both directions of a new word may come up on the same day.
6. **More practice on demand.** After a session you can keep going in rounds of 20:
   _review ahead_ studies the cards due soonest and counts normally (FSRS accounts for the early
   review, so they're pushed out less than on-time reviews), and _free practice_ drills random
   learned cards without changing the schedule.

Ideas for later: multiple choice for brand-new words, cloze sentences (practising cases in
context), gender drills for nouns, aspect-pair drills for verbs, audio via the Web Speech API
(`hr-HR`).
