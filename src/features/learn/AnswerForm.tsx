import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useTranslation } from "react-i18next";
import { toggleDiacritic } from "../../domain/diacritics";
import { useDiacriticsBarEnabled } from "../../settings/settingsStore";
import { Button } from "../../ui/Button";
import styles from "./AnswerForm.module.css";
import { DiacriticsBar } from "./DiacriticsBar";

interface AnswerFormProps {
  onSubmit: (input: string) => void;
}

/** Text input for typing the Croatian answer. An empty answer counts as "don't know". */
export function AnswerForm({ onSubmit }: AnswerFormProps) {
  const { t } = useTranslation();
  const showDiacriticsBar = useDiacriticsBarEnabled();
  const [value, setValue] = useState("");
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the field for every new card, so the learner can type right away.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /** Replaces `value[start, end)` with `text` and puts the caret right after it. */
  function replaceRange(start: number, end: number, text: string) {
    const input = inputRef.current;
    if (!input) return;
    // Render the new value synchronously, so the caret can be placed right after it.
    flushSync(() => setValue(value.slice(0, start) + text + value.slice(end)));
    const caret = start + text.length;
    input.focus();
    input.setSelectionRange(caret, caret);
  }

  /** Replaces the selection (or inserts at the caret). Used by the special-character bar. */
  function insertAtCaret(text: string) {
    const input = inputRef.current;
    if (!input) return;
    replaceRange(input.selectionStart ?? value.length, input.selectionEnd ?? value.length, text);
  }

  /** Alt+. turns the letter before the caret into its next variant (c → č → ć → c). */
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isToggleShortcut(event)) return;
    event.preventDefault();

    const input = event.currentTarget;
    const caret = input.selectionStart;
    if (caret === null || caret !== input.selectionEnd || caret === 0) return;
    const toggled = toggleDiacritic(value.charAt(caret - 1));
    if (toggled !== undefined) {
      replaceRange(caret - 1, caret, toggled);
    }
  }

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(value);
      }}
    >
      <label htmlFor={inputId} className={styles.label}>
        {t("learn.answerLabel")}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        className={styles.input}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        aria-keyshortcuts="Alt+Period"
        lang="hr"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        enterKeyHint="done"
      />
      {showDiacriticsBar && <DiacriticsBar onInsert={insertAtCaret} />}
      <Button type="submit" variant="primary">
        {t("learn.check")}
      </Button>
    </form>
  );
}

/**
 * Alt+. (Option+. on macOS). Matched by physical key (`code`), so it works on any keyboard
 * layout and even though Option+. types "≥" on a Mac; `key` is a fallback for virtual keyboards
 * and remote desktops that don't report `code`. AltGr (Ctrl+Alt on Windows) is excluded,
 * because it is used to type characters on many layouts.
 */
function isToggleShortcut(event: KeyboardEvent<HTMLInputElement>): boolean {
  return (
    (event.code === "Period" || event.key === ".") &&
    event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey &&
    !event.getModifierState("AltGraph")
  );
}
