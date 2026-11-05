import type { Locale } from "./locales";
import { de, type MessageKey, type Messages } from "./messages/de";
import { en } from "./messages/en";

export type MessageParams = Readonly<Record<string, string | number>>;

const catalogs: Record<Locale, Messages> = { de, en };

/**
 * Replaces `{name}` placeholders with values from `params`.
 * Unknown placeholders are left untouched so missing params are visible in the UI.
 */
export function interpolate(template: string, params: MessageParams): string {
  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    Object.hasOwn(params, name) ? String(params[name]) : placeholder,
  );
}

export function translate(locale: Locale, key: MessageKey, params?: MessageParams): string {
  const template = catalogs[locale][key];
  return params ? interpolate(template, params) : template;
}
