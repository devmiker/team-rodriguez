/**
 * The contact form.
 *
 * Built as progressive enhancement rather than as a JavaScript app that happens to
 * render inputs. Astro server-renders this component, so the HTML that arrives is a
 * real `<form method="post" action="/api/contact">` that submits and works with
 * JavaScript disabled, blocked, or still downloading — the API answers a form-encoded
 * POST with a redirect to the thank-you page. React then takes over `onSubmit` and
 * turns the same form into an inline one, with no page navigation and errors shown
 * against the fields.
 *
 * That is not an abstract virtue. A contact form is the one page on a small business
 * site where a failure costs actual money, and "the bundle 404'd on a hotel wifi" is a
 * thing that happens.
 *
 * Accessibility, which is most of the code below:
 *   - every input has a real <label>, not a placeholder standing in for one
 *   - hints and errors are wired with aria-describedby, so they are announced when the
 *     field receives focus rather than sitting silently next to it
 *   - `aria-invalid` marks failed fields
 *   - on a failed submit, an error summary appears at the top, takes focus, and links
 *     to each bad field. This is the pattern that actually works for someone using a
 *     screen reader, because "3 errors" with links beats hunting down the form
 *   - the status region is `aria-live="polite"`, so success and failure are announced
 *     without stealing focus mid-typing
 *   - validation runs on submit, not on keystroke: telling someone their email is
 *     invalid while they are still typing the @ is hostile
 *
 * Spam defence is deliberately quiet — see `spamCheck` in src/lib/contact.ts. Nothing
 * here tells a submitter which check they failed.
 */

import { useEffect, useId, useRef, useState } from "react";
import {
  BUDGETS,
  HONEYPOT_FIELD,
  LIMITS,
  PROJECT_TYPES,
  TIMELINES,
  validate,
  type FieldErrors,
} from "../../lib/contact";

import "./ContactForm.css";

/** Every piece of text the form renders, resolved by the page in the right language. */
export interface ContactFormLabels {
  name: string;
  nameError: string;
  email: string;
  emailHint: string;
  emailError: string;
  company: string;
  optional: string;
  projectType: string;
  projectTypePlaceholder: string;
  projectTypeError: string;
  projectTypeOptions: Record<string, string>;
  budget: string;
  budgetHint: string;
  budgetOptions: Record<string, string>;
  timeline: string;
  timelineOptions: Record<string, string>;
  message: string;
  messageHint: string;
  messageError: string;
  messageTooLong: string;
  required: string;
  submit: string;
  submitting: string;
  errorSummaryHeading: string;
  successHeading: string;
  successBody: string;
  failureHeading: string;
  failureBody: string;
  rateLimited: string;
  noscript: string;
}

export interface ContactFormProps {
  labels: ContactFormLabels;
  /** Where a no-JavaScript submit should land. Sent as a hidden field. */
  redirectTo: string;
  /** The API path. A prop so a test can point it somewhere harmless. */
  action?: string;
  /** Temporary shutdown while the form backend is not ready. */
  disabled?: boolean;
}

type Status = "idle" | "sending" | "sent" | "failed" | "rate-limited";

/* Derived from the <form> element's own props rather than written as
   React.FormEventHandler, which React 19's types mark deprecated. */
type SubmitHandler = NonNullable<React.ComponentProps<"form">["onSubmit"]>;

export default function ContactForm({
  labels,
  redirectTo,
  action = "/api/contact",
  disabled = false,
}: ContactFormProps) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [startedAt, setStartedAt] = useState("");

  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const ids = {
    name: useId(),
    email: useId(),
    company: useId(),
    projectType: useId(),
    budget: useId(),
    timeline: useId(),
    message: useId(),
    summary: useId(),
  };

  /**
   * Stamped after hydration rather than at render. If the server rendered it, every
   * visitor would carry the build time and every submission would look twelve hours
   * stale. Without JavaScript it stays empty, and `spamCheck` treats a missing
   * timestamp as no evidence rather than as guilt.
   */
  useEffect(() => setStartedAt(String(Date.now())), []);

  /** The message for a field, mapped from the shared validator's UiKey. */
  const messageFor = (key: string | undefined): string | undefined => {
    switch (key) {
      case "form.name.error":
        return labels.nameError;
      case "form.email.error":
        return labels.emailError;
      case "form.message.error":
        return labels.messageError;
      case "form.message.tooLong":
        return labels.messageTooLong;
      case "form.projectType.error":
        return labels.projectTypeError;
      default:
        return undefined;
    }
  };

  const errorEntries = (Object.keys(errors) as (keyof FieldErrors)[])
    .map((field) => ({ field, text: messageFor(errors[field]) }))
    .filter((e): e is { field: keyof FieldErrors; text: string } => Boolean(e.text));

  // Focus the summary once it exists, so a screen reader announces the errors and a
  // keyboard user's next Tab starts at the first broken field rather than the top of
  // the page.
  useEffect(() => {
    if (errorEntries.length > 0) summaryRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors]);

  const onSubmit: SubmitHandler = async (event) => {
    event.preventDefault();
    if (disabled) return;

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    // The same validator the server runs. Failing here saves a round trip; passing
    // here proves nothing, which is why the server runs it again.
    const result = validate(data);
    if (!result.ok) {
      setErrors(result.errors);
      setStatus("idle");
      return;
    }

    setErrors({});
    setStatus("sending");

    try {
      const response = await fetch(action, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          ...result.value,
          [HONEYPOT_FIELD]: data[HONEYPOT_FIELD] ?? "",
          startedAt,
        }),
      });

      if (response.status === 429) {
        setStatus("rate-limited");
        return;
      }
      if (!response.ok) {
        setStatus("failed");
        return;
      }

      setStatus("sent");
      form.reset();
      setStartedAt(String(Date.now()));
    } catch {
      // Offline, DNS failure, the request blocked by an extension. The visitor needs
      // the fallback address, which the failure message points at.
      setStatus("failed");
    }
  };

  const describedBy = (...parts: (string | false | undefined)[]) =>
    parts.filter(Boolean).join(" ") || undefined;

  if (status === "sent") {
    return (
      <div className="contact-form__done card" role="status">
        <h2>{labels.successHeading}</h2>
        <p>{labels.successBody}</p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      className="contact-form"
      method="post"
      action={action}
      onSubmit={onSubmit}
      noValidate
    >
      {disabled && (
        <div className="contact-form__notice card" role="status" aria-live="polite">
          <h2>Contact form temporarily unavailable</h2>
          <p>We are pausing enquiries while the form is being finalised. Please email us directly instead.</p>
        </div>
      )}
      {/* Where the no-JavaScript path should land. Validated server-side against the
          site's own known paths — never used as an open redirect. */}
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <input type="hidden" name="startedAt" value={startedAt} />

      {/* The honeypot. Hidden from sight, from the accessibility tree and from the tab
          order, so no human ever encounters it; most form-filling bots fill it anyway.
          `autoComplete="off"` keeps a browser's autofill from doing it by accident. */}
      <div className="contact-form__trap" aria-hidden="true">
        <label htmlFor={HONEYPOT_FIELD}>Do not fill this in</label>
        <input
          id={HONEYPOT_FIELD}
          type="text"
          name={HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {errorEntries.length > 0 && (
        <div
          ref={summaryRef}
          id={ids.summary}
          className="contact-form__summary"
          role="alert"
          tabIndex={-1}
        >
          <h2>{labels.errorSummaryHeading}</h2>
          <ul>
            {errorEntries.map(({ field, text }) => (
              <li key={field}>
                <a href={`#${ids[field as keyof typeof ids]}`}>{text}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="contact-form__row">
        <div className="field">
          <label htmlFor={ids.name}>
            {labels.name} <span className="field__required">{labels.required}</span>
          </label>
          <input
            id={ids.name}
            name="name"
            type="text"
            required
            maxLength={LIMITS.name}
            autoComplete="name"
            disabled={disabled}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy(errors.name && `${ids.name}-error`)}
          />
          {errors.name && (
            <p id={`${ids.name}-error`} className="field__error">
              {messageFor(errors.name)}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor={ids.email}>
            {labels.email} <span className="field__required">{labels.required}</span>
          </label>
          <input
            id={ids.email}
            name="email"
            type="email"
            required
            maxLength={LIMITS.email}
            autoComplete="email"
            inputMode="email"
            disabled={disabled}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy(
              `${ids.email}-hint`,
              errors.email && `${ids.email}-error`,
            )}
          />
          <p id={`${ids.email}-hint`} className="field__hint">
            {labels.emailHint}
          </p>
          {errors.email && (
            <p id={`${ids.email}-error`} className="field__error">
              {messageFor(errors.email)}
            </p>
          )}
        </div>
      </div>

      <div className="field">
        <label htmlFor={ids.company}>
          {labels.company} <span className="field__optional">({labels.optional})</span>
        </label>
        <input
          id={ids.company}
          name="company"
          type="text"
          maxLength={LIMITS.company}
          autoComplete="organization"
          disabled={disabled}
        />
      </div>

      <div className="field">
        <label htmlFor={ids.projectType}>
          {labels.projectType} <span className="field__required">{labels.required}</span>
        </label>
        <select
          id={ids.projectType}
          name="projectType"
          required
          defaultValue=""
          disabled={disabled}
          aria-invalid={errors.projectType ? true : undefined}
          aria-describedby={describedBy(errors.projectType && `${ids.projectType}-error`)}
        >
          <option value="" disabled>
            {labels.projectTypePlaceholder}
          </option>
          {PROJECT_TYPES.map((value) => (
            <option key={value} value={value}>
              {labels.projectTypeOptions[value]}
            </option>
          ))}
        </select>
        {errors.projectType && (
          <p id={`${ids.projectType}-error`} className="field__error">
            {messageFor(errors.projectType)}
          </p>
        )}
      </div>

      <div className="contact-form__row">
        <div className="field">
          <label htmlFor={ids.budget}>{labels.budget}</label>
          <select
            id={ids.budget}
            name="budget"
            defaultValue="unsure"
            disabled={disabled}
            aria-describedby={`${ids.budget}-hint`}
          >
            {BUDGETS.map((value) => (
              <option key={value} value={value}>
                {labels.budgetOptions[value]}
              </option>
            ))}
          </select>
          <p id={`${ids.budget}-hint`} className="field__hint">
            {labels.budgetHint}
          </p>
        </div>

        <div className="field">
          <label htmlFor={ids.timeline}>{labels.timeline}</label>
          <select id={ids.timeline} name="timeline" defaultValue="flexible" disabled={disabled}>
            {TIMELINES.map((value) => (
              <option key={value} value={value}>
                {labels.timelineOptions[value]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor={ids.message}>
          {labels.message} <span className="field__required">{labels.required}</span>
        </label>
        <textarea
          id={ids.message}
          name="message"
          rows={7}
          required
          maxLength={LIMITS.message}
          disabled={disabled}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describedBy(
            `${ids.message}-hint`,
            errors.message && `${ids.message}-error`,
          )}
        />
        <p id={`${ids.message}-hint`} className="field__hint">
          {labels.messageHint}
        </p>
        {errors.message && (
          <p id={`${ids.message}-error`} className="field__error">
            {messageFor(errors.message)}
          </p>
        )}
      </div>

      <div className="contact-form__actions">
        <button
          type="submit"
          className="button button--primary"
          disabled={status === "sending" || disabled}
        >
          {status === "sending" ? labels.submitting : labels.submit}
        </button>
      </div>

      {/* Announced politely: a visitor who is still reading is not interrupted, and a
          visitor waiting on the result hears it. */}
      <div className="contact-form__status" role="status" aria-live="polite">
        {status === "failed" && (
          <div className="contact-form__alert">
            <strong>{labels.failureHeading}</strong> {labels.failureBody}
          </div>
        )}
        {status === "rate-limited" && (
          <div className="contact-form__alert">{labels.rateLimited}</div>
        )}
      </div>

      <noscript>
        <p className="field__hint">{labels.noscript}</p>
      </noscript>
    </form>
  );
}
