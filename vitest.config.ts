/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

/**
 * Tests run through Astro's own Vite config, so imports resolve exactly as they do in
 * the build — a test cannot pass against a module graph the site does not use.
 *
 * The environment is per-file rather than global: component tests declare
 * `// @vitest-environment jsdom` at the top, and everything else runs in plain Node,
 * which is both faster and closer to where that code actually executes.
 */
export default getViteConfig({
  test: {
    environment: "node",
  },
});
