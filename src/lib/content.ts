/**
 * Sämtliche Inhalte der Website – zweisprachig, Slowenisch zuerst,
 * Deutsch danach (wie in der gedruckten Broschüre).
 *
 * Die Website ist eine One-Pager: Hero → Galerie → Kolofon/Impressum.
 * Die Broschüre bleibt das Hauptmedium, die Website ist ihre Galerie.
 */

export type Bi = { sl: string; de: string };

export const HERO = {
  years: '1996 - 2026',
  titleTop: '30 let',
  titleBottom: '30 Jahre',
  leadSl: 'Trideset let kulturnega doma KUMST v Žitari vasi – v fotografijah iz arhiva društva Trta.',
  leadDe: 'Dreißig Jahre Kulturhaus KUMST in Sittersdorf – in Fotografien aus dem Archiv des Vereins Trta.',
  ctaGallery: { sl: 'Galerija', de: 'Galerie' },
  ctaBrochure: { sl: 'Brošura', de: 'Broschüre' },
};

export const GALLERY = {
  label: { sl: 'Arhiv', de: 'Archiv' },
  heading: { sl: 'Galerija slik', de: 'Bildergalerie' },
  introSl:
    'Fotografije iz arhiva Slovenskega prosvetnega društva Trta: delovne akcije, gledališke predstave, koncerti in praznovanja v kulturnem domu.',
  introDe:
    'Fotografien aus dem Archiv des Slovensko prosvetno društvo Trta: Arbeitsaktionen, Theaterabende, Konzerte und Feste im Kulturhaus.',
  emptySl: 'Galerija je še prazna. Fotografije bomo kmalu dodali.',
  emptyDe: 'Die Galerie ist noch leer. Die Fotos folgen in Kürze.',
  countSl: (n: number) =>
    `${n} ${n === 1 ? 'fotografija' : n === 2 ? 'fotografiji' : n < 5 ? 'fotografije' : 'fotografij'}`,
  countDe: (n: number) => `${n} ${n === 1 ? 'Foto' : 'Fotos'}`,
  archive: 'Arhiv SPD Trta',
  back: { sl: 'Nazaj v galerijo', de: 'Zurück zur Galerie' },
  openTab: { sl: 'Odpri v novem zavihku', de: 'In neuem Tab öffnen' },
  zoomHint: { sl: 'Klikni za povečavo', de: 'Klicken zum Vergrößern' },
};

export const DOWNLOAD = {
  label: { sl: 'Tiskana izdaja', de: 'Printausgabe' },
  heading: { sl: 'Brošura', de: 'Die Broschüre' },
  lineSl: 'Vse fotografije in še veliko več: jubilejna brošura 30 let KUMST kot PDF.',
  lineDe: 'Alle Fotos und viel mehr: die Jubiläumsbroschüre 30 Jahre KUMST als PDF.',
  cta: { sl: 'Prenesi PDF', de: 'PDF herunterladen' },
  ctaOpen: { sl: 'Odpri v brskalniku', de: 'Im Browser öffnen' },
  hintSl: 'Brezplačno, brez prijave.',
  hintDe: 'Kostenlos, ohne Anmeldung.',
};

export const KOLOFON = {
  label: { sl: 'Kolofon', de: 'Impressum' },
  heading: { sl: 'Kolofon', de: 'Impressum' },
  rows: [
    {
      k: { sl: 'Izdajatelj', de: 'Herausgeber' },
      v: 'SPD Trta, Žitara vas / Sittersdorf 3, 9133 Žitara vas / Sittersdorf',
    },
    { k: { sl: 'Redakcija', de: 'Redaktion' }, v: 'Pauli Stern, Damjan Stern' },
    { k: { sl: 'Lektorat', de: 'Lektorat' }, v: 'Ana Smrtnik-Einspieler' },
    { k: { sl: 'Slike', de: 'Bilder' }, v: 'TRTA Arhiv' },
    {
      k: { sl: 'Ilustracije', de: 'Illustrationen' },
      v: 'Ilustracije so bile narejene s pomočjo generativne umetne inteligence. / Die Illustrationen wurden mit Hilfe von generativer KI erstellt.',
    },
    { k: { sl: 'Grafično oblikovanje', de: 'Grafische Gestaltung' }, v: 'Mario Franc Korpitsch' },
    {
      k: { sl: 'Tisk', de: 'Druck' },
      v: 'Mohorjeva tiskarna, Adi-Dasslergasse 4, A-9073 Viktring / Vetrinj',
    },
  ],
  funding: 'Gefördert aus Mitteln der Volksgruppenförderung:',
  fundingSl: 'Izdano s sredstvi javnih subvencij za narodne skupnosti.',
  contact: { sl: 'Kontakt', de: 'Kontakt' },
  siteNoteSl: 'Spletna stran kot razširjena galerija k brošuri.',
  siteNoteDe: 'Diese Website ist die erweiterte Bildergalerie zur Broschüre.',
};

export const FOOTER = {
  taglineSl: 'Kulturni dom KUMST · Žitara vas / Sittersdorf',
  taglineDe: 'Kulturhaus KUMST · Sittersdorf / Žitara vas',
  edit: { sl: 'Uredništvo', de: 'Redaktion' },
};
