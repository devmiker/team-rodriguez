/**
 * Light and dark theme.
 *
 * - Default: follow the device setting, through CSS `prefers-color-scheme`. That path
 *   needs no JavaScript at all, so the correct theme renders even if the bundle never
 *   arrives.
 * - An explicit choice is kept in localStorage and applied as `<html data-theme="…">`
 *   by an inline script before first paint, so the page never flashes the other theme.
 *
 * The stored value needs no cookie banner anywhere: it is written only because the
 * visitor asked for it, it is not an identifier, and it never leaves the browser.
 *
 * The logic lives here, tested, rather than in the inline script — which is kept to
 * four lines because every byte of it is hashed into the Content-Security-Policy.
 */

export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_STORAGE_KEY = "tr-theme";
export const THEME_ATTRIBUTE = "data-theme";

export const isTheme = (value: unknown): value is Theme =>
  typeof value === "string" && (THEMES as readonly string[]).includes(value);

/** The theme in effect: a valid stored choice, otherwise the device setting. */
export const resolveTheme = (stored: unknown, deviceDark: boolean): Theme =>
  isTheme(stored) ? stored : deviceDark ? "dark" : "light";

export const otherTheme = (theme: Theme): Theme => (theme === "dark" ? "light" : "dark");

/**
 * localStorage throws rather than returning null in some configurations — Safari's
 * private mode historically, and any browser with site data blocked. Treat a throw as
 * "no choice recorded" rather than letting it break the page.
 */
export function readStoredTheme(storage: Pick<Storage, "getItem"> | undefined): Theme | undefined {
  try {
    const value = storage?.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

export function storeTheme(storage: Pick<Storage, "setItem"> | undefined, theme: Theme): void {
  try {
    storage?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage unavailable. The choice still applies to this page view, which is the
    // most that can be honoured.
  }
}
