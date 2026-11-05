import { useEffect, useSyncExternalStore } from "react";
import { useSettingsStore } from "./settingsStore";

export const THEME_PREFERENCES = ["system", "light", "dark"] as const;

/** What the user chose. "system" follows the device's light/dark setting. */
export type ThemePreference = (typeof THEME_PREFERENCES)[number];
export type Theme = "light" | "dark";

export function resolveTheme(preference: ThemePreference, systemPrefersDark: boolean): Theme {
  if (preference !== "system") return preference;
  return systemPrefersDark ? "dark" : "light";
}

let darkSchemeQuery: MediaQueryList | undefined;

/** Created on first use, so this module can be imported where `window` doesn't exist (tests). */
function getDarkSchemeQuery(): MediaQueryList {
  darkSchemeQuery ??= window.matchMedia("(prefers-color-scheme: dark)");
  return darkSchemeQuery;
}

function subscribeToSystemScheme(onChange: () => void): () => void {
  const query = getDarkSchemeQuery();
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** The theme currently in effect, updated live when the device switches light/dark. */
export function useResolvedTheme(): Theme {
  const preference = useSettingsStore((state) => state.theme);
  const systemPrefersDark = useSyncExternalStore(
    subscribeToSystemScheme,
    () => getDarkSchemeQuery().matches,
  );
  return resolveTheme(preference, systemPrefersDark);
}

/**
 * Applies the theme as `data-theme` on <html>, which the design tokens in global.css react to.
 * The initial value is set by an inline script in index.html to avoid a flash of the wrong theme.
 */
export function useApplyTheme(): void {
  const theme = useResolvedTheme();
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
}
