# Team Rodriguez

Marketing site for a small software studio that builds websites for small businesses.
Astro 7, React islands, TypeScript, three languages, light and dark, no third-party
anything.

> **Not live yet.** `LAUNCHED` in `src/data/company.ts` is `false`, which means every
> page is `noindex`, no sitemap is written and `robots.txt` disallows everything. See
> [`docs/ROADMAP.md`](docs/ROADMAP.md) for what has to happen first.

---

## Running it

Node 22.12 or newer.

```bash
npm install
npm run dev          # http://localhost:4321  → redirects to /en/
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Static build into `dist/` |
| `npm run preview` | Serve the built output |
| `npm run check` | `astro check` — TypeScript across `.astro`, `.ts` and `.tsx` |
| `npm test` | Vitest |
| `npm run a11y` | axe-core over every built page, in both themes |
| `npm run verify` | All four, in order. What CI runs, and the pre-push hook. |

The API is a separate npm project:

```bash
npm --prefix api install
npm --prefix api run build
```

To run the whole thing locally including the function, install the
[Azure Static Web Apps CLI](https://learn.microsoft.com/azure/static-web-apps/local-development)
and copy `api/local.settings.json.example` to `api/local.settings.json`.

---

## Where things are

```
src/data/       The facts: company, services, team, partners, work, legal
src/i18n/       Locales, translated route slugs, string tables
src/lib/        contact (shared with the API), csp, seo, theme
src/components/ .astro components; islands/ holds the two React ones
src/views/      One per page
src/styles/     tokens.css is the palette; nothing else may contain a colour
api/            The Azure Function behind the contact form
docs/           SECURITY.md, ROADMAP.md
AGENTS.md       The working context. Read this before changing anything.
```

---

## The things most likely to surprise you

**Every fact about the company is in one file.** `src/data/company.ts`. Renaming the
company, changing the domain or the email is a one-file edit that updates the site, the
structured data, the legal pages and the footer together.

**Content is gated, not invented.** Team members, partners and case studies each have a
`published` flag, and an unpublished entry does not appear in the built HTML at all.
Pages with nothing published say so honestly rather than showing invented clients.

**Slugs are translated.** `/en/services/`, `/de/leistungen/`, `/es/servicios/` are the
same page. Nothing hard-codes a path — `pathFor()` in `src/i18n/routes.ts` builds them
all, and so the navigation, language switcher, hreflang tags and sitemap cannot drift
apart.

**The contact form works without JavaScript.** It server-renders as a real
`<form method="post">`. React upgrades it in place to an inline submit with field-level
errors.

**Validation is one module, run twice.** `src/lib/contact.ts` is imported by both the
browser island and the Azure Function.

**The CSP is generated from the build output.** Every inline script and style is hashed
at build time, so the policy cannot drift from what shipped.

**`npm run verify` runs before every push**, via a git hook that `npm install` sets up.
`git push --no-verify` skips it.

---

## Deploying

Azure Static Web Apps, from `.github/workflows/ci.yml` on a push to `main`. The deploy
step skips with a warning until `AZURE_STATIC_WEB_APPS_API_TOKEN` exists as a
repository secret, so `main` stays green in the meantime.

**Repository variables** (Settings → Secrets and variables → Actions → Variables):

| Name | Effect |
|---|---|
| `SITE_URL` | Production origin. Until set, no canonical URLs and no sitemap. |
| `CSP_MODE` | `enforce` makes the Content-Security-Policy blocking. Leave unset at first. |

**Static Web App application settings** (the API reads these; none are in the repo):

| Name | Effect |
|---|---|
| `CONTACT_TO` | Where enquiries are delivered |
| `CONTACT_FROM` | From address, on a domain verified with the mail provider |
| `RESEND_API_KEY` | Mail provider key |

---

## Accessibility

Built to WCAG 2.2 AA. Every semantic colour pair is contrast-tested against the real
stylesheet in both themes; every built page is audited with axe-core in both themes;
pointer target sizes are checked against the declarations.

Automated testing catches roughly a third of real accessibility problems. Before
launch, someone has to drive the site with a keyboard only, and then with a screen
reader. See [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Security

See [`docs/SECURITY.md`](docs/SECURITY.md) — including a section on what it does *not*
protect against.
