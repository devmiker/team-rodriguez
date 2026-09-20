/**
 * The motion system's safety contract.
 *
 * There is one failure mode that matters here and it is severe: a scroll-reveal
 * that hides content and then never shows it again leaves a blank page, and the
 * usual way to write one does exactly that the day the script fails. These tests
 * read the real stylesheet and the real script and assert the design that prevents
 * it — so someone "simplifying" the selectors later gets a failing test rather than
 * an invisible site.
 *
 * They are static checks, not behavioural ones: there is no DOM here, and what is
 * being protected is a property of the source rather than of a rendered page.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const read = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8");

const motionCss = read("./motion.css");
const globalCss = read("./global.css");
const tokensCss = read("./tokens.css");
const script = read("../components/MotionScript.astro");

/** Declaration blocks that set `opacity: 0`, with the selector that opened them. */
function opacityZeroRules(css: string): string[] {
  const rules: string[] = [];
  for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    if (/(^|;)\s*opacity\s*:\s*0\s*(;|$)/.test(body ?? "")) rules.push((selector ?? "").trim());
  }
  return rules;
}

describe("nothing is hidden unless motion is provably available", () => {
  /**
   * The core invariant. Every rule that sets `opacity: 0` must be gated on
   * `[data-motion="on"]`, which only exists once the script has confirmed the
   * visitor wants motion and the browser can deliver it.
   *
   * Keyframes are exempt: a `from { opacity: 0 }` inside @keyframes only applies
   * while its animation is running, and the animations themselves are gated.
   */
  it("gates every opacity:0 rule in motion.css on [data-motion]", () => {
    const withoutKeyframes = motionCss.replace(/@keyframes[^{]*\{(?:[^{}]*\{[^}]*\})*[^}]*\}/g, "");
    for (const selector of opacityZeroRules(withoutKeyframes)) {
      expect(selector, `"${selector}" hides content without checking [data-motion]`).toContain(
        '[data-motion="on"]',
      );
    }
  });

  it("hides nothing at all from global.css", () => {
    // global.css is unconditional. An opacity:0 there would apply to everyone,
    // including a visitor whose JavaScript never ran.
    expect(opacityZeroRules(globalCss)).toEqual([]);
  });

  it("sets the attribute before creating the observer", () => {
    // Order matters: the attribute arms the hiding rules, so it must never be set
    // by the same code path that also has to succeed at observing. If it were set
    // after a throwing call, content could be hidden with nothing left to reveal it.
    const attributeAt = script.indexOf('setAttribute("data-motion"');
    const observerAt = script.indexOf("new IntersectionObserver");
    expect(attributeAt).toBeGreaterThan(-1);
    expect(observerAt).toBeGreaterThan(-1);
    expect(attributeAt).toBeLessThan(observerAt);
  });

  it("only sets the attribute when reduced motion is NOT requested", () => {
    expect(script).toContain("prefers-reduced-motion: no-preference");
    expect(script).toContain('"IntersectionObserver" in window');
  });

  it("wraps the whole script in a catch that leaves motion off", () => {
    // Without this, a throw anywhere after the attribute is set would strand
    // hidden elements. With it, the worst case is an unanimated page.
    expect(script).toMatch(/try\s*\{[\s\S]*\}\s*catch\b/);
  });

  it("removes the attribute again if the preference changes mid-visit", () => {
    expect(script).toContain('removeAttribute("data-motion")');
    expect(script).toContain('query.addEventListener("change"');
  });
});

describe("reduced motion", () => {
  it("restores the finished state explicitly rather than trusting the clamp", () => {
    // global.css clamps durations to 0.01ms, which is safe for a transition but not
    // for an animation with fill-mode: both. This block is what guarantees the hero
    // is visible for a visitor who asked for less motion.
    const block = motionCss.match(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\}/,
    )?.[1];
    expect(block, "motion.css has no reduced-motion block").toBeTruthy();
    expect(block!).toContain("opacity: 1 !important");
    expect(block!).toContain("transform: none !important");
    expect(block!).toContain("animation: none !important");
  });

  it("keeps the cross-page view transition behind the same preference", () => {
    const viewTransitionAt = motionCss.indexOf("@view-transition");
    const guardAt = motionCss.indexOf("@media (prefers-reduced-motion: no-preference)");
    expect(viewTransitionAt).toBeGreaterThan(-1);
    expect(guardAt).toBeGreaterThan(-1);
    expect(guardAt).toBeLessThan(viewTransitionAt);
  });
});

describe("what gets animated", () => {
  it("animates only compositable properties", () => {
    // Animating anything that triggers layout — height, top, margin, width — is how
    // scroll animation becomes jank on a mid-range phone.
    const forbidden = ["height", "width", "top", "left", "margin", "padding"];
    for (const [, body] of motionCss.matchAll(/transition:\s*([^;]+);/g)) {
      for (const property of forbidden) {
        expect(body, `transition animates ${property}`).not.toMatch(
          new RegExp(`(^|[\\s,])${property}[\\s,]`),
        );
      }
    }
  });

  it("uses no third-party animation library", () => {
    // Rule 6 in AGENTS.md. The whole system is CSS plus one inline script.
    for (const source of [motionCss, script]) {
      expect(source).not.toMatch(/gsap|lenis|locomotive|\baos\b|framer-motion/i);
    }
  });

  it("declares its curves and durations as tokens", () => {
    for (const token of ["--ease-out", "--ease-spring", "--duration-slow", "--stagger"]) {
      expect(tokensCss, `${token} is not declared in tokens.css`).toContain(token);
    }
  });

  it("keeps hover effects off touch screens", () => {
    // A hover state on a touch device fires after the tap, so it reads as a glitch
    // on the way to the next page rather than as feedback.
    expect(motionCss).toContain("@media (hover: hover)");
    const hoverRules = [...motionCss.matchAll(/([^{}]*:hover[^{}]*)\{/g)].map((m) =>
      (m[1] ?? "").trim(),
    );
    expect(hoverRules.length).toBeGreaterThan(0);
  });
});
