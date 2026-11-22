/**
 * Sämtliche Inhalte der Website – zweisprachig, Slowenisch zuerst,
 * Deutsch danach (wie in der gedruckten Broschüre).
 */

export type Bi = { sl: string; de: string };

export const NAV: { label: Bi; href: string }[] = [
  { label: { sl: 'Galerija', de: 'Galerie' }, href: '/galerija' },
  { label: { sl: 'Zgodba', de: 'Geschichte' }, href: '/#zgodba' },
  { label: { sl: 'Brošura', de: 'Broschüre' }, href: '/#brosura' },
  { label: { sl: 'Kolofon', de: 'Impressum' }, href: '/kolofon' },
];

export const HERO = {
  years: '1996 — 2026',
  titleTop: '30 let',
  titleBottom: '30 Jahre',
  bigSl: 'KULTURNI MOST',
  bigDe: 'KULTURBRÜCKE',
  leadSl:
    'Kulturni dom KUMST v Žitari vasi praznuje trideset let delovanja. Tu so spomini, obrazi in trenutki iz arhiva Slovenskega prosvetnega društva Trta.',
  leadDe:
    'Das Kulturhaus KUMST in Sittersdorf feiert dreißig Jahre. Hier sind die Erinnerungen, Gesichter und Momente aus dem Archiv des Slovensko prosvetno društvo Trta.',
  ctaGallery: { sl: 'Galerija', de: 'Galerie' },
  ctaBrochure: { sl: 'Brošura', de: 'Broschüre' },
};

export const ABOUT = {
  label: { sl: 'KUMST danes', de: 'KUMST heute' },
  heading: { sl: 'Hiša, ki povezuje', de: 'Ein Haus, das verbindet' },
  sl: 'Kulturni dom KUMST je danes središče delovanja SPD Trta. Tu vadijo mladinska gledališka skupina, zbor Trtinos ter ženski in moški zbor. Prav tako je dom prizorišče skorajda vseh prireditev in srečanj, ki jih prireja Trta. Vrata so odprta tudi sosedom, pevcem sv. Florjana, vodni zadrugi in prijateljskim skupinam. Pri prireditvi KUMST & MUSICA nudi oder domačim umetnikom in glasbenikom obeh deželnih jezikov. Tako je dozorel v pravi kulturni most. Poslanstvo, ki mu je namenjeno tudi v prihodnjih tridesetih letih.',
  de: 'Heute schlägt im KUMST das Herz der Trta. Hier proben Jugendtheater, der Chor Trtinos, Frauen- und Männerchor, hier findet fast jede Vereinsveranstaltung statt. Offen steht das Haus auch den Nachbarn, den Florianisängern, der Wassergenossenschaft und befreundeten Gruppen. Bei der Veranstaltung KUMST & MUSICA wird es zur Bühne für Kunstschaffende beider Landessprachen. So ist es zur echten Kulturbrücke gereift – und das soll es auch die nächsten dreißig Jahre bleiben.',
  facts: [
    { k: '1989', sl: 'prva delovna akcija', de: 'erste Arbeitsaktion' },
    { k: '9. 11. 1996', sl: 'slavnostna otvoritev', de: 'feierliche Eröffnung' },
    { k: '3', sl: 'pevski zbori', de: 'Chöre im Haus' },
  ],
} as const;

export type TimelineEntry = { year: string; sl: string; de: string };

/** Zeitleiste – 1:1 aus der Broschüre (Seite 2) übernommen. */
export const TIMELINE: TimelineEntry[] = [
  { year: '1912', sl: 'Otvoritev društvenega doma 23. junija 1912', de: 'Die Eröffnung des Vereinshauses am 23. Juni 1912' },
  { year: '1944', sl: 'Požar in uničenje doma', de: 'Brand und Zerstörung des Hauses' },
  { year: '1948', sl: 'Ponovna zgradnja', de: 'Wiederaufbau' },
  { year: '1952', sl: 'Otvoritev kot Prosvetni dom 6. aprila 1952', de: 'Eröffnung als Kulturhaus am 6. April 1952' },
  { year: '1956', sl: 'Prekinitev delovanja in propad', de: 'Ende der Kulturtätigkeiten und baulicher Verfall' },
  { year: '1989', sl: 'Ustanovitev iniciative KUMST', de: 'Gründung der Initiative KUMST' },
  { year: '1996', sl: 'Otvoritev obnovljenega kulturnega doma KUMST', de: 'Eröffnung des renovierten Kulturhauses KUMST' },
];

export const GALLERY = {
  label: { sl: 'Arhiv', de: 'Archiv' },
  heading: { sl: 'Galerija slik', de: 'Bildergalerie' },
  introSl:
    'Fotografije iz arhiva Slovenskega prosvetnega društva Trta: delovne akcije, gledališke predstave, koncerti, praznovanja in vsakdan v kulturnem domu.',
  introDe:
    'Fotografien aus dem Archiv des Slovensko prosvetno društvo Trta: Arbeitsaktionen, Theaterabende, Konzerte, Feste und der Alltag im Kulturhaus.',
  emptySl: 'Galerija je še prazna. Fotografije bomo kmalu dodali.',
  emptyDe: 'Die Galerie ist noch leer. Die Fotos folgen in Kürze.',
  countSl: (n: number) => `${n} ${n === 1 ? 'fotografija' : n === 2 ? 'fotografiji' : n < 5 ? 'fotografije' : 'fotografij'}`,
  countDe: (n: number) => `${n} ${n === 1 ? 'Foto' : 'Fotos'}`,
  showAll: { sl: 'Vse fotografije', de: 'Alle Fotos' },
  back: { sl: 'Nazaj v galerijo', de: 'Zurück zur Galerie' },
};

export const DOWNLOAD = {
  label: { sl: 'Tiskana izdaja', de: 'Printausgabe' },
  heading: { sl: 'Brošura za domov', de: 'Die Broschüre zum Mitnehmen' },
  sl: 'Ob jubileju je izšla brošura 30 let KUMST: trideset let kulturnega doma, pogovori z ljudmi, ki so hišo ustvarjali, arhivske fotografije in celotna časovnica na pregledni razpredelnici.',
  de: 'Zum Jubiläum ist die Broschüre 30 Jahre KUMST erschienen: dreißig Jahre Kulturhaus, Gespräche mit den Menschen, die das Haus geprägt haben, Archivfotos und die ganze Zeitleiste auf einen Blick.',
  cta: { sl: 'Prenesi PDF', de: 'PDF herunterladen' },
  ctaOpen: { sl: 'Odpri v brskalniku', de: 'Im Browser öffnen' },
  hintSl: 'Brezplačno, brez prijave.',
  hintDe: 'Kostenlos, ohne Anmeldung.',
};

export const KOLOFON = {
  label: { sl: 'Kolofon', de: 'Impressum' },
  heading: { sl: 'Kolofon', de: 'Impressum' },
  rows: [
    { k: { sl: 'Izdajatelj', de: 'Herausgeber' }, v: 'SPD Trta, Žitara vas / Sittersdorf 3, 9133 Žitara vas / Sittersdorf' },
    { k: { sl: 'Redakcija', de: 'Redaktion' }, v: 'Pauli Stern, Damjan Stern' },
    { k: { sl: 'Lektorat', de: 'Lektorat' }, v: 'Ana Smrtnik-Einspieler' },
    { k: { sl: 'Slike', de: 'Bilder' }, v: 'TRTA Arhiv' },
    {
      k: { sl: 'Ilustracije', de: 'Illustrationen' },
      v: 'Ilustracije so bile narejene s pomočjo generativne umetne inteligence. / Die Illustrationen wurden mit Hilfe von generativer KI erstellt.',
    },
    { k: { sl: 'Grafično oblikovanje', de: 'Grafische Gestaltung' }, v: 'Mario Franc Korpitsch' },
    { k: { sl: 'Tisk', de: 'Druck' }, v: 'Mohorjeva tiskarna, Adi-Dasslergasse 4, A-9073 Viktring / Vetrinj' },
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
  rights: '© 2026 SPD Trta',
  edit: { sl: 'Uredništvo', de: 'Redaktion' },
  newsletterSl: 'Novice dobite po pošti',
  newsletterDe: 'Neuigkeiten per E-Mail',
};
