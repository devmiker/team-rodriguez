/**
 * Canonical URLs, hreflang and structured data.
 *
 * All three are generated from `pathFor()`, the same function the navigation and the
 * language switcher use, so the URL a search engine is told about is by construction
 * the URL a visitor can click to. Hand-written canonicals drift, and a wrong one is
 * worse than none: it tells a search engine to drop the page it is on.
 */

import { COMPANY, COMPANY_DESCRIPTION, absoluteUrl, LAUNCHED } from "../data/company";
import { LOCALE_META, type Locale } from "../i18n/locales";
import { alternates, pathFor, ROUTE_DEFS, type PageRef } from "../i18n/routes";

export interface SeoData {
  canonical: string;
  alternates: { hreflang: string; href: string }[];
  ogLocale: string;
  /** Other languages' OG locale codes, for `og:locale:alternate`. */
  ogLocaleAlternates: string[];
  noindex: boolean;
}

/**
 * `noindex` is set when any of three things is true, and the union is deliberate:
 * the page is marked noindex in ROUTES (the form's thank-you page), the caller asked
 * for it (a placeholder page with no real content yet), or the whole site has not
 * launched. The last one is the safety net — a site with unwritten legal pages should
 * not be accumulating search results that later have to be removed.
 */
export function seoFor(
  page: PageRef,
  locale: Locale,
  options: { noindex?: boolean } = {},
): SeoData {
  const routeNoindex = ROUTE_DEFS[page.route].noindex ?? false;

  return {
    canonical: absoluteUrl(pathFor(page, locale)),
    alternates: alternates(page).map(({ locale: l, path }) => ({
      hreflang: l === "x-default" ? "x-default" : l,
      href: absoluteUrl(path),
    })),
    ogLocale: LOCALE_META[locale].og,
    ogLocaleAlternates: Object.entries(LOCALE_META)
      .filter(([l]) => l !== locale)
      .map(([, meta]) => meta.og),
    noindex: routeNoindex || (options.noindex ?? false) || !LAUNCHED,
  };
}

/**
 * The organisation, as schema.org.
 *
 * Only fields with real values are emitted. Structured data that describes a company
 * which does not exist yet is not a neutral placeholder — search engines treat a
 * mismatch between markup and page content as a quality signal, and the wrong kind.
 * So `legalName`, `address` and `telephone` appear only once `src/data/company.ts` has
 * them, and the whole block is omitted before launch.
 */
export function organizationJsonLd(locale: Locale): Record<string, unknown> | undefined {
  if (!LAUNCHED) return undefined;

  const sameAs: string[] = Object.values(COMPANY.social).filter(
    (v): v is NonNullable<typeof v> => Boolean(v),
  );

  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": absoluteUrl("/#organization"),
    name: COMPANY.name,
    url: absoluteUrl(pathFor({ route: "home" }, locale)),
    description: COMPANY_DESCRIPTION[locale],
    ...(COMPANY.legalName ? { legalName: COMPANY.legalName } : {}),
    ...(COMPANY.email ? { email: COMPANY.email } : {}),
    ...(COMPANY.phone ? { telephone: COMPANY.phone } : {}),
    ...(COMPANY.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: COMPANY.address.street,
            addressLocality: COMPANY.address.city,
            addressRegion: COMPANY.address.region,
            postalCode: COMPANY.address.postalCode,
            addressCountry: COMPANY.address.country,
          },
        }
      : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

/**
 * The page itself, as schema.org — `inLanguage` and a link back to the organisation.
 * Omitted before launch for the same reason as above.
 */
export function webPageJsonLd(
  page: PageRef,
  locale: Locale,
  title: string,
  description: string,
): Record<string, unknown> | undefined {
  if (!LAUNCHED) return undefined;

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: absoluteUrl(pathFor(page, locale)),
    name: title,
    description,
    inLanguage: LOCALE_META[locale].intl,
    isPartOf: { "@id": absoluteUrl("/#organization") },
  };
}
