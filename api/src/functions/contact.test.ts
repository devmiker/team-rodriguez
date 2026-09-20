/**
 * The endpoint's own logic that is worth testing in isolation: the open-redirect
 * guard.
 *
 * Everything else in the handler is either the shared validator (tested in
 * src/lib/contact.test.ts) or a call to the mail provider, which is not worth mocking
 * an HTTP client to assert.
 */

import { describe, expect, it } from "vitest";
import { safeRedirect } from "./contact";

describe("safeRedirect", () => {
  it.each(["/en/thanks/", "/de/danke/", "/es/gracias/", "/en/", "/de/kontakt/"])(
    "accepts this site's own path %s",
    (path) => expect(safeRedirect(path)).toBe(path),
  );

  it.each([
    "https://evil.example/phish",
    "//evil.example/phish",
    "/\\evil.example",
    "http://evil.example",
    "javascript:alert(1)",
    "/en/../../etc/passwd",
    "/en/thanks/?next=https://evil.example",
    "/fr/merci/",
    "/en/Thanks/",
    "/en/thanks",
    "",
    " /en/thanks/",
  ])("falls back to the default for %j", (value) => {
    expect(safeRedirect(value)).toBe("/en/thanks/");
  });

  it("falls back for anything that is not a string", () => {
    for (const value of [undefined, null, 1, {}, ["/en/thanks/"]]) {
      expect(safeRedirect(value)).toBe("/en/thanks/");
    }
  });
});
