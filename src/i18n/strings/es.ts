/**
 * Spanish.
 *
 * Not yet read end to end by a native speaker, so `LOCALE_META.es.reviewed` is false
 * and every Spanish page says so. Flip that flag only once someone has actually read
 * this file — and the moment you do, this comment should go too.
 *
 * Addressing: "usted" throughout, and neutral vocabulary rather than regional. A studio
 * writing to a business owner it has never met uses "usted" in every Spanish-speaking
 * market; "tú" is safe in Spain and reads as over-familiar in much of Latin America.
 */

import type { UiStrings } from "./en";

export const es: UiStrings = {
  // --- Site identity ----------------------------------------------------
  "site.name": "Team Rodriguez",
  "site.tagline": "Webs que se pagan solas",
  "site.description":
    "Un pequeño estudio de software que crea sitios web rápidos, accesibles y con precios honestos para pequeñas empresas.",

  // --- Accessibility and chrome ----------------------------------------
  "a11y.skipToContent": "Saltar al contenido",
  "a11y.breadcrumb": "Ruta de navegación",
  "nav.label": "Principal",
  "nav.openMenu": "Abrir menú",
  "nav.closeMenu": "Cerrar menú",
  "nav.home": "Inicio",
  "theme.label": "Tema",
  "theme.toLight": "Cambiar al tema claro",
  "theme.toDark": "Cambiar al tema oscuro",
  "lang.label": "Idioma",
  "lang.current": "Idioma actual",

  "translation.machine":
    "Esta página se tradujo automáticamente y todavía no la ha revisado una persona nativa.",
  "translation.readOriginal": "Leer el original en inglés",

  // --- Footer -----------------------------------------------------------
  "footer.blurb":
    "Creamos y cuidamos sitios web para pequeñas empresas. Trabajamos en remoto, con clientes estén donde estén.",
  "footer.navHeading": "Sitio",
  "footer.legalHeading": "Legal",
  "footer.contactHeading": "Contacto",
  "footer.rights": "Todos los derechos reservados.",
  "footer.builtWith": "Hecho con Astro. Sin rastreadores, sin aviso de cookies, sin tonterías.",

  // --- Home -------------------------------------------------------------
  "home.title": "Team Rodriguez — sitios web para pequeñas empresas",
  "home.description":
    "Un pequeño estudio de software que crea sitios web rápidos y accesibles para pequeñas empresas. Precios claros, ingeniería de verdad, sin ataduras.",
  "home.hero.eyebrow": "Estudio de software",
  "home.hero.heading": "Webs que se pagan solas",
  "home.hero.body":
    "La mayoría de los sitios web de pequeñas empresas son lentos, frágiles y cuestan más mantenerlos de lo que aportan. Nosotros hacemos los otros: rápidos, accesibles, fáciles de cambiar y suyos para siempre.",
  "home.hero.cta": "Empezar un proyecto",
  "home.hero.ctaSecondary": "Ver lo que hacemos",

  "home.proof.speed": "Páginas que cargan en menos de un segundo",
  "home.proof.a11y": "Probadas con lector de pantalla y teclado",
  "home.proof.own": "El código y el dominio son suyos, siempre",

  "home.services.eyebrow": "Lo que hacemos",
  "home.services.heading": "Cuatro cosas, bien hechas",
  "home.services.body":
    "Hacemos poco a propósito. Así lo hacemos de verdad bien, en lugar de sabernos un poco de todo.",
  "home.services.cta": "Todos los servicios",

  "home.process.eyebrow": "Cómo funciona",
  "home.process.heading": "Sin sorpresas, en ningún momento",
  "home.process.body":
    "Recibe un precio cerrado antes de empezar, un enlace para seguir el avance y un sitio que podrá mantener usted mismo cuando se lo entreguemos.",

  "home.process.1.title": "Hablamos",
  "home.process.1.body":
    "Media hora, gratis. Qué hace el negocio, quién tiene que encontrarlo y qué no está funcionando ahora. Si no somos los adecuados, se lo diremos.",
  "home.process.2.title": "Recibe un precio cerrado",
  "home.process.2.body":
    "Un alcance por escrito y una cifra. No una estimación por horas que va creciendo. Si el alcance cambia, volvemos a presupuestar antes de seguir.",
  "home.process.3.title": "Construimos a la vista",
  "home.process.3.body":
    "Un enlace de vista previa desde el primer día. Ve el avance según ocurre y comenta mientras cambiar algo todavía sale barato.",
  "home.process.4.title": "Recibe las llaves",
  "home.process.4.body":
    "El código, el dominio y la cuenta de alojamiento, todo a su nombre. Quedarse con nosotros para el mantenimiento es opcional: el sitio funciona igual.",

  "home.team.eyebrow": "Con quién trabaja",
  "home.team.heading": "Un equipo pequeño, a propósito",
  "home.team.body":
    "Habla con las personas que escriben el código. Nada pasa por un gestor de cuentas ni se subcontrata en silencio.",
  "home.team.cta": "Conocer al equipo",

  "home.partners.eyebrow": "Buena compañía",
  "home.partners.heading": "Pequeñas empresas que valoramos",
  "home.partners.body":
    "Clientes y vecinos cuyo trabajo recomendamos con gusto. Sin enlaces de afiliado y sin pagar por aparecer.",
  "home.partners.cta": "Verlas todas",

  "home.cta.heading": "Cuéntenos qué necesita",
  "home.cta.body":
    "Con una descripción breve basta para empezar. Respondemos a todo en un plazo de dos días laborables.",
  "home.cta.button": "Empezar un proyecto",

  // --- Services ---------------------------------------------------------
  "services.title": "Servicios",
  "services.description":
    "Diseño y desarrollo de sitios web, tiendas en línea, mantenimiento continuo y auditorías de velocidad, accesibilidad y buscadores.",
  "services.heading": "Lo que hacemos",
  "services.lead":
    "Pocos servicios, con el precio por delante. Todo lo de abajo se presupuesta en firme tras una conversación gratuita de media hora.",
  "services.includes": "Qué incluye",
  "services.who": "Quién lo hace",
  "services.from": "Desde",
  "services.priceNote":
    "Precios de partida orientativos. Su presupuesto queda cerrado por escrito antes de empezar.",
  "services.cta.heading": "¿No sabe cuál de estos necesita?",
  "services.cta.body":
    "Describa el problema en lugar de la solución y le diremos qué lo arreglaría de verdad — incluso cuando la respuesta sea que no nos necesita.",

  // --- Work -------------------------------------------------------------
  "work.title": "Proyectos",
  "work.description": "Proyectos seleccionados y para qué se construyeron.",
  "work.heading": "Proyectos seleccionados",
  "work.lead": "Algunos proyectos, cuál era el encargo y qué cambió después.",
  "work.pending":
    "Estamos redactando los casos de estudio. Mientras tanto, le enseñamos con gusto trabajos recientes en una llamada — incluidas las partes que no salieron según lo previsto.",
  "work.visit": "Ver el sitio",
  "work.result": "Resultado",
  "work.stack": "Hecho con",

  // --- Team -------------------------------------------------------------
  "team.title": "Equipo",
  "team.description": "Las personas que harán el trabajo de verdad.",
  "team.heading": "El equipo",
  "team.lead":
    "Pequeño, con experiencia, y las mismas personas desde la primera llamada hasta la entrega. Nunca le presentarán a alguien nuevo a mitad del proyecto.",
  "team.pending": "Estamos redactando los perfiles del equipo.",
  "team.focus": "Especialidad",
  "team.offers": "De qué se encargan",
  "team.speaks": "Trabaja en",
  "team.profile": "Perfil",

  // --- Partners ---------------------------------------------------------
  "partners.title": "Aliados",
  "partners.description":
    "Pequeñas empresas y profesionales independientes que recomendamos con gusto.",
  "partners.heading": "Pequeñas empresas que valoramos",
  "partners.lead":
    "Clientes, colaboradores y vecinos que hacen buen trabajo. Nadie paga por estar en esta página y aquí no hay enlaces de afiliado.",
  "partners.pending": "Estamos preparando esta página.",
  "partners.visit": "Visitar",

  // --- Contact and form -------------------------------------------------
  "contact.title": "Contacto",
  "contact.description":
    "Cuéntenos su proyecto y le responderemos en un plazo de dos días laborables.",
  "contact.heading": "Empezar un proyecto",
  "contact.lead":
    "Cuanto más nos cuente, más útil será nuestra primera respuesta. Nada de esto le compromete a nada.",
  "contact.direct.heading": "¿Prefiere el correo?",
  "contact.direct.body": "Escríbanos directamente a",
  "contact.response.heading": "Qué pasa después",
  "contact.response.body":
    "Leemos cada mensaje nosotros mismos. En dos días laborables recibirá una respuesta real de una persona — normalmente con una o dos preguntas y una opinión honesta sobre si somos los adecuados.",
  "contact.privacy":
    "Lo que envíe llega a nuestro correo y a ningún sitio más. No lo guardamos en ninguna base de datos, no le añadimos a ninguna lista y no se lo pasamos a nadie.",

  "form.name.label": "Su nombre",
  "form.name.error": "Díganos cómo dirigirnos a usted.",
  "form.email.label": "Correo electrónico",
  "form.email.hint": "Para poder responderle. Nunca se envía nada más a esta dirección.",
  "form.email.error": "Indique un correo electrónico en el que podamos localizarle.",
  "form.company.label": "Nombre del negocio",
  "form.company.optional": "opcional",
  "form.projectType.label": "¿Qué necesita?",
  "form.projectType.placeholder": "Elija una opción",
  "form.projectType.new": "Un sitio web nuevo",
  "form.projectType.redesign": "Rediseñar un sitio que ya tengo",
  "form.projectType.shop": "Una tienda en línea",
  "form.projectType.care": "Mantenimiento de un sitio que ya tengo",
  "form.projectType.audit": "Una auditoría — velocidad, accesibilidad o buscadores",
  "form.projectType.other": "Otra cosa",
  "form.projectType.error": "Elija la opción más parecida.",
  "form.budget.label": "Presupuesto aproximado",
  "form.budget.hint": "Un rango honesto nos ahorra tiempo a los dos. Elija el más cercano.",
  "form.budget.unsure": "Todavía no lo sé",
  "form.budget.under2k": "Menos de 2.000",
  "form.budget.2to5k": "2.000 – 5.000",
  "form.budget.5to10k": "5.000 – 10.000",
  "form.budget.over10k": "Más de 10.000",
  "form.timeline.label": "¿Para cuándo lo necesita?",
  "form.timeline.flexible": "Sin fecha fija",
  "form.timeline.month": "En un mes",
  "form.timeline.quarter": "En tres meses",
  "form.timeline.later": "Más adelante este año",
  "form.message.label": "Cuéntenos",
  "form.message.hint":
    "Qué hace el negocio, qué no está funcionando ahora y cómo sería un buen resultado.",
  "form.message.error": "Cuéntenos algo sobre el proyecto.",
  "form.message.tooLong": "Es más largo de lo que acepta el formulario. Recórtelo un poco.",
  "form.required": "obligatorio",
  "form.submit": "Enviar mensaje",
  "form.submitting": "Enviando…",
  "form.errorSummary.heading": "Revise lo siguiente",
  "form.success.heading": "Mensaje enviado",
  "form.success.body":
    "Gracias — ya está en nuestro correo. Una persona le responderá en un plazo de dos días laborables.",
  "form.failure.heading": "No se ha podido enviar",
  "form.failure.body":
    "Algo ha fallado por nuestra parte. Inténtelo de nuevo o escríbanos directamente — la dirección está justo debajo.",
  "form.rateLimited":
    "Son varios mensajes seguidos en poco tiempo. Espere un minuto e inténtelo otra vez.",
  "form.noscript":
    "Este formulario funciona sin JavaScript. Al enviarlo pasará a una página de confirmación.",

  // --- Thanks (no-JavaScript form target) -------------------------------
  "thanks.title": "Mensaje enviado",
  "thanks.description": "Su mensaje se ha enviado.",
  "thanks.heading": "Mensaje enviado",
  "thanks.body":
    "Gracias — su mensaje ya está en nuestro correo. Una persona le responderá en un plazo de dos días laborables.",
  "thanks.back": "Volver a la página de inicio",

  // --- Legal ------------------------------------------------------------
  "privacy.title": "Privacidad",
  "privacy.description": "Qué recoge este sitio web, que es casi nada.",
  "privacy.heading": "Privacidad",
  "privacy.pending":
    "Este aviso de privacidad describe en lenguaje llano lo que el sitio hace realmente. Todavía no lo ha revisado un abogado, y debe hacerlo antes de que el sitio se publique.",

  "terms.title": "Términos",
  "terms.description": "Las condiciones bajo las que se ofrecen este sitio y nuestros servicios.",
  "terms.heading": "Términos del servicio",
  "terms.pending":
    "Las condiciones del servicio todavía no están redactadas. Hay que escribirlas a partir de los contratos reales de la empresa antes de publicar esta página.",

  "legal.lastUpdated": "Última actualización",

  // --- Errors -----------------------------------------------------------
  "notFound.title": "Página no encontrada",
  "notFound.heading": "Esa página no está aquí",
  "notFound.body":
    "Puede que el enlace esté desactualizado o que la dirección tenga una errata. Las páginas de abajo siguen donde las dejó.",
};
