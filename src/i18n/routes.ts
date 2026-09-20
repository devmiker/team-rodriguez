/**
 * Every route on the site, and its URL slug in each language.
 *
 * Slugs are translated because a Spanish visitor reading `/es/servicios/` is being
 * spoken to, and `/es/services/` is not. That has a cost: the same page has three
 * different URLs, and anything that links, switches language or emits hreflang has to
 * agree on all three. So nothing hard-codes a path — `pathFor()` is the only way to
 * build one, and the language switcher, the nav, the sitemap and the hreflang tags all
 * go through it.
 *
 * `inNav` decides what appears in the primary navigation. Legal pages are reachable
 * from the footer and by URL, but do not belong in the header.
 */

import { DEFAULT_LOCALE, LOCALES, type Locale } from "./locales";

export interface RouteDef {
  /**
   * The slug after the locale, per language. An empty string is the language's home
   * page (`/en/`). Slugs never contain slashes — a detail page appends one segment.
   */
  slug: Record<Locale, string>;
  inNav: boolean;
  /** Keeps the page out of search results and the sitemap. */
  noindex?: boolean;
}

export const ROUTES = {
  home: {
    slug: { en: "", de: "", es: "" },
    inNav: false,
  },
  services: {
    slug: { en: "services", de: "leistungen", es: "servicios" },
    inNav: true,
  },
  work: {
    slug: { en: "work", de: "projekte", es: "proyectos" },
    inNav: true,
  },
  team: {
    slug: { en: "team", de: "team", es: "equipo" },
    inNav: true,
  },
  partners: {
    slug: { en: "partners", de: "partner", es: "aliados" },
    inNav: true,
  },
  contact: {
    slug: { en: "contact", de: "kontakt", es: "contacto" },
    inNav: true,
  },
  /**
   * Where the no-JavaScript form posts land. Never linked, never indexed — reaching it
   * any way other than by submitting the form just shows a message and a way back.
   */
  thanks: {
    slug: { en: "thanks", de: "danke", es: "gracias" },
    inNav: false,
    noindex: true,
  },
  privacy: {
    slug: { en: "privacy", de: "datenschutz", es: "privacidad" },
    inNav: false,
  },
  terms: {
    slug: { en: "terms", de: "agb", es: "terminos" },
    inNav: false,
  },
} as const satisfies Record<string, RouteDef>;

/**
 * `ROUTES` is `as const` so `RouteKey` is a union of the literal keys rather than
 * `string` — but that also narrows each entry to its own literal shape, and an entry
 * without `noindex` then has no such property to read. This view keeps the precise
 * keys and gives every entry the full `RouteDef` shape.
 */
export const ROUTE_DEFS: Record<RouteKey, RouteDef> = ROUTES;

export type RouteKey = keyof typeof ROUTES;

export const ROUTE_KEYS = Object.keys(ROUTES) as RouteKey[];

/** The routes the header navigation shows, in the order it shows them. */
export const NAV_ROUTES = ROUTE_KEYS.filter((key) => ROUTES[key].inNav);

/** The legal routes the footer shows. */
export const LEGAL_ROUTES: RouteKey[] = ["privacy", "terms"];

/**
 * A page: a route, plus the slug of a detail page under it when there is one.
 *
 * `{ route: "work" }` is the index; `{ route: "work", slug: "harbor-dental" }` is one
 * case study under it.
 */
export interface PageRef {
  route: RouteKey;
  slug?: string;
}

/**
 * The URL for a page in one language — always absolute-from-root, always with a
 * trailing slash, so nothing anywhere has to remember which form to use.
 *
 *   pathFor({ route: "services" }, "de")                  → "/de/leistungen/"
 *   pathFor({ route: "work", slug: "harbor" }, "es")      → "/es/proyectos/harbor/"
 *   pathFor({ route: "home" }, "en")                      → "/en/"
 */
export function pathFor(page: PageRef, locale: Locale): string {
  const base = ROUTES[page.route].slug[locale];
  const segments = [locale, base, page.slug].filter((s): s is string => Boolean(s));
  return `/${segments.join("/")}/`;
}

/** Whether `current` is, or is inside, `target` — for marking the active nav item. */
export function isCurrent(current: PageRef, target: RouteKey): boolean {
  return current.route === target;
}

/**
 * The same page in every language, for the language switcher and for hreflang.
 * `x-default` points at the source language, which is what a search engine should
 * offer a visitor whose language we do not publish.
 */
export function alternates(page: PageRef): { locale: Locale | "x-default"; path: string }[] {
  return [
    ...LOCALES.map((locale) => ({ locale, path: pathFor(page, locale) })),
    { locale: "x-default" as const, path: pathFor(page, DEFAULT_LOCALE) },
  ];
}
