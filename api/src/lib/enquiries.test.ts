/**
 * The enquiry store. Nothing here touches a real database: `fetch` is replaced with a
 * recorder, which is enough to pin down the three things that matter — the URL and
 * auth the request goes to, that submitted text travels only as bound parameters,
 * and that any failure is reported as a failure.
 */

import { describe, expect, it, vi } from "vitest";
import type { ContactSubmission } from "../../../src/lib/contact.js";
import {
  RETENTION_DAYS,
  markEmailed,
  pipeline,
  retentionCutoff,
  saveEnquiry,
  saveStatements,
  storeConfig,
} from "./enquiries.js";

const submission: ContactSubmission = {
  name: "Ada'); DROP TABLE enquiries;--",
  email: "ada@example.com",
  company: "Analytical Engines",
  projectType: "new",
  budget: "1kto2k5",
  timeline: "month",
  message: "Five pages, nothing fancy.",
};

const config = { url: "https://db-org.turso.io", token: "secret-token" };

function okFetch(results: unknown[] = [{ type: "ok" }]) {
  return vi.fn<typeof fetch>(async () => new Response(JSON.stringify({ results }), { status: 200 }));
}

function sentBody(fetchMock: ReturnType<typeof okFetch>) {
  const init = fetchMock.mock.calls[0]?.[1];
  return JSON.parse(String(init?.body)) as {
    requests: { type: string; stmt?: { sql: string; args?: { type: string; value: string }[] } }[];
  };
}

describe("storeConfig", () => {
  it("is null until both settings exist, so the site works before the database does", () => {
    expect(storeConfig({})).toBeNull();
    expect(storeConfig({ TURSO_DATABASE_URL: "libsql://db-org.turso.io" })).toBeNull();
    expect(storeConfig({ TURSO_AUTH_TOKEN: "t" })).toBeNull();
    expect(storeConfig({ TURSO_DATABASE_URL: "  ", TURSO_AUTH_TOKEN: "t" })).toBeNull();
  });

  it("turns Turso's libsql:// URL into its https endpoint", () => {
    expect(storeConfig({ TURSO_DATABASE_URL: "libsql://db-org.turso.io", TURSO_AUTH_TOKEN: "t" })).toEqual({
      url: "https://db-org.turso.io",
      token: "t",
    });
  });

  it("drops a trailing slash, so the endpoint path is never doubled", () => {
    expect(
      storeConfig({ TURSO_DATABASE_URL: "https://db-org.turso.io/", TURSO_AUTH_TOKEN: "t" })?.url,
    ).toBe("https://db-org.turso.io");
  });

  it("allows plain http only for a local dev server", () => {
    expect(storeConfig({ TURSO_DATABASE_URL: "http://127.0.0.1:8080", TURSO_AUTH_TOKEN: "t" })?.url).toBe(
      "http://127.0.0.1:8080",
    );
    expect(storeConfig({ TURSO_DATABASE_URL: "http://db-org.turso.io", TURSO_AUTH_TOKEN: "t" })).toBeNull();
    expect(storeConfig({ TURSO_DATABASE_URL: "ftp://db-org.turso.io", TURSO_AUTH_TOKEN: "t" })).toBeNull();
    expect(storeConfig({ TURSO_DATABASE_URL: "not a url", TURSO_AUTH_TOKEN: "t" })).toBeNull();
  });
});

describe("saveEnquiry", () => {
  it("posts to the pipeline endpoint with the token as a bearer credential", async () => {
    const fetchMock = okFetch();
    await saveEnquiry(config, "id-1", submission, new Date("2026-11-11T12:00:00Z"), fetchMock);

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://db-org.turso.io/v2/pipeline");
    expect(init?.method).toBe("POST");
    expect((init?.headers as Record<string, string>).authorization).toBe("Bearer secret-token");
  });

  it("never puts submitted text into SQL — only into bound parameters", async () => {
    const fetchMock = okFetch();
    await saveEnquiry(config, "id-1", submission, new Date("2026-11-11T12:00:00Z"), fetchMock);

    const { requests } = sentBody(fetchMock);
    for (const request of requests) {
      const sql = request.stmt?.sql ?? "";
      for (const value of Object.values(submission)) expect(sql).not.toContain(value);
    }
    const insert = requests.find((r) => r.stmt?.sql.startsWith("INSERT"));
    expect(insert?.stmt?.args?.map((a) => a.value)).toContain(submission.name);
    expect(insert?.stmt?.args?.every((a) => a.type === "text")).toBe(true);
  });

  it("prunes past the retention window before inserting, and closes the stream", async () => {
    const fetchMock = okFetch();
    const now = new Date("2026-11-11T12:00:00Z");
    await saveEnquiry(config, "id-1", submission, now, fetchMock);

    const { requests } = sentBody(fetchMock);
    const kinds = requests.map((r) => r.stmt?.sql.split(" ")[0] ?? r.type);
    expect(kinds).toEqual(["CREATE", "CREATE", "DELETE", "INSERT", "close"]);
    expect(requests[2]?.stmt?.args?.[0]?.value).toBe(retentionCutoff(now));
  });

  it("throws when the database answers with an HTTP error", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => new Response("nope", { status: 401 }));
    await expect(saveEnquiry(config, "id-1", submission, new Date(), fetchMock)).rejects.toThrow("401");
  });

  it("throws when any statement in the pipeline fails", async () => {
    const fetchMock = okFetch([{ type: "ok" }, { type: "error", error: { message: "disk full" } }]);
    await expect(saveEnquiry(config, "id-1", submission, new Date(), fetchMock)).rejects.toThrow("disk full");
  });

  it("throws when the request itself fails", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => {
      throw new TypeError("fetch failed");
    });
    await expect(saveEnquiry(config, "id-1", submission, new Date(), fetchMock)).rejects.toThrow("fetch failed");
  });
});

describe("retention", () => {
  it("is about six months, which is what the privacy page says", () => {
    expect(RETENTION_DAYS).toBeGreaterThanOrEqual(182);
    expect(RETENTION_DAYS).toBeLessThanOrEqual(184);
  });

  it("puts the cutoff RETENTION_DAYS before now, as a sortable ISO string", () => {
    expect(retentionCutoff(new Date("2026-11-11T00:00:00.000Z"))).toBe("2026-05-12T00:00:00.000Z");
  });

  it("stores the creation time in the same format the cutoff compares against", () => {
    const now = new Date("2026-11-11T12:00:00Z");
    const insert = saveStatements("id-1", submission, now)[3];
    expect(insert?.args?.[1]).toEqual({ type: "text", value: now.toISOString() });
  });
});

describe("markEmailed", () => {
  it("updates only the given id, passed as a parameter", async () => {
    const fetchMock = okFetch();
    await markEmailed(config, "id-9", fetchMock);
    const { requests } = sentBody(fetchMock);
    expect(requests[0]?.stmt).toEqual({
      sql: "UPDATE enquiries SET emailed = 1 WHERE id = ?",
      args: [{ type: "text", value: "id-9" }],
    });
  });
});

describe("pipeline", () => {
  it("treats a response with no results as success", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => new Response("{}", { status: 200 }));
    await expect(pipeline(config, [{ sql: "SELECT 1" }], fetchMock)).resolves.toBeUndefined();
  });
});
