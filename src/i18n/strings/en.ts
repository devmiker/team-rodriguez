/**
 * English — the source language.
 *
 * This table's shape defines `UiStrings`, so every other language must have exactly
 * these keys. A missing one is a TypeScript error rather than a blank space on a live
 * page, and an extra one is an error too, which catches a key that was renamed here
 * but not there.
 *
 * Keys are grouped by where the text appears. Keep the grouping; a flat table sorted
 * by accident becomes impossible to translate against.
 */

export const en = {
  // --- Site identity ----------------------------------------------------
  "site.name": "Team Rodriguez",
  "site.tagline": "Websites that earn their keep",
  "site.description":
    "A small software studio building fast, accessible, honestly-priced websites for small businesses.",

  // --- Accessibility and chrome ----------------------------------------
  "a11y.skipToContent": "Skip to content",
  "a11y.breadcrumb": "Breadcrumb",
  "nav.label": "Main",
  "nav.openMenu": "Open menu",
  "nav.closeMenu": "Close menu",
  "nav.home": "Home",
  "theme.label": "Theme",
  "theme.toLight": "Switch to light theme",
  "theme.toDark": "Switch to dark theme",
  "lang.label": "Language",
  "lang.current": "Current language",

  "translation.machine":
    "This page was translated automatically and has not yet been checked by a native speaker.",
  "translation.readOriginal": "Read the English original",

  // --- Footer -----------------------------------------------------------
  "footer.blurb":
    "We build and look after websites for small businesses. Based remotely, working with clients wherever they are.",
  "footer.navHeading": "Site",
  "footer.legalHeading": "Legal",
  "footer.contactHeading": "Get in touch",
  "footer.rights": "All rights reserved.",
  "footer.builtWith": "Built with Astro. No trackers, no cookie banner, no nonsense.",

  // --- Home -------------------------------------------------------------
  "home.title": "Team Rodriguez — websites for small businesses",
  "home.description":
    "A small software studio building fast, accessible websites for small businesses. Clear pricing, real engineering, no lock-in.",
  "home.hero.eyebrow": "Software studio",
  "home.hero.heading": "Websites that earn their keep",
  "home.hero.body":
    "Most small-business websites are slow, fragile, and cost more to run than they return. We build the other kind: fast, accessible, easy to change, and yours to keep.",
  "home.hero.cta": "Start a project",
  "home.hero.ctaSecondary": "See what we do",

  "home.proof.speed": "Pages that load in under a second",
  "home.proof.a11y": "Accessible to screen readers and keyboards, tested",
  "home.proof.own": "You own the code and the domain, always",

  "home.services.eyebrow": "What we do",
  "home.services.heading": "Four things, done properly",
  "home.services.body":
    "We deliberately do a narrow set of work. It means we are genuinely good at it rather than passably familiar with everything.",
  "home.services.cta": "All services",

  "home.process.eyebrow": "How it goes",
  "home.process.heading": "No surprises, at any point",
  "home.process.body":
    "You get a fixed price before we start, a link to watch it being built, and a site you can actually maintain when we hand it over.",

  "home.process.1.title": "We talk",
  "home.process.1.body":
    "Half an hour, free. What the business does, who needs to find it, what is not working now. If we are not the right fit we will say so.",
  "home.process.2.title": "You get a fixed price",
  "home.process.2.body":
    "A written scope and one number. Not an hourly estimate that grows. If the scope changes, we re-quote before doing the work.",
  "home.process.3.title": "We build in the open",
  "home.process.3.body":
    "A live preview link from day one. You see progress as it happens and give feedback while it is still cheap to act on.",
  "home.process.4.title": "You get the keys",
  "home.process.4.body":
    "The code, the domain, the hosting account. All in your name. Keep us on for maintenance or do not — the site works either way.",

  "home.team.eyebrow": "Who you work with",
  "home.team.heading": "A small team, on purpose",
  "home.team.body":
    "You talk to the people writing the code. Nothing is passed to an account manager and nothing is quietly offshored.",
  "home.team.cta": "Meet the team",

  "home.partners.eyebrow": "Good company",
  "home.partners.heading": "Small businesses we rate",
  "home.partners.body":
    "Clients and neighbours whose work we are glad to point people towards. No affiliate links, no payment for placement.",
  "home.partners.cta": "See them all",

  "home.cta.heading": "Tell us what you need",
  "home.cta.body":
    "A short description is plenty to start. We reply to everything within two working days.",
  "home.cta.button": "Start a project",

  // --- Services ---------------------------------------------------------
  "services.title": "Services",
  "services.description":
    "Website design and build, online shops, ongoing care, and audits for speed, accessibility and search.",
  "services.heading": "What we do",
  "services.lead":
    "A narrow set of services, priced up front. Everything below is a fixed quote after a free half-hour conversation.",
  "services.includes": "What is included",
  "services.who": "Who does this",
  "services.from": "From",
  "services.priceNote":
    "Indicative starting prices. Your quote is fixed in writing before any work begins.",
  "services.cta.heading": "Not sure which of these you need?",
  "services.cta.body":
    "Describe the problem rather than the solution and we will tell you what would actually fix it — including when the answer is that you do not need us.",

  // --- Work -------------------------------------------------------------
  "work.title": "Work",
  "work.description": "Selected projects and what they were built to do.",
  "work.heading": "Selected work",
  "work.lead":
    "Everything we have built, in two groups: work for businesses, and the projects we built to learn. Both are labelled, because they are not the same thing.",
  "work.pending":
    "Case studies are being written up. In the meantime, we are happy to walk you through recent work on a call — including the parts that did not go to plan.",
  "work.visit": "Visit the site",
  "work.stack": "Built with",
  "work.builtBy": "Built by",
  "work.opensNewTab": "(opens in a new tab)",
  "work.category.client": "For clients",
  "work.category.clientBlurb":
    "Sites built for a business, for its actual customers.",
  "work.category.practice": "Our own projects",
  "work.category.practiceBlurb":
    "Built to learn something, or for ourselves. Shown because how someone practises tells you as much as what they ship.",

  // --- Team -------------------------------------------------------------
  "team.title": "Team",
  "team.description": "The people who will actually do the work.",
  "team.heading": "The team",
  "team.lead":
    "Small, senior, and the same people from first call to handover. You will never be introduced to someone new halfway through.",
  "team.pending": "Team profiles are being written up.",
  "team.focus": "Focus",
  "team.offers": "What they take on",
  "team.speaks": "Works in",
  "team.profile": "Profile",

  // --- Partners ---------------------------------------------------------
  "partners.title": "Partners",
  "partners.description": "Small businesses and independents we are glad to recommend.",
  "partners.heading": "Small businesses we rate",
  "partners.lead":
    "Clients, collaborators and neighbours doing good work. Nobody pays to be on this page, and there are no affiliate links on it.",
  "partners.pending": "This page is being put together.",
  "partners.visit": "Visit",

  // --- Contact and form -------------------------------------------------
  "contact.title": "Contact",
  "contact.description":
    "Tell us about your project and we will reply within two working days.",
  "contact.heading": "Start a project",
  "contact.lead":
    "The more you tell us, the more useful our first reply will be. Nothing here commits you to anything.",
  "contact.direct.heading": "Prefer email?",
  "contact.direct.body": "Write to us directly at",
  "contact.response.heading": "What happens next",
  "contact.response.body":
    "We read every message ourselves. You will get a real reply from a person within two working days — usually with a question or two, and an honest view of whether we are the right people for it.",
  "contact.privacy":
    "What you send is emailed to us and nothing else. We do not store it in a database, add you to a mailing list, or pass it to anyone.",

  "form.name.label": "Your name",
  "form.name.error": "Please tell us what to call you.",
  "form.email.label": "Email address",
  "form.email.hint": "So we can reply. Nothing else is ever sent to it.",
  "form.email.error": "Please enter an email address we can reach you at.",
  "form.company.label": "Business name",
  "form.company.optional": "optional",
  "form.projectType.label": "What do you need?",
  "form.projectType.placeholder": "Choose one",
  "form.projectType.new": "A new website",
  "form.projectType.redesign": "A redesign of an existing site",
  "form.projectType.shop": "An online shop",
  "form.projectType.care": "Care for a site I already have",
  "form.projectType.audit": "An audit — speed, accessibility or search",
  "form.projectType.other": "Something else",
  "form.projectType.error": "Please pick the closest option.",
  "form.budget.label": "Rough budget",
  "form.budget.hint": "An honest range saves us both time. Pick the nearest.",
  "form.budget.unsure": "Not sure yet",
  "form.budget.under2k": "Under 2,000",
  "form.budget.2to5k": "2,000 – 5,000",
  "form.budget.5to10k": "5,000 – 10,000",
  "form.budget.over10k": "Over 10,000",
  "form.timeline.label": "When do you need it?",
  "form.timeline.flexible": "No fixed date",
  "form.timeline.month": "Within a month",
  "form.timeline.quarter": "Within three months",
  "form.timeline.later": "Later this year",
  "form.message.label": "Tell us about it",
  "form.message.hint":
    "What the business does, what is not working now, and what a good outcome looks like.",
  "form.message.error": "Please tell us a little about the project.",
  "form.message.tooLong": "That is longer than the form accepts. Please trim it a little.",
  "form.required": "required",
  "form.submit": "Send message",
  "form.submitting": "Sending…",
  "form.errorSummary.heading": "Please check the following",
  "form.success.heading": "Message sent",
  "form.success.body":
    "Thank you — it is in our inbox. You will hear back from a person within two working days.",
  "form.failure.heading": "That did not send",
  "form.failure.body":
    "Something went wrong at our end. Please try again, or email us directly — the address is just below.",
  "form.rateLimited":
    "That is a few messages in quick succession. Please wait a minute and try again.",
  "form.noscript":
    "This form works without JavaScript. Submitting it will take you to a confirmation page.",

  // --- Thanks (no-JavaScript form target) -------------------------------
  "thanks.title": "Message sent",
  "thanks.description": "Your message has been sent.",
  "thanks.heading": "Message sent",
  "thanks.body":
    "Thank you — your message is in our inbox. You will hear back from a person within two working days.",
  "thanks.back": "Back to the home page",

  // --- Legal ------------------------------------------------------------
  "privacy.title": "Privacy",
  "privacy.description": "What this website collects, which is close to nothing.",
  "privacy.heading": "Privacy",
  "privacy.pending":
    "This privacy notice is a plain-language description of what the site actually does. It has not yet been reviewed by a lawyer, and it must be before the site goes live.",

  "terms.title": "Terms",
  "terms.description": "The terms this website and our services are provided under.",
  "terms.heading": "Terms",
  "terms.pending":
    "Terms of service have not been written yet. They need to be drafted against the company's actual contracts before this page goes live.",

  "legal.lastUpdated": "Last updated",

  // --- Errors -----------------------------------------------------------
  "notFound.title": "Page not found",
  "notFound.heading": "That page is not here",
  "notFound.body":
    "The link may be out of date, or the address may have a typo in it. The pages below are all still where you left them.",
} as const;

/** The shape every language table must have. */
export type UiStrings = Record<keyof typeof en, string>;
export type UiKey = keyof typeof en;
