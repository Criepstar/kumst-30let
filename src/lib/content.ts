/**
 * Sämtliche Inhalte der Website – zweisprachig, Slowenisch zuerst,
 * Deutsch danach (wie in der gedruckten Broschüre).
 *
 * Die Website ist eine One-Pager: Hero → Galerie → Kolofon/Impressum.
 * Die Broschüre bleibt das Hauptmedium, die Website ist ihre Galerie.
 */

export type Bi = { sl: string; de: string };

export const HERO = {
  titleTop: '30 let',
  titleBottom: '30 Jahre',
  heading: { sl: '30 let Kumst', de: '30 Jahre Kumst' },
  leadSl:
    'Od leta 1996 je kulturni dom KUMST v Žitari vasi most med ljudmi in jeziki – ob jubileju v slikah in besedah.',
  leadDe:
    'Seit 1996 ist das Kulturhaus KUMST in Sittersdorf eine Brücke zwischen Menschen und Sprachen – zum Jubiläum in Bildern und Worten.',
  ctaGallery: { sl: 'Galerija', de: 'Galerie' },
  ctaBrochure: { sl: 'Brošura', de: 'Broschüre' },
};

export const GALLERY = {
  label: { sl: 'Arhiv', de: 'Archiv' },
  heading: { sl: 'Galerija slik', de: 'Bildergalerie' },
  introSl:
    'Delovne akcije, prireditve in fotografije kulturnega doma iz zadnjih 110 let – iz arhiva Slovenskega prosvetnega društva Trta.',
  introDe:
    'Arbeitseinsätze, Veranstaltungen und Bilder des Kulturhauses aus den vergangenen 110 Jahren – aus dem Archiv des Slowenischen Kulturvereins Trta.',
  emptySl: 'Galerija je še prazna. Fotografije bomo kmalu dodali.',
  emptyDe: 'Die Galerie ist noch leer. Die Fotos folgen in Kürze.',
  countSl: (n: number) =>
    `${n} ${n === 1 ? 'fotografija' : n === 2 ? 'fotografiji' : n < 5 ? 'fotografije' : 'fotografij'}`,
  countDe: (n: number) => `${n} ${n === 1 ? 'Foto' : 'Fotos'}`,
  archive: 'KUMST - 30 let / Jahre',
  zoomHint: { sl: 'Klikni za povečavo', de: 'Klicken zum Vergrößern' },
};

export const DOWNLOAD = {
  label: { sl: 'Tiskana izdaja', de: 'Printausgabe' },
  heading: { sl: 'Brošura', de: 'Die Broschüre' },
  lineSl:
    'Kaj KUMST pomeni ljudem: spomini in misli članic, članov in drugih.',
  lineDe:
    'Was das KUMST den Menschen bedeutet: Erinnerungen und Gedanken von Vereinsmitgliedern und anderen.',
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
