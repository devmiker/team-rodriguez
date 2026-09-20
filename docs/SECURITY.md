# Security

What this site does to reduce its attack surface, and — just as usefully — what it
deliberately does not do.

The short version: the site is static HTML with one small POST endpoint. Almost every
class of web vulnerability needs something this site does not have — a database, a
session, a login, a template rendered from user input, a third-party script. The
remaining surface is the contact endpoint, and most of this document is about that.

---

## The shape of the thing

```
Browser ──GET──> Azure Static Web Apps ──> static files, nothing else runs
Browser ──POST─> /api/contact (one Azure Function) ──HTTPS──> mail provider ──> inbox
```

No database. No sessions, cookies or authentication. No user accounts. No admin panel.
No content management system. Nothing is stored anywhere as a result of a visit.

That is the single largest security decision in the project, and it was made by
choosing the architecture rather than by adding controls.

---

## No third parties

The site loads no script, font, stylesheet, image or iframe from any other origin.
Fonts are self-hosted from npm packages and served from our own domain.

This is not only a privacy position. Every third-party script is code you do not
control, executing with full access to your pages, updated without your review. The
supply-chain compromises of the last several years have overwhelmingly been exactly
this. Declining the whole category is cheaper than auditing it.

It is also what lets `default-src 'self'` be honest, and what makes the cookie banner
unnecessary rather than merely absent.

**If you add a third party, four things break at once:** the CSP needs an exception,
the privacy page in `src/data/legal.ts` becomes false, the "no cookie banner" claim may
become false, and the `buildCspValue` test asserting no external origin fails. That
last one is on purpose — it makes the decision visible in review.

---

## Headers

Set in `public/staticwebapp.config.json`, applied to every response.

| Header | Why |
|---|---|
| `Strict-Transport-Security` | One year, subdomains included. Stops downgrade to HTTP. |
| `X-Content-Type-Options: nosniff` | Stops a browser guessing a type and executing something it should not. |
| `X-Frame-Options: DENY` | Clickjacking, for older browsers. `frame-ancestors` handles modern ones. |
| `Referrer-Policy: strict-origin-when-cross-origin` | Outbound links see the origin, never the full path. |
| `Permissions-Policy` | Camera, microphone, geolocation, payment and the rest, all off. Nothing here needs them. |
| `Cross-Origin-Opener-Policy: same-origin` | Isolates the browsing context. |
| `Cross-Origin-Resource-Policy: same-origin` | Stops other origins embedding our resources. |
| `X-Robots-Tag` | Added pre-launch, removed by the build once `LAUNCHED` is true. |

`Cross-Origin-Embedder-Policy` is deliberately **not** set. It would gain nothing here —
nothing needs cross-origin isolation — and it breaks quietly when a future resource
lacks a CORP header.

---

## Content-Security-Policy

Generated at build time from the pages the build actually produced. Every inline script
and style is hashed and listed; see `src/lib/csp.ts` and the integration in
`astro.config.mjs`.

```
default-src 'self'; script-src 'self' <hashes>; style-src 'self' <hashes>;
img-src 'self' data:; font-src 'self'; connect-src 'self'; manifest-src 'self';
frame-src 'none'; frame-ancestors 'none'; form-action 'self';
object-src 'none'; base-uri 'none'; upgrade-insecure-requests
```

Worth knowing:

- **It is derived, never hand-written.** A hand-maintained policy drifts the first time
  someone edits an inline script, and the usual fix is `'unsafe-inline'`, which throws
  away most of what CSP is for. A test asserts the policy never contains it.
- **`form-action 'self'`** rather than `'none'`, because the no-JavaScript form
  fallback posts to our own endpoint. `'self'` still means an injected form cannot
  point at an attacker's collector.
- **`base-uri 'none'`** is not decorative. A single injected `<base>` silently
  re-points every relative URL on the page.
- **JSON-LD is not hashed.** It is a data block, never executed, so `script-src` does
  not govern it.
- **Report-only by default.** Set the `CSP_MODE` repository variable to `enforce` once
  it has been watched in a real browser. Until then violations appear in the console
  and break nothing.

---

## The contact endpoint

`api/src/functions/contact.ts`. The only code on the site that accepts input.

### Input handling

Every field is treated as hostile.

- **Length caps first**, so a 50 MB "message" is rejected without being processed.
- **Control characters stripped** — C0/C1 including CR and LF, zero-width characters,
  and the Unicode bidirectional overrides. That last group can make a displayed string
  read differently from the string actually submitted, which is how something gets past
  a human reviewer.
- **Enumerated fields checked against a fixed list**, never accepted as free text, so
  they cannot carry a payload at all.
- **Validated by the same module the browser ran** (`src/lib/contact.ts`), imported
  rather than duplicated so the two cannot disagree. Client-side validation is a
  courtesy to the visitor; it is not a control.

### Email header injection

The attack: CR/LF inside a value that reaches a mail header lets a submitter append
their own `Bcc:` and turn the form into a way of mailing strangers from your domain.

Two independent barriers, because one of them will eventually be edited by someone who
does not know why it is there:

1. Validation strips CR and LF from every field before anything else sees them.
2. The endpoint puts no submitted text into a header. The subject is a fixed template
   plus a length-capped, newline-stripped name. `Reply-To` is the submitted address
   only after it has passed a pattern that cannot contain whitespace, a comma, a
   semicolon or an angle bracket.

There is a test file full of these payloads. Do not delete it.

### The email body

HTML-escaped. The recipient's mail client renders that body, so unescaped input there
is a stored XSS in your own inbox.

### Open redirect

The no-JavaScript path needs somewhere to send the visitor afterwards, and that target
arrives in the request body. It is accepted only if it matches the shape of this site's
own paths — a single leading slash (so `//evil.example` cannot match), no dot (so no
traversal), no colon (so no `javascript:`), no backslash. Anything else falls back to
the default thank-you page.

A redirect endpoint that sends the visitor wherever it is told is a phishing primitive,
and contact forms are a classic place to find one.

### Spam and abuse

Layered, cheap, and quiet:

- **Honeypot** — a field hidden from sight, from the accessibility tree and from the
  tab order. Most form-filling bots fill it.
- **Minimum fill time** — three seconds. Low on purpose: a dropped genuine enquiry
  costs far more than a patient bot getting through to the other checks.
- **Staleness** — a page open more than twelve hours is suspect.
- **Rate limiting** — three per minute per client, in memory.

A caught submission gets the same success response a real one does. Telling a bot which
check it failed tells it how to pass next time; and a human who somehow trips one is
better served by a message that appears to have sent than by an accusation.

**Be clear-eyed about the rate limiting.** It is per-instance and in-memory. A
serverless host may run several instances and recycle them at any time, so it bounds
one instance's traffic and nothing more. It stops a held-down submit button and a naive
script; it does not stop a distributed flood. A shared store (Redis, Table Storage)
would make it a real limit, at the cost of giving a stateless endpoint a stateful
dependency. That trade-off is worth revisiting **only if the mailbox actually gets
flooded** — not before.

### No CAPTCHA

Deliberate, for three reasons: it is a third-party script (which breaks the whole "no
third parties" property above), it is a genuine accessibility barrier for the people
least able to work around it, and at this volume the cheap checks are enough.

If it ever becomes necessary, Cloudflare Turnstile is the least bad option — no
cookies, usually no interaction. Adding it means `script-src` and `frame-src` entries
for `challenges.cloudflare.com`, and a line in the privacy page. Do both in the same
commit.

### Secrets

`CONTACT_TO`, `CONTACT_FROM` and `RESEND_API_KEY` live in the Static Web App's
application settings. None are in the repository; `api/local.settings.json` is
gitignored and `api/local.settings.json.example` shows the shape. The destination
address can be changed without a deploy.

### Errors

Failures are logged server-side and answered with a generic response. The mail
provider's error text never reaches the caller. Submission *content* is never logged —
only verdicts.

---

## Dependencies

Seven runtime dependencies on the site, one on the API. Every one is either Astro,
React, or a font package.

- `npm audit --audit-level=moderate` runs in CI for both trees and fails the build.
- Dependabot watches both, weekly, plus GitHub Actions.
- Workflow actions are pinned to commit SHAs, not tags. A tag can be moved to point at
  different code; a SHA cannot. This is the highest-value supply-chain control available
  in a workflow file, and Dependabot keeps the pins current.
- The mail provider is called over its HTTP API with `fetch` rather than through an
  SDK: one fewer dependency to audit, patch, and trust with the contents of every
  enquiry the business receives.

---

## What this does not protect against

Stated plainly, because a security document that only lists wins is not useful.

- **A compromised hosting account or GitHub account.** Turn on two-factor
  authentication for both. This is the most likely way this site gets defaced, by a
  wide margin, and nothing in the code can help.
- **A distributed flood of the contact endpoint.** See the rate-limiting note above.
- **A compromised npm package.** Audit and Dependabot reduce the window; they do not
  close it. The very small dependency count is the real mitigation.
- **Whatever the mail provider does with the messages.** They are a processor in the
  path. Name them on the privacy page.
- **The email inbox itself.** Enquiries arrive as ordinary email and live wherever that
  mailbox lives, under whatever protection it has.

---

## Reporting

There is no `security.txt` yet because there is no domain yet. Add one at
`public/.well-known/security.txt` when there is.
