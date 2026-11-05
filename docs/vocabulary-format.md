# Vocabulary format

The vocabulary is one hand-maintained JSON file: [`src/data/vocabulary.json`](../src/data/vocabulary.json).

- **Schema:** [`src/data/vocabulary.schema.json`](../src/data/vocabulary.schema.json), referenced
  via `$schema`, gives autocompletion and validation in the editor.
- **Validator:** [`src/domain/vocabulary.ts`](../src/domain/vocabulary.ts) (`parseVocabulary`) is
  the authoritative check. It runs when the app starts and in `yarn test`, so an invalid file
  fails CI before it is deployed. It also checks things the schema can't, such as unique ids.
- The file is bundled into the app at build time. The app never writes to it.

```json
{
  "$schema": "./vocabulary.schema.json",
  "words": [
    {
      "id": "28cb71a9-51d9-4166-a528-fdbcff856e9b",
      "hr": "kuća",
      "de": "das Haus",
      "pos": "noun",
      "gender": "f",
      "example": { "hr": "Ovo je moja kuća.", "de": "Das ist mein Haus." },
      "tags": ["L01"]
    },
    {
      "id": "3ccf1885-9ae7-4cf8-91ef-1bb2cb3ab09f",
      "hr": "pisati",
      "de": ["schreiben", "aufschreiben"],
      "pos": "verb",
      "aspect": "ipf",
      "note": "Perfektiv: napisati",
      "tags": ["L01", "Verben"]
    }
  ]
}
```

## Fields

| Field     | Required | Meaning                                                                                 |
| --------- | -------- | --------------------------------------------------------------------------------------- |
| `id`      | yes      | UUID, unique across the file (see below).                                               |
| `hr`      | yes      | Croatian term. A string, or an array of accepted variants (the first one is shown).     |
| `de`      | yes      | German term. A string, or an array of accepted variants (the first one is shown).       |
| `pos`     | no       | Part of speech: `noun`, `verb`, `adj`, `adv`, `phrase`, `other`.                        |
| `gender`  | no       | `m`, `f` or `n`. Only allowed when `pos` is `noun`.                                     |
| `aspect`  | no       | `ipf` (imperfective) or `pf` (perfective). Only allowed when `pos` is `verb`.           |
| `note`    | no       | Free-text hint shown after answering.                                                   |
| `example` | no       | Example sentence: `{ "hr": "...", "de": "..." }`.                                       |
| `tags`    | no       | Free-form labels for filtering, e.g. a lesson (`"L05"`) or a topic (`"Essen"`). Unique. |

Unknown properties are rejected, so a typo like `"gendre"` doesn't go unnoticed. Strings are
trimmed and must not be empty.

## Rules

- **Ids are stable.** Learning progress is stored per `id`. Never change the id of a word you have
  already learned, or its progress is lost. To fix a typo, edit `hr`/`de` and keep the id.
  Generate new ids with `node -e 'console.log(crypto.randomUUID())'`.
- **Order matters.** New words are introduced in file order, so append new words at the end.
- **Removing a word** hides it in the app. Its progress stays stored, so it comes back if the word
  is re-added with the same id.

## Changing the format

Update the validator, the types, the schema and this document together.
`src/data/vocabulary.test.ts` fails if the schema and the validator disagree on the allowed
properties or enum values.
