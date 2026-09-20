import { defineMiddleware } from "astro:middleware";
import { assertServiceIdsExist } from "./data/team";

/**
 * Check the data model before any page renders.
 *
 * Pages are static, so this runs during `astro build` — which means a team member
 * pointing at a service that does not exist fails the build rather than shipping a
 * profile with an empty list of services on it.
 *
 * It lives here rather than in each page so that no page can forget it, and so that
 * adding a page does not mean remembering to add the check.
 */
export const onRequest = defineMiddleware(async (_context, next) => {
  assertServiceIdsExist();
  return next();
});
