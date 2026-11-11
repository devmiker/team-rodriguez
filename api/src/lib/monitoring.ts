/**
 * Error reporting for the contact function: sends server-side failures to Sentry
 * (org devmiker, project team-rodriguez-api).
 *
 * A tiny direct client for Sentry's envelope endpoint rather than the Node SDK, for the
 * same reason the mail and store code have no SDK: one fewer dependency to audit and
 * patch, for what is thirty lines of `fetch`. It follows the client already running
 * on Pro Lift's site.
 *
 * ── What a report contains, and what it never does ───────────────────────────
 *  The error's type, message and stack, plus the enquiry id when there is one. Never
 *  anything the visitor typed, never their address, never a request header. Callers
 *  pass errors whose messages are written here (status codes, "not configured"), not
 *  provider responses, which can echo submitted values back.
 *
 *  This is server-to-server. The browser never talks to Sentry, so rule 6 in
 *  AGENTS.md (no third-party requests from the page) and `default-src 'self'` still
 *  hold. The privacy page says a report can be sent, and what is in it.
 *
 * Reports are queued while the request runs; the handler awaits `flushErrors()`
 * before it answers, because Azure may freeze the function as soon as it responds.
 */

import { randomUUID } from "node:crypto";

// Public by design: a DSN can only send events to this one project.
const DSN = "https://415d0aa3e7886701eff202a77187ed3d@o4512339434864640.ingest.us.sentry.io/4512415476809728";

const dsn = new URL(DSN);
const projectId = dsn.pathname.replace(/\//g, "");
export const ENVELOPE_URL = `${dsn.protocol}//${dsn.host}/api/${projectId}/envelope/`;
const AUTH = `Sentry sentry_version=7, sentry_client=team-rodriguez-api/1.0, sentry_key=${dsn.username}`;

const pending = new Set<Promise<void>>();

/** Off in tests and under a local `func start`; on in Azure. */
export function reportingEnabled(env: Record<string, string | undefined> = process.env): boolean {
  if (env.VITEST) return false;
  return env.AZURE_FUNCTIONS_ENVIRONMENT !== "Development";
}

type Frame = { function?: string; filename: string; lineno: number; colno: number; in_app: boolean };

function frames(stack: string | undefined): { frames: Frame[] } | undefined {
  if (!stack) return undefined;
  const out: Frame[] = [];
  for (const line of stack.split("\n").slice(1)) {
    const m = /^\s*at (?:(.+?) \()?(.+?):(\d+):(\d+)\)?$/.exec(line);
    if (!m) continue;
    const filename = m[2] ?? "";
    out.push({
      function: m[1],
      filename,
      lineno: Number(m[3]),
      colno: Number(m[4]),
      in_app: !filename.startsWith("node:") && !filename.includes("node_modules"),
    });
  }
  return out.length ? { frames: out.reverse() } : undefined; // Sentry wants the oldest frame first
}

/** Build the envelope body. Exported for the test. */
export function envelope(err: unknown, tags: Record<string, string> = {}, now = new Date()): string {
  const e = err instanceof Error ? err : new Error(String(err));
  const eventId = randomUUID().replace(/-/g, "");
  const timestamp = now.toISOString();
  const event = {
    event_id: eventId,
    timestamp,
    platform: "node",
    level: "error",
    environment: "production",
    server_name: "azure-functions",
    tags,
    exception: {
      values: [{ type: e.name, value: e.message.slice(0, 2000), stacktrace: frames(e.stack) }],
    },
  };
  return [
    JSON.stringify({ event_id: eventId, sent_at: timestamp }),
    JSON.stringify({ type: "event" }),
    JSON.stringify(event),
    "",
  ].join("\n");
}

/** Queue an error for Sentry. Never throws, never blocks. */
export function reportError(
  err: unknown,
  tags: Record<string, string> = {},
  fetchImpl: typeof fetch = fetch,
): void {
  if (!reportingEnabled()) return;
  try {
    const p: Promise<void> = fetchImpl(ENVELOPE_URL, {
      method: "POST",
      headers: { "content-type": "application/x-sentry-envelope", "x-sentry-auth": AUTH },
      body: envelope(err, tags),
      signal: AbortSignal.timeout(3_000),
    })
      .then(() => undefined)
      .catch(() => undefined)
      .finally(() => pending.delete(p));
    pending.add(p);
  } catch {
    // Reporting must never break the request.
  }
}

/** Wait, briefly, for queued reports to go out. */
export async function flushErrors(): Promise<void> {
  if (pending.size) await Promise.allSettled([...pending]);
}
