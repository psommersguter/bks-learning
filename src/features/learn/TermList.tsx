import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import type { BksRegion, GermanRegion, Term } from "../../domain/vocabulary";
import styles from "./TermList.module.css";

type Region = BksRegion | GermanRegion;

interface TermListProps {
  terms: readonly Term<Region>[];
  /** Language of the terms, for screen readers and hyphenation. */
  lang: "hr" | "de";
}

/** The forms of a word, separated by " / ", each with labels for the regions it's used in. */
export function TermList({ terms, lang }: TermListProps) {
  return (
    <span lang={lang}>
      {terms.map((term, index) => (
        <Fragment key={term.text}>
          {index > 0 && " / "}
          <span className={styles.term}>
            {term.text}
            {term.regions.map((region) => (
              <RegionBadge key={region} region={region} />
            ))}
          </span>
        </Fragment>
      ))}
    </span>
  );
}

/** A small label like "HR" or "AT"; the full name is shown on hover and read by screen readers. */
export function RegionBadge({ region }: { region: Region }) {
  const { t } = useTranslation();
  const name = t(`regions.${region}`);

  return (
    <abbr className={styles.region} title={name} aria-label={name}>
      {region.toUpperCase()}
    </abbr>
  );
}
