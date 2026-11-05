import { describe, expect, it } from "vitest";
import { interpolate, translate } from "./translate";

describe("interpolate", () => {
  it("replaces named placeholders", () => {
    expect(interpolate("{count} Karten fällig", { count: 3 })).toBe("3 Karten fällig");
  });

  it("replaces repeated placeholders", () => {
    expect(interpolate("{a} und {a}", { a: "x" })).toBe("x und x");
  });

  it("keeps placeholders without a matching param", () => {
    expect(interpolate("{count} von {total}", { count: 1 })).toBe("1 von {total}");
  });

  it("ignores inherited object properties", () => {
    expect(interpolate("{toString}", {})).toBe("{toString}");
  });
});

describe("translate", () => {
  it("returns the message for the given locale", () => {
    expect(translate("de", "app.languageSwitch.label")).toBe("Sprache");
    expect(translate("en", "app.languageSwitch.label")).toBe("Language");
  });
});
