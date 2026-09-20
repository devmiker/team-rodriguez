/**
 * The work gallery.
 *
 * Two categories, and the split is the whole point of the page.
 *
 *   "client"    — built for a business, for its actual customers.
 *   "practice"  — built to learn something, or for ourselves.
 *
 * Showing both is good: it is more work, it shows a trajectory, and a prospective
 * client would rather see six honest things than two polished ones. But they have to
 * be LABELLED. A prospect judges a studio by the weakest thing presented as
 * representative, not by the average — so a to-do app under "practice, learning DOM
 * manipulation" reads as charming, while the same app in a row headed "our work"
 * quietly undercuts every price on the services page.
 *
 * So: never move something into `client` to pad that column. The column being short
 * is a fact about the business today, not a problem to be styled around.
 *
 * `published` works as it does everywhere else in `src/data/`: false means the entry
 * does not reach the built HTML at all.
 *
 * ── Screenshots ──────────────────────────────────────────────────────────────
 *  `image` is a filename under `public/work/`. Without one, the card draws a
 *  browser frame with the site's domain in it — a deliberate design, not a
 *  broken-image gap, so the page is presentable before anyone has taken a
 *  screenshot. See public/work/README.md for sizes.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { LocalizedText } from "../i18n/locales";
import { TEAM } from "./team";

export const PROJECT_CATEGORIES = ["client", "practice"] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export interface Project {
  slug: string;
  published: boolean;
  category: ProjectCategory;
  /** The site or project's own name. Not translated — it is a proper noun. */
  name: string;
  url: string;
  year?: number;
  /** Team member ids. Checked against `TEAM` at build time. */
  builtBy: string[];
  /** One or two sentences: what it is, and what it was for. */
  summary: LocalizedText;
  /** Technology names. Not translated. */
  stack: string[];
  /** Filename under `public/work/`. Undefined draws the browser-frame placeholder. */
  image?: string;
  imageAlt?: LocalizedText;
}

export const PROJECTS: Project[] = [
  {
    /**
     * Confirmed by Mike, 2026-09-20: this is the team's own project, built together
     * and published on a domain they bought. Not client work.
     *
     * So it stays in `practice`, and that is not a demotion — it is the most
     * substantial thing in the gallery. A team that buys a domain and ships a
     * complete site for a business that is not paying them is showing exactly the
     * thing a prospective client wants to know: that they finish things.
     *
     * Do not move it to `client` later "because it looks real". It is real; it just
     * was not for a client, and the column headings on the page say what they mean.
     */
    slug: "pinche-cafe",
    published: true,
    category: "practice",
    name: "Pinché Café",
    url: "https://www.pinchecafes.com/",
    year: 2021,
    builtBy: ["mike-rodriguez", "francisco-martinez"],
    summary: {
      en: "A coffee house site — who they are, the menu with prices, and the opening hours. Our own project: built as a team and put live on a domain we bought.",
      de: "Die Website eines Cafés — wer dahintersteckt, die Karte mit Preisen und die Öffnungszeiten. Unser eigenes Projekt: im Team gebaut und auf einer selbst gekauften Domain veröffentlicht.",
      es: "El sitio de una cafetería: quiénes son, la carta con precios y los horarios. Proyecto propio: hecho en equipo y publicado en un dominio que compramos nosotros.",
    },
    stack: ["React", "JavaScript", "HTML", "CSS"],
  },
  {
    slug: "tic-tac-toe",
    published: true,
    category: "practice",
    name: "Tic Tac Toe",
    url: "https://master.dpr5uhurcolxt.amplifyapp.com/",
    builtBy: ["mike-rodriguez"],
    summary: {
      en: "A two-player game in the browser. Small on purpose: game state, turn handling and win detection, with no library doing the thinking.",
      de: "Ein Zwei-Spieler-Spiel im Browser. Bewusst klein: Spielstand, Zugwechsel und Gewinnerkennung — ohne Bibliothek, die das Denken übernimmt.",
      es: "Un juego para dos en el navegador. Pequeño a propósito: estado del juego, turnos y detección de victoria, sin ninguna librería que piense por ti.",
    },
    stack: ["React", "JavaScript"],
  },
  {
    slug: "todo-app",
    published: true,
    category: "practice",
    name: "To Do List",
    url: "https://devmiker.github.io/todoApp/",
    builtBy: ["mike-rodriguez"],
    summary: {
      en: "Add a task, complete it, watch it move. A study in DOM manipulation without a framework — the groundwork that makes the framework worth using later.",
      de: "Aufgabe hinzufügen, abhaken, verschieben. Eine Übung in DOM-Manipulation ohne Framework — die Grundlage, die ein Framework später überhaupt sinnvoll macht.",
      es: "Añadir una tarea, completarla, verla moverse. Un ejercicio de manipulación del DOM sin framework: la base que hace que un framework valga la pena después.",
    },
    stack: ["JavaScript", "HTML", "CSS"],
  },
];

/**
 * Mike's personal portfolio is deliberately NOT in this list.
 *
 * It is linked from his team card instead, which is where "more about this person"
 * belongs. Three reasons it does not go in the gallery: a portfolio is an about-page
 * rather than something built for someone; it is an older, weaker version of exactly
 * what this site is selling, so putting it in a gallery invites the comparison; and
 * it is already one click away for anyone who wants it.
 */

export const publishedProjects = (): Project[] => PROJECTS.filter((p) => p.published);

export const projectsIn = (category: ProjectCategory): Project[] =>
  publishedProjects().filter((p) => p.category === category);

/** "https://www.pinchecafes.com/" → "pinchecafes.com", for the browser-frame label. */
export function displayDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Fails the build if a project credits someone who is not on the team.
 *
 * Run from `src/middleware.ts`. A typo here would silently drop a name from a credit
 * line, which is the kind of thing a colleague notices before you do.
 */
export function assertBuiltByIdsExist(): void {
  const known = new Set(TEAM.map((m) => m.id));
  for (const project of PROJECTS) {
    for (const id of project.builtBy) {
      if (!known.has(id)) {
        throw new Error(
          `Project ${JSON.stringify(project.slug)} credits unknown team member ` +
            `${JSON.stringify(id)}. Known ids: ${[...known].join(", ")}`,
        );
      }
    }
  }
}
