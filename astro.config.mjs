// @ts-check
import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { defineConfig, fontProviders } from "astro/config";
import react from "@astrojs/react";

import { DEFAULT_LOCALE, LOCALES } from "./src/i18n/locales.ts";
import { buildCspValue, collectInlineSources, cspHeaderName, cspModeFrom } from "./src/lib/csp.ts";

/**
 * Fonts are self-hosted out of the @fontsource npm packages, so no font request ever
 * leaves our own origin. Loading them from fonts.googleapis.com would mean a
 * third-party request on every page view, a CSP exception for that origin, and — for
 * any visitor in the EU — a personal-data transfer that needs consent. Self-hosting
 * removes all three problems at once, and is also faster.
 *
 * The `local` provider names each file explicitly. (The `npm` provider only reads a
 * package's default stylesheet, which silently drops every weight except 400.)
 *
 * Only the `latin` subset is declared. English, German and Spanish between them need
 * nothing outside U+0000–00FF: ä ö ü ß ñ á é í ó ú ¿ ¡ are all in there. Adding a
 * language with characters beyond it — Turkish ğ ş ı, Polish ł ą — means adding a
 * `latin-ext` variant for each family here, and nothing else.
 */

/** The `latin` unicode range, as @fontsource's own stylesheets publish it. */
const LATIN = /** @type {[string, ...string[]]} */ ([
  "U+0000-00FF", "U+0131", "U+0152-0153", "U+02BB-02BC", "U+02C6", "U+02DA", "U+02DC",
  "U+0304", "U+0308", "U+0329", "U+2000-206F", "U+20AC", "U+2122", "U+2191", "U+2193",
  "U+2212", "U+2215", "U+FEFF", "U+FFFD",
]);

/**
 * One @font-face: a @fontsource file and the CSS weight it answers to.
 *
 * @param {string} pkg     @fontsource package name, e.g. "inter"
 * @param {number} weight  CSS weight this face serves
 */
const face = (pkg, weight) => ({
  weight,
  style: /** @type {const} */ ("normal"),
  src: /** @type {[string]} */ ([`@fontsource/${pkg}/files/${pkg}-latin-${weight}-normal.woff2`]),
  unicodeRange: LATIN,
});

/**
 * Repairs the redirect page Astro generates for "/".
 *
 * Astro emits it with a two-second `<meta http-equiv="refresh">`, no `lang` attribute
 * and its one link outside any landmark. That is three WCAG failures — a timed refresh
 * the visitor cannot control (2.2.1), a page whose language is not stated (3.1.1), and
 * content outside a landmark (1.3.1) — in a file that is generated rather than
 * authored, so there is nowhere in our source to fix them.
 *
 * In production the host answers "/" with a 301 and this page is never seen, but it
 * ships all the same, and any other host would serve it. Dropping the delay to zero
 * makes it a redirect rather than a timed one, which is the documented exception to
 * 2.2.1.
 *
 * @type {() => import("astro").AstroIntegration}
 */
const rootRedirect = () => ({
  name: "team-rodriguez:root-redirect",
  hooks: {
    "astro:build:done": async ({ dir, logger }) => {
      const file = new URL("index.html", dir);
      let html = await readFile(file, "utf8");
      if (!html.includes('http-equiv="refresh"')) return;

      html = html.replace(/content="\d+;\s*url=/, 'content="0; url=');

      if (/<html[\s>]/.test(html)) {
        html = html.replace(/<html(?![^>]*\slang=)/, `<html lang="${DEFAULT_LOCALE}"`);
      } else {
        html = html.replace(/(<!doctype html>)/i, `$1<html lang="${DEFAULT_LOCALE}">`) + "</html>";
      }

      if (!html.includes("<main")) {
        html = html.includes("</body>")
          ? html.replace("<body>", "<body><main>").replace("</body>", "</main></body>")
          : html.replace("<body>", "<body><main>").replace(/(<\/html>|$)/, "</main>$1");
      }

      await writeFile(file, html);
      logger.info(`Root redirect: lang="${DEFAULT_LOCALE}", refresh delay 0, link inside <main>.`);
    },
  },
});

/**
 * Derives the Content-Security-Policy from the pages the build actually produced and
 * writes it into `staticwebapp.config.json`, so the policy can never drift from the
 * output. See src/lib/csp.ts for what is hashed and why.
 *
 * Report-only unless CSP_MODE=enforce.
 *
 * @type {() => import("astro").AstroIntegration}
 */
const contentSecurityPolicy = () => ({
  name: "team-rodriguez:csp",
  hooks: {
    "astro:build:done": async ({ dir, logger }) => {
      const root = fileURLToPath(dir);
      const pages = (await readdir(root, { recursive: true })).filter((n) => n.endsWith(".html"));

      /** @type {{ scripts: string[], styles: string[] }} */
      const sources = { scripts: [], styles: [] };
      for (const page of pages) {
        const html = await readFile(new URL(page.replaceAll("\\", "/"), dir), "utf8");
        const found = collectInlineSources(html);
        sources.scripts.push(...found.scripts);
        sources.styles.push(...found.styles);
      }

      const mode = cspModeFrom(process.env);
      const file = new URL("staticwebapp.config.json", dir);
      const config = JSON.parse(await readFile(file, "utf8"));
      config.globalHeaders = {
        ...config.globalHeaders,
        [cspHeaderName(mode)]: buildCspValue(sources),
      };
      await writeFile(file, `${JSON.stringify(config, null, 2)}\n`);

      const counts = `${new Set(sources.scripts).size} script, ${new Set(sources.styles).size} style`;
      logger.info(`CSP ${mode} — ${counts} hashes from ${pages.length} pages`);
    },
  },
});

/**
 * Writes `robots.txt` and `sitemap.xml`, and keeps the blanket `X-Robots-Tag` header
 * in step with whether the site has actually launched.
 *
 * All three are derived from `LAUNCHED` in src/data/company.ts and from the pages the
 * build produced, so there is one switch rather than three places to remember. Before
 * launch: everything disallowed, no sitemap, `noindex` on every response. After:
 * a sitemap listing every page that is not marked noindex, and the header removed.
 *
 * A page can be noindex individually (see src/lib/seo.ts) — those are filtered out of
 * the sitemap here by reading the built HTML, rather than by keeping a second list
 * that could disagree with the meta tags.
 *
 * @type {() => import("astro").AstroIntegration}
 */
const seoFiles = () => ({
  name: "team-rodriguez:seo-files",
  hooks: {
    "astro:build:done": async ({ dir, logger }) => {
      const { LAUNCHED } = await import("./src/data/company.ts");
      const root = fileURLToPath(dir);
      const site = process.env.SITE_URL;

      const configFile = new URL("staticwebapp.config.json", dir);
      const config = JSON.parse(await readFile(configFile, "utf8"));

      if (!LAUNCHED || !site) {
        await writeFile(
          new URL("robots.txt", dir),
          [
            "# The site has not launched (LAUNCHED is false in src/data/company.ts),",
            "# or SITE_URL is unset. Nothing here should be indexed yet.",
            "User-agent: *",
            "Disallow: /",
            "",
          ].join("\n"),
        );
        config.globalHeaders = {
          ...config.globalHeaders,
          "X-Robots-Tag": "noindex, nofollow",
        };
        await writeFile(configFile, `${JSON.stringify(config, null, 2)}\n`);
        logger.warn("Pre-launch: robots.txt disallows everything and X-Robots-Tag is noindex.");
        return;
      }

      const files = (await readdir(root, { recursive: true })).filter((n) => n.endsWith(".html"));
      /** @type {string[]} */
      const urls = [];
      for (const file of files) {
        const html = await readFile(new URL(file.replaceAll("\\", "/"), dir), "utf8");
        if (/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html)) continue;
        const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
        if (canonical?.[1]) urls.push(canonical[1]);
      }

      const sitemap = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...[...new Set(urls)].sort().map((url) => `  <url><loc>${url}</loc></url>`),
        "</urlset>",
        "",
      ].join("\n");

      await writeFile(new URL("sitemap.xml", dir), sitemap);
      await writeFile(
        new URL("robots.txt", dir),
        ["User-agent: *", "Allow: /", "", `Sitemap: ${new URL("/sitemap.xml", site).href}`, ""].join(
          "\n",
        ),
      );

      // Launched: the blanket header must go, or every page stays noindex regardless
      // of what its own meta tag says.
      delete config.globalHeaders?.["X-Robots-Tag"];
      await writeFile(configFile, `${JSON.stringify(config, null, 2)}\n`);

      logger.info(`Sitemap: ${new Set(urls).size} indexable pages of ${files.length}.`);
    },
  },
});

// https://astro.build/config
export default defineConfig({
  /**
   * Production origin. Unset until the domain is bought and pointed — and while it is
   * unset, `src/data/company.ts` keeps LAUNCHED false, which makes every page noindex.
   * That pairing is intentional: a site with no real domain should not be indexed.
   */
  site: process.env.SITE_URL || undefined,

  /** Every URL ends in "/", matching what src/i18n/routes.ts builds. */
  trailingSlash: "always",

  /*
   * Order matters: `seoFiles` and `contentSecurityPolicy` both rewrite
   * staticwebapp.config.json, so they must not run concurrently — Astro runs
   * integration hooks in array order, which serialises them.
   */
  integrations: [react(), rootRedirect(), seoFiles(), contentSecurityPolicy()],

  /** English is primary; every URL carries its language and "/" redirects to "/en/". */
  i18n: {
    locales: [...LOCALES],
    defaultLocale: DEFAULT_LOCALE,
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: true,
    },
  },

  build: {
    /** One stylesheet rather than many small ones: fewer requests on a cold cache. */
    inlineStylesheets: "auto",
  },

  fonts: [
    {
      provider: fontProviders.local(),
      name: "Space Grotesk",
      cssVariable: "--font-space-grotesk",
      fallbacks: ["system-ui", "sans-serif"],
      options: {
        variants: /** @type {[ReturnType<typeof face>, ...ReturnType<typeof face>[]]} */ (
          [500, 700].map((w) => face("space-grotesk", w))
        ),
      },
    },
    {
      provider: fontProviders.local(),
      name: "Inter",
      cssVariable: "--font-inter",
      fallbacks: ["system-ui", "sans-serif"],
      options: {
        variants: /** @type {[ReturnType<typeof face>, ...ReturnType<typeof face>[]]} */ (
          [400, 500, 600, 700].map((w) => face("inter", w))
        ),
      },
    },
    {
      provider: fontProviders.local(),
      name: "JetBrains Mono",
      cssVariable: "--font-jetbrains-mono",
      fallbacks: ["ui-monospace", "monospace"],
      options: { variants: [face("jetbrains-mono", 400)] },
    },
  ],
});
