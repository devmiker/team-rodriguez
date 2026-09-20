/**
 * The generated Content-Security-Policy.
 *
 * The hashing has to match what a browser computes byte for byte — a single trimmed
 * space is a blocked script and a broken theme toggle — so these tests pin the exact
 * extraction behaviour rather than a loose "contains a hash" assertion.
 */

import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  buildCspValue,
  collectInlineSources,
  cspHeaderName,
  cspModeFrom,
  sourceHash,
} from "./csp";

const sha = (s: string) => `'sha256-${createHash("sha256").update(s, "utf8").digest("base64")}'`;

describe("mode", () => {
  it("only enforces when explicitly asked to", () => {
    expect(cspModeFrom({})).toBe("report-only");
    expect(cspModeFrom({ CSP_MODE: "" })).toBe("report-only");
    expect(cspModeFrom({ CSP_MODE: "Enforce" })).toBe("report-only");
    expect(cspModeFrom({ CSP_MODE: "enforce" })).toBe("enforce");
  });

  it("names the right header for each mode", () => {
    expect(cspHeaderName("report-only")).toBe("Content-Security-Policy-Report-Only");
    expect(cspHeaderName("enforce")).toBe("Content-Security-Policy");
  });
});

describe("collectInlineSources", () => {
  it("takes the script body exactly as written, including whitespace", () => {
    const body = "\n  const a = 1;\n";
    const { scripts } = collectInlineSources(`<script>${body}</script>`);
    expect(scripts).toEqual([body]);
  });

  it("ignores scripts with a src — those are covered by 'self'", () => {
    expect(collectInlineSources('<script src="/app.js"></script>').scripts).toEqual([]);
  });

  it("ignores JSON-LD, which is data and is never executed", () => {
    const html = '<script type="application/ld+json">{"@type":"Thing"}</script>';
    expect(collectInlineSources(html).scripts).toEqual([]);
  });

  it("collects inline styles", () => {
    expect(collectInlineSources("<style>body{color:red}</style>").styles).toEqual([
      "body{color:red}",
    ]);
  });

  it("handles several of each on one page", () => {
    const html = "<script>a</script><style>b</style><script>c</script>";
    const found = collectInlineSources(html);
    expect(found.scripts).toEqual(["a", "c"]);
    expect(found.styles).toEqual(["b"]);
  });
});

describe("buildCspValue", () => {
  const policy = buildCspValue({ scripts: ["a", "b", "a"], styles: ["s"] });
  const directive = (name: string) =>
    policy.split("; ").find((d) => d.startsWith(`${name} `)) ?? "";

  it("lists each distinct hash once", () => {
    expect(directive("script-src")).toBe(`script-src 'self' ${[sha("a"), sha("b")].sort().join(" ")}`);
  });

  it("hashes exactly as sourceHash does", () => {
    expect(sourceHash("a")).toBe(sha("a"));
  });

  it("allows no third-party origin anywhere", () => {
    expect(policy).not.toMatch(/https?:\/\//);
  });

  it("never falls back to 'unsafe-inline' or 'unsafe-eval'", () => {
    // The usual "fix" for a hash mismatch, and the one that throws away most of the
    // value of having a policy at all.
    expect(policy).not.toContain("unsafe-inline");
    expect(policy).not.toContain("unsafe-eval");
  });

  it("locks down the classic injection footholds", () => {
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("base-uri 'none'");
    expect(policy).toContain("frame-ancestors 'none'");
  });

  it("allows forms to post to this origin and nowhere else", () => {
    // 'self' rather than 'none': the no-JavaScript form fallback posts to /api/contact.
    expect(directive("form-action")).toBe("form-action 'self'");
  });

  it("keeps connect-src to this origin", () => {
    expect(directive("connect-src")).toBe("connect-src 'self'");
  });

  it("allows data: for images only, for the inline SVG favicon", () => {
    expect(directive("img-src")).toBe("img-src 'self' data:");
    expect(directive("script-src")).not.toContain("data:");
    expect(directive("font-src")).toBe("font-src 'self'");
  });
});
