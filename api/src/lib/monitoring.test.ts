import { afterEach, describe, expect, it, vi } from "vitest";
import { ENVELOPE_URL, envelope, flushErrors, reportError, reportingEnabled } from "./monitoring.js";

describe("reportingEnabled", () => {
  it("is off in tests and under a local func start, on in Azure", () => {
    expect(reportingEnabled({ VITEST: "true" })).toBe(false);
    expect(reportingEnabled({ AZURE_FUNCTIONS_ENVIRONMENT: "Development" })).toBe(false);
    expect(reportingEnabled({ AZURE_FUNCTIONS_ENVIRONMENT: "Production" })).toBe(true);
    expect(reportingEnabled({})).toBe(true);
  });
});

describe("envelope", () => {
  it("is three newline-separated JSON lines in Sentry's envelope format", () => {
    const lines = envelope(new TypeError("boom"), { stage: "email" }).trim().split("\n");
    expect(lines).toHaveLength(3);
    const [header, item, event] = lines.map((l) => JSON.parse(l));
    expect(header.event_id).toBe(event.event_id);
    expect(item).toEqual({ type: "event" });
    expect(event.exception.values[0]).toMatchObject({ type: "TypeError", value: "boom" });
    expect(event.tags).toEqual({ stage: "email" });
  });

  it("orders frames oldest first and marks Node internals as not ours", () => {
    const err = new Error("x");
    err.stack = [
      "Error: x",
      "    at sendEmail (/home/site/wwwroot/dist/api/src/functions/contact.js:10:5)",
      "    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)",
    ].join("\n");
    const event = JSON.parse(envelope(err).trim().split("\n")[2]!);
    const frames = event.exception.values[0].stacktrace.frames;
    expect(frames[0].filename).toBe("node:internal/process/task_queues");
    expect(frames[0].in_app).toBe(false);
    expect(frames[1]).toMatchObject({ function: "sendEmail", lineno: 10, in_app: true });
  });

  it("accepts something that is not an Error", () => {
    const event = JSON.parse(envelope("plain string").trim().split("\n")[2]!);
    expect(event.exception.values[0].value).toBe("plain string");
  });
});

describe("reportError", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("sends nothing while tests run", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    reportError(new Error("x"), {}, fetchMock);
    await flushErrors();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts the envelope to the project's ingest URL when enabled, and never throws", async () => {
    vi.stubEnv("VITEST", "");
    const fetchMock = vi.fn<typeof fetch>(async () => {
      throw new Error("network down");
    });
    expect(() => reportError(new Error("x"), { stage: "store" }, fetchMock)).not.toThrow();
    await flushErrors();
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(ENVELOPE_URL);
    expect(ENVELOPE_URL).toMatch(/^https:\/\/[^/]+\.ingest\.us\.sentry\.io\/api\/\d+\/envelope\/$/);
    expect((init?.headers as Record<string, string>)["x-sentry-auth"]).toContain("sentry_key=");
  });
});
