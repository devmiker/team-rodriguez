/**
 * Theme resolution. Small, but it decides what every visitor sees before first paint,
 * and the inline script in ThemeScript.astro is a four-line mirror of it.
 */

import { describe, expect, it, vi } from "vitest";
import {
  isTheme,
  otherTheme,
  readStoredTheme,
  resolveTheme,
  storeTheme,
  THEME_STORAGE_KEY,
} from "./theme";

describe("resolveTheme", () => {
  it("prefers an explicit choice over the device setting", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("follows the device when there is no choice", () => {
    expect(resolveTheme(undefined, true)).toBe("dark");
    expect(resolveTheme(undefined, false)).toBe("light");
  });

  it("ignores a stored value that is not a theme", () => {
    // localStorage is writable by anything running on the origin, and by the visitor.
    for (const junk of ["", "DARK", "blue", 1, null, {}]) {
      expect(resolveTheme(junk, false)).toBe("light");
    }
  });
});

describe("isTheme / otherTheme", () => {
  it("recognises only the two themes", () => {
    expect(isTheme("light")).toBe(true);
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("auto")).toBe(false);
  });

  it("toggles", () => {
    expect(otherTheme("light")).toBe("dark");
    expect(otherTheme("dark")).toBe("light");
  });
});

describe("storage", () => {
  it("reads a valid stored theme", () => {
    const storage = { getItem: vi.fn().mockReturnValue("dark") };
    expect(readStoredTheme(storage)).toBe("dark");
    expect(storage.getItem).toHaveBeenCalledWith(THEME_STORAGE_KEY);
  });

  it("treats a throwing storage as no choice rather than breaking the page", () => {
    // Private browsing and blocked site data both make localStorage throw rather than
    // return null. An unhandled throw here would take out the inline script that runs
    // before first paint.
    const storage = {
      getItem: () => {
        throw new Error("blocked");
      },
    };
    expect(readStoredTheme(storage)).toBeUndefined();
  });

  it("swallows a throwing write", () => {
    const storage = {
      setItem: () => {
        throw new Error("quota");
      },
    };
    expect(() => storeTheme(storage, "dark")).not.toThrow();
  });

  it("copes with no storage object at all", () => {
    expect(readStoredTheme(undefined)).toBeUndefined();
    expect(() => storeTheme(undefined, "light")).not.toThrow();
  });
});
