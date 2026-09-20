/**
 * Content-Security-Policy, generated from what the build actually produced.
 *
 * The policy is derived, never hand-maintained. Every inline script and style in
 * `dist/` is hashed at build time and listed in the header, so changing a script
 * produces a new hash on the next build automatically. A hand-written policy drifts
 * the first time someone edits an inline script, and the usual fix — adding
 * `'unsafe-inline'` — throws away most of what CSP is for.
 *
 * What ends up hashed here:
 *   - `ThemeScript.astro`, which must run before first paint or the page flashes
 *   - Astro's island bootstrap and hydration loader
 *   - any small script Astro chose to inline rather than emit as a file
 *   - Astro's `astro-island` display rule and the @font-face blocks from the Fonts API
 *
 * `<script type="application/ld+json">` is deliberately NOT hashed. It is a data
 * block, never executed, and `script-src` does not govern it.
 *
 * Ships as `Content-Security-Policy-Report-Only` by default, which cannot break the
 * site and reports violations to the browser console. Set the `CSP_MODE` repository
 * variable to `enforce` once it has been watched in a real browser for a while.
 */

import { createHash } from "node:crypto";

export type CspMode = "report-only" | "enforce";

export const cspModeFrom = (env: Record<string, string | undefined>): CspMode =>
  env.CSP_MODE === "enforce" ? "enforce" : "report-only";

export const cspHeaderName = (mode: CspMode): string =>
  mode === "enforce" ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only";

/** `'sha256-…'`, quoted as a CSP source expression. */
export const sourceHash = (source: string): string =>
  `'sha256-${createHash("sha256").update(source, "utf8").digest("base64")}'`;

export interface InlineSources {
  scripts: string[];
  styles: string[];
}

/**
 * The inline scripts and styles in one page, exactly as the browser hashes them: the
 * raw text between the tags, with nothing trimmed. A single stripped space produces a
 * different hash and a blocked script.
 */
export function collectInlineSources(html: string): InlineSources {
  const scripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter(
      ([, attrs]) =>
        !/\ssrc\s*=/.test(attrs ?? "") &&
        !/type\s*=\s*["']application\/ld\+json["']/.test(attrs ?? ""),
    )
    .map(([, , body]) => body ?? "");

  const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(([, body]) => body ?? "");

  return { scripts, styles };
}

/**
 * The policy.
 *
 * - `default-src 'self'` — everything comes from this origin. The site loads no
 *   third-party script, font, style or image of any kind, which is the property the
 *   privacy page rests on and the reason there is no cookie banner.
 * - `img-src` allows `data:` for the inline SVG favicon.
 * - `connect-src 'self'` — the contact form posts to `/api/contact` on this same
 *   origin. It is not a list of allowed APIs; it is one.
 * - `form-action 'self'` — the no-JavaScript form fallback posts to our own endpoint.
 *   This is the one directive that is looser than uncle-smash-web's, which could use
 *   `'none'` because that site has no forms at all. `'self'` still means a script that
 *   managed to inject a form could not point it at an attacker's collector.
 * - `frame-ancestors 'none'` restates `X-Frame-Options: DENY` for modern browsers and
 *   is what actually stops clickjacking.
 * - `object-src` and `base-uri` `'none'` — both are classic injection footholds
 *   (`<object>` for plugin content, `<base>` for silently re-pointing every relative
 *   URL on the page) and neither is used here.
 * - `upgrade-insecure-requests` so a stray http:// URL is fetched over TLS rather than
 *   mixed-content-blocked.
 */
export function buildCspValue({ scripts, styles }: InlineSources): string {
  const unique = (values: string[]) => [...new Set(values)].sort();
  const scriptHashes = unique(scripts.map(sourceHash));
  const styleHashes = unique(styles.map(sourceHash));

  return [
    "default-src 'self'",
    `script-src 'self'${scriptHashes.map((h) => ` ${h}`).join("")}`,
    `style-src 'self'${styleHashes.map((h) => ` ${h}`).join("")}`,
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "manifest-src 'self'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}
