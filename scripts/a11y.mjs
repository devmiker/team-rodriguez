/**
 * Accessibility audit over the built site.
 *
 * Runs axe-core against every page in `dist/`, in both themes, and fails the build on
 * any violation. It runs on the built HTML rather than on a dev server, so what is
 * audited is exactly what ships.
 *
 * Be clear about the limits. Automated testing catches somewhere around a third of
 * real accessibility problems — it finds a missing label or a contrast failure, and it
 * cannot tell you that the tab order makes no sense or that a heading lies about what
 * follows it. This is a floor, not a ceiling. Before launch, someone should navigate
 * the site with a keyboard only, and with a screen reader, and that is not optional.
 *
 * jsdom rather than a real browser: no layout engine, so the rules that need computed
 * geometry (target size, some contrast cases) are skipped here. Target size is covered
 * by `src/styles/targetSize.test.ts` and contrast by `src/styles/tokens.test.ts`
 * instead, both reading the real stylesheet.
 */

import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import axeCore from "axe-core";

const DIST = new URL("../dist/", import.meta.url);

/**
 * The themes to audit. `data-theme` is what the inline script sets, so setting it here
 * exercises the same code path a visitor's saved choice does.
 */
const THEMES = ["light", "dark"];

/** Rules jsdom cannot evaluate meaningfully, with the reason each one is off. */
const DISABLED_RULES = {
  // Needs a layout engine to know what overlaps what.
  "target-size": "no layout in jsdom — covered by src/styles/targetSize.test.ts",
  // axe resolves colours through getComputedStyle, which in jsdom does not resolve
  // custom properties across the cascade. Covered by src/styles/tokens.test.ts.
  "color-contrast": "custom properties unresolved in jsdom — covered by tokens.test.ts",
};

async function htmlFiles() {
  const names = await readdir(fileURLToPath(DIST), { recursive: true });
  return names.filter((n) => n.endsWith(".html")).sort();
}

async function auditPage(file, theme) {
  const html = await readFile(new URL(file.replaceAll("\\", "/"), DIST), "utf8");
  /*
   * `runScripts: "dangerously"` is required: axe-core has to execute inside the page.
   * The only scripts here are ours, from our own build output — nothing is fetched,
   * because jsdom is not given a resource loader.
   */
  const dom = new JSDOM(html, {
    pretendToBeVisual: true,
    runScripts: "dangerously",
    url: "https://example.com/",
    beforeParse(window) {
      /*
       * jsdom implements neither matchMedia nor IntersectionObserver, and Astro's
       * island loader uses both (`client:media`, `client:visible`). Without these the
       * loader throws before axe ever runs.
       *
       * Both stubs report "no": no media query matches, nothing is intersecting. That
       * is deliberate — it leaves the islands unhydrated, so what gets audited is the
       * server-rendered HTML. Which is the right target: it is what arrives before any
       * JavaScript, what a visitor with scripts blocked sees, and what a crawler reads.
       * Auditing the hydrated states needs a real browser and belongs in the manual
       * pass described at the top of this file.
       */
      window.matchMedia = () => ({
        matches: false,
        media: "",
        onchange: null,
        addListener() {},
        removeListener() {},
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent: () => false,
      });
      window.IntersectionObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
          return [];
        }
      };
      window.requestIdleCallback ??= (cb) => window.setTimeout(() => cb({ didTimeout: false }), 0);
      window.cancelIdleCallback ??= (id) => window.clearTimeout(id);
    },
  });
  const { window } = dom;

  window.document.documentElement.setAttribute("data-theme", theme);

  // axe-core is designed to run inside the page it is auditing.
  const script = window.document.createElement("script");
  script.textContent = axeCore.source;
  window.document.head.append(script);

  const results = await window.axe.run(window.document, {
    rules: Object.fromEntries(Object.keys(DISABLED_RULES).map((id) => [id, { enabled: false }])),
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
  });

  window.close();
  return results.violations;
}

const files = await htmlFiles();
if (files.length === 0) {
  console.error("No HTML in dist/. Run `astro build` first.");
  process.exit(1);
}

let failures = 0;

for (const theme of THEMES) {
  for (const file of files) {
    const violations = await auditPage(file, theme);
    for (const violation of violations) {
      failures += 1;
      console.error(`\n✗ ${file} [${theme}] — ${violation.id} (${violation.impact})`);
      console.error(`  ${violation.help}`);
      console.error(`  ${violation.helpUrl}`);
      for (const node of violation.nodes.slice(0, 3)) {
        console.error(`  → ${node.html.slice(0, 160)}`);
      }
    }
  }
}

const checked = files.length * THEMES.length;

if (failures > 0) {
  console.error(`\n${failures} violation(s) across ${checked} page renders.`);
  process.exit(1);
}

console.log(
  `axe: ${checked} page renders clean (${files.length} pages × ${THEMES.length} themes).`,
);
for (const [rule, why] of Object.entries(DISABLED_RULES)) {
  console.log(`  note: "${rule}" not run here — ${why}`);
}
