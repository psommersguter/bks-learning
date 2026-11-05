/**
 * Croatian special letters and the "toggle" used by the keyboard shortcut (Alt+.): it turns the
 * letter before the caret into its next variant, e.g. c → č → ć → c.
 */

export const CROATIAN_SPECIAL_LETTERS = ["č", "ć", "đ", "š", "ž"] as const;

/** Each cycle starts with the base letter. Upper case is derived. */
const CYCLES: readonly (readonly string[])[] = [
  ["c", "č", "ć"],
  ["s", "š"],
  ["z", "ž"],
  ["d", "đ"],
];

const NEXT_LETTER: ReadonlyMap<string, string> = buildNextLetterMap();

function buildNextLetterMap(): Map<string, string> {
  const next = new Map<string, string>();
  for (const cycle of CYCLES) {
    cycle.forEach((letter, index) => {
      const following = cycle[(index + 1) % cycle.length] ?? letter;
      next.set(letter, following);
      next.set(letter.toUpperCase(), following.toUpperCase());
    });
  }
  return next;
}

/** The next variant of a letter (c → č → ć → c), or `undefined` if it has none. */
export function toggleDiacritic(letter: string): string | undefined {
  return NEXT_LETTER.get(letter);
}
