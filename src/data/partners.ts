/**
 * Small businesses the studio promotes.
 *
 * Same `published` gate as the team: an unpublished entry never reaches the HTML. Do
 * not list a business before it has agreed to appear. Using someone's name and logo to
 * imply a relationship they have not confirmed is the kind of thing that ends
 * relationships.
 *
 * Outbound links carry `rel="noopener"` (see PartnerCard) — `noreferrer` is
 * deliberately *not* set, because a partner seeing referral traffic from this site is
 * part of the point. `nofollow` is not set either: these are genuine, unpaid
 * recommendations, which is exactly what a followed link is supposed to mean. If a
 * placement is ever paid for, that entry must set `sponsored: true`, which adds
 * `rel="sponsored"` and a visible label — both are required, not optional.
 *
 * Entries are real businesses; each stays unpublished until its owner agrees.
 */

import type { LocalizedText } from "../i18n/locales";

export interface Partner {
  id: string;
  published: boolean;
  name: string;
  /** What they do, in one sentence. */
  blurb: LocalizedText;
  /** Free-text category shown as a tag, per language. */
  category: LocalizedText;
  url: string;
  /** Filename under `public/partners/`. Undefined renders a lettermark instead. */
  logo?: string;
  /** True only if money changed hands for this placement. Adds rel and a label. */
  sponsored?: boolean;
}

export const PARTNERS: Partner[] = [
  /*
   * Both are businesses we built sites for, added 2026-11-11 at Mike's request and
   * left unpublished until each owner has agreed to appear (see the note at the top).
   * Flip `published` only after they have seen this wording.
   */
  {
    id: "prolift-junk-haulers",
    published: false,
    name: "Pro Lift Junk Haulers",
    blurb: {
      en: "Junk removal and trailer rentals across Riverside and the Inland Empire, in English and Spanish.",
      de: "Entrümpelung und Anhängervermietung in Riverside und dem Inland Empire, auf Englisch und Spanisch.",
      es: "Retiro de basura y alquiler de remolques en Riverside y el Inland Empire, en inglés y en español.",
    },
    category: { en: "Junk removal", de: "Entrümpelung", es: "Retiro de basura" },
    url: "https://www.proliftjunkhauler.com/",
  },
  {
    id: "ejs-inspiring-hands",
    published: false,
    name: "E&J's Inspiring Hands Foundation",
    blurb: {
      en: "A nonprofit in Perris, California helping neighbours into jobs, training and education, and feeding the community while it does.",
      de: "Eine gemeinnützige Organisation in Perris, Kalifornien, die Menschen in Arbeit, Ausbildung und Bildung hilft und dabei die Nachbarschaft mit Essen versorgt.",
      es: "Una organización sin fines de lucro en Perris, California, que ayuda a sus vecinos a encontrar empleo, formación y estudios, y alimenta a la comunidad mientras lo hace.",
    },
    category: { en: "Nonprofit", de: "Gemeinnützig", es: "Sin fines de lucro" },
    url: "https://www.ejsinspiringhands.org/",
  },
];

export const publishedPartners = (): Partner[] => PARTNERS.filter((p) => p.published);
