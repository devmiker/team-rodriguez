/**
 * Every fact about the company, in one place.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  THIS FILE IS THE IDENTITY LAYER. Values still to be confirmed are marked
 *  `TODO`. Nothing else in the codebase hard-codes a company name, an address,
 *  an email or a URL — so when the LLC is registered and the real details
 *  exist, editing this one file updates the site, the JSON-LD, the legal pages
 *  and the contact form's displayed address together.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * `LAUNCHED` is the switch that decides whether the site is indexable. While it is
 * false every page carries `noindex`, because a site with placeholder legal pages and
 * unwritten case studies should not be collecting search traffic it will later have to
 * clean up.
 */

import type { LocalizedText } from "../i18n/locales";

/**
 * Flip to true only when: the legal pages have real reviewed text, the team and
 * partner entries are real people who have agreed to appear, and the contact form has
 * been tested end to end against the live mailbox.
 */
export const LAUNCHED = false;

export const COMPANY = {
  /** TODO: confirm once the LLC name is registered — this is the working name. */
  name: "Team Rodriguez",

  /**
   * TODO: the registered legal name, once it exists — e.g. "Team Rodriguez LLC".
   * The legal pages need the entity, not the trading name. Until this has a value
   * those pages say the entity is not yet registered rather than inventing one.
   */
  legalName: undefined as string | undefined,

  /** TODO: replace with the production domain once it is bought and pointed. */
  origin: "https://teamrodriguez.example",

  /**
   * The address shown on the site as the direct-email fallback.
   *
   * Where the contact form actually delivers is a separate thing: the API reads it
   * from the `CONTACT_TO` application setting, so the destination is not in this
   * repository at all and can be changed without a deploy.
   *
   * TODO: replace with an address on the company domain (hello@…). A personal Gmail
   * address published on a business site attracts a great deal of scraped spam, and it
   * cannot be handed to a colleague later without editing every page that shows it.
   * Until then this is the address that exists.
   */
  email: "devmiker@gmail.com",

  /** TODO: a business phone number, or leave undefined and the footer omits it. */
  phone: undefined as string | undefined,

  /**
   * Where the business operates from. Shown in the footer and used for the
   * `areaServed` hint in structured data.
   */
  location: "Raleigh, North Carolina",

  /**
   * TODO: the registered business address. A North Carolina LLC files a registered
   * agent address that is public record anyway; whether to publish it here is a
   * choice, but structured data for a local business is not worth emitting without it.
   */
  address: undefined as
    | { street: string; city: string; region: string; postalCode: string; country: string }
    | undefined,

  /**
   * Where the company is formed. Drives which legal pages are required: "US" needs a
   * privacy notice; a German entity would additionally need an Impressum, which is a
   * legal obligation rather than a nicety (§5 DDG).
   */
  jurisdiction: "US" as "US" | "DE",

  /** Working days to first reply. Kept here so the copy in three languages cannot drift. */
  responseWorkingDays: 2,

  /**
   * Profiles the footer links to. Set a value to undefined to hide that link.
   *
   * Annotated `string | undefined` rather than left to inference: this object is
   * `as const`, so without the annotation each URL would have its own literal type and
   * code that filters out the empty ones could not be typed at all.
   */
  social: {
    github: "https://github.com/devmiker" as string | undefined,
    linkedin: "https://www.linkedin.com/in/mike-l-rodriguez/" as string | undefined,
  },

  foundedYear: 2026,
} as const;

/**
 * The organisation's own description, per language — used in JSON-LD, where it should
 * read as a plain sentence about the business rather than marketing copy.
 */
export const COMPANY_DESCRIPTION: LocalizedText = {
  en: "A small software studio building fast, accessible websites for small businesses.",
  de: "Ein kleines Software-Studio, das schnelle, barrierefreie Websites für kleine Unternehmen baut.",
  es: "Un pequeño estudio de software que crea sitios web rápidos y accesibles para pequeñas empresas.",
};

/** An absolute URL on the site's own origin, for canonicals, hreflang and JSON-LD. */
export const absoluteUrl = (path: string): string => new URL(path, COMPANY.origin).href;
