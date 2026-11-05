# Vocabulary format (draft)

> Status: **proposal, not implemented yet.** To be confirmed with the owner before the
> vocabulary loader is built.

The vocabulary is a single JSON file maintained by hand, grouped by course lesson. It is
imported (and validated) at build time, so a typo fails CI instead of breaking the app.

Proposed location: `src/data/vocabulary.json`

```json
{
  "$schema": "./vocabulary.schema.json",
  "lessons": [
    {
      "id": "l01",
      "title": "Lektion 1",
      "words": [
        { "id": "kuca", "hr": "kuća", "de": "das Haus", "pos": "noun", "gender": "f" },
        { "id": "pisati", "hr": "pisati", "de": "schreiben", "pos": "verb", "aspect": "ipf" },
        {
          "id": "dobar-dan",
          "hr": "dobar dan",
          "de": ["guten Tag", "Guten Tag"],
          "pos": "phrase",
          "note": "Formelle Begrüßung tagsüber"
        }
      ]
    }
  ]
}
```

## Fields

| Field     | Required | Meaning                                                                             |
| --------- | -------- | ----------------------------------------------------------------------------------- |
| `id`      | yes      | Stable identifier, unique across the whole file (see below).                        |
| `hr`      | yes      | Croatian term. A string, or an array of accepted variants (the first one is shown). |
| `de`      | yes      | German term. A string, or an array of accepted variants (the first one is shown).   |
| `pos`     | no       | Part of speech: `noun`, `verb`, `adj`, `adv`, `phrase`, `other`.                    |
| `gender`  | no       | Nouns: `m`, `f`, `n`.                                                               |
| `aspect`  | no       | Verbs: `ipf` (imperfective) or `pf` (perfective).                                   |
| `note`    | no       | Free-text hint shown after answering.                                               |
| `example` | no       | `{ "hr": "...", "de": "..." }`, an example sentence (for a later cloze mode).       |

### Why ids must stay stable

Learning progress is stored per `id`. **Never change the id** of a word you have already
learned, or its progress is lost. To fix a typo, edit `hr`/`de` and keep the id.

## Open questions

- Is `id` written by hand (readable) or generated (e.g. a short random string)? A test can check
  that all ids are unique either way.
- Should a JSON Schema file provide autocompletion and validation in the editor?
