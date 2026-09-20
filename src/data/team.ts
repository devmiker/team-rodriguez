/**
 * The team, and what each person offers.
 *
 * Each member carries their own `services` — the ids of the entries in
 * `src/data/services.ts` they actually take on. The team page renders those against
 * the person, and the services page can show who does each one. Keeping them as ids
 * rather than free text means a service cannot be advertised against a person under a
 * name that does not match the name on the services page.
 *
 * `published` is the gate. An entry with `published: false` is not rendered anywhere,
 * is not in the JSON-LD, and does not appear in the built HTML at all — so a draft
 * profile cannot leak onto a live page.
 *
 * That gate matters more than it looks. Publishing a person's name, photo, employer
 * and specialisms is publishing personal data about them. Get each person's explicit
 * agreement, and let them read their own entry, before flipping their flag.
 *
 * ── TODO ─────────────────────────────────────────────────────────────────────
 *  Francisco and Luis are published at Mike's request. Two things still need
 *  doing, and neither is a code change:
 *
 *    1. Both should read their own entry and approve it. It publishes their
 *       name, their specialisms and a link to their profile.
 *    2. Both need a `bio` in their own words, and Luis needs his real title.
 *
 *  `bio` is optional on purpose. A card without one renders cleanly — name,
 *  role, what they take on, what they work in — rather than carrying a sentence
 *  someone else invented for them. An empty field is honest; a fabricated one
 *  is not, and it is the kind of thing a colleague notices.
 *
 *  Locations are regions, not cities, for the reason given in company.ts: a
 *  person's home town is personal information and a remote studio gains nothing
 *  from publishing it. Leave `location` undefined to omit it entirely.
 *
 *  Photos live in `public/team/` and the filename goes in `photo`. They are
 *  square WebP at 256x256 — the card renders the avatar at 64px, so 256 covers a
 *  2x display with room to spare, and the three of them together weigh under
 *  20 KB. Anything larger is bytes nobody sees.
 *
 *  Leave `photo` undefined and the card renders initials in a tinted circle
 *  instead, which looks deliberate rather than unfinished — so a new colleague
 *  can be added before there is a photograph of them.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { LocalizedText } from "../i18n/locales";
import { SERVICES } from "./services";

export interface TeamMember {
  id: string;
  published: boolean;
  name: string;
  /** Job title, per language. */
  role: LocalizedText;
  /** Where they are. Optional — some people would rather not say. */
  location?: string;
  /**
   * Two or three sentences, in their own words. Optional: a card without a bio
   * looks deliberate, and is far better than one carrying words its subject never
   * wrote. Leave it undefined until the person has supplied one.
   */
  bio?: LocalizedText;
  /** Which services in `SERVICES` this person takes on. Ids, checked at build time. */
  services: string[];
  /** Short technology labels. Not translated: these are proper nouns. */
  focus: string[];
  /** Languages they can work in, as locale codes plus any extras. */
  speaks?: string[];
  /** Filename under `public/team/`, e.g. "mike.webp". Undefined renders initials. */
  photo?: string;
  links?: {
    github?: string;
    linkedin?: string;
    site?: string;
  };
}

export const TEAM: TeamMember[] = [
  {
    id: "mike-rodriguez",
    published: true,
    name: "Mike Rodriguez",
    role: {
      en: "Founder, software engineer",
      de: "Gründer, Softwareentwickler",
      es: "Fundador, ingeniero de software",
    },
    location: "United States · Remote",
    // TODO: rewrite in your own words. Drafted from your portfolio — it is a starting
    // point, not your biography.
    bio: {
      en: "Takes the first call and builds the sites. Front-end engineer, IT professional and veteran, working towards the kind of engineering that lasts — which in practice means choosing boring, durable technology over whatever launched last week, so you are not rebuilding in two years.",
      de: "Nimmt das erste Gespräch an und baut die Websites. Frontend-Entwickler, IT-Fachmann und Veteran, mit dem Anspruch, Technik zu bauen, die hält — also eher langweilige, haltbare Werkzeuge als das, was letzte Woche erschienen ist. Damit Sie in zwei Jahren nicht neu bauen müssen.",
      es: "Atiende la primera llamada y construye los sitios. Ingeniero de front-end, profesional de TI y veterano, orientado a la ingeniería que dura — lo que en la práctica significa elegir tecnología aburrida y duradera antes que lo que se lanzó la semana pasada, para que usted no tenga que rehacerlo en dos años.",
    },
    services: ["website", "shop", "care", "audit"],
    focus: ["TypeScript", "React", "Astro", "C#", "Accessibility"],
    speaks: ["en", "es", "de"],
    photo: "mike.webp",
    links: {
      github: "https://github.com/devmiker",
      linkedin: "https://www.linkedin.com/in/mike-l-rodriguez/",
      site: "https://master.d2uq24fdi4cg7.amplifyapp.com/",
    },
  },
  {
    id: "francisco-martinez",
    published: true,
    name: "Francisco Martinez",
    role: {
      en: "Software engineer, front end",
      de: "Softwareentwickler, Frontend",
      es: "Ingeniero de software, front-end",
    },
    location: "Los Angeles, California",
    // TODO: Francisco's own words. This is drafted from his public profile and the
    // Pinché Café project, and should be replaced rather than approved as-is.
    bio: {
      en: "Front-end engineer. Works in English and Spanish, which is why the Spanish side of a project is built rather than translated at the end.",
      de: "Frontend-Entwickler. Arbeitet auf Englisch und Spanisch — weshalb die spanische Seite eines Projekts gebaut und nicht erst am Ende übersetzt wird.",
      es: "Ingeniero de front-end. Trabaja en inglés y español, por eso la parte en español de un proyecto se construye en vez de traducirse al final.",
    },
    services: ["website", "shop"],
    focus: ["JavaScript", "React", "HTML", "CSS"],
    speaks: ["en", "es"],
    photo: "francisco.webp",
    links: {
      linkedin: "https://www.linkedin.com/in/francisco-martinez-me/",
    },
  },
  {
    id: "luis-inzunza",
    published: true,
    name: "Luis Inzunza",
    role: {
      // TODO: Luis's actual title. His LinkedIn sits behind a sign-in wall, so this
      // is the generic form rather than a guess dressed up as a fact. Ask him.
      en: "Software engineer",
      de: "Softwareentwickler",
      es: "Ingeniero de software",
    },
    // No bio: nobody has asked Luis for one yet, so there is nothing honest to put
    // here. The card renders without it. TODO: two sentences from Luis.
    services: ["website", "care"],
    focus: ["JavaScript"],
    photo: "luis.webp",
    links: {
      linkedin: "https://www.linkedin.com/in/luis-inzu/",
    },
  },
];

/** The only list a view should render. Draft entries never reach the HTML. */
export const publishedTeam = (): TeamMember[] => TEAM.filter((m) => m.published);

/** Published members who offer a given service, for the services page. */
export const teamForService = (serviceId: string): TeamMember[] =>
  publishedTeam().filter((m) => m.services.includes(serviceId));

/**
 * Fails the build if a member lists a service that does not exist.
 *
 * Run from `src/middleware.ts`, so it runs before any page renders rather than in
 * whichever page happened to remember to call it. A silent typo here would show a
 * person offering nothing on the team page, which is the kind of bug nobody notices
 * until a client asks about it.
 */
export function assertServiceIdsExist(): void {
  const known = new Set(SERVICES.map((s) => s.id));
  for (const member of TEAM) {
    for (const id of member.services) {
      if (!known.has(id)) {
        throw new Error(
          `Team member ${JSON.stringify(member.id)} lists unknown service ${JSON.stringify(id)}. ` +
            `Known services: ${[...known].join(", ")}`,
        );
      }
    }
  }
}

/** "Mike Rodriguez" → "MR". One letter for a single-word name. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}
