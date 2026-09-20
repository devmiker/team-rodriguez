# Deploying

The site is hosted on **Azure Static Web Apps**, free plan, deployed by GitHub Actions
from `main`. Everything the deploy needs is already in the repo; what follows is the
one-time setup, then the launch sequence.

Nothing here has been done yet. Work top to bottom.

---

## Why not GitHub Pages

Evaluated on 2026-09-20 and rejected. Recording it here so it does not get re-opened
every few months: GitHub Pages is a file server with no server-side runtime and no way
to set HTTP response headers.

That costs two things this site is built around.

**The contact form stops working.** It posts to `/api/contact`, which is the Azure
Function in `api/`. On Pages that is a 404, and both submission paths fail — the React
island's `fetch` and the no-JavaScript `<form method="post">` fallback that exists
precisely so the form survives a broken bundle.

**Every security header disappears.** `public/staticwebapp.config.json` is an Azure
file; Pages ignores it entirely. That silently drops HSTS, `X-Frame-Options`,
`Referrer-Policy`, `Permissions-Policy`, COOP, CORP, the pre-launch `X-Robots-Tag`, and
the build-generated Content-Security-Policy that `astro.config.mjs` derives by hashing
the inline scripts and styles the build actually produced. GitHub's position is that a
`<meta>` tag is the only option, and a `<meta>` CSP cannot express `frame-ancestors` at
all.

Cloudflare Pages is the credible alternative if Azure ever becomes a problem — a
`_headers` file replaces `staticwebapp.config.json` and Pages Functions replaces the
Azure Function. It is a day of porting, not a rewrite. GitHub Pages is not an
alternative for this site; it is a different, smaller site.

---

## What you need first

| | |
|---|---|
| Azure account | Free plan is enough. See the limits at the bottom. |
| Resend account | With a **verified sending domain**. This is the long pole — DNS records take time to propagate, so start it before you need it. |
| GitHub repo | Exists: `devmiker/team-rodriguez`. Nothing has been pushed yet. |

---

## 1. Get the code onto GitHub

Two files are in the wrong place first. Anything under `.github/` is blocked from being
written remotely, so the CI workflow was delivered as a chat attachment and the desktop
app saved it into `Claude outputs\` — inside the repo.

```powershell
cd C:\Users\devmi\repos\team-rodriguez

mkdir .github\workflows
move "Claude outputs\ci.yml"         .github\workflows\ci.yml
move "Claude outputs\dependabot.yml" .github\dependabot.yml
rmdir "Claude outputs"
```

Then clear out the leftovers. The three original photo JPEGs at the repo root were
processed into `public/team/*.webp` and are not needed:

```powershell
del mike_phtoto.jpeg, francisco_photo.jpeg, luis_phtoto.jpeg
```

Then push:

```powershell
npm install
npm run verify
git add -A
git commit -F <message file>
git push -u origin main
```

`npm run verify` is `astro check` → `vitest` → `astro build` → axe. The pre-push hook
in `.githooks/` runs it anyway; running it yourself first means finding problems before
a failed push.

The first push will run CI and **skip the deploy** with a warning, because the
deployment token does not exist yet. That is intended — `main` stays green while you do
the next step.

---

## 2. Create the Static Web App

In the Azure portal: **Create a resource → Static Web App**.

| Field | Value |
|---|---|
| Plan type | **Free** |
| Region | Pick the one nearest your customers |
| Deployment source | **Other** |

**Choose "Other", not GitHub.** This is the one setting that matters and it is easy to
get wrong, because GitHub is the obvious answer.

If you connect Azure to GitHub here, Azure writes *its own* workflow file into
`.github/workflows/` and commits it to your repo. You then have two workflows deploying
the same site, and Azure's generated one does not run `npm run verify` — so it will
happily publish a build with failing tests, a type error, or an accessibility
regression. The whole point of `ci.yml` is that deploy is gated on verify. Picking
"Other" leaves that gate in place and lets the existing workflow do the deploying.

---

## 3. Save the deployment token

In the new resource: **Overview → Manage deployment token**. Copy it.

In GitHub: **Settings → Secrets and variables → Actions → New repository secret**.

| Name | Value |
|---|---|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | the token you just copied |

The name has to match exactly — `ci.yml` checks for it and skips the deploy if it is
empty. It is a secret, not a variable: it grants publish rights to the site.

Push anything to `main` (or re-run the last workflow) and the deploy job will run for
real. Azure gives you a URL like `https://<random-name>.azurestaticapps.net`.

---

## 4. Configure mail

The function reads three values. Without them it logs an error and the submission is
**not delivered** — the visitor still sees a success message, so this failure is silent
by design and you will not notice it from the outside.

In the portal: **your Static Web App → Settings → Environment variables** (older portals
call it Configuration → Application settings).

| Name | Value |
|---|---|
| `RESEND_API_KEY` | `re_...` from Resend |
| `CONTACT_TO` | where enquiries should land |
| `CONTACT_FROM` | `Team Rodriguez <website@your-verified-domain.com>` |

`CONTACT_FROM` must be on a domain **verified in Resend**. An unverified sender is
rejected by Resend, and even if it were not, it would fail SPF and DKIM at the
recipient and land in spam.

These live in Azure, never in the repo. `api/local.settings.json.example` shows the same
three for local development; copy it to `api/local.settings.json`, which is gitignored.

Save, then restart the app so the function picks them up.

---

## 5. Test the form properly

Both paths, because they fail independently:

1. **With JavaScript on** — submit and confirm the inline success state, then confirm
   the mail arrives.
2. **With JavaScript disabled** — submit again. The form should POST, the browser
   should land on `/en/thanks/`, and the mail should arrive. This is the path that
   proves the progressive-enhancement fallback actually works in production, and it is
   the one nobody ever tests.

Then check the spam defences did not catch you: the honeypot field must stay empty, and
there is a minimum fill time, so do not submit in under a couple of seconds.

---

## 6. Custom domain

**Your Static Web App → Custom domains → Add.** Azure walks you through the DNS records
and issues a certificate that renews itself. The free plan allows two domains, which is
exactly enough for `example.com` and `www.example.com`.

Buy the domain first. Everything in the launch sequence below depends on it.

---

## 7. The launch sequence

Do these **in order**. Each one is safe on its own; doing them out of order publishes
something you cannot un-publish.

### 7.1 Set `SITE_URL`

GitHub → **Settings → Secrets and variables → Actions → Variables** (not secrets — this
is public information and it belongs in the build log).

| Name | Value |
|---|---|
| `SITE_URL` | `https://your-domain.com` |

Until this is set, `astro.config.mjs` leaves `site` undefined and no canonical URL or
sitemap can be generated.

### 7.2 Flip `LAUNCHED`

`LAUNCHED` in `src/data/company.ts`, currently `false`. It is one switch controlling
four things, which is why it is one switch:

| | `false` | `true` |
|---|---|---|
| `robots.txt` | `Disallow: /` | `Allow: /` + sitemap link |
| `sitemap.xml` | not written | every non-noindex page |
| `X-Robots-Tag` | `noindex, nofollow` on every response | removed |
| JSON-LD | not emitted | emitted |

Do not flip it while the legal pages are still placeholders. `PRIVACY_REVIEWED` and
`TERMS_SUPPLIED` in `src/data/legal.ts` are both `false` and every affected page says so
out loud. Search engines indexing placeholder legal text is a mess to clean up later.

### 7.3 Turn the CSP from report-only to enforcing

**Last**, and only after watching it.

The policy is generated at build time from hashes of the inline scripts and styles the
build produced, so it is exact — but exact policies break things in ways only real
traffic reveals. It ships **report-only** by default, which means violations are logged
to the browser console and nothing is blocked.

Load the live site, open DevTools, and click through every page in all three languages
with the theme toggle and the mobile nav. Zero violations for a while, then:

GitHub → Actions variables:

| Name | Value |
|---|---|
| `CSP_MODE` | `enforce` |

That switches the header from `Content-Security-Policy-Report-Only` to
`Content-Security-Policy` on the next deploy. If the theme toggle or the contact form
breaks immediately after, it is a CSP violation — check the console, and unset the
variable to roll back.

---

## The free plan, concretely

| | Free | Note |
|---|---|---|
| Managed Azure Functions | ✅ | The contact form works. This is the part people assume is paid. |
| Custom domains | 2 | `example.com` + `www` |
| SSL certificate | ✅ | Auto-renewing |
| Max app size | 250 MB | This site is a rounding error against that |
| Staging environments | 3 | One per pull request |
| SLA | ❌ | No uptime guarantee. Fine for a studio site; know it before you promise a client uptime on *their* site. |

Upgrading is **Settings → Hosting plan → Standard** and takes effect without a
redeploy, so starting free costs nothing later.

---

## Things that will bite you

**The API runtime is a version pin that expires.** `platform.apiRuntime` in
`public/staticwebapp.config.json` is `node:22`. Azure retires Node versions on a
schedule; when 22 is retired, the function stops running and mail stops sending with no
code change and no failing build. `src/lib/hosting.test.ts` pins the supported list and
checks it agrees with `package.json`'s `engines.node` — when you bump one, the test
tells you about the other.

**A silent mail failure looks like success.** If `RESEND_API_KEY`, `CONTACT_TO` or
`CONTACT_FROM` is missing, the function logs an error and returns the normal success
response. That is deliberate — a submitter should never see your infrastructure — but it
means the only way to know mail is broken is to look. Check the function logs after any
configuration change, and send yourself a test message.

**Caught spam also looks like success.** The honeypot, the minimum fill time and the
rate limiter all return the same response a real submission gets, because telling a bot
which check it failed tells it how to pass. If a real enquiry seems to vanish, that is
the first place to look.

**Rate limiting is per-instance and in memory.** It resets when the function instance
recycles and is not shared across instances. It is a speed bump, not a control. See
`docs/SECURITY.md`.

**`skip_api_build: true` is load-bearing.** The API is compiled in the verify job and
uploaded already built. `api/tsconfig.json` has `rootDir: ".."` so it can compile the
shared validator from `src/lib/contact.ts` into the same output tree — a detail the
platform's own build would not reproduce. If you ever remove that flag, the API build
will fail on the server in a way that is hard to read.

**`.github/` cannot be written from a Claude session.** It is blocked. Workflow changes
arrive as chat attachments and land in `Claude outputs\`, which is gitignored. Move
them by hand.
