/**
 * Looking up translated UI text.
 *
 *   const t = useTranslations(locale);
 *   t("home.hero.heading")
 *
 * The key is typed, so a typo or a key that was renamed in `strings/en.ts` fails the
 * build instead of rendering an empty string into a live page.
 *
 * There is no runtime fallback to English. A missing key cannot happen — every table
 * is typed as `UiStrings`, so the compiler already required it.
 */

import type { Locale } from "./locales";
import { de } from "./strings/de";
import { en, type UiKey, type UiStrings } from "./strings/en";
import { es } from "./strings/es";

export const STRINGS: Record<Locale, UiStrings> = { en, de, es };

export type Translator = (key: UiKey) => string;

export function useTranslations(locale: Locale): Translator {
  const table = STRINGS[locale];
  return (key) => table[key];
}

export type { UiKey, UiStrings };
