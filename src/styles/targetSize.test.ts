/**
 * Pointer target sizes (WCAG 2.2, 2.5.8 Target Size (Minimum), AA).
 *
 * The criterion asks for 24×24 CSS pixels, with an exception for targets spaced far
 * enough apart that their 24px exclusion zones do not overlap. axe-core can check this
 * properly, but only in a real browser — it needs layout — so the audit in
 * `scripts/a11y.mjs` runs in jsdom with that rule off. This test covers the same
 * ground from the other side: it reads the declarations and checks that every
 * interactive thing on the site is *given* a size, and that the size is big enough.
 *
 * It is an inventory rather than a crawl, which is the honest trade-off: a crawl would
 * have to guess which selectors are interactive and would miss whatever it guessed
 * wrong about. An inventory misses a control nobody added here — so when you add an
 * interactive component, add it to INTERACTIVE below. That is the whole maintenance
 * burden, and it is the point: it makes "did I give this a target size?" a question
 * you have to answer.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Read a stylesheet with its comments removed.
 *
 * Stripping comments is not cosmetic here: several of these rules carry a comment
 * between two declarations explaining the size choice, and a naive declaration matcher
 * would stop at it and report the property as missing.
 */
const read = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8").replace(
    /\/\*[\s\S]*?\*\//g,
    "",
  );

const tokens = read("./tokens.css");

/** The comfortable figure the design uses, from tokens.css. */
const TARGET_MIN = (() => {
  const match = tokens.match(/--target-min:\s*(\d+)px/);
  if (!match?.[1]) throw new Error("--target-min is not declared in tokens.css");
  return Number(match[1]);
})();

/** WCAG 2.2 AA minimum, in CSS pixels. */
const WCAG_MIN = 24;

const ROOT_FONT_PX = 16;

/** Resolve a CSS length to pixels. Understands px, rem, and var(--target-min). */
function toPx(value: string): number | undefined {
  const text = value.trim();
  if (text === "var(--target-min)") return TARGET_MIN;

  const px = text.match(/^(\d*\.?\d+)px$/);
  if (px?.[1]) return Number(px[1]);

  const rem = text.match(/^(\d*\.?\d+)rem$/);
  if (rem?.[1]) return Number(rem[1]) * ROOT_FONT_PX;

  return undefined;
}

/** The declaration block for `selector` in `css`, or undefined. */
function rule(css: string, selector: string): string | undefined {
  // Matches the selector at the start of a rule, allowing it to be one of several.
  const pattern = new RegExp(
    `(?:^|[,{}])\\s*${selector.replace(/[.[\]*+?^$|()\\]/g, "\\$&")}\\s*(?:,[^{]*)?\\{([^}]*)\\}`,
    "m",
  );
  return css.match(pattern)?.[1];
}

function declaration(block: string, property: string): string | undefined {
  return block.match(new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`))?.[1]?.trim();
}

/**
 * Every interactive control on the site, where its size is declared, and the smallest
 * dimension it is allowed to be.
 *
 * `min` is `TARGET_MIN` for anything a thumb reaches for, and `WCAG_MIN` for the few
 * dense controls that rely on the spacing exception — each of which says why.
 */
const INTERACTIVE: {
  what: string;
  file: string;
  selector: string;
  property: "min-block-size" | "block-size";
  min: number;
  why?: string;
}[] = [
  {
    what: "buttons and button-styled links",
    file: "./global.css",
    selector: ".button",
    property: "min-block-size",
    min: TARGET_MIN,
  },
  {
    what: "header navigation links",
    file: "../components/SiteHeader.astro",
    selector: ".nav a",
    property: "min-block-size",
    min: TARGET_MIN,
  },
  {
    what: "the theme toggle",
    file: "../components/ThemeToggle.astro",
    selector: ".theme-toggle",
    property: "block-size",
    min: TARGET_MIN,
  },
  {
    what: "the mobile menu button",
    file: "../components/islands/MobileNav.css",
    selector: ".mobile-nav__button",
    property: "block-size",
    min: TARGET_MIN,
  },
  {
    what: "mobile navigation links",
    file: "../components/islands/MobileNav.css",
    selector: ".mobile-nav__links a",
    property: "min-block-size",
    min: TARGET_MIN,
  },
  {
    what: "mobile language links",
    file: "../components/islands/MobileNav.css",
    selector: ".mobile-nav__langs a",
    property: "min-block-size",
    min: TARGET_MIN,
  },
  {
    what: "form inputs, selects and textareas",
    file: "../components/islands/ContactForm.css",
    selector: ".field input",
    property: "min-block-size",
    min: TARGET_MIN,
  },
  {
    what: "language codes in the header",
    file: "../components/LanguageSwitcher.astro",
    selector: ".lang",
    property: "block-size",
    min: WCAG_MIN,
    why: "Three two-letter codes at 44px each would dominate the header. They are 32px and spaced so their exclusion zones do not overlap, which is the documented spacing exception.",
  },
  {
    what: "footer links",
    file: "../components/SiteFooter.astro",
    selector: "a",
    property: "min-block-size",
    min: WCAG_MIN,
    why: "A dense list of secondary links. 28px with vertical spacing between rows, relying on the spacing exception.",
  },
];

describe("--target-min", () => {
  it("is at least the WCAG 2.2 AA minimum", () => {
    expect(TARGET_MIN).toBeGreaterThanOrEqual(WCAG_MIN);
  });
});

describe.each(INTERACTIVE)("$what", ({ file, selector, property, min }) => {
  const css = read(file);

  it(`declares ${property} on ${selector}`, () => {
    const block = rule(css, selector);
    expect(block, `no rule for ${selector} in ${file}`).toBeDefined();
    expect(declaration(block!, property), `${selector} has no ${property}`).toBeDefined();
  });

  it(`is at least ${min}px tall`, () => {
    const value = declaration(rule(css, selector)!, property)!;
    const px = toPx(value);
    expect(px, `could not resolve ${value} to pixels`).toBeDefined();
    expect(px!).toBeGreaterThanOrEqual(min);
  });
});

describe("controls below the comfortable size", () => {
  it("each explain why the spacing exception applies", () => {
    // If someone shrinks a control to squeeze it in, this makes them write down the
    // reason — which is usually the moment they reconsider.
    for (const entry of INTERACTIVE) {
      if (entry.min < TARGET_MIN) {
        expect(entry.why, `${entry.what} is under ${TARGET_MIN}px with no justification`)
          .toBeTruthy();
      }
    }
  });
});
