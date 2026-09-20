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
 * TODO: every entry below is a placeholder. Replace them with real businesses.
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
  {
    id: "placeholder-one",
    published: false,
    name: "Placeholder Business",
    blurb: {
      en: "Placeholder entry. Not rendered while `published` is false.",
      de: "Platzhalter-Eintrag. Wird nicht gerendert, solange `published` false ist.",
      es: "Entrada de marcador de posición. No se renderiza mientras `published` sea false.",
    },
    category: { en: "Trade", de: "Handwerk", es: "Oficio" },
    url: "https://example.com",
  },
  {
    id: "placeholder-two",
    published: false,
    name: "Another Placeholder",
    blurb: {
      en: "Placeholder entry. Not rendered while `published` is false.",
      de: "Platzhalter-Eintrag. Wird nicht gerendert, solange `published` false ist.",
      es: "Entrada de marcador de posición. No se renderiza mientras `published` sea false.",
    },
    category: { en: "Hospitality", de: "Gastronomie", es: "Hostelería" },
    url: "https://example.com",
  },
];

export const publishedPartners = (): Partner[] => PARTNERS.filter((p) => p.published);
