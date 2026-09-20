/**
 * The site's languages. English is the source, Spanish is second in the UI, and
 * German is last while it is still being learned.
 *
 * Adding a language starts here and the type system walks you through the rest:
 * `LOCALE_META` needs an entry, `src/i18n/strings/` needs a table (and the `UiStrings`
 * type makes a missing key a build error, not a blank space on the page),
 * `src/i18n/routes.ts` needs a slug for every route, and any localised data in
 * `src/data/` needs the new key. `astro.config.mjs` reads `LOCALES` for routing, so
 * routes and sitemap follow automatically.
 */

export const LOCALES = ["en", "es", "de"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export interface LocaleMeta {
  /** The language's name in that language — how a switcher should label it. */
  name: string;
  dir: "ltr" | "rtl";
  /** Open Graph locale code. */
  og: string;
  /** BCP 47 tag for Intl formatting (dates, numbers, lists). */
  intl: string;
  /**
   * False while the translation has not been read by a fluent speaker. Pages in an
   * unreviewed language show a notice pointing at the English original, and are still
   * indexed — a machine translation that says what it is beats no page at all, but
   * pretending it was written by a human does not.
   *
   * Flip to true only after someone has actually read `src/i18n/strings/<locale>.ts`
   * end to end.
   */
  reviewed: boolean;
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en: { name: "English", dir: "ltr", og: "en_US", intl: "en-US", reviewed: true },
  de: { name: "Deutsch", dir: "ltr", og: "de_DE", intl: "de-DE", reviewed: false },
  es: { name: "Español", dir: "ltr", og: "es_ES", intl: "es-ES", reviewed: false },
};

export const isLocale = (value: string): value is Locale =>
  (LOCALES as readonly string[]).includes(value);

/**
 * Narrow Astro's `currentLocale` (a plain string, possibly undefined) to a `Locale`.
 *
 * Throws rather than falling back to the default: a page that rendered in English
 * under `/de/` would publish the wrong `lang`, the wrong hreflang and the wrong copy,
 * and nothing would report an error. Better to fail the build.
 */
export function toLocale(value: string | undefined): Locale {
  if (value !== undefined && isLocale(value)) return value;
  throw new Error(
    `Unsupported locale ${JSON.stringify(value)}. Pages must live under /${LOCALES.join("/, /")}/.`,
  );
}

/** Text that exists in every language. Data modules use this shape. */
export type LocalizedText = Record<Locale, string>;

/** Pick one language out of a `LocalizedText`, with the source language as fallback. */
export const localized = (text: LocalizedText, locale: Locale): string =>
  text[locale] || text[DEFAULT_LOCALE];
