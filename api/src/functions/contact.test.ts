/**
 * The endpoint's own logic: the open-redirect guard, and the store-then-email
 * decision — which outcome the visitor sees when the database or the mail provider
 * is down. The validator itself is tested in src/lib/contact.test.ts, and the store's
 * request format in ../lib/enquiries.test.ts.
 */

import { HttpRequest, InvocationContext } from "@azure/functions";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { contact, safeRedirect } from "./contact.js";

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

/* -------------------------------------------------------------------------- */
/* Store first, then email                                                    */
/* -------------------------------------------------------------------------- */

describe("contact handler: store and email", () => {
  const body = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    company: "Analytical Engines",
    projectType: "new",
    budget: "1kto2k5",
    timeline: "month",
    message: "We need a site for a small engineering firm. Five pages, nothing fancy.",
  };

  const env = {
    RESEND_API_KEY: "re_test",
    CONTACT_TO: "us@example.com",
    CONTACT_FROM: "Site <site@example.com>",
    TURSO_DATABASE_URL: "libsql://db-org.turso.io",
    TURSO_AUTH_TOKEN: "t",
  };

  /** Route fetch by host: the database and the mail provider each succeed or fail. */
  function stubNetwork({ db, mail }: { db: boolean; mail: boolean }) {
    const calls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        const url = String(input);
        calls.push(url);
        const ok = url.includes("turso.io") ? db : mail;
        return ok
          ? new Response(JSON.stringify({ results: [{ type: "ok" }], id: "m1" }), { status: 200 })
          : new Response("down", { status: 503 });
      }),
    );
    return calls;
  }

  async function submit() {
    const request = new HttpRequest({
      method: "POST",
      url: "http://localhost/api/contact",
      headers: { "content-type": "application/json", "x-forwarded-for": `203.0.113.${Math.floor(Math.random() * 250)}` },
      body: { string: JSON.stringify(body) },
    });
    const context = new InvocationContext();
    vi.spyOn(context, "error").mockImplementation(() => {});
    vi.spyOn(context, "warn").mockImplementation(() => {});
    vi.spyOn(context, "info").mockImplementation(() => {});
    return { response: await contact(request, context), context };
  }

  beforeEach(() => {
    for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("stores, emails, then marks the enquiry as emailed", async () => {
    const calls = stubNetwork({ db: true, mail: true });
    const { response } = await submit();
    expect(response.status).toBe(200);
    expect(calls.map((u) => new URL(u).host)).toEqual(["db-org.turso.io", "api.resend.com", "db-org.turso.io"]);
  });

  it("still succeeds when the email fails but the enquiry was stored — the lead is not lost", async () => {
    stubNetwork({ db: true, mail: false });
    const { response, context } = await submit();
    expect(response.status).toBe(200);
    expect(vi.mocked(context.error).mock.calls.some(([m]) => String(m).includes("NOT emailed"))).toBe(true);
  });

  it("still succeeds when the store fails but the email went out", async () => {
    stubNetwork({ db: false, mail: true });
    const { response } = await submit();
    expect(response.status).toBe(200);
  });

  it("reports an error only when both the store and the email fail", async () => {
    stubNetwork({ db: false, mail: false });
    const { response } = await submit();
    expect(response.status).toBe(500);
  });

  it("works exactly as before when the store is not configured", async () => {
    vi.stubEnv("TURSO_DATABASE_URL", "");
    const calls = stubNetwork({ db: true, mail: true });
    const { response } = await submit();
    expect(response.status).toBe(200);
    expect(calls.map((u) => new URL(u).host)).toEqual(["api.resend.com"]);
  });

  it("sends Sentry an error report with no submitted content, even when the mail provider echoes it", async () => {
    vi.stubEnv("VITEST", "");
    const sentry: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
        const url = String(input);
        if (url.includes("sentry.io")) {
          sentry.push(String(init?.body));
          return new Response("{}", { status: 200 });
        }
        if (url.includes("turso.io")) return new Response("down", { status: 503 });
        // Resend rejecting the message and quoting the address back in its error.
        return new Response(`{"message":"Invalid reply_to: ${body.email}"}`, { status: 422 });
      }),
    );
    const { response } = await submit();
    expect(response.status).toBe(500);
    // The handler's own wrapper is not used by `contact`, so flush here as it would.
    const { flushErrors } = await import("../lib/monitoring.js");
    await flushErrors();
    expect(sentry.length).toBeGreaterThanOrEqual(2);
    const all = sentry.join("\n");
    expect(all).toContain("Enquiry lost");
    expect(all).not.toContain(body.email);
    expect(all).not.toContain(body.message);
    expect(all).not.toContain(body.name);
  });

  it("never writes submitted content to the log", async () => {
    stubNetwork({ db: true, mail: false });
    const { context } = await submit();
    const logged = [context.error, context.warn, context.info]
      .flatMap((fn) => vi.mocked(fn).mock.calls.flat())
      .map(String)
      .join("\n");
    expect(logged).not.toContain(body.email);
    expect(logged).not.toContain(body.message);
  });
});
