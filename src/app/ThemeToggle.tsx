import { useTranslation } from "react-i18next";
import { useSettingsStore } from "../settings/settingsStore";
import { useResolvedTheme } from "../settings/theme";
import { MoonIcon, SunIcon } from "../ui/icons";
import styles from "./App.module.css";

/** Switches between light and dark. "Follow the device" can be restored in the settings. */
export function ThemeToggle() {
  const { t } = useTranslation();
  const theme = useResolvedTheme();
  const setTheme = useSettingsStore((state) => state.setTheme);

  const nextTheme = theme === "dark" ? "light" : "dark";
  const label = t(nextTheme === "dark" ? "app.themeToggle.toDark" : "app.themeToggle.toLight");

  return (
    <button
      type="button"
      className={styles.iconButton}
      onClick={() => setTheme(nextTheme)}
      aria-label={label}
      title={label}
    >
      {nextTheme === "dark" ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
