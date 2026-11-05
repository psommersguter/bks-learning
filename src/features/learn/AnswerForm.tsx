import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../ui/Button";
import styles from "./AnswerForm.module.css";

interface AnswerFormProps {
  onSubmit: (input: string) => void;
}

/** Text input for typing the Croatian answer. An empty answer counts as "don't know". */
export function AnswerForm({ onSubmit }: AnswerFormProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the field for every new card, so the learner can type right away.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
        lang="hr"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        enterKeyHint="done"
      />
      <Button type="submit" variant="primary">
        {t("learn.check")}
      </Button>
    </form>
  );
}
