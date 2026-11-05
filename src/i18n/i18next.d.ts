import "i18next";
import type { de } from "./messages/de";

// Makes `t()` type-safe: unknown keys and missing interpolation values are compile errors.
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: {
      translation: typeof de;
    };
  }
}
