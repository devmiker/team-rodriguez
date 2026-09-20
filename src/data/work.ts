/**
 * Case studies.
 *
 * Same `published` gate as team and partners, and for a sharper reason here: a case
 * study names a client and makes claims about their business. Publish one only with
 * the client's agreement, and only with numbers you can actually show.
 *
 * `result` is the most valuable line on the page and the easiest one to fake. Put a
 * measured number in it or leave it undefined — "increased engagement" with nothing
 * behind it is worse than an empty field, because a prospective client who has been
 * lied to by three agencies already can spot it.
 *
 * TODO: the entry below is a shape example, unpublished. Replace it with real work.
 */

import type { LocalizedText } from "../i18n/locales";

export interface CaseStudy {
  /** Becomes the URL segment: /en/work/<slug>/ */
  slug: string;
  published: boolean;
  client: string;
  year: number;
  title: LocalizedText;
  /** The brief, in a sentence or two. */
  brief: LocalizedText;
  /** What was actually done. Three to five sentences. */
  approach: LocalizedText;
  /** A measured outcome, or nothing at all. Never a vague claim. */
  result?: LocalizedText;
  /** Technology names. Not translated. */
  stack: string[];
  /** The live site, if it is still up and still ours. */
  url?: string;
  /** Filename under `public/work/`. */
  image?: string;
  imageAlt?: LocalizedText;
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    /**
     * Real prior work — Mike and Francisco, 2021. Left unpublished because the write-up
     * below is a stub and the client has not been asked whether they want to be named.
     * Both of those are a conversation, not a code change.
     *
     * TODO: fill in `approach` and `result` properly, confirm with the client, publish.
     */
    slug: "pinche-cafe",
    published: false,
    client: "Pinché Café",
    year: 2021,
    title: {
      en: "A coffee company's first website",
      de: "Die erste Website eines Kaffeeunternehmens",
      es: "El primer sitio web de una cafetería",
    },
    brief: {
      en: "TODO: what the business needed and why they came to us.",
      de: "TODO: Was das Unternehmen brauchte und warum es zu uns kam.",
      es: "TODO: qué necesitaba el negocio y por qué acudió a nosotros.",
    },
    approach: {
      en: "TODO: what was built, and which decisions were hard. A case study in which nothing was difficult is not believed.",
      de: "TODO: Was gebaut wurde und welche Entscheidungen schwierig waren. Eine Fallstudie, in der nichts schwierig war, glaubt niemand.",
      es: "TODO: qué se construyó y qué decisiones fueron difíciles. Un caso donde nada fue difícil no resulta creíble.",
    },
    stack: ["React", "JavaScript", "HTML", "CSS"],
    url: "https://www.pinchecafe.co/",
  },
  {
    slug: "example-project",
    published: false,
    client: "Example Client",
    year: 2026,
    title: {
      en: "Shape example — not published",
      de: "Strukturbeispiel — nicht veröffentlicht",
      es: "Ejemplo de estructura — sin publicar",
    },
    brief: {
      en: "This entry exists to show the shape a case study takes. It is not rendered while `published` is false.",
      de: "Dieser Eintrag zeigt nur die Struktur einer Fallstudie. Er wird nicht gerendert, solange `published` false ist.",
      es: "Esta entrada solo muestra la estructura de un caso. No se renderiza mientras `published` sea false.",
    },
    approach: {
      en: "Describe what was built and why those decisions were made. Name the trade-offs — a case study that reads as though nothing was difficult is not believed.",
      de: "Beschreiben Sie, was gebaut wurde und warum so entschieden wurde. Benennen Sie die Abwägungen — eine Fallstudie, in der nichts schwierig war, glaubt niemand.",
      es: "Describa qué se construyó y por qué se tomaron esas decisiones. Nombre las renuncias: un caso donde nada fue difícil no resulta creíble.",
    },
    stack: ["Astro", "TypeScript"],
  },
];

export const publishedCaseStudies = (): CaseStudy[] =>
  CASE_STUDIES.filter((c) => c.published).sort((a, b) => b.year - a.year);

export const caseStudyBySlug = (slug: string): CaseStudy | undefined =>
  publishedCaseStudies().find((c) => c.slug === slug);
