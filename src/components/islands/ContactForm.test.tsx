// @vitest-environment jsdom
/**
 * The contact form island.
 *
 * What is asserted here is the accessibility contract, because that is the part that
 * silently rots: labels wired to inputs, errors announced and linked, the honeypot
 * kept away from humans, and — most importantly — the form still being a real form
 * that posts somewhere when JavaScript does nothing.
 */

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ContactForm, { type ContactFormLabels } from "./ContactForm";
import { HONEYPOT_FIELD } from "../../lib/contact";

afterEach(cleanup);

const labels: ContactFormLabels = {
  name: "Your name",
  nameError: "Please tell us what to call you.",
  email: "Email address",
  emailHint: "So we can reply.",
  emailError: "Please enter an email address.",
  company: "Business name",
  optional: "optional",
  projectType: "What do you need?",
  projectTypePlaceholder: "Choose one",
  projectTypeError: "Please pick the closest option.",
  projectTypeOptions: {
    new: "A new website",
    redesign: "A redesign",
    shop: "An online shop",
    care: "Care",
    audit: "An audit",
    other: "Something else",
  },
  budget: "Rough budget",
  budgetHint: "Pick the nearest.",
  budgetOptions: {
    unsure: "Not sure yet",
    under2k: "Under 2,000",
    "2to5k": "2,000 – 5,000",
    "5to10k": "5,000 – 10,000",
    over10k: "Over 10,000",
  },
  timeline: "When do you need it?",
  timelineOptions: {
    flexible: "No fixed date",
    month: "Within a month",
    quarter: "Within three months",
    later: "Later this year",
  },
  message: "Tell us about it",
  messageHint: "What the business does.",
  messageError: "Please tell us a little about the project.",
  messageTooLong: "That is too long.",
  required: "required",
  submit: "Send message",
  submitting: "Sending…",
  errorSummaryHeading: "Please check the following",
  successHeading: "Message sent",
  successBody: "Thank you.",
  failureHeading: "That did not send",
  failureBody: "Please try again.",
  rateLimited: "Too many messages.",
  noscript: "This form works without JavaScript.",
};

const setup = () => render(<ContactForm labels={labels} redirectTo="/en/thanks/" />);

/** Fill everything the validator requires. */
function fillValidly() {
  fireEvent.change(screen.getByLabelText(/Your name/), { target: { value: "Ada Lovelace" } });
  fireEvent.change(screen.getByLabelText(/Email address/), {
    target: { value: "ada@example.com" },
  });
  fireEvent.change(screen.getByLabelText(/What do you need/), { target: { value: "new" } });
  fireEvent.change(screen.getByLabelText(/Tell us about it/), {
    target: { value: "A five page site for a small engineering firm." },
  });
}

describe("without JavaScript doing anything", () => {
  it("is a real form that posts to the endpoint", () => {
    // The single most important property of this component. If someone converts it to
    // a button with an onClick, this fails.
    const { container } = setup();
    const form = container.querySelector("form");
    expect(form?.getAttribute("method")?.toLowerCase()).toBe("post");
    expect(form?.getAttribute("action")).toBe("/api/contact");
  });

  it("carries the redirect target as a hidden field", () => {
    const { container } = setup();
    expect(container.querySelector('input[name="redirectTo"]')).toHaveProperty(
      "value",
      "/en/thanks/",
    );
  });
});

describe("labelling", () => {
  it.each([
    "Your name",
    "Email address",
    "Business name",
    "What do you need?",
    "Rough budget",
    "When do you need it?",
    "Tell us about it",
  ])("associates a real label with %s", (text) => {
    setup();
    expect(screen.getByLabelText(new RegExp(text.replace(/[?]/g, "\\?")))).toBeDefined();
  });

  it("wires the email hint to the field with aria-describedby", () => {
    setup();
    const input = screen.getByLabelText(/Email address/);
    const described = input.getAttribute("aria-describedby");
    expect(described).toBeTruthy();
    expect(document.getElementById(described!.split(" ")[0]!)?.textContent).toBe(labels.emailHint);
  });
});

describe("the honeypot", () => {
  it("exists, is hidden from assistive technology, and is out of the tab order", () => {
    const { container } = setup();
    const field = container.querySelector(`input[name="${HONEYPOT_FIELD}"]`);
    expect(field).not.toBeNull();
    expect(field!.getAttribute("tabindex")).toBe("-1");
    expect(field!.closest("[aria-hidden='true']")).not.toBeNull();
    expect(field!.getAttribute("autocomplete")).toBe("off");
  });

  it("is absent from the accessibility tree", () => {
    // Asserted through the role query, which honours aria-hidden the way assistive
    // technology does. (getByLabelText deliberately does not, so it is not the right
    // check here — the label exists in the DOM, it is just never exposed.)
    setup();
    const exposed = screen.getAllByRole("textbox").map((el) => el.getAttribute("name"));
    expect(exposed).not.toContain(HONEYPOT_FIELD);
  });
});

describe("failed submission", () => {
  it("shows an error summary that takes focus and links to each bad field", () => {
    const { container } = setup();
    fireEvent.submit(container.querySelector("form")!);

    const summary = screen.getByRole("alert");
    expect(summary.textContent).toContain(labels.errorSummaryHeading);
    expect(document.activeElement).toBe(summary);

    // Each entry is a link, and each link points at a field that exists on the page.
    const links = within(summary).getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(3);
    for (const link of links) {
      const id = link.getAttribute("href")!.slice(1);
      expect(document.getElementById(id), `#${id} should exist`).not.toBeNull();
    }
  });

  it("marks the failed fields with aria-invalid and an error message", () => {
    const { container } = setup();
    fireEvent.submit(container.querySelector("form")!);

    const name = screen.getByLabelText(/Your name/);
    expect(name.getAttribute("aria-invalid")).toBe("true");

    const described = name.getAttribute("aria-describedby")!;
    expect(document.getElementById(described)?.textContent).toBe(labels.nameError);
  });

  it("does not send anything to the server", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { container } = setup();
    fireEvent.submit(container.querySelector("form")!);
    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});

describe("temporarily closed state", () => {
  it("keeps the form visible but disables all inputs and blocks submit", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { container } = render(
      <ContactForm labels={labels} redirectTo="/en/thanks/" disabled />,
    );

    const form = container.querySelector("form")!;
    expect(form).not.toBeNull();
    expect(screen.getByText("Contact form temporarily unavailable")).toBeTruthy();

    for (const control of form.querySelectorAll("input, select, textarea, button")) {
      expect((control as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement).disabled).toBe(true);
    }

    fireEvent.submit(form);
    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});

describe("successful submission", () => {
  it("posts JSON and then shows the confirmation", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    const { container } = setup();
    fillValidly();
    fireEvent.submit(container.querySelector("form")!);

    await screen.findByText(labels.successHeading);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/contact");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toMatchObject({
      name: "Ada Lovelace",
      email: "ada@example.com",
      projectType: "new",
    });

    vi.unstubAllGlobals();
  });

  it("tells the visitor when the request fails, rather than failing silently", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    const { container } = setup();
    fillValidly();
    fireEvent.submit(container.querySelector("form")!);

    await screen.findByText(new RegExp(labels.failureHeading));
    vi.unstubAllGlobals();
  });

  it("distinguishes being rate limited from a general failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 429 }));

    const { container } = setup();
    fillValidly();
    fireEvent.submit(container.querySelector("form")!);

    await screen.findByText(labels.rateLimited);
    vi.unstubAllGlobals();
  });
});
