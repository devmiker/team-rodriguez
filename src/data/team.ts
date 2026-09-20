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
 *  Francisco's and Luis's entries need their own words. What is here is a
 *  placeholder drafted from what is publicly visible, which is not the same as
 *  something they have agreed to have published about them — so both are
 *  `published: false` until they have seen it and said yes.
 *
 *  Photos go in `public/team/` as square images, at least 640×640, and the
 *  filename goes in `photo`. Leave `photo` undefined and the card renders
 *  initials in a tinted circle instead, which looks deliberate rather than
 *  unfinished — so there is no hurry about photography.
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
  /** Two or three sentences. What they do and what they are good at — not a CV. */
  bio: LocalizedText;
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
    location: "Raleigh, North Carolina",
    // TODO: rewrite in your own words. Drafted from your portfolio — it is a starting
    // point, not your biography.
    bio: {
      en: "Takes the first call and builds the sites. Front-end engineer, IT professional and veteran, working towards the kind of engineering that lasts — which in practice means choosing boring, durable technology over whatever launched last week, so you are not rebuilding in two years.",
      de: "Nimmt das erste Gespräch an und baut die Websites. Frontend-Entwickler, IT-Fachmann und Veteran, mit dem Anspruch, Technik zu bauen, die hält — also eher langweilige, haltbare Werkzeuge als das, was letzte Woche erschienen ist. Damit Sie in zwei Jahren nicht neu bauen müssen.",
      es: "Atiende la primera llamada y construye los sitios. Ingeniero de front-end, profesional de TI y veterano, orientado a la ingeniería que dura — lo que en la práctica significa elegir tecnología aburrida y duradera antes que lo que se lanzó la semana pasada, para que usted no tenga que rehacerlo en dos años.",
    },
    services: ["website", "shop", "care", "audit"],
    focus: ["TypeScript", "React", "Astro", "C#", "Accessibility"],
    speaks: ["en"],
    links: {
      github: "https://github.com/devmiker",
      linkedin: "https://www.linkedin.com/in/mike-l-rodriguez/",
      site: "https://master.d2uq24fdi4cg7.amplifyapp.com/",
    },
  },
  {
    id: "francisco-martinez",
    // TODO: Francisco needs to read this entry and agree to it before this goes true.
    published: false,
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
    links: {
      linkedin: "https://www.linkedin.com/in/francisco-martinez-me/",
    },
  },
  {
    id: "luis-inzunza",
    // TODO: Luis needs to read this entry and agree to it before this goes true.
    published: false,
    name: "Luis Inzunza",
    role: {
      // TODO: Luis's actual title — his LinkedIn is behind a sign-in wall, so this is
      // a guess and should not be published as one.
      en: "Software engineer",
      de: "Softwareentwickler",
      es: "Ingeniero de software",
    },
    // TODO: Luis's own words.
    bio: {
      en: "Placeholder. Not rendered while `published` is false — ask Luis for two sentences and his preferred title before turning this on.",
      de: "Platzhalter. Wird nicht gerendert, solange `published` false ist.",
      es: "Marcador de posición. No se renderiza mientras `published` sea false.",
    },
    services: ["website", "care"],
    focus: ["JavaScript"],
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
