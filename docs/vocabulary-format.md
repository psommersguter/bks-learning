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
      "bks": "brod",
      "de": "das Schiff",
      "pos": "noun",
      "gender": "m",
      "example": { "bks": "Brod plovi prema Splitu.", "de": "Das Schiff fährt nach Split." },
      "tags": ["L01", "Verkehr"]
    },
    {
      "id": "3ccf1885-9ae7-4cf8-91ef-1bb2cb3ab09f",
      "bks": [
        { "term": "paradajz", "regions": ["bs", "sr"] },
        { "term": "rajčica", "regions": ["hr"] }
      ],
      "de": ["die Tomate", { "term": "der Paradeiser", "regions": ["at"] }],
      "pos": "noun",
      "gender": "m",
      "note": "paradajz ist regional auch in Kroatien üblich. rajčica ist feminin.",
      "tags": ["L01", "Essen"]
    }
  ]
}
```

## Fields

| Field     | Required | Meaning                                                                                 |
| --------- | -------- | --------------------------------------------------------------------------------------- |
| `id`      | yes      | UUID, unique across the file (see below).                                               |
| `bks`     | yes      | BKS (Bosnian/Croatian/Serbian) term(s), see [Terms and regions](#terms-and-regions).    |
| `de`      | yes      | German term(s), see [Terms and regions](#terms-and-regions).                            |
| `pos`     | no       | Part of speech: `noun`, `verb`, `adj`, `adv`, `phrase`, `other`.                        |
| `gender`  | no       | `m`, `f` or `n` of the main form. Only allowed when `pos` is `noun`.                    |
| `aspect`  | no       | `ipf` (imperfective) or `pf` (perfective). Only allowed when `pos` is `verb`.           |
| `note`    | no       | Free-text hint shown after answering.                                                   |
| `example` | no       | Example sentence: `{ "bks": "...", "de": "..." }`.                                      |
| `tags`    | no       | Free-form labels for filtering, e.g. a lesson (`"L05"`) or a topic (`"Essen"`). Unique. |

Unknown properties are rejected, so a typo like `"gendre"` doesn't go unnoticed. Strings are
trimmed and must not be empty.

## Terms and regions

The course teaches BKS (Bosnian/Croatian/Serbian), so a word often has several regional forms.
These differences are intended, and the app shows them as small labels (e.g. `supa BS SR`).

- `bks` / `de` is a **string**, or an **array of forms**. All forms count as correct answers.
- The **first form is the main form**: the one the course teaches. It's shown first and used
  for the example sentence.
- A form is a plain string if it's **used everywhere**, or `{ "term": "…", "regions": [...] }` if
  it's **only used in some regions**:
  - BKS (`bks`): `hr` Croatia, `bs` Bosnia and Herzegovina, `sr` Serbia
  - German (`de`): `at` Austria, `de` Germany, `ch` Switzerland
- `regions` must not be empty (use a plain string instead) and must not repeat a region. The
  same form must not appear twice.
- Use `note` for what labels can't express: colloquial use, loanword origin, a different gender
  of a variant (`gender` describes the main form).

## Rules

- **Ids are stable.** Learning progress is stored per `id`. Never change the id of a word you have
  already learned, or its progress is lost. To fix a typo, edit `bks`/`de` and keep the id.
  Generate new ids with `node -e 'console.log(crypto.randomUUID())'`.
- **Order matters.** New words are introduced in file order, so append new words at the end.
- **Removing a word** hides it in the app. Its progress stays stored, so it comes back if the word
  is re-added with the same id.

## Changing the format

Update the validator, the types, the schema and this document together.
`src/data/vocabulary.test.ts` fails if the schema and the validator disagree on the allowed
properties or enum values (parts of speech, genders, aspects, regions).
