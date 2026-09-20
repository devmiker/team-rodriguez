/**
 * The i18n layer: route slugs, path building, page enumeration, translation parity.
 *
 * The parity test is the important one. TypeScript already requires every language
 * table to have every key, so a *missing* key cannot ship — but a key that was
 * duplicated, left in English, or silently emptied can, and those are exactly the
 * things a reader notices and a developer does not.
 */

import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, LOCALE_META, LOCALES, toLocale } from "./locales";
import { allPages, assertUniquePaths } from "./pages";
import { alternates, NAV_ROUTES, pathFor, ROUTE_DEFS, ROUTE_KEYS, ROUTES } from "./routes";
import { STRINGS } from "./ui";
import { en } from "./strings/en";

describe("locales", () => {
  it("has metadata for every locale, and no extras", () => {
    expect(Object.keys(LOCALE_META).sort()).toEqual([...LOCALES].sort());
  });

  it("treats the default locale as reviewed — it is the source language", () => {
    expect(LOCALE_META[DEFAULT_LOCALE].reviewed).toBe(true);
  });

  it("throws rather than guessing on an unknown locale", () => {
    // Falling back would publish a page in the wrong language with the wrong hreflang
    // and no error anywhere. Better to fail the build.
    expect(() => toLocale("pt")).toThrow();
    expect(() => toLocale(undefined)).toThrow();
  });
});

describe("routes", () => {
  it("gives every route a slug in every language", () => {
    for (const key of ROUTE_KEYS) {
      for (const locale of LOCALES) {
        expect(ROUTES[key].slug[locale], `${key}/${locale}`).toBeTypeOf("string");
      }
    }
  });

  it("never puts a slash inside a slug", () => {
    // pathFor joins segments itself; a slash in a slug would produce "//" or a depth
    // the route file does not expect.
    for (const key of ROUTE_KEYS) {
      for (const locale of LOCALES) {
        expect(ROUTES[key].slug[locale]).not.toContain("/");
      }
    }
  });

  it("builds paths that start and end with a slash", () => {
    for (const key of ROUTE_KEYS) {
      for (const locale of LOCALES) {
        const path = pathFor({ route: key }, locale);
        expect(path.startsWith(`/${locale}/`)).toBe(true);
        expect(path.endsWith("/")).toBe(true);
        expect(path).not.toContain("//");
      }
    }
  });

  it("translates the slugs it should", () => {
    expect(pathFor({ route: "services" }, "en")).toBe("/en/services/");
    expect(pathFor({ route: "services" }, "de")).toBe("/de/leistungen/");
    expect(pathFor({ route: "services" }, "es")).toBe("/es/servicios/");
  });

  it("puts a detail slug under its parent", () => {
    expect(pathFor({ route: "work", slug: "pinche-cafe" }, "es")).toBe(
      "/es/proyectos/pinche-cafe/",
    );
  });

  it("keeps the thank-you page out of the navigation and out of the index", () => {
    expect(NAV_ROUTES).not.toContain("thanks");
    expect(ROUTE_DEFS.thanks.noindex).toBe(true);
  });

  it("offers every language plus x-default as alternates", () => {
    const list = alternates({ route: "contact" });
    expect(list).toHaveLength(LOCALES.length + 1);
    expect(list.at(-1)).toEqual({
      locale: "x-default",
      path: pathFor({ route: "contact" }, DEFAULT_LOCALE),
    });
  });
});

describe("pages", () => {
  it("builds every route in every language", () => {
    expect(allPages()).toHaveLength(ROUTE_KEYS.length * LOCALES.length);
  });

  it("accepts the real page list", () => {
    expect(() => assertUniquePaths(allPages())).not.toThrow();
  });

  it("throws when two pages would build to the same URL", () => {
    // The failure this guards against: a case study slugged "team" silently
    // overwriting the team page during the build.
    const pages = allPages({ team: ["extra"] });
    const clashing = [...pages, { locale: "en" as const, page: { route: "team" as const }, path: "team" }];
    expect(() => assertUniquePaths(clashing)).toThrow(/build to/);
  });
});

describe("translations", () => {
  const keys = Object.keys(en) as (keyof typeof en)[];

  it.each(LOCALES)("%s has exactly the same keys as English", (locale) => {
    expect(Object.keys(STRINGS[locale]).sort()).toEqual([...keys].sort());
  });

  it.each(LOCALES)("%s has no empty strings", (locale) => {
    for (const key of keys) {
      expect(STRINGS[locale][key].trim(), `${locale}.${key}`).not.toBe("");
    }
  });

  it("has a title for every route, since the nav and footer look one up by key", () => {
    for (const locale of LOCALES) {
      for (const route of ROUTE_KEYS) {
        expect(STRINGS[locale][`${route}.title` as keyof typeof en], `${locale}.${route}.title`)
          .toBeTypeOf("string");
      }
    }
  });

  it("leaves nothing obviously untranslated in German or Spanish", () => {
    // A handful of strings are legitimately identical across languages — the company
    // name, "Astro". Anything else matching English character-for-character is almost
    // always a key that was copied and never translated.
    const allowed = new Set(["site.name"]);
    for (const locale of ["de", "es"] as const) {
      const copied = keys.filter(
        (key) =>
          !allowed.has(key) &&
          STRINGS[locale][key] === en[key] &&
          en[key].length > 24,
      );
      expect(copied, `${locale} strings identical to English`).toEqual([]);
    }
  });
});
