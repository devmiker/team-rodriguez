/**
 * Contrast, checked against the real stylesheet.
 *
 * This reads `tokens.css` and computes WCAG contrast for every semantic pair the site
 * actually uses, in both themes. It is the one test that would catch the most common
 * and most invisible design regression there is: someone lightens a grey because it
 * "looks better", and body text quietly drops to 3.9:1 for everybody.
 *
 * Reading the CSS rather than a duplicated table of hex values is the point. A test
 * that checks its own copy of the palette passes forever after the palette changes.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const css = readFileSync(fileURLToPath(new URL("./tokens.css", import.meta.url)), "utf8");

/* -------------------------------------------------------------------------- */
/* Reading the stylesheet                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The declarations inside one block, by selector.
 *
 * Light lives in the bare `:root {`; dark lives in `:root[data-theme="dark"] {`. The
 * media-query copy is checked separately for agreement, because the two must not
 * drift — a visitor whose device is dark and a visitor who pressed the button should
 * see the same page.
 */
function block(startsWith: string): Record<string, string> {
  const index = css.indexOf(startsWith);
  if (index === -1) throw new Error(`No block starting ${JSON.stringify(startsWith)} in tokens.css`);
  const open = css.indexOf("{", index);
  const close = css.indexOf("\n}", open);
  const body = css.slice(open + 1, close);

  const out: Record<string, string> = {};
  for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    if (name && value) out[name] = value.trim();
  }
  return out;
}

const light = block(":root {");
const dark = block(':root[data-theme="dark"] {');
const darkViaMedia = block(':root:not([data-theme="light"]) {');

/** Resolve `var(--x)` one level deep, which is as deep as this palette nests. */
function resolve(tokens: Record<string, string>, name: string): string {
  const raw = tokens[name] ?? light[name];
  if (!raw) throw new Error(`Token ${name} is not defined`);
  const via = raw.match(/^var\((--[\w-]+)\)$/);
  if (via?.[1]) return resolve({ ...light, ...tokens }, via[1]);
  return raw;
}

/* -------------------------------------------------------------------------- */
/* Contrast                                                                    */
/* -------------------------------------------------------------------------- */

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const match = hex.trim().match(/^#([0-9a-f]{6})$/i);
  if (!match?.[1]) throw new Error(`Not a 6-digit hex colour: ${JSON.stringify(hex)}`);
  const n = parseInt(match[1], 16);
  return (
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255)
  );
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/* -------------------------------------------------------------------------- */
/* What has to pass                                                            */
/* -------------------------------------------------------------------------- */

/** Text pairs: WCAG AA for normal-size text is 4.5:1. */
const TEXT_PAIRS: [fg: string, bg: string][] = [
  ["--color-text", "--color-bg"],
  ["--color-text-dim", "--color-bg"],
  ["--color-text", "--color-bg-raised"],
  ["--color-text-dim", "--color-bg-raised"],
  ["--color-link", "--color-bg"],
  ["--color-link", "--color-bg-raised"],
  ["--color-on-accent", "--color-accent"],
  ["--color-text-on-band", "--color-bg-band"],
  ["--color-text-dim-on-band", "--color-bg-band"],
  ["--color-link-on-band", "--color-bg-band"],
  ["--color-danger", "--color-bg"],
  ["--color-danger", "--color-bg-raised"],
  ["--color-success", "--color-bg"],
];

/**
 * Non-text UI pairs: WCAG 1.4.11 requires 3:1 for anything a visitor has to perceive
 * to use — an input's border, a focus ring.
 *
 * `--color-line` is deliberately NOT in this list. It is decorative separation, does
 * not meet 3:1, and must never be the only marker of an interactive boundary; the
 * comment in tokens.css says so and this omission is the other half of that contract.
 */
const UI_PAIRS: [fg: string, bg: string][] = [
  ["--color-line-strong", "--color-bg"],
  ["--color-line-strong", "--color-bg-raised"],
  ["--color-focus", "--color-bg"],
  ["--color-focus", "--color-bg-raised"],
  ["--color-focus-on-band", "--color-bg-band"],
  ["--color-accent", "--color-bg"],
];

const THEMES: [name: string, tokens: Record<string, string>][] = [
  ["light", light],
  ["dark", dark],
];

describe.each(THEMES)("%s theme", (_name, tokens) => {
  it.each(TEXT_PAIRS)("%s on %s reaches AA for body text (4.5:1)", (fg, bg) => {
    const ratio = contrast(resolve(tokens, fg), resolve(tokens, bg));
    expect(ratio, `${fg} on ${bg} is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
  });

  it.each(UI_PAIRS)("%s on %s reaches 3:1 for non-text UI", (fg, bg) => {
    const ratio = contrast(resolve(tokens, fg), resolve(tokens, bg));
    expect(ratio, `${fg} on ${bg} is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(3);
  });
});

describe("the two dark-theme declarations", () => {
  /**
   * Dark is declared twice — once under `prefers-color-scheme`, once under an explicit
   * `data-theme`. They must be identical. If they drift, one group of visitors gets a
   * palette nobody has ever checked, and no other test would notice.
   */
  it("declare exactly the same tokens with the same values", () => {
    expect(Object.keys(darkViaMedia).sort()).toEqual(Object.keys(dark).sort());
    for (const key of Object.keys(dark)) {
      expect(darkViaMedia[key], `${key} differs between the two dark blocks`).toBe(dark[key]);
    }
  });
});

describe("the favicon", () => {
  /**
   * The favicon is one of the very few places a brand colour legitimately lives
   * outside tokens.css — it is an asset, not a stylesheet, so `--brand-navy` cannot
   * reach it.
   *
   * That exemption is exactly how it drifted: the navy was lightened across the whole
   * palette and the favicon kept the old near-black for a day, which nobody would have
   * noticed until someone compared a browser tab against the header. This test closes
   * the gap the token layer cannot.
   */
  const favicon = readFileSync(
    fileURLToPath(new URL("../../public/favicon.svg", import.meta.url)),
    "utf8",
  );

  it("uses the brand navy as its field", () => {
    expect(favicon.toLowerCase()).toContain(light["--brand-navy"]!.toLowerCase());
  });

  it("uses the bright emerald as its mark", () => {
    // The bright one, not the deep one: the field behind it is navy, so this is the
    // dark-theme pairing even in a light browser chrome.
    expect(favicon.toLowerCase()).toContain(light["--brand-emerald-bright"]!.toLowerCase());
  });

  it("contains no colour that is not a brand token", () => {
    const brand = new Set(
      Object.entries(light)
        .filter(([name]) => name.startsWith("--brand-"))
        .map(([, value]) => value.toLowerCase()),
    );
    for (const hex of favicon.toLowerCase().match(/#[0-9a-f]{6}/g) ?? []) {
      expect(brand, `favicon uses ${hex}, which is not a --brand-* token`).toContain(hex);
    }
  });
});

describe("the brand layer", () => {
  it("never reaches a component directly — every --color-* is a literal or a brand var", () => {
    for (const [name, value] of Object.entries({ ...light, ...dark })) {
      if (!name.startsWith("--color-")) continue;
      expect(
        /^#[0-9a-f]{6}$/i.test(value) || /^var\(--brand-[\w-]+\)$/.test(value),
        `${name} is ${value}; semantic tokens must be a hex value or a --brand-* variable`,
      ).toBe(true);
    }
  });

  it("keeps the vivid emerald away from body text on white", () => {
    // The whole reason --brand-emerald-deep exists. If someone ever points
    // --color-link at --brand-emerald, this fails and explains why.
    const ratio = contrast(light["--brand-emerald"]!, light["--color-bg"]!);
    expect(ratio).toBeLessThan(4.5);
    expect(resolve(light, "--color-link")).not.toBe(light["--brand-emerald"]);
  });
});
