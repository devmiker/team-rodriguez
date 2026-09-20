/**
 * The services the studio sells.
 *
 * Deliberately a short list. Four things described concretely sell better than twelve
 * described vaguely, and a small team that claims twelve is not believed.
 *
 * Prices are numbers rather than pre-formatted strings so they can be rendered with
 * `Intl.NumberFormat` in the visitor's language and the currency stays consistent.
 * They are starting points, and the copy says so — see `services.priceNote`.
 *
 * TODO: the figures below are placeholders chosen to be plausible for a small studio.
 * Replace them with real numbers before launch, or set `priceFrom` to undefined on a
 * service to show no figure at all rather than a made-up one.
 */

import type { LocalizedText } from "../i18n/locales";

export interface Service {
  id: string;
  /** Icon key in `src/components/iconPaths.ts`. */
  icon: string;
  name: LocalizedText;
  summary: LocalizedText;
  /** Three to five concrete deliverables. Vague bullets are worse than none. */
  includes: LocalizedText[];
  priceFrom?: number;
  currency: "USD" | "EUR";
}

export const SERVICES: Service[] = [
  {
    id: "website",
    icon: "layout",
    currency: "USD",
    priceFrom: 875,
    name: {
      en: "Website design and build",
      de: "Website gestalten und bauen",
      es: "Diseño y desarrollo web",
    },
    summary: {
      en: "A complete site, designed around what your customers actually need to do, and built to load fast on a phone on a bad connection.",
      de: "Eine vollständige Website, gestaltet um das, was Ihre Kundschaft wirklich erledigen will — und gebaut, um auch auf dem Handy bei schlechter Verbindung schnell zu laden.",
      es: "Un sitio completo, diseñado en torno a lo que sus clientes necesitan hacer de verdad y construido para cargar rápido en un móvil con mala conexión.",
    },
    includes: [
      {
        en: "Design in your brand, or a brand if you do not have one yet",
        de: "Gestaltung in Ihrer Marke — oder eine Marke, falls Sie noch keine haben",
        es: "Diseño con su marca, o una marca si todavía no la tiene",
      },
      {
        en: "Up to eight pages of copy we write with you",
        de: "Bis zu acht Seiten Text, die wir gemeinsam mit Ihnen schreiben",
        es: "Hasta ocho páginas de texto que redactamos con usted",
      },
      {
        en: "Contact forms, maps, opening hours, whatever the business needs",
        de: "Kontaktformulare, Karten, Öffnungszeiten — was das Unternehmen eben braucht",
        es: "Formularios de contacto, mapas, horarios y lo que el negocio necesite",
      },
      {
        en: "Accessibility tested with a screen reader and a keyboard",
        de: "Barrierefreiheit mit Screenreader und Tastatur getestet",
        es: "Accesibilidad probada con lector de pantalla y teclado",
      },
      {
        en: "Everything handed over in your name: code, domain, hosting",
        de: "Alles auf Ihren Namen übergeben: Code, Domain, Hosting",
        es: "Todo entregado a su nombre: código, dominio y alojamiento",
      },
    ],
  },
  {
    id: "shop",
    icon: "cart",
    currency: "USD",
    priceFrom: 1625,
    name: {
      en: "Online shop",
      de: "Online-Shop",
      es: "Tienda en línea",
    },
    summary: {
      en: "Selling online without handing a third of your margin to a platform. Real payments, real stock, a checkout people finish.",
      de: "Online verkaufen, ohne ein Drittel Ihrer Marge an eine Plattform abzugeben. Echte Zahlungen, echter Bestand, ein Bezahlvorgang, den Leute abschließen.",
      es: "Vender en línea sin regalar un tercio de su margen a una plataforma. Pagos reales, stock real y un pago que la gente termina.",
    },
    includes: [
      {
        en: "Card payments through Stripe, in your own account",
        de: "Kartenzahlung über Stripe, auf Ihrem eigenen Konto",
        es: "Pagos con tarjeta mediante Stripe, en su propia cuenta",
      },
      {
        en: "Products and stock you can edit yourself, without calling us",
        de: "Produkte und Bestand, die Sie selbst pflegen — ohne uns anzurufen",
        es: "Productos y stock que puede editar usted mismo, sin llamarnos",
      },
      {
        en: "Tax and shipping rules set up for where you actually sell",
        de: "Steuer- und Versandregeln, eingerichtet für die Märkte, in denen Sie verkaufen",
        es: "Reglas de impuestos y envío configuradas para donde vende realmente",
      },
      {
        en: "Order emails that look like they came from your business",
        de: "Bestell-E-Mails, die aussehen, als kämen sie von Ihrem Unternehmen",
        es: "Correos de pedido que parecen venir de su negocio",
      },
    ],
  },
  {
    id: "care",
    icon: "shield",
    currency: "USD",
    priceFrom: 24,
    name: {
      en: "Care and hosting",
      de: "Betreuung und Hosting",
      es: "Mantenimiento y alojamiento",
    },
    summary: {
      en: "Monthly. Someone whose job it is to notice when your site breaks, before a customer does.",
      de: "Monatlich. Jemand, dessen Aufgabe es ist zu merken, dass Ihre Website nicht läuft — bevor es Kundschaft merkt.",
      es: "Mensual. Alguien cuyo trabajo es darse cuenta de que su sitio falla antes de que lo note un cliente.",
    },
    includes: [
      {
        en: "Uptime monitoring, and we are the ones who get woken up",
        de: "Verfügbarkeitsüberwachung — und geweckt werden wir, nicht Sie",
        es: "Monitorización de disponibilidad, y los que se despiertan somos nosotros",
      },
      {
        en: "Security patches applied and tested, not just installed",
        de: "Sicherheitsupdates eingespielt und getestet, nicht nur installiert",
        es: "Parches de seguridad aplicados y probados, no solo instalados",
      },
      {
        en: "Backups taken daily and restored on a schedule to prove they work",
        de: "Tägliche Backups, regelmäßig zurückgespielt, damit klar ist, dass sie funktionieren",
        es: "Copias de seguridad diarias y restauraciones periódicas para comprobar que sirven",
      },
      {
        en: "An hour of content or copy changes each month, no quibbling",
        de: "Eine Stunde Inhalts- oder Textänderungen pro Monat, ohne Diskussion",
        es: "Una hora de cambios de contenido o texto al mes, sin discusiones",
      },
      {
        en: "Cancel any month. We keep clients by being useful, not by contract",
        de: "Monatlich kündbar. Wir halten Kundschaft durch Nutzen, nicht durch Vertrag",
        es: "Cancele cualquier mes. Retenemos clientes por ser útiles, no por contrato",
      },
    ],
  },
  {
    id: "audit",
    icon: "gauge",
    currency: "USD",
    priceFrom: 225,
    name: {
      en: "Audit: speed, accessibility, search",
      de: "Audit: Tempo, Barrierefreiheit, Auffindbarkeit",
      es: "Auditoría: velocidad, accesibilidad y buscadores",
    },
    summary: {
      en: "You already have a site and something is wrong with it. We find out what, in writing, whether or not you hire us to fix it.",
      de: "Sie haben bereits eine Website, und irgendetwas stimmt nicht. Wir finden heraus, was — schriftlich, unabhängig davon, ob Sie uns mit der Behebung beauftragen.",
      es: "Ya tiene un sitio y algo falla. Averiguamos qué es, por escrito, nos contrate o no para arreglarlo.",
    },
    includes: [
      {
        en: "Real-device performance measurements, not a single lab score",
        de: "Messungen auf echten Geräten, nicht ein einzelner Laborwert",
        es: "Mediciones en dispositivos reales, no una única puntuación de laboratorio",
      },
      {
        en: "A WCAG 2.2 AA pass, tested by hand as well as by tooling",
        de: "Eine Prüfung nach WCAG 2.2 AA, von Hand und mit Werkzeugen",
        es: "Una revisión WCAG 2.2 AA, comprobada a mano además de con herramientas",
      },
      {
        en: "Technical search review: what is blocking you from being found",
        de: "Technische Suchmaschinen-Analyse: was verhindert, dass Sie gefunden werden",
        es: "Revisión técnica para buscadores: qué impide que le encuentren",
      },
      {
        en: "A prioritised list with effort estimates, written for a non-developer",
        de: "Eine priorisierte Liste mit Aufwandsschätzung, verständlich ohne Technikkenntnisse",
        es: "Una lista priorizada con estimación de esfuerzo, escrita para quien no programa",
      },
    ],
  },
];

/** A service by id, for detail views and cross-links. Throws if the id is unknown. */
export function serviceById(id: string): Service {
  const service = SERVICES.find((s) => s.id === id);
  if (!service) throw new Error(`Unknown service id ${JSON.stringify(id)}`);
  return service;
}
