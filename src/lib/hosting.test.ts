/**
 * The hosting contract: `public/staticwebapp.config.json`.
 *
 * This file is the only reason the site has security headers at all. Azure Static Web
 * Apps reads it and turns it into real HTTP responses; nothing in Astro produces it,
 * and no other host understands it. It is also half-generated — `astro.config.mjs`
 * writes the CSP and the pre-launch `X-Robots-Tag` into the copy in `dist/` at build
 * time — so the checked-in version is a template whose hand-written half nobody looks
 * at again until something is broken in production.
 *
 * Hence these tests. Each one guards a value that is invisible until it bites:
 *
 * - The API runtime is a version pin that silently expires. Azure retires Node
 *   versions on a published schedule, and an unpinned or EOL runtime means the
 *   contact form stops sending mail with no code change and no failing build.
 * - The `/api/*` lockdown is the whole server-side attack surface of this site. One
 *   endpoint, one method. That is worth a test.
 *
 * Deployment is documented in `docs/DEPLOY.md`.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const read = (relative: string): string =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8");

const config = JSON.parse(read("../../public/staticwebapp.config.json"));
const pkg = JSON.parse(read("../../package.json"));

/**
 * Runtimes Azure still supports for managed functions.
 *
 * Deliberately excludes node:14, node:16 and node:18, all of which reached end of
 * support in 2025 and would be accepted by the platform while receiving no security
 * patches. When Azure adds a newer version, add it here — this list is the reason a
 * stale pin becomes a red test instead of a quiet risk.
 */
const SUPPORTED_API_RUNTIMES = ["node:20", "node:22"];

describe("the API runtime pin", () => {
  it("is set at all", () => {
    // Without an explicit pin the platform chooses, and what it chooses has changed
    // before. The function then runs on a version nobody picked and nobody tested.
    expect(
      config.platform?.apiRuntime,
      "platform.apiRuntime is missing from staticwebapp.config.json",
    ).toBeDefined();
  });

  it("names a runtime Azure still supports", () => {
    expect(SUPPORTED_API_RUNTIMES).toContain(config.platform.apiRuntime);
  });

  it("agrees with the Node version the rest of the project requires", () => {
    // package.json says >=22.12.0 and CI runs Node 22. The function running on
    // something older is how you find out in production that a language feature the
    // shared validator uses does not exist there.
    const required = pkg.engines.node.match(/(\d+)/)?.[1];
    expect(config.platform.apiRuntime).toBe(`node:${required}`);
  });
});

describe("the API surface", () => {
  const routes: { route: string; methods?: string[]; statusCode?: number }[] = config.routes;

  it("exposes exactly one endpoint, and only to POST", () => {
    const contact = routes.find((r) => r.route === "/api/contact");
    expect(contact, "the /api/contact route is missing").toBeDefined();
    expect(contact!.methods).toEqual(["POST"]);
  });

  it("answers every other API verb with 405 rather than falling through", () => {
    // A request that matches no route is served the static 404 page — a 200-shaped
    // HTML response to an API call. This rule makes the refusal explicit, and covers
    // the verbs an automated scan reaches for first.
    const wildcard = routes.find((r) => r.route === "/api/*");
    expect(wildcard, "the /api/* catch-all is missing").toBeDefined();
    expect(wildcard!.statusCode).toBe(405);
    for (const method of ["GET", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]) {
      expect(wildcard!.methods, `${method} is not refused by /api/*`).toContain(method);
    }
  });
});

describe("the hand-written headers", () => {
  /**
   * The generated half (CSP, and X-Robots-Tag before launch) is written into `dist/`
   * at build time and is covered by `csp.test.ts`. These are the ones a human typed,
   * which is exactly why they need a test: nothing else would notice their removal.
   */
  const REQUIRED = [
    "Strict-Transport-Security",
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "Cross-Origin-Opener-Policy",
    "Cross-Origin-Resource-Policy",
  ];

  it.each(REQUIRED)("still sets %s", (header) => {
    expect(config.globalHeaders?.[header]).toBeTruthy();
  });

  it("redirects the bare root to the default locale with a 301", () => {
    const root = (config.routes as { route: string; redirect?: string; statusCode?: number }[]) //
      .find((r) => r.route === "/");
    expect(root?.redirect).toBe("/en/");
    // 301 rather than 302: the root will never serve anything else, and a permanent
    // redirect is what consolidates link equity onto the localised URL.
    expect(root?.statusCode).toBe(301);
  });
});
