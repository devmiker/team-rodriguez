/**
 * POST /api/contact — the contact form's only endpoint.
 *
 * Runs as an Azure Static Web Apps managed function, which means it sits on the same
 * origin as the site. That is worth stating plainly, because it is what lets the
 * Content-Security-Policy stay at `connect-src 'self'` and `form-action 'self'`: there
 * is no third-party form collector, no cross-origin request, and no CORS to open up.
 *
 * ── What this endpoint will and will not do ──────────────────────────────────
 *  - It accepts POST and nothing else.
 *  - It re-runs every validation the browser ran. Client-side validation is a
 *    courtesy to the visitor; it is not a control.
 *  - It never puts submitted text into an email header. The subject is built from
 *    a fixed template plus a length-capped, CR/LF-stripped name; Reply-To is the
 *    submitted address only after it has passed a pattern that cannot contain a
 *    newline, a comma, a semicolon or an angle bracket. Header injection through a
 *    contact form is how a form becomes an open relay, and it is worth two
 *    independent barriers.
 *  - It HTML-escapes everything that goes into the email body. The recipient's mail
 *    client renders that body; unescaped input there is a stored XSS in your inbox.
 *  - It answers a submission caught by a spam check with the same success response a
 *    real one gets. Telling a bot which check it failed tells it how to pass.
 *  - It never returns an internal error message to the caller. Failures are logged
 *    server-side and answered with a generic 500.
 *
 * ── Configuration (Static Web App → Configuration → Application settings) ─────
 *    CONTACT_TO       where enquiries are delivered
 *    CONTACT_FROM     the From address, on a domain verified with the mail provider
 *    RESEND_API_KEY   the mail provider's key
 *  None of these are in the repository, and the destination address can be changed
 *  without a deploy.
 */

import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from "@azure/functions";

/*
 * The one module shared with the site. It is imported rather than duplicated so the
 * browser and the server can never disagree about what a valid message is — and it is
 * the ONLY shared module on purpose: it has no imports of its own, so it compiles
 * cleanly both through Vite (extensionless) and through Node16 ESM (explicit .js).
 */
import {
  HONEYPOT_FIELD,
  spamCheck,
  validate,
  type ContactSubmission,
} from "../../../src/lib/contact.js";

/* -------------------------------------------------------------------------- */
/* Rate limiting                                                              */
/* -------------------------------------------------------------------------- */

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 3;

/**
 * Per-instance, in-memory rate limiting.
 *
 * Be clear-eyed about what this is: a serverless host may run several instances and
 * may recycle them at any time, so this bounds one instance's traffic and nothing
 * more. It stops the obvious case — someone holding down the submit button, a naive
 * script hammering one connection — and it does not stop a distributed flood.
 *
 * The real defences against that are the host's own platform limits and the cheap
 * checks in `spamCheck`. A shared store (Redis, Table Storage) would make this a
 * genuine limit; it is deliberately not here, because it would add a stateful
 * dependency to an endpoint whose entire appeal is that it has none. Revisit that
 * trade-off if the mailbox ever actually gets flooded.
 */
const hits = new Map<string, number[]>();

function rateLimited(key: string, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);

  // Keep the map from growing without bound across a long-lived instance.
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(k);
    }
  }

  return recent.length > RATE_MAX;
}

/**
 * The client address, as the platform reports it.
 *
 * `x-forwarded-for` is client-controllable in general, so the *first* entry is taken
 * only as a bucketing key and is never trusted as an identity or written anywhere. On
 * Static Web Apps the platform rewrites this header, so the leftmost value is the real
 * caller; on any other host, treat it as a hint.
 */
function clientKey(request: HttpRequest): string {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const first = forwarded.split(",")[0]?.trim();
  return (first || "unknown").slice(0, 64);
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The shape of a path this site builds: `/<locale>/<slug>/`, lower-case ASCII only.
 *
 * An allowlist pattern rather than an exact list, because importing the route table
 * would drag the whole i18n module graph across the Vite/Node boundary for one string
 * check. The pattern is strict enough to be equivalent for this purpose: it demands a
 * single leading slash (so `//evil.example`, which a browser reads as a
 * protocol-relative URL to another host, cannot match), forbids `.` entirely (so no
 * `../` traversal), forbids `:` (so no `https:` or `javascript:`), and forbids the
 * backslash some browsers normalise to a slash.
 */
const SITE_PATH = /^\/(?:en|de|es)\/(?:[a-z0-9-]+\/)?$/;

const DEFAULT_REDIRECT = "/en/thanks/";

/**
 * Where a no-JavaScript submit is sent afterwards.
 *
 * The value arrives in the request body, so it is attacker-controlled. Anything that
 * is not plainly one of this site's own paths falls back to the default. A redirect
 * endpoint that sends the visitor wherever it is told is a phishing primitive, and a
 * contact form is a classic place to find one.
 */
export function safeRedirect(value: unknown): string {
  return typeof value === "string" && SITE_PATH.test(value) ? value : DEFAULT_REDIRECT;
}

/** Anything at all could be in a header value; this makes sure a newline is not. */
const headerSafe = (value: string, max = 120): string =>
  value.replace(/[\r\n]+/g, " ").slice(0, max).trim();

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** Parse a body as JSON or as a form post, without throwing on malformed input. */
async function readBody(request: HttpRequest): Promise<{ data: Record<string, unknown>; isForm: boolean }> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = await request.formData();
    const data: Record<string, unknown> = {};
    for (const [key, value] of form.entries()) data[key] = typeof value === "string" ? value : "";
    return { data, isForm: true };
  }

  try {
    const parsed = (await request.json()) as unknown;
    return {
      data: parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {},
      isForm: false,
    };
  } catch {
    return { data: {}, isForm: false };
  }
}

/* -------------------------------------------------------------------------- */
/* Email                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Hand the message to the mail provider.
 *
 * Sent with `fetch` against the provider's HTTP API rather than through an SDK. That
 * is one fewer dependency to audit, to keep patched, and to trust with the contents of
 * every enquiry the business receives — for what amounts to twenty lines of code.
 */
async function sendEmail(
  submission: ContactSubmission,
  context: InvocationContext,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  const from = process.env.CONTACT_FROM;

  if (!apiKey || !to || !from) {
    context.error(
      "Mail is not configured: set RESEND_API_KEY, CONTACT_TO and CONTACT_FROM in the " +
        "Static Web App's application settings. The submission was NOT delivered.",
    );
    return false;
  }

  const subject = headerSafe(`Website enquiry — ${submission.name}`);

  const rows: [string, string][] = [
    ["Name", submission.name],
    ["Email", submission.email],
    ["Business", submission.company || "—"],
    ["Needs", submission.projectType],
    ["Budget", submission.budget],
    ["Timeline", submission.timeline],
  ];

  const html = [
    "<h2>New enquiry from the website</h2>",
    "<table>",
    ...rows.map(
      ([label, value]) =>
        `<tr><td><strong>${escapeHtml(label)}</strong></td><td>${escapeHtml(value)}</td></tr>`,
    ),
    "</table>",
    "<h3>Message</h3>",
    `<p>${escapeHtml(submission.message).replace(/\n/g, "<br>")}</p>`,
  ].join("");

  const text = [
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Message:",
    submission.message,
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        text,
        /*
         * So "reply" in the mailbox goes to the person who wrote in. The address has
         * already passed `isPlausibleEmail`, which rejects whitespace, commas,
         * semicolons and angle brackets — none of the characters that would let this
         * value break out of the field it is placed in.
         */
        reply_to: submission.email,
      }),
    });

    if (!response.ok) {
      // The provider's message goes to the log, never to the caller.
      context.error(`Mail provider returned ${response.status}: ${await response.text()}`);
      return false;
    }
    return true;
  } catch (error) {
    context.error("Mail provider request failed", error);
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/* Handler                                                                     */
/* -------------------------------------------------------------------------- */

export async function contact(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  /** Sent on every response: a JSON error must not be sniffed as anything else. */
  const baseHeaders = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  };

  const { data, isForm } = await readBody(request);
  const redirectTo = safeRedirect(data.redirectTo);

  /** A form post cannot render JSON, so it always ends on a page. */
  const done = (ok: boolean, status: number): HttpResponseInit => {
    if (isForm) {
      // 303 rather than 302: it makes the follow-up a GET, which is what stops a
      // browser reload from re-submitting the form.
      return { status: 303, headers: { location: redirectTo, "cache-control": "no-store" } };
    }
    return { status, headers: baseHeaders, jsonBody: { ok } };
  };

  if (rateLimited(clientKey(request))) {
    context.warn("Rate limit hit.");
    return isForm
      ? done(false, 429)
      : { status: 429, headers: baseHeaders, jsonBody: { ok: false, reason: "rate-limited" } };
  }

  /*
   * The quiet checks. A caught submission gets the ordinary success response — it is
   * simply not sent anywhere. Note what is NOT logged: none of the submitted content,
   * only the verdict.
   */
  const verdict = spamCheck({ honeypot: data[HONEYPOT_FIELD], startedAt: data.startedAt });
  if (verdict !== "ok") {
    context.info(`Discarded a submission (${verdict}).`);
    return done(true, 200);
  }

  const result = validate(data);
  if (!result.ok || !result.value) {
    // A real visitor never reaches this, because the browser validated first. Anything
    // that does is either a bot or a crafted request, so the response stays terse.
    return isForm
      ? done(false, 400)
      : { status: 400, headers: baseHeaders, jsonBody: { ok: false, errors: result.errors } };
  }

  const sent = await sendEmail(result.value, context);
  if (!sent) {
    return isForm
      ? done(false, 500)
      : { status: 500, headers: baseHeaders, jsonBody: { ok: false } };
  }

  return done(true, 200);
}

app.http("contact", {
  // POST only. A GET that reached this handler would be a routing mistake, and the
  // host config answers every other method on /api/* with 405 before it gets here.
  methods: ["POST"],
  authLevel: "anonymous",
  route: "contact",
  handler: contact,
});
