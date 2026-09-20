/**
 * Legal page content.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  NOT LEGAL ADVICE, AND NOT LAWYER-REVIEWED.
 *
 *  What is written below is an accurate, plain-language description of what this
 *  website actually does — which is the hard part, and the part only someone who
 *  has read the code can write. It is a solid starting draft to hand to a lawyer,
 *  not a substitute for one. `PRIVACY_REVIEWED` stays false until a lawyer has
 *  read it, and while it is false the page carries a visible notice saying so.
 *
 *  The claims below are true of the site as built. If you add analytics, a
 *  chat widget, an embedded map, a font from a CDN or a tracking pixel, several
 *  of them become false immediately — and the cookie-banner question, which this
 *  site currently answers with "none needed", reopens. Update this file in the
 *  same commit as any such change.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { LocalizedText } from "../i18n/locales";

/** Flip to true only after a lawyer has read the privacy text. */
export const PRIVACY_REVIEWED = false;

/** Flip to true once terms of service have actually been written. */
export const TERMS_SUPPLIED = false;

/** ISO date the legal text last changed. Shown on the page. */
export const LEGAL_UPDATED = "2026-09-19";

export interface LegalSection {
  heading: LocalizedText;
  body: LocalizedText[];
}

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    heading: {
      en: "The short version",
      de: "Die Kurzfassung",
      es: "La versión corta",
    },
    body: [
      {
        en: "This website has no analytics, no advertising, no tracking pixels and no third-party scripts of any kind. It sets no cookies. Nothing you do here is recorded or shared. The only information we ever receive is what you choose to type into the contact form and send us.",
        de: "Diese Website hat keine Analyse-Werkzeuge, keine Werbung, keine Tracking-Pixel und keinerlei Skripte von Dritten. Sie setzt keine Cookies. Nichts, was Sie hier tun, wird aufgezeichnet oder weitergegeben. Die einzigen Informationen, die wir erhalten, sind die, die Sie selbst ins Kontaktformular eintragen und absenden.",
        es: "Este sitio no tiene analítica, ni publicidad, ni píxeles de seguimiento, ni scripts de terceros de ningún tipo. No instala cookies. Nada de lo que hace aquí se registra ni se comparte. La única información que recibimos es la que usted escribe en el formulario de contacto y nos envía.",
      },
      {
        en: "That is also why there is no cookie banner. There is nothing to consent to.",
        de: "Deshalb gibt es auch kein Cookie-Banner: Es gibt nichts, dem zuzustimmen wäre.",
        es: "Por eso tampoco hay aviso de cookies: no hay nada que consentir.",
      },
    ],
  },
  {
    heading: {
      en: "The contact form",
      de: "Das Kontaktformular",
      es: "El formulario de contacto",
    },
    body: [
      {
        en: "When you submit the contact form, the name, email address, business name, project type, budget range, timeline and message you entered are sent to us as an email. They are not written to a database, added to a mailing list, or passed to anyone else.",
        de: "Wenn Sie das Kontaktformular absenden, werden Name, E-Mail-Adresse, Firmenname, Projektart, Budgetrahmen, Zeitrahmen und Ihre Nachricht als E-Mail an uns geschickt. Sie werden nicht in einer Datenbank gespeichert, keinem Verteiler hinzugefügt und an niemanden weitergegeben.",
        es: "Cuando envía el formulario de contacto, el nombre, el correo electrónico, el nombre del negocio, el tipo de proyecto, el rango de presupuesto, los plazos y su mensaje se nos envían por correo electrónico. No se guardan en ninguna base de datos, no se añaden a ninguna lista y no se pasan a nadie.",
      },
      {
        en: "We reply to the address you give, and we keep the correspondence for as long as we are talking to you about the project plus a reasonable period afterwards for our own records. Ask us to delete it and we will.",
        de: "Wir antworten an die von Ihnen angegebene Adresse und bewahren den Schriftwechsel auf, solange wir mit Ihnen über das Projekt sprechen, sowie für einen angemessenen Zeitraum danach zu unseren Unterlagen. Auf Wunsch löschen wir ihn.",
        es: "Respondemos a la dirección que nos indique y conservamos la correspondencia mientras hablamos del proyecto y un periodo razonable después para nuestros registros. Si nos pide que la borremos, la borramos.",
      },
      {
        en: "The email is delivered by a third-party email service on our behalf. Like any email, it passes through their systems on the way to our inbox. TODO: name the provider here once it is chosen.",
        de: "Die E-Mail wird in unserem Auftrag von einem externen E-Mail-Dienst zugestellt. Wie jede E-Mail durchläuft sie auf dem Weg in unser Postfach deren Systeme. TODO: Anbieter hier benennen, sobald gewählt.",
        es: "El correo lo entrega en nuestro nombre un servicio de correo externo. Como cualquier correo, pasa por sus sistemas de camino a nuestra bandeja. TODO: nombrar aquí al proveedor cuando se elija.",
      },
    ],
  },
  {
    heading: {
      en: "What your browser stores",
      de: "Was Ihr Browser speichert",
      es: "Qué guarda su navegador",
    },
    body: [
      {
        en: "If you choose light or dark using the switch in the header, that single choice is saved in your own browser's local storage so the site remembers it next time. It is not a cookie, it is not an identifier, it never leaves your device, and we never see it. Clearing your browser data removes it.",
        de: "Wenn Sie über den Schalter in der Kopfzeile Hell oder Dunkel wählen, wird genau diese eine Entscheidung im lokalen Speicher Ihres Browsers abgelegt, damit die Website sie beim nächsten Mal kennt. Das ist kein Cookie, keine Kennung, es verlässt Ihr Gerät nie, und wir sehen es nie. Beim Löschen der Browserdaten verschwindet es.",
        es: "Si elige el tema claro u oscuro con el interruptor de la cabecera, esa única elección se guarda en el almacenamiento local de su navegador para que el sitio la recuerde. No es una cookie, no es un identificador, nunca sale de su dispositivo y nosotros nunca la vemos. Al borrar los datos del navegador desaparece.",
      },
    ],
  },
  {
    heading: {
      en: "Hosting and server logs",
      de: "Hosting und Server-Protokolle",
      es: "Alojamiento y registros del servidor",
    },
    body: [
      {
        en: "The site is hosted on Microsoft Azure Static Web Apps. Like every web server, it records ordinary request logs — IP address, time, the page requested, browser user agent — which exist to run and secure the service. We do not use these logs to build a profile of you and we do not combine them with anything else.",
        de: "Die Website wird auf Microsoft Azure Static Web Apps betrieben. Wie jeder Webserver führt sie gewöhnliche Zugriffsprotokolle — IP-Adresse, Zeit, aufgerufene Seite, Browserkennung —, die dem Betrieb und der Absicherung des Dienstes dienen. Wir nutzen diese Protokolle nicht, um ein Profil von Ihnen zu erstellen, und führen sie mit nichts anderem zusammen.",
        es: "El sitio se aloja en Microsoft Azure Static Web Apps. Como cualquier servidor web, registra peticiones ordinarias — dirección IP, hora, página solicitada, navegador — que existen para operar y proteger el servicio. No usamos esos registros para crear un perfil suyo ni los combinamos con nada más.",
      },
      {
        en: "Fonts are served from this same site rather than from a font provider, so viewing a page does not send a request to anyone else at all.",
        de: "Schriften werden von dieser Website selbst ausgeliefert und nicht von einem Schriftanbieter — der Aufruf einer Seite sendet also an niemanden sonst eine Anfrage.",
        es: "Las tipografías se sirven desde este mismo sitio y no desde un proveedor de fuentes, así que ver una página no envía ninguna petición a nadie más.",
      },
    ],
  },
  {
    heading: {
      en: "Your rights",
      de: "Ihre Rechte",
      es: "Sus derechos",
    },
    body: [
      {
        en: "Ask us what we hold about you and we will tell you. Ask us to correct it or delete it and we will. Write to the address on the contact page — there is no special procedure and no form to fill in.",
        de: "Fragen Sie uns, was wir über Sie gespeichert haben, und wir sagen es Ihnen. Bitten Sie uns, es zu berichtigen oder zu löschen, und wir tun es. Schreiben Sie an die Adresse auf der Kontaktseite — es gibt kein besonderes Verfahren und kein Formular.",
        es: "Pregúntenos qué guardamos sobre usted y se lo diremos. Pídanos que lo corrijamos o lo borremos y lo haremos. Escriba a la dirección de la página de contacto: no hay ningún procedimiento especial ni formulario que rellenar.",
      },
      {
        en: "TODO: once the entity is registered, add the legal name and registered address here, and — if you take on clients in the EU or UK — the specific GDPR rights language and a lawful-basis statement. A lawyer should draft that part.",
        de: "TODO: Sobald die Gesellschaft eingetragen ist, hier Firmenname und Sitz ergänzen und — falls Sie Kundschaft in der EU oder im Vereinigten Königreich betreuen — die konkreten DSGVO-Rechte sowie die Rechtsgrundlage benennen. Diesen Teil sollte eine Anwältin oder ein Anwalt entwerfen.",
        es: "TODO: cuando la entidad esté registrada, añadir aquí la razón social y el domicilio y — si atiende a clientes en la UE o el Reino Unido — el texto concreto de derechos del RGPD y la base jurídica. Esa parte debe redactarla un abogado.",
      },
    ],
  },
];
