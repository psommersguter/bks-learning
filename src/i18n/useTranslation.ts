import { useCallback } from "react";
import { useSettingsStore } from "../settings/settingsStore";
import type { MessageKey } from "./messages/de";
import { type MessageParams, translate } from "./translate";

/** Returns a `t` function bound to the currently selected UI locale. */
export function useTranslation() {
  const locale = useSettingsStore((state) => state.locale);
  const t = useCallback(
    (key: MessageKey, params?: MessageParams) => translate(locale, key, params),
    [locale],
  );
  return { t, locale };
}
