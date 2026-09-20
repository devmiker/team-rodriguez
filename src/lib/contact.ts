/**
 * The contact form's shape and rules — the single source, used by both sides.
 *
 * The browser island imports this to validate before sending, and the Azure Function
 * imports this same file to validate again on arrival. That is deliberate: client-side
 * validation is a courtesy to the visitor and is trivially bypassed, so the server
 * repeats every check rather than trusting anything that arrives. Sharing the module
 * means the two can never disagree about what a valid message is.
 *
 * No dependencies, no Node built-ins, no DOM. It has to run in both places.
 *
 * ── Threat notes ─────────────────────────────────────────────────────────────
 *  - Length caps are enforced before anything else, so a 50 MB "message" is
 *    rejected without being processed.
 *  - Every field is stripped of control characters, CR and LF included. CR/LF in a
 *    value that reaches an email header is header injection: it lets a submitter
 *    append their own Bcc: and turn this form into an open relay. The API keeps
 *    submitted text out of headers entirely, and this strips it anyway — two
 *    independent barriers, because one of them will eventually be edited by
 *    someone who does not know why it is there.
 *  - Enumerated fields are checked against a fixed list rather than accepted as
 *    free text, so they cannot carry a payload at all.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Field length caps, in characters, applied on both sides. */
export const LIMITS = {
  name: 100,
  email: 254, // the maximum length of an addressable email address (RFC 5321)
  company: 120,
  message: 4000,
} as const;

/**
 * A field that is never shown to a human and must stay empty. Most form-filling bots
 * populate every input they find. Named plausibly rather than "honeypot" so a bot
 * cannot skip it by name, and hidden with CSS plus `aria-hidden` and `tabindex="-1"`
 * so no screen reader or keyboard user ever meets it.
 */
export const HONEYPOT_FIELD = "website_url";

/**
 * A form filled in faster than this was not filled in by a person reading it. Three
 * seconds is low on purpose: the cost of a false positive (a real enquiry silently
 * dropped) is far higher than letting a patient bot through to the other checks.
 */
export const MIN_FILL_MS = 3000;

/** Older than this and the page has been sitting open long enough to be suspect. */
export const MAX_FILL_MS = 1000 * 60 * 60 * 12;

export const PROJECT_TYPES = ["new", "redesign", "shop", "care", "audit", "other"] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const BUDGETS = ["unsure", "under2k", "2to5k", "5to10k", "over10k"] as const;
export type Budget = (typeof BUDGETS)[number];

export const TIMELINES = ["flexible", "month", "quarter", "later"] as const;
export type Timeline = (typeof TIMELINES)[number];

export interface ContactSubmission {
  name: string;
  email: string;
  company: string;
  projectType: ProjectType;
  budget: Budget;
  timeline: Timeline;
  message: string;
}

/** Field name → the `UiKey` of the message to show against it. */
export type FieldErrors = Partial<Record<keyof ContactSubmission, string>>;

export interface ValidationResult {
  ok: boolean;
  errors: FieldErrors;
  /** Present only when `ok` — cleaned values, safe to put in an email body. */
  value?: ContactSubmission;
}

/**
 * Strip characters that have no business in a form field.
 *
 * Removes C0 and C1 control characters (CR and LF among them), zero-width characters
 * used to disguise text, and the Unicode bidirectional overrides — those last can make
 * a displayed string read differently from the string that was actually submitted,
 * which is how a "harmless" value gets past a human reviewer.
 *
 * Whitespace is collapsed except in `message`, which keeps its paragraph breaks via
 * `cleanMultiline` below.
 */
export function clean(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
    .replace(/[\u200B-\u200F\u2028-\u202E\u2060-\u2064\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** As `clean`, but keeps newlines so a message keeps its paragraphs. */
export function cleanMultiline(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/\r\n?/g, "\n")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F-\u009F]/g, " ")
    .replace(/[\u200B-\u200F\u2029-\u202E\u2060-\u2064\uFEFF]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Is this plausibly a deliverable address?
 *
 * Deliberately not RFC 5322 — that grammar accepts things no mail server will take,
 * and a regex implementing it is a well-known way to write a catastrophically
 * backtracking pattern. This asks for one @, something either side, a dot in the
 * domain, and no whitespace. The real test of an address is whether a reply to it
 * arrives, and nothing here can determine that.
 */
export function isPlausibleEmail(value: string): boolean {
  if (value.length > LIMITS.email) return false;
  return /^[^\s@,;:<>"'\\]+@[^\s@,;:<>"'\\]+\.[A-Za-z]{2,}$/.test(value);
}

const oneOf = <T extends readonly string[]>(list: T, value: unknown): value is T[number] =>
  typeof value === "string" && (list as readonly string[]).includes(value);

/**
 * Validate a raw submission from anywhere — a fetch body, a form POST, a bot.
 *
 * Every field is treated as hostile. `raw` is typed `unknown` rather than
 * `ContactSubmission` precisely so that nothing here can accidentally trust its shape.
 */
export function validate(raw: unknown): ValidationResult {
  const errors: FieldErrors = {};
  const input = (raw ?? {}) as Record<string, unknown>;

  const name = clean(input.name).slice(0, LIMITS.name);
  const email = clean(input.email).slice(0, LIMITS.email).toLowerCase();
  const company = clean(input.company).slice(0, LIMITS.company);
  const message = cleanMultiline(input.message);

  if (name.length < 2) errors.name = "form.name.error";
  if (!isPlausibleEmail(email)) errors.email = "form.email.error";
  if (message.length < 10) errors.message = "form.message.error";
  else if (message.length > LIMITS.message) errors.message = "form.message.tooLong";

  if (!oneOf(PROJECT_TYPES, input.projectType)) errors.projectType = "form.projectType.error";
  // Budget and timeline both have a safe default, so an unrecognised value falls back
  // rather than blocking a genuine enquiry over a dropdown.
  const budget: Budget = oneOf(BUDGETS, input.budget) ? input.budget : "unsure";
  const timeline: Timeline = oneOf(TIMELINES, input.timeline) ? input.timeline : "flexible";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    errors: {},
    value: {
      name,
      email,
      company,
      projectType: input.projectType as ProjectType,
      budget,
      timeline,
      message,
    },
  };
}

export type SpamVerdict = "ok" | "honeypot" | "too-fast" | "stale";

/**
 * The cheap bot checks, run before anything expensive and before any mail is sent.
 *
 * All three are silent in effect: the API answers a caught submission with the same
 * success response a real one gets. Telling a bot which check it failed is telling it
 * how to pass next time, and a human who somehow trips one is better served by a
 * message that appears to have sent than by an accusation.
 */
export function spamCheck(input: {
  honeypot?: unknown;
  startedAt?: unknown;
  now?: number;
}): SpamVerdict {
  if (typeof input.honeypot === "string" && input.honeypot.trim() !== "") return "honeypot";

  const started = Number(input.startedAt);
  if (!Number.isFinite(started) || started <= 0) return "ok"; // missing timestamp is not evidence
  const elapsed = (input.now ?? Date.now()) - started;
  if (elapsed < MIN_FILL_MS) return "too-fast";
  if (elapsed > MAX_FILL_MS) return "stale";
  return "ok";
}
