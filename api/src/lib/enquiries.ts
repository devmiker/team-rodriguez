/**
 * The enquiry store: every valid contact-form submission is written here BEFORE it is
 * emailed, so a mail outage, an expired key or a typo in CONTACT_TO can no longer
 * lose a lead. The email is the notification; this table is the record.
 *
 * ── Why Turso, and why no SDK ─────────────────────────────────────────────────
 * Turso is SQLite over HTTPS. A serverless function that runs for a few hundred
 * milliseconds has no use for a connection pool, and HTTPS needs no native driver —
 * so this talks to Turso's documented SQL-over-HTTP endpoint (`POST /v2/pipeline`)
 * with `fetch`, exactly as the mail code talks to Resend. One fewer dependency to
 * audit, patch and trust with every enquiry the business receives.
 *
 * ── What it will and will not do ──────────────────────────────────────────────
 *  - Submitted text only ever travels as a bound parameter (`args`), never inside
 *    the SQL string. There is no string building of SQL anywhere in this file.
 *  - It creates its own table on first use (`IF NOT EXISTS`), so there is no
 *    migration step to forget when the database is first created.
 *  - It deletes anything older than RETENTION_DAYS on every write. The weekly
 *    `.github/workflows/retention.yml` run does the same, so the promise on the
 *    privacy page holds even in a month when nobody writes in.
 *  - It gives up after STORE_TIMEOUT_MS. A slow database must not hold a visitor's
 *    form submission hostage; the email path still runs.
 *
 * ── Configuration (Static Web App → Configuration → Application settings) ─────
 *    TURSO_DATABASE_URL   libsql://<db>-<org>.turso.io  (https:// also accepted)
 *    TURSO_AUTH_TOKEN     from `turso db tokens create <db>`
 *  Leave both unset and the store is skipped with a warning in the log — the site
 *  then behaves exactly as it did before the store existed.
 *
 * IMPORTANT: if RETENTION_DAYS changes, change the privacy text in src/data/legal.ts
 * and the `cutoff` in .github/workflows/retention.yml in the same commit.
 */

import type { ContactSubmission } from "../../../src/lib/contact.js";

/** Six months, rounded up. The privacy page promises "six months". */
export const RETENTION_DAYS = 183;

const STORE_TIMEOUT_MS = 5_000;

export interface StoreConfig {
  /** Base https URL of the database, without a trailing slash. */
  url: string;
  token: string;
}

/**
 * Read the store's settings, or return null when it is not configured.
 *
 * Turso hands out `libsql://` URLs; the HTTP endpoint is the same host over https.
 * Plain http is accepted only for a local `turso dev` server — anything else would
 * send the auth token and every enquiry across the network in clear text.
 */
export function storeConfig(env: Record<string, string | undefined> = process.env): StoreConfig | null {
  const raw = env.TURSO_DATABASE_URL?.trim();
  const token = env.TURSO_AUTH_TOKEN?.trim();
  if (!raw || !token) return null;

  let parsed: URL;
  try {
    parsed = new URL(raw.replace(/^libsql:\/\//i, "https://"));
  } catch {
    return null;
  }

  const local = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  if (parsed.protocol !== "https:" && !(local && parsed.protocol === "http:")) return null;

  return { url: `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, ""), token };
}

/* -------------------------------------------------------------------------- */
/* The SQL-over-HTTP call                                                     */
/* -------------------------------------------------------------------------- */

type Value = { type: "text"; value: string } | { type: "integer"; value: string } | { type: "null" };

export interface Statement {
  sql: string;
  args?: Value[];
}

const text = (value: string): Value => ({ type: "text", value });

interface PipelineResult {
  type: "ok" | "error";
  error?: { message?: string };
}

/**
 * Run statements in order on one stream. Throws if the request fails or if ANY
 * statement errors — a half-applied write is reported as a failed write.
 *
 * The thrown message is for the server log only; the handler never returns it.
 */
export async function pipeline(
  config: StoreConfig,
  statements: Statement[],
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  const response = await fetchImpl(`${config.url}/v2/pipeline`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      requests: [
        ...statements.map((stmt) => ({ type: "execute", stmt })),
        { type: "close" },
      ],
    }),
    signal: AbortSignal.timeout(STORE_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Enquiry store returned HTTP ${response.status}`);
  }

  const body = (await response.json()) as { results?: PipelineResult[] };
  const failed = (body.results ?? []).find((r) => r.type === "error");
  if (failed) {
    throw new Error(`Enquiry store rejected a statement: ${failed.error?.message ?? "unknown error"}`);
  }
}

/* -------------------------------------------------------------------------- */
/* Statements                                                                 */
/* -------------------------------------------------------------------------- */

const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS enquiries (
  id           TEXT PRIMARY KEY,
  created_at   TEXT NOT NULL,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  company      TEXT NOT NULL,
  project_type TEXT NOT NULL,
  budget       TEXT NOT NULL,
  timeline     TEXT NOT NULL,
  message      TEXT NOT NULL,
  emailed      INTEGER NOT NULL DEFAULT 0
)`;

const CREATE_INDEX = "CREATE INDEX IF NOT EXISTS enquiries_created_at ON enquiries (created_at)";

/** ISO-8601 UTC strings sort the same way the instants do, so `<` compares dates. */
export function retentionCutoff(now: Date): string {
  return new Date(now.getTime() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

export function saveStatements(id: string, submission: ContactSubmission, now: Date): Statement[] {
  return [
    { sql: CREATE_TABLE },
    { sql: CREATE_INDEX },
    { sql: "DELETE FROM enquiries WHERE created_at < ?", args: [text(retentionCutoff(now))] },
    {
      sql:
        "INSERT INTO enquiries (id, created_at, name, email, company, project_type, budget, timeline, message) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: [
        text(id),
        text(now.toISOString()),
        text(submission.name),
        text(submission.email),
        text(submission.company),
        text(submission.projectType),
        text(submission.budget),
        text(submission.timeline),
        text(submission.message),
      ],
    },
  ];
}

/** Record an enquiry. Throws on any failure; the caller decides what that means. */
export function saveEnquiry(
  config: StoreConfig,
  id: string,
  submission: ContactSubmission,
  now = new Date(),
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  return pipeline(config, saveStatements(id, submission, now), fetchImpl);
}

/**
 * Mark an enquiry as delivered by email. Anything left at `emailed = 0` was saved
 * but never reached the inbox — docs/DEPLOY.md has the one-line query to find them.
 */
export function markEmailed(config: StoreConfig, id: string, fetchImpl: typeof fetch = fetch): Promise<void> {
  return pipeline(
    config,
    [{ sql: "UPDATE enquiries SET emailed = 1 WHERE id = ?", args: [text(id)] }],
    fetchImpl,
  );
}
