/**
 * Canonical URLs, hreflang and the noindex rules.
 *
 * The noindex logic is the part worth protecting: the whole site is meant to be
 * unindexable until someone deliberately flips LAUNCHED, and that is easy to
 * accidentally undo.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { LAUNCHED } from "../data/company";
import { LOCALES } from "../i18n/locales";
import { APPLE_TOUCH_ICON, OG_IMAGE, organizationJsonLd, seoFor, webPageJsonLd } from "./seo";

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

/**
 * The two images in `public/` that the head points at. Their dimensions are declared
 * in `seo.ts` and announced to crawlers (`og:image:width/height`) and to iOS
 * (`sizes`), so the files must actually be that size. Read straight from the PNG
 * header: width and height are big-endian at bytes 16 and 20, after the signature
 * and the IHDR chunk header. The colour type at byte 25 says whether there is an
 * alpha channel, which iOS would fill with black on the home screen.
 */
describe("preview images", () => {
  const png = (path: string) => {
    const bytes = readFileSync(fileURLToPath(new URL(`../../public${path}`, import.meta.url)));
    expect(bytes.subarray(1, 4).toString("ascii"), `${path} is not a PNG`).toBe("PNG");
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), colourType: bytes[25] };
  };

  it("og.png is the size Seo.astro announces", () => {
    const { width, height } = png(OG_IMAGE.path);
    expect([width, height]).toEqual([OG_IMAGE.width, OG_IMAGE.height]);
  });

  it("apple-touch-icon.png is square, the declared size, and has no alpha channel", () => {
    const { width, height, colourType } = png(APPLE_TOUCH_ICON.path);
    expect([width, height]).toEqual([APPLE_TOUCH_ICON.size, APPLE_TOUCH_ICON.size]);
    // 4 (grey + alpha) and 6 (RGBA) carry alpha; a palette PNG (3) could still carry
    // a tRNS chunk, which is checked for directly.
    expect([4, 6]).not.toContain(colourType);
    const bytes = readFileSync(fileURLToPath(new URL(`../../public${APPLE_TOUCH_ICON.path}`, import.meta.url)));
    expect(bytes.includes(Buffer.from("tRNS"))).toBe(false);
  });
});
