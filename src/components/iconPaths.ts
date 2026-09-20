/**
 * The site's entire icon set.
 *
 * Inline paths rather than an icon font or a sprite fetched at runtime: an icon font
 * is a separate download that blocks rendering and reads as garbage characters to a
 * screen reader if it fails, and a runtime sprite is another request. These cost a few
 * hundred bytes inside HTML that was already being sent.
 *
 * All are drawn on a 24×24 grid, stroked rather than filled, so one `stroke-width`
 * keeps them visually consistent at every size. `currentColor` means they inherit the
 * surrounding text colour and therefore work in both themes with no extra work.
 *
 * Keep this set small. An icon that appears once is usually a word in disguise.
 */

export const ICON_PATHS = {
  // Services
  layout: "M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 9h18M9 9v12",
  cart: "M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6M10 21a1 1 0 1 0 0-.01M18 21a1 1 0 1 0 0-.01",
  shield: "M12 3l7.5 3v5.2c0 4.5-3 8.6-7.5 10-4.5-1.4-7.5-5.5-7.5-10V6z",
  gauge: "M12 14l4-4M4.6 18a9 9 0 1 1 14.8 0",

  // Navigation and controls
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6L6 18",
  chevronDown: "M6 9l6 6 6-6",
  arrowRight: "M4 12h15M13 6l6 6-6 6",
  check: "M4 12.5l5 5L20 6.5",

  // Theme
  sun: "M12 4V2M12 22v-2M6 6L4.5 4.5M19.5 19.5L18 18M4 12H2M22 12h-2M6 18l-1.5 1.5M19.5 4.5L18 6M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  moon: "M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z",

  // Contact
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M3.5 9h17M3.5 15h17M12 3c2.3 2.4 3.5 5.6 3.5 9s-1.2 6.6-3.5 9c-2.3-2.4-3.5-5.6-3.5-9s1.2-6.6 3.5-9",
  mail: "M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3.5 7.5l8.5 6 8.5-6",
  external: "M14 4h6v6M20 4l-8.5 8.5M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4",

  // Status
  alert: "M12 8v5M12 16.5v.5M10.3 3.9L2.5 17.4A2 2 0 0 0 4.2 20.4h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
} as const;

export type IconName = keyof typeof ICON_PATHS;
