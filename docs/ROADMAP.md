# Roadmap

Where the project is, and what has to happen before it can go live.

## Done

- Astro 7 + React islands + TypeScript strict, building 29 pages across three languages
- Design system: two-layer tokens, light and dark, every semantic pair verified AA
- i18n: English source, German and Spanish marked unreviewed and saying so on the page
- Header, footer, navigation, language switcher, theme toggle, mobile menu
- Home, services, work, team, partners, contact, thank-you, privacy, terms, 404
- Contact form: works without JavaScript, validated identically on both sides
- Azure Function endpoint with spam defence, rate limiting and header-injection guards
- Generated Content-Security-Policy, full security header set, launch gate on indexing
- 185 tests, plus an axe-core pass over every built page in both themes
- CI: typecheck, test, build, audit, accessibility, deploy (skips until a token exists)

## Before launch — blocking

These are in rough dependency order. Nothing below can be skipped.

1. **Register the entity.** Then fill `legalName`, `address` and `jurisdiction` in
   `src/data/company.ts`.
2. **Buy the domain.** Set `COMPANY.origin` and the `SITE_URL` repository variable.
3. **Business email.** Replace `COMPANY.email`, and set `CONTACT_TO` in the Static Web
   App's application settings.
4. **Mail provider.** Create the account, verify the sending domain, set
   `RESEND_API_KEY` and `CONTACT_FROM`. Then send a real test message through the live
   form and confirm it arrives — including the no-JavaScript path.
5. **Legal review.** A lawyer reads `src/data/legal.ts`; then set `PRIVACY_REVIEWED`.
   Write terms against your actual client contract; then set `TERMS_SUPPLIED`.
6. **Team entries.** Get Francisco's and Luis's own words, their real titles, and their
   agreement to appear. Then `published: true`.
7. **Real prices.** Confirm or replace the figures in `src/data/services.ts`.
8. **Manual accessibility pass.** Keyboard only, then a screen reader. The automated
   audit catches about a third of real problems.
9. **Flip `LAUNCHED` to `true`.** This turns on indexing, the sitemap and structured
   data all at once.
10. **Set `CSP_MODE=enforce`** — after watching the report-only policy in a real browser
    for a while and seeing no violations.

## Before launch — should do

- `public/og.png` (1200×630) for link previews, and `public/apple-touch-icon.png` (180×180)
- Team photographs, 640×640 or larger, into `public/team/`
- At least one real case study in `src/data/work.ts` with a measured result
- A first partner or two, with their agreement

## Later

- Case-study detail pages (the route and the data model already support them)
- A reviewed Spanish translation — Francisco works in Spanish, so `es` is the first
  candidate to flip to `reviewed: true`
- Shared-store rate limiting on the contact endpoint, if the mailbox ever gets flooded
- Turnstile or an equivalent, same condition; note it widens the CSP (see SECURITY.md)
