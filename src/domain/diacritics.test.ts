import { describe, expect, it } from "vitest";
import { toggleDiacritic } from "./diacritics";

describe("toggleDiacritic", () => {
  it("cycles c → č → ć → c", () => {
    expect(toggleDiacritic("c")).toBe("č");
    expect(toggleDiacritic("č")).toBe("ć");
    expect(toggleDiacritic("ć")).toBe("c");
  });

  it.each([
    ["s", "š"],
    ["z", "ž"],
    ["d", "đ"],
  ])("toggles %s ↔ %s", (base, special) => {
    expect(toggleDiacritic(base)).toBe(special);
    expect(toggleDiacritic(special)).toBe(base);
  });

  it("handles upper case", () => {
    expect(toggleDiacritic("C")).toBe("Č");
    expect(toggleDiacritic("Č")).toBe("Ć");
    expect(toggleDiacritic("Ć")).toBe("C");
    expect(toggleDiacritic("Đ")).toBe("D");
  });

  it("leaves other letters alone", () => {
    expect(toggleDiacritic("a")).toBeUndefined();
    expect(toggleDiacritic(" ")).toBeUndefined();
    expect(toggleDiacritic("")).toBeUndefined();
  });
});
