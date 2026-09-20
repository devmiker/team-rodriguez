/**
 * Canonical URLs, hreflang and the noindex rules.
 *
 * The noindex logic is the part worth protecting: the whole site is meant to be
 * unindexable until someone deliberately flips LAUNCHED, and that is easy to
 * accidentally undo.
 */

import { describe, expect, it } from "vitest";
import { LAUNCHED } from "../data/company";
import { LOCALES } from "../i18n/locales";
import { organizationJsonLd, seoFor, webPageJsonLd } from "./seo";

describe("seoFor", () => {
  it("returns an absolute canonical on the site's own origin", () => {
    const { canonical } = seoFor({ route: "services" }, "de");
    expect(canonical).toMatch(/^https?:\/\//);
    expect(new URL(canonical).pathname).toBe("/de/leistungen/");
  });

  it("lists every language plus x-default", () => {
    const { alternates } = seoFor({ route: "contact" }, "en");
    expect(alternates.map((a) => a.hreflang)).toEqual([...LOCALES, "x-default"]);
  });

  it("marks a route that is noindex by definition", () => {
    expect(seoFor({ route: "thanks" }, "en").noindex).toBe(true);
  });

  it("honours a caller asking for noindex", () => {
    expect(seoFor({ route: "team" }, "en", { noindex: true }).noindex).toBe(true);
  });

  it("noindexes everything while the site has not launched", () => {
    // The safety net. If this ever starts failing, check LAUNCHED before "fixing" it.
    if (!LAUNCHED) {
      expect(seoFor({ route: "home" }, "en").noindex).toBe(true);
    }
  });

  it("gives each language its own og:locale and lists the others as alternates", () => {
    const { ogLocale, ogLocaleAlternates } = seoFor({ route: "home" }, "es");
    expect(ogLocale).toBe("es_ES");
    expect(ogLocaleAlternates).toHaveLength(LOCALES.length - 1);
    expect(ogLocaleAlternates).not.toContain("es_ES");
  });
});

describe("structured data", () => {
  it("emits nothing at all before launch", () => {
    // Describing a company that does not exist yet is not a neutral placeholder.
    if (!LAUNCHED) {
      expect(organizationJsonLd("en")).toBeUndefined();
      expect(webPageJsonLd({ route: "home" }, "en", "t", "d")).toBeUndefined();
    }
  });
});
