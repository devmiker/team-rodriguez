# Team Rodriguez — working context

The one file to read before changing anything here. It holds the facts, the decisions
and the reasons. `CLAUDE.md` points at this file and holds nothing of its own.

---

## What this is

A marketing site for a small software studio that builds websites for small businesses.
It replaces an empty repository — there was no previous site in git, so nothing was
migrated and nothing is owed to an old design.

Working name **Team Rodriguez**. The LLC is not registered yet, which is why
`src/data/company.ts` is full of `TODO` and `LAUNCHED` is `false`.

**Stack:** Astro 7, React islands, TypeScript (strict), Vitest, Azure Static Web Apps
with one managed Azure Function. Three languages: English (source), German, Spanish.

---

## The rules that matter

These are not style preferences. Each one exists because breaking it causes a specific
problem, named here.

1. **No colour value outside `src/styles/tokens.css`.** A hex code in a component is a
   colour nobody checked for contrast and that does not switch with the theme.
   `tokens.test.ts` enforces the token layer; it cannot enforce what is not in it.

2. **No hard-coded URL path.** Use `pathFor()` from `src/i18n/routes.ts`. Slugs are
   translated, so the same page has three URLs, and the nav, the language switcher,
   hreflang and the sitemap all have to agree. They do because they all call the same
   function.

3. **No fabricated content.** Team members, partners and case studies are all gated on
   a `published` flag, and an unpublished entry never reaches the HTML. Do not invent a
   client, a testimonial or a result to fill a page — `PendingNotice` exists for that,
   and it costs nothing.

4. **Personal data needs a person's agreement.** A team or partner entry publishes
   someone's name and specialisms. Ask them, show them the wording, then flip the flag.

5. **Validate on the server, always.** `src/lib/contact.ts` is imported by both the
   browser island and the Azure Function. Client-side validation is a courtesy to the
   visitor; it is not a control. Never add a check to one side only.

6. **No third-party requests.** No analytics, no hosted fonts, no embedded widgets. The
   privacy page, the absence of a cookie banner, and `default-src 'self'` in the CSP
   all rest on this. Adding one breaks all three at once — and if you do add one, update
   `src/data/legal.ts` in the same commit.

7. **`npm run verify` before pushing.** The pre-push hook runs it for you.

---

## Layout

```
src/
  data/          The facts. company, services, team, partners, work, legal.
  i18n/          locales, routes (translated slugs), pages, ui, strings/{en,de,es}
  lib/           contact (shared with the API), csp, seo, theme
  components/    .astro components; islands/ holds the two React ones
  layouts/       BaseLayout — the shell every page renders inside
  views/         One per page. Receives nothing, reads its own locale.
  pages/         [locale]/[...path].astro renders every page in every language
  styles/        tokens.css (the palette), global.css (everything shared)
  middleware.ts  Data-model checks that run before any page renders
api/             The Azure Function behind the contact form
scripts/a11y.mjs axe-core over the built site, both themes
```

### Adding a page

1. A `ROUTES` entry in `src/i18n/routes.ts` with a slug in all three languages.
2. `<route>.title` and `<route>.description` in all three string tables.
3. A view in `src/views/`.
4. One line in `src/pages/[locale]/[...path].astro`.

Nothing else. No new file per language.

### Adding a language

Start at `src/i18n/locales.ts` and let the compiler walk you through it: `LOCALE_META`,
a table in `strings/`, a slug per route, and `LocalizedText` values in `src/data/`. Set
`reviewed: false` and every page in that language says so until a fluent speaker has
read it. If the language needs characters outside Latin-1 (Turkish, Polish, anything
non-Latin), add a `latin-ext` or equivalent font variant in `astro.config.mjs`.

---

## Decisions, and why

**Astro with islands, not a single-page app.** The site is text. Server-rendered HTML
loads faster, works without JavaScript, and the two components that genuinely need
state — the mobile menu and the contact form — are the only JavaScript that ships.

**Translated slugs.** A Spanish visitor reading `/es/servicios/` is being spoken to;
`/es/services/` is not. The cost is that nothing may hard-code a path. See rule 2.

**English is the source language.** German and Spanish are marked unreviewed and say
so on every page. Francisco works in Spanish, so `es` is the first candidate to be
reviewed and flipped.

**Prices are published.** "Contact us for pricing" makes a small business owner assume
they cannot afford you and close the tab. Indicative "from" figures with a note that
the real number is fixed in writing first is the honest version. The numbers in
`src/data/services.ts` are placeholders until you say otherwise.

**The form works without JavaScript.** It server-renders as a real
`<form method="post">` that posts to the API and redirects to a thank-you page; React
upgrades it to an inline submit. A contact form is the one page where a failure costs
real money, and "the bundle failed to load" is a thing that happens.

**Spam defence is quiet.** Honeypot, a minimum fill time, length caps, an enum
allowlist and per-instance rate limiting. A caught submission gets the same success
response a real one does — telling a bot which check it failed tells it how to pass.
No CAPTCHA: it would be a third-party script (rule 6), it is a genuine accessibility
barrier, and for a site at this volume the cheap checks are enough. Revisit if the
mailbox actually gets flooded; `docs/SECURITY.md` says what to reach for.

**CSP is generated, not written.** `astro.config.mjs` hashes every inline script and
style the build produced. A hand-maintained policy drifts the first time someone edits
an inline script, and the usual fix — `'unsafe-inline'` — throws away most of the value.

**`LAUNCHED` gates indexing.** While it is false: every page is `noindex`, no sitemap
is written, `robots.txt` disallows everything, and no structured data is emitted. A
site with placeholder legal pages should not be collecting search results it will later
have to clean up.

---

## Open questions

- **Company name and entity.** "Team Rodriguez" is the working name. Registering an LLC
  in North Carolina fixes `legalName`, the address, and the legal pages.
- **Domain.** Nothing is bought. `SITE_URL` and `COMPANY.origin` both wait on it.
- **Business email.** `devmiker@gmail.com` is what exists. A published personal Gmail
  attracts scraped spam and cannot be handed to a colleague later.
- **Mail provider.** The API calls Resend's HTTP API. Any provider with an HTTP send
  endpoint is a twenty-line change; the account and a verified sending domain are not.
- **Francisco's and Luis's entries.** Drafted from public information, both
  `published: false`. They need their own words, their real titles, and their consent.
- **Legal review.** `PRIVACY_REVIEWED` and `TERMS_SUPPLIED` are both false and the
  pages say so. The privacy text is an accurate description of what the site does,
  which is the hard part; it still needs a lawyer.

---

## Things that will bite you

- **Astro's style scoping does not reach into a child component.** A scoped rule in
  `ThemeToggle.astro` targeting a class on an `<Icon>` matches nothing, silently. This
  already happened once, and the toggle showed both the sun and the moon. Anchor such
  rules with `:global(...)` on a class unique to the parent.
- **`src/lib/contact.ts` is compiled by two toolchains.** Vite resolves extensionless
  imports; the API's Node16 ESM build requires explicit `.js`. That file therefore has
  no relative imports at all, deliberately. Keep it that way or the API build breaks.
- **The CSP hashes exact bytes.** Trimming a space in an inline script changes the hash.
  If the theme toggle stops working in a browser but not in the build, check the console
  for a CSP violation.
- **`npm run a11y` runs in jsdom.** No layout engine, so target-size and colour-contrast
  are checked by `src/styles/targetSize.test.ts` and `tokens.test.ts` instead. Automated
  testing catches roughly a third of real accessibility problems. Before launch, someone
  has to drive the site with a keyboard and a screen reader.
