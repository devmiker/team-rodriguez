/**
 * The contact form's rules — the module both the browser and the Azure Function run.
 *
 * Most of what is tested here is not "does a good message pass" but "does a hostile
 * one fail, in the specific way that matters". The header-injection cases in
 * particular are the difference between a contact form and an open mail relay.
 */

import { describe, expect, it } from "vitest";
import {
  clean,
  cleanMultiline,
  isPlausibleEmail,
  LIMITS,
  MIN_FILL_MS,
  spamCheck,
  validate,
} from "./contact";

const good = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "Analytical Engines",
  projectType: "new",
  budget: "2to5k",
  timeline: "month",
  message: "We need a site for a small engineering firm. Five pages, nothing fancy.",
};

describe("validate", () => {
  it("accepts a well-formed submission and returns the cleaned values", () => {
    const result = validate(good);
    expect(result.ok).toBe(true);
    expect(result.value).toMatchObject({ name: "Ada Lovelace", email: "ada@example.com" });
  });

  it("lower-cases the email, because addresses are compared by humans", () => {
    expect(validate({ ...good, email: "Ada@Example.COM" }).value?.email).toBe("ada@example.com");
  });

  it("collects every failure at once rather than stopping at the first", () => {
    // A form that reveals one error at a time is a form people abandon.
    const result = validate({ ...good, name: "", email: "nope", message: "hi" });
    expect(result.ok).toBe(false);
    expect(Object.keys(result.errors).sort()).toEqual(["email", "message", "name"]);
  });

  it("rejects an unknown projectType instead of passing it through", () => {
    const result = validate({ ...good, projectType: "'; DROP TABLE enquiries; --" });
    expect(result.ok).toBe(false);
    expect(result.errors.projectType).toBeDefined();
  });

  it("falls back rather than failing on an unknown budget or timeline", () => {
    // These are optional conveniences. Blocking a genuine enquiry over a dropdown
    // value nobody reads would be the wrong trade.
    const result = validate({ ...good, budget: "eleventy", timeline: "yesterday" });
    expect(result.ok).toBe(true);
    expect(result.value).toMatchObject({ budget: "unsure", timeline: "flexible" });
  });

  it("treats a missing body as a failure, not a crash", () => {
    for (const input of [undefined, null, "", 42, [], { name: 1, email: {} }]) {
      expect(() => validate(input)).not.toThrow();
      expect(validate(input).ok).toBe(false);
    }
  });

  it("rejects a message longer than the cap", () => {
    const result = validate({ ...good, message: "a".repeat(LIMITS.message + 1) });
    expect(result.errors.message).toBe("form.message.tooLong");
  });

  it("truncates rather than rejects an over-long name", () => {
    // A name is capped, not refused: someone with a very long name should not be
    // locked out of the form.
    const result = validate({ ...good, name: "A".repeat(LIMITS.name + 50) });
    expect(result.ok).toBe(true);
    expect(result.value?.name.length).toBe(LIMITS.name);
  });
});

describe("header injection", () => {
  /**
   * CR and LF in a value that reaches an email header let a submitter append their own
   * headers — `Bcc:` above all — and turn the form into a way of mailing strangers
   * from your domain. Every one of these must come out of validation with no newline
   * left in it.
   */
  const payloads = [
    "Ada\r\nBcc: victim@example.com",
    "Ada\nBcc: victim@example.com",
    "Ada\rBcc: victim@example.com",
    "Ada\u0000Bcc: victim@example.com",
    "Ada\u2028Bcc: victim@example.com",
  ];

  it.each(payloads)("strips control characters from the name: %j", (payload) => {
    const value = validate({ ...good, name: payload }).value;
    expect(value?.name).toBeDefined();
    expect(value!.name).not.toMatch(/[\r\n\u0000\u2028\u2029]/);
  });

  it("refuses an email address containing a newline or a second recipient", () => {
    for (const address of [
      "ada@example.com\r\nBcc: victim@example.com",
      "ada@example.com, victim@example.com",
      "ada@example.com;victim@example.com",
      "<ada@example.com>",
      "ada@example.com victim@example.com",
    ]) {
      expect(isPlausibleEmail(address), address).toBe(false);
    }
  });

  it("keeps newlines in the message, where they are paragraphs and not headers", () => {
    // The message never goes near a header, so it is allowed to have structure.
    const value = validate({ ...good, message: "First line.\n\nSecond line." }).value;
    expect(value?.message).toBe("First line.\n\nSecond line.");
  });
});

describe("clean", () => {
  it("removes zero-width and bidirectional characters", () => {
    // Bidi overrides can make a displayed string read differently from the string
    // that was actually submitted — which is how something gets past a human reviewer.
    expect(clean("Ada​Love‮lace")).toBe("AdaLovelace");
  });

  it("collapses runs of whitespace and trims", () => {
    expect(clean("  Ada   Lovelace \t ")).toBe("Ada Lovelace");
  });

  it("returns an empty string for anything that is not a string", () => {
    for (const input of [undefined, null, 7, {}, []]) expect(clean(input)).toBe("");
  });
});

describe("cleanMultiline", () => {
  it("normalises line endings and caps blank runs at one", () => {
    expect(cleanMultiline("a\r\n\r\n\r\n\r\nb")).toBe("a\n\nb");
  });

  it("keeps single newlines", () => {
    expect(cleanMultiline("a\nb")).toBe("a\nb");
  });
});

describe("isPlausibleEmail", () => {
  it.each(["a@b.co", "ada.lovelace+site@example.co.uk", "x_y@sub.domain.org"])(
    "accepts %s",
    (address) => expect(isPlausibleEmail(address)).toBe(true),
  );

  it.each(["", "ada", "ada@", "@example.com", "ada@example", "ada @example.com"])(
    "rejects %j",
    (address) => expect(isPlausibleEmail(address)).toBe(false),
  );

  it("rejects an address longer than RFC 5321 allows", () => {
    expect(isPlausibleEmail(`${"a".repeat(250)}@example.com`)).toBe(false);
  });
});

describe("spamCheck", () => {
  const now = 1_000_000_000;

  it("catches a filled honeypot", () => {
    expect(spamCheck({ honeypot: "http://spam.example", startedAt: now - 10_000, now })).toBe(
      "honeypot",
    );
  });

  it("ignores an empty or whitespace-only honeypot", () => {
    expect(spamCheck({ honeypot: "   ", startedAt: now - 10_000, now })).toBe("ok");
  });

  it("catches a form submitted faster than a person could read it", () => {
    expect(spamCheck({ startedAt: now - (MIN_FILL_MS - 1), now })).toBe("too-fast");
  });

  it("allows a form filled in at human speed", () => {
    expect(spamCheck({ startedAt: now - 30_000, now })).toBe("ok");
  });

  it("catches a very stale page", () => {
    expect(spamCheck({ startedAt: now - 1000 * 60 * 60 * 24, now })).toBe("stale");
  });

  it("treats a missing timestamp as no evidence, not as guilt", () => {
    // Without JavaScript the field is never stamped. A genuine visitor with scripts
    // off must not be silently dropped.
    for (const startedAt of [undefined, "", "not-a-number", 0, -1]) {
      expect(spamCheck({ startedAt, now })).toBe("ok");
    }
  });
});
