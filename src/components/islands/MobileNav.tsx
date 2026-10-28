/**
 * The small-screen navigation panel.
 *
 * This is one of only two React islands on the site, and it is React because it is
 * genuinely stateful: open/closed, focus containment, Escape, restoring focus to the
 * button afterwards. Everything else on the site is static HTML.
 *
 * It hydrates with `client:media` so the bundle is never downloaded on a desktop that
 * will never open it. The markup is server-rendered either way, so the button is in
 * the HTML before any JavaScript arrives.
 *
 * Accessibility, which is most of the code here:
 *   - the button owns `aria-expanded` and `aria-controls`, so its state is announced
 *   - the open panel is a `dialog` with `aria-modal`, and focus is contained inside it
 *   - Escape closes it, which is the behaviour every keyboard user expects
 *   - focus returns to the button on close, so the tab order does not restart
 *   - the rest of the page gets `inert`-like treatment via scroll lock and the overlay
 *
 * None of this is decoration. A menu you can tab out of while it is open leaves a
 * keyboard user interacting with a page they cannot see.
 */

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import "./MobileNav.css";

export interface NavLink {
  href: string;
  label: string;
  current: boolean;
}

export interface LanguageLink {
  href: string;
  code: string;
  name: string;
  current: boolean;
}

export interface MobileNavProps {
  links: NavLink[];
  languages: LanguageLink[];
  openLabel: string;
  closeLabel: string;
  navLabel: string;
  languageLabel: string;
  /** The panel's closing call to action: the contact page. */
  cta: { href: string; label: string };
}

/** Everything focusable inside `root`, in document order. */
function focusables(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => el.offsetParent !== null || el === document.activeElement);
}

export default function MobileNav({
  links,
  languages,
  openLabel,
  closeLabel,
  navLabel,
  languageLabel,
  cta,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /*
    The panel is portalled to <body> once the island has hydrated. Rendered inside
    the header it inherited the header's `.band` tokens — light text meant for navy —
    on its own light background, so in the light theme the links were nearly
    invisible. Outside the header it gets the page's tokens like everything else.
    The server render (before hydration) keeps it inline and hidden, which is fine:
    it cannot open until the script has run.
  */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const close = useCallback(() => {
    setOpen(false);
    // Focus goes back to the control that opened the panel. Without this it falls to
    // <body> and the next Tab starts from the top of the page.
    buttonRef.current?.focus();
  }, []);

  // Escape, and Tab containment. Registered on the document rather than the panel so
  // a Tab that has already escaped the panel is still caught and brought back.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;

      const items = focusables(panel);
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  // Move focus into the panel when it opens, and stop the page behind it scrolling.
  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    focusables(panel ?? document.body)[0]?.focus();

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const overlay = (
    <>
      {open && (
        <div className="mobile-nav__scrim" onClick={close} aria-hidden="true">
          {/* The scrim is decorative and click-to-close. Escape and the button are the
              accessible routes out, so it is hidden from assistive technology rather
              than exposed as an unlabelled clickable div. */}
        </div>
      )}

      <div
        ref={panelRef}
        id={panelId}
        className="mobile-nav__panel"
        role="dialog"
        aria-modal="true"
        aria-label={navLabel}
        hidden={!open}
      >
        {/* The header's button sits under the scrim while the panel is open, so the
            panel carries its own way out. Escape works too. */}
        <button type="button" className="mobile-nav__button mobile-nav__close" onClick={close}>
          <svg
            width="1.5em"
            height="1.5em"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
          <span className="visually-hidden">{closeLabel}</span>
        </button>

        {/*
          Languages first, as a three-way row: switching language is the thing a
          visitor on the wrong one needs most, so it is the first thing in the panel
          rather than the last. Still three plain links with hreflang, never a
          dropdown.
        */}
        <nav aria-label={languageLabel} className="mobile-nav__langs">
          <ul>
            {languages.map((language) => (
              <li key={language.code}>
                <a
                  href={language.href}
                  hrefLang={language.code}
                  lang={language.code}
                  aria-current={language.current ? "true" : undefined}
                >
                  {language.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={navLabel}>
          <ul className="mobile-nav__links">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  aria-current={link.current ? "page" : undefined}
                  onClick={close}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <p className="mobile-nav__cta">
          <a className="button button--primary" href={cta.href} onClick={close}>
            {cta.label}
          </a>
        </p>
      </div>
    </>
  );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="mobile-nav__button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <svg
          width="1.5em"
          height="1.5em"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d={open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"} />
        </svg>
        <span className="visually-hidden">{open ? closeLabel : openLabel}</span>
      </button>

      {mounted ? createPortal(overlay, document.body) : overlay}
    </>
  );
}
