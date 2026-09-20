/**
 * Every page the site builds, in every language — the single source for static paths.
 *
 * One dynamic route (`src/pages/[locale]/[...path].astro`) renders all of them, so
 * adding a language or a page never means copying route files around. The paths come
 * from `pathFor()`, which is also what the nav, the language switcher, the sitemap and
 * the hreflang tags use, so those four can never drift apart from what was built.
 */

import { LOCALES, type Locale } from "./locales";
import { pathFor, ROUTE_KEYS, type PageRef, type RouteKey } from "./routes";

export interface PageEntry {
  locale: Locale;
  page: PageRef;
  /** The `[...path]` param: the URL after the locale, with no slash at either end. */
  path: string | undefined;
}

/** "/es/proyectos/harbor/" → "proyectos/harbor"; a home page → undefined. */
const restAfterLocale = (url: string, locale: Locale): string | undefined =>
  url.slice(`/${locale}/`.length).replace(/\/$/, "") || undefined;

/**
 * All pages. `detailSlugs` supplies the entries for routes that have detail pages (the
 * published case-study slugs, for instance), passed in rather than imported so this
 * module never has to load content.
 */
export function allPages(
  detailSlugs: Partial<Record<RouteKey, readonly string[]>> = {},
): PageEntry[] {
  const refs: PageRef[] = [
    ...ROUTE_KEYS.map((route) => ({ route })),
    ...Object.entries(detailSlugs).flatMap(([route, slugs]) =>
      (slugs ?? []).map((slug) => ({ route: route as RouteKey, slug })),
    ),
  ];

  return LOCALES.flatMap((locale) =>
    refs.map((page) => ({ locale, page, path: restAfterLocale(pathFor(page, locale), locale) })),
  );
}

/**
 * Throws if two pages in one language would be built at the same URL.
 *
 * Without this, a slug collision — a case study called "team", say — silently
 * overwrites a page during the build and nobody notices until the page is gone.
 */
export function assertUniquePaths(pages: readonly PageEntry[]): void {
  const seen = new Map<string, PageRef>();
  for (const { locale, page, path } of pages) {
    const url = `/${locale}/${path ?? ""}`;
    const clash = seen.get(url);
    if (clash) {
      throw new Error(
        `Two pages build to ${url}: ${JSON.stringify(clash)} and ${JSON.stringify(page)}`,
      );
    }
    seen.set(url, page);
  }
}
