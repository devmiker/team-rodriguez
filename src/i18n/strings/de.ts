/**
 * German.
 *
 * Not yet read end to end by a native speaker, so `LOCALE_META.de.reviewed` is false
 * and every German page says so. Flip that flag only once someone has actually read
 * this file — and the moment you do, this comment should go too.
 *
 * Addressing: "Sie" throughout. A small studio writing to a business owner in German
 * uses "Sie"; the "du" that reads as friendly in English tech marketing reads as
 * presumptuous here.
 */

import type { UiStrings } from "./en";

export const de: UiStrings = {
  // --- Site identity ----------------------------------------------------
  "site.name": "Team Rodriguez",
  "site.tagline": "Websites, die sich rechnen",
  "site.description":
    "Ein kleines Software-Studio, das schnelle, barrierefreie und fair kalkulierte Websites für kleine Unternehmen baut.",

  // --- Accessibility and chrome ----------------------------------------
  "a11y.skipToContent": "Zum Inhalt springen",
  "a11y.breadcrumb": "Brotkrumennavigation",
  "nav.label": "Hauptnavigation",
  "nav.openMenu": "Menü öffnen",
  "nav.closeMenu": "Menü schließen",
  "nav.home": "Startseite",
  "theme.label": "Darstellung",
  "theme.toLight": "Zur hellen Darstellung wechseln",
  "theme.toDark": "Zur dunklen Darstellung wechseln",
  "lang.label": "Sprache",
  "lang.current": "Aktuelle Sprache",

  "translation.machine":
    "Diese Seite wurde maschinell übersetzt und noch nicht von einer muttersprachlichen Person geprüft.",
  "translation.readOriginal": "Das englische Original lesen",

  // --- Footer -----------------------------------------------------------
  "footer.blurb":
    "Wir bauen und betreuen Websites für kleine Unternehmen. Ortsunabhängig, für Kundinnen und Kunden überall.",
  "footer.navHeading": "Seiten",
  "footer.legalHeading": "Rechtliches",
  "footer.contactHeading": "Kontakt",
  "footer.rights": "Alle Rechte vorbehalten.",
  "footer.builtWith": "Gebaut mit Astro. Keine Tracker, kein Cookie-Banner, kein Unsinn.",

  // --- Home -------------------------------------------------------------
  "home.title": "Team Rodriguez — Websites für kleine Unternehmen",
  "home.description":
    "Ein kleines Software-Studio für schnelle, barrierefreie Websites für kleine Unternehmen. Klare Preise, echte Technik, keine Abhängigkeit.",
  "home.hero.eyebrow": "Software-Studio",
  "home.hero.heading": "Websites, die sich rechnen",
  "home.hero.body":
    "Die meisten Websites kleiner Unternehmen sind langsam, anfällig und kosten im Betrieb mehr, als sie einbringen. Wir bauen die andere Sorte: schnell, barrierefrei, leicht zu ändern — und sie gehört Ihnen.",
  "home.hero.cta": "Projekt anfragen",
  "home.hero.ctaSecondary": "Leistungen ansehen",

  "home.proof.speed": "Seiten, die in unter einer Sekunde laden",
  "home.proof.a11y": "Getestet mit Screenreader und Tastatur",
  "home.proof.own": "Code und Domain gehören immer Ihnen",

  "home.services.eyebrow": "Was wir machen",
  "home.services.heading": "Vier Dinge, richtig gemacht",
  "home.services.body":
    "Wir machen bewusst wenig. Deshalb können wir es wirklich, statt uns überall nur auszukennen.",
  "home.services.cta": "Alle Leistungen",

  "home.process.eyebrow": "So läuft es",
  "home.process.heading": "Keine Überraschungen, zu keinem Zeitpunkt",
  "home.process.body":
    "Sie bekommen einen Festpreis vor Projektbeginn, einen Link zum Mitverfolgen und am Ende eine Website, die Sie selbst pflegen können.",

  "home.process.1.title": "Wir sprechen",
  "home.process.1.body":
    "Eine halbe Stunde, kostenlos. Was das Unternehmen macht, wer es finden soll, was gerade nicht funktioniert. Wenn wir nicht die Richtigen sind, sagen wir das.",
  "home.process.2.title": "Sie bekommen einen Festpreis",
  "home.process.2.body":
    "Ein schriftlicher Umfang und eine Zahl. Keine Stundenschätzung, die wächst. Ändert sich der Umfang, kalkulieren wir neu, bevor wir weiterarbeiten.",
  "home.process.3.title": "Wir bauen sichtbar",
  "home.process.3.body":
    "Ab dem ersten Tag ein Vorschau-Link. Sie sehen den Fortschritt und geben Rückmeldung, solange Änderungen noch günstig sind.",
  "home.process.4.title": "Sie bekommen die Schlüssel",
  "home.process.4.body":
    "Code, Domain, Hosting-Konto — alles auf Ihren Namen. Ob Sie uns für die Wartung behalten, ist Ihre Entscheidung; die Website läuft so oder so.",

  "home.team.eyebrow": "Mit wem Sie arbeiten",
  "home.team.heading": "Bewusst ein kleines Team",
  "home.team.body":
    "Sie sprechen mit den Menschen, die den Code schreiben. Nichts geht an eine Kundenbetreuung, nichts wird still ins Ausland vergeben.",
  "home.team.cta": "Team kennenlernen",

  "home.partners.eyebrow": "Gute Gesellschaft",
  "home.partners.heading": "Kleine Unternehmen, die wir schätzen",
  "home.partners.body":
    "Kundinnen, Kunden und Nachbarbetriebe, die wir gern weiterempfehlen. Keine Affiliate-Links, keine bezahlte Platzierung.",
  "home.partners.cta": "Alle ansehen",

  "home.cta.heading": "Sagen Sie uns, was Sie brauchen",
  "home.cta.body":
    "Ein paar Sätze genügen für den Anfang. Wir antworten auf alles innerhalb von zwei Werktagen.",
  "home.cta.button": "Projekt anfragen",

  // --- Services ---------------------------------------------------------
  "services.title": "Leistungen",
  "services.description":
    "Websites gestalten und bauen, Online-Shops, laufende Betreuung sowie Audits zu Tempo, Barrierefreiheit und Auffindbarkeit.",
  "services.heading": "Was wir machen",
  "services.lead":
    "Wenige Leistungen, Preise im Voraus. Alles unten wird nach einem kostenlosen halbstündigen Gespräch fest angeboten.",
  "services.includes": "Enthalten ist",
  "services.who": "Wer das macht",
  "services.from": "Ab",
  "services.priceNote":
    "Richtwerte für den Einstieg. Ihr Preis wird vor Arbeitsbeginn schriftlich fixiert.",
  "services.cta.heading": "Nicht sicher, was davon Sie brauchen?",
  "services.cta.body":
    "Beschreiben Sie das Problem statt der Lösung, und wir sagen Ihnen, was es tatsächlich behebt — auch dann, wenn die Antwort lautet, dass Sie uns nicht brauchen.",

  // --- Work -------------------------------------------------------------
  "work.title": "Projekte",
  "work.description": "Ausgewählte Projekte und wozu sie gebaut wurden.",
  "work.heading": "Ausgewählte Projekte",
  "work.lead": "Einige Projekte, die Aufgabenstellung dahinter und was sich danach verändert hat.",
  "work.pending":
    "Die Projektberichte werden gerade geschrieben. Bis dahin führen wir Sie gern telefonisch durch aktuelle Arbeiten — auch durch die Teile, die nicht nach Plan liefen.",
  "work.visit": "Zur Website",
  "work.result": "Ergebnis",
  "work.stack": "Gebaut mit",

  // --- Team -------------------------------------------------------------
  "team.title": "Team",
  "team.description": "Die Menschen, die die Arbeit tatsächlich machen.",
  "team.heading": "Das Team",
  "team.lead":
    "Klein, erfahren, und vom ersten Gespräch bis zur Übergabe dieselben Personen. Sie werden nie mittendrin jemand Neuem vorgestellt.",
  "team.pending": "Die Team-Profile werden gerade geschrieben.",
  "team.focus": "Schwerpunkt",
  "team.offers": "Was sie übernehmen",
  "team.speaks": "Arbeitssprachen",
  "team.profile": "Profil",

  // --- Partners ---------------------------------------------------------
  "partners.title": "Partner",
  "partners.description":
    "Kleine Unternehmen und Selbstständige, die wir gern weiterempfehlen.",
  "partners.heading": "Kleine Unternehmen, die wir schätzen",
  "partners.lead":
    "Kundinnen, Kunden, Mitstreitende und Nachbarbetriebe mit guter Arbeit. Niemand bezahlt für einen Platz auf dieser Seite, und Affiliate-Links gibt es hier nicht.",
  "partners.pending": "Diese Seite wird gerade zusammengestellt.",
  "partners.visit": "Ansehen",

  // --- Contact and form -------------------------------------------------
  "contact.title": "Kontakt",
  "contact.description":
    "Erzählen Sie uns von Ihrem Projekt — wir antworten innerhalb von zwei Werktagen.",
  "contact.heading": "Projekt anfragen",
  "contact.lead":
    "Je mehr Sie uns schreiben, desto nützlicher fällt unsere erste Antwort aus. Nichts davon verpflichtet Sie zu irgendetwas.",
  "contact.direct.heading": "Lieber per E-Mail?",
  "contact.direct.body": "Schreiben Sie uns direkt an",
  "contact.response.heading": "Wie es weitergeht",
  "contact.response.body":
    "Wir lesen jede Nachricht selbst. Innerhalb von zwei Werktagen bekommen Sie eine echte Antwort von einem Menschen — meist mit ein, zwei Rückfragen und einer ehrlichen Einschätzung, ob wir die Richtigen dafür sind.",
  "contact.privacy":
    "Was Sie senden, wird uns per E-Mail zugestellt und sonst nichts. Wir speichern es in keiner Datenbank, nehmen Sie in keinen Verteiler auf und geben es an niemanden weiter.",

  "form.name.label": "Ihr Name",
  "form.name.error": "Bitte sagen Sie uns, wie wir Sie ansprechen sollen.",
  "form.email.label": "E-Mail-Adresse",
  "form.email.hint": "Damit wir antworten können. Sonst geht nie etwas an diese Adresse.",
  "form.email.error": "Bitte geben Sie eine E-Mail-Adresse an, unter der wir Sie erreichen.",
  "form.company.label": "Name des Unternehmens",
  "form.company.optional": "optional",
  "form.projectType.label": "Was brauchen Sie?",
  "form.projectType.placeholder": "Bitte wählen",
  "form.projectType.new": "Eine neue Website",
  "form.projectType.redesign": "Einen Relaunch einer bestehenden Website",
  "form.projectType.shop": "Einen Online-Shop",
  "form.projectType.care": "Betreuung für eine bestehende Website",
  "form.projectType.audit": "Ein Audit — Tempo, Barrierefreiheit oder Auffindbarkeit",
  "form.projectType.other": "Etwas anderes",
  "form.projectType.error": "Bitte wählen Sie die passendste Option.",
  "form.budget.label": "Ungefähres Budget",
  "form.budget.hint": "Eine ehrliche Spanne spart uns beiden Zeit. Nehmen Sie die nächstliegende.",
  "form.budget.unsure": "Noch unklar",
  "form.budget.under2k": "Unter 2.000",
  "form.budget.2to5k": "2.000 – 5.000",
  "form.budget.5to10k": "5.000 – 10.000",
  "form.budget.over10k": "Über 10.000",
  "form.timeline.label": "Bis wann brauchen Sie es?",
  "form.timeline.flexible": "Kein festes Datum",
  "form.timeline.month": "Innerhalb eines Monats",
  "form.timeline.quarter": "Innerhalb von drei Monaten",
  "form.timeline.later": "Später im Jahr",
  "form.message.label": "Erzählen Sie uns davon",
  "form.message.hint":
    "Was das Unternehmen macht, was gerade nicht funktioniert und wie ein gutes Ergebnis aussähe.",
  "form.message.error": "Bitte schreiben Sie uns kurz etwas zum Projekt.",
  "form.message.tooLong": "Das ist länger, als das Formular annimmt. Bitte kürzen Sie es etwas.",
  "form.required": "Pflichtfeld",
  "form.submit": "Nachricht senden",
  "form.submitting": "Wird gesendet …",
  "form.errorSummary.heading": "Bitte prüfen Sie Folgendes",
  "form.success.heading": "Nachricht gesendet",
  "form.success.body":
    "Vielen Dank — sie liegt in unserem Postfach. Sie hören innerhalb von zwei Werktagen von einem Menschen.",
  "form.failure.heading": "Das hat nicht geklappt",
  "form.failure.body":
    "Bei uns ist etwas schiefgelaufen. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt — die Adresse steht gleich darunter.",
  "form.rateLimited":
    "Das sind mehrere Nachrichten in kurzer Folge. Bitte warten Sie eine Minute und versuchen Sie es noch einmal.",
  "form.noscript":
    "Dieses Formular funktioniert auch ohne JavaScript. Nach dem Absenden landen Sie auf einer Bestätigungsseite.",

  // --- Thanks (no-JavaScript form target) -------------------------------
  "thanks.title": "Nachricht gesendet",
  "thanks.description": "Ihre Nachricht wurde gesendet.",
  "thanks.heading": "Nachricht gesendet",
  "thanks.body":
    "Vielen Dank — Ihre Nachricht liegt in unserem Postfach. Sie hören innerhalb von zwei Werktagen von einem Menschen.",
  "thanks.back": "Zurück zur Startseite",

  // --- Legal ------------------------------------------------------------
  "privacy.title": "Datenschutz",
  "privacy.description": "Was diese Website erhebt — nämlich so gut wie nichts.",
  "privacy.heading": "Datenschutz",
  "privacy.pending":
    "Diese Datenschutzerklärung beschreibt in einfachen Worten, was die Website tatsächlich tut. Sie wurde noch nicht juristisch geprüft, und das muss vor dem Livegang geschehen.",

  "terms.title": "AGB",
  "terms.description": "Zu welchen Bedingungen diese Website und unsere Leistungen bereitstehen.",
  "terms.heading": "Allgemeine Geschäftsbedingungen",
  "terms.pending":
    "Die Geschäftsbedingungen sind noch nicht geschrieben. Sie müssen anhand der tatsächlichen Verträge des Unternehmens entworfen werden, bevor diese Seite live geht.",

  "legal.lastUpdated": "Zuletzt aktualisiert",

  // --- Errors -----------------------------------------------------------
  "notFound.title": "Seite nicht gefunden",
  "notFound.heading": "Diese Seite gibt es hier nicht",
  "notFound.body":
    "Vielleicht ist der Link veraltet, vielleicht hat sich ein Tippfehler in die Adresse geschlichen. Die Seiten unten sind alle noch da, wo Sie sie verlassen haben.",
};
