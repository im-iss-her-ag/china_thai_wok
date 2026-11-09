import menu from '../../data/menu.json';
import { SLOTS } from './hours';

export type Dish = {
  nr: string | null;
  name: string;
  description: string | null;
  additives: string[];
  allergens: string[];
  price: number;
  spicy: string | null;
  vegetarian: boolean;
  size?: string;
  sauceChoice?: string[];
  soldOut?: boolean;
};
export type Category = {
  id: string;
  name: string;
  note: string | null;
  categoryCodes: string | null;
  items: Dish[];
};

export const R = menu.restaurant;
export const categories = menu.categories as Category[];
export const additives = menu.additives as Record<string, string>;
export const allergens = menu.allergens as Record<string, string>;
export const sauces = menu.sauceOptions as Record<string, { name: string; codes: string; spicy?: string }>;

export const dishCount = categories.reduce((n, c) => n + c.items.length, 0);

/** Hinweisleiste oben – null = ausgeblendet (später aus dem Admin) */
export const notice: string | null = null;

export const site = {
  name: R.name,
  slogan: R.slogan,
  phone: R.phone,
  tel: `tel:${R.phoneE164}`,
  street: R.address.street,
  zip: R.address.postalCode,
  city: R.address.city,
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`China-Thai-Wok, ${R.address.street}, ${R.address.postalCode} ${R.address.city}`),
  mapsEmbed: 'https://www.google.com/maps?q=' + encodeURIComponent(`${R.address.street}, ${R.address.postalCode} ${R.address.city}`) + '&output=embed',
  hours: SLOTS.map((s) => ({ label: s.label, time: `${s.from} – ${s.to}` })),
  menuPdf: '/china-thai-wok-speisekarte.pdf',
  delivery: { hours: '11:00 – 14:00 · 17:00 – 21:00', min: R.delivery.minimumOrderSchmalkalden, promoFrom: 60 },
};

/**
 * Google-Bewertungen & Social Media.
 * rating/count = null → Bewertungsblock wird ausgeblendet. reviews = [] → keine Zitate.
 * Zitate nur als kurze, wörtliche Auszüge mit Vorname + Quelle „Google“ verwenden.
 */
export const social = {
  googleUrl: 'https://www.google.com/maps?cid=11309293640070533277',
  rating: null as number | null, // z. B. 4.6
  count: null as number | null, // z. B. 512
  instagram: null as string | null, // z. B. 'https://www.instagram.com/…'
  /** Wörtliche Auszüge aus öffentlichen Google-Bewertungen ([…] = gekürzt). Name nur Vorname + Initial. */
  reviews: [
    {
      name: 'Philip R.', stars: 5, tag: 'Google · Local Guide',
      text: 'Service war sehr nett und freundlich. Essen war sehr lecker ich habe selten so leckere Frühlingsrollen gegessen. Mein Persönliches Lob an die Küche. […] Sehr zu empfehlen.',
    },
    {
      name: 'Gabi U.', stars: 5, tag: 'Google · Local Guide',
      text: 'Die Bedienung ist sehr freundlich und wir bekamen auch sehr schnell unser Essen, was sehr gut und reichlich war. Die Garnelen waren groß und super im Garpunkt. Das Gemüse frisch und knackig […]',
    },
    {
      name: 'Anja', stars: 4, tag: 'Google · Abholung',
      text: 'Solide asiatische Küche, es hat uns geschmeckt. Beim takeaway war die Wartezeit nicht lange. […] Das Personal war freundlich.',
    },
  ] as { name: string; text: string; stars: number; tag?: string }[],
};

export const euro = (n: number) =>
  n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

/** Sauber lesbare Kurzform für lange Gerichtnamen */
export const findDish = (nr: string) => {
  for (const c of categories) {
    const d = c.items.find((i) => i.nr === nr);
    if (d) return { dish: d, cat: c };
  }
  return null;
};

/** Empfehlungen des Hauses (Nr. → Bild, Kurztitel) */
export const signature = [
  { nr: '75', img: 'dish-ente', title: 'Knusprige Ente Hongkong Art' },
  { nr: 'T1', img: 'dish-curry', title: 'Rotes Thai-Curry mit Tofu' },
  { nr: '96', img: 'dish-grossgericht', title: 'Acht Kostbarkeiten' },
  { nr: '89A', img: 'dish-garnelen', title: 'Gebackene Großgarnelen' },
  { nr: '20', img: 'dish-reis', title: 'Nasi-Goreng' },
  { nr: '30', img: 'dish-padthai', title: 'Bami-Goreng' },
  { nr: '7B', img: 'dish-fruehlingsrollen', title: 'Frühlingsrollen' },
  { nr: '5', img: 'dish-suppe', title: 'Tom Ka Gai' },
]
  .map((s) => ({ ...s, ...findDish(s.nr)! }))
  .filter((s) => s.dish);

/** Bild pro Kategorie (Vorschau & Kopfbild) */
export const catImage: Record<string, string> = {
  'vorspeisen': 'dish-suppe',
  'gebratener-reis': 'dish-reis',
  'gebratene-nudeln': 'dish-padthai',
  'gebratene-glasnudeln': 'cat-glasnudeln',
  'vegetarisch-tofu': 'dish-curry',
  'huehnerfleisch': 'cat-huhn',
  'schweinefleisch': 'cat-schwein',
  'knuspriges-huhn': 'cat-knuspriges-huhn',
  'rindfleisch': 'cat-rind',
  'ente': 'dish-ente',
  'meeresfruechte': 'dish-garnelen',
  'grossgerichte': 'dish-grossgericht',
  'entengrossgerichte': 'cat-halbe-ente',
  'thai-spezialitaeten': 'cuisine-thai',
  'udon': 'cuisine-udon',
  'extra-sossen': 'cat-sossen',
  'nachspeisen': 'cat-nachspeisen',
  'getraenke': 'cat-getraenke',
};

/** Kurze Namen für die Kategorie-Leiste */
export const shortName: Record<string, string> = {
  'vorspeisen': 'Vorspeisen',
  'gebratener-reis': 'Reis',
  'gebratene-nudeln': 'Nudeln',
  'gebratene-glasnudeln': 'Glasnudeln',
  'vegetarisch-tofu': 'Vegetarisch',
  'huehnerfleisch': 'Huhn',
  'schweinefleisch': 'Schwein',
  'knuspriges-huhn': 'Knuspriges Huhn',
  'rindfleisch': 'Rind',
  'ente': 'Ente',
  'meeresfruechte': 'Meeresfrüchte',
  'grossgerichte': 'Großgerichte',
  'entengrossgerichte': 'Halbe Ente',
  'thai-spezialitaeten': 'Thai',
  'udon': 'Udon',
  'extra-sossen': 'Soßen',
  'nachspeisen': 'Nachspeisen',
  'getraenke': 'Getränke',
};

/** Bild-Schlüssel je Gericht: Nummer (klein) bzw. Slug für Gerichte ohne Nummer.
 *  Bilddatei: src/assets/images/gerichte/<key>.jpg, Nachweis in gerichte/credits.json */
const noNrKey: Record<string, string> = {
  'Dunkle Soße': 'sauce-dunkel', 'Süß-sauer Soße': 'sauce-suess-sauer', 'Curry-Soße': 'sauce-curry',
  'Mango-Soße': 'sauce-mango', 'Erdnuss-Soße': 'sauce-erdnuss',
  'Coca Cola': 'drink-cola', 'Guava-, Mango-, Lycheesaft': 'drink-saft', 'Chinabier „Tsing Tao“': 'drink-tsingtao', 'Leikeim Bier': 'drink-bier',
};
export const dishKey = (d: Dish) => (d.nr ?? noNrKey[d.name] ?? d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).toLowerCase();

/** Kurzer Einleitungstext je Kategorie (Gäste & SEO) */
export const catIntro: Record<string, string> = {
  'vorspeisen': 'Suppen, knusprige Frühlingsrollen und Wan Tan – der perfekte Start in Ihr Essen.',
  'gebratener-reis': 'Bei großer Hitze im Wok gebraten – mit Ei, knackigem Gemüse und Fleisch, Ente oder Garnelen nach Wahl.',
  'gebratene-nudeln': 'Gebratene Nudeln frisch aus dem Wok – vom Klassiker mit Gemüse bis Bami-Goreng.',
  'gebratene-glasnudeln': 'Feine Glasnudeln, kurz und heiß im Wok geschwenkt.',
  'vegetarisch-tofu': 'Frisches Gemüse und Tofu – mit dunkler Soße, Mango, Curry oder Erdnuss.',
  'huehnerfleisch': 'Zartes Hühnerfleisch oder gebackene Hühnerbrust – mit Erdnuss-, Curry-, Mango- oder Hoisin-Soße.',
  'schweinefleisch': 'Schweinefleisch aus dem Wok – als Chop Suey, mit Curry, Hoisin oder Mango.',
  'knuspriges-huhn': 'Außen knusprig, innen saftig – mit Gemüse und Soße nach Ihrem Geschmack.',
  'rindfleisch': 'Zartes Rindfleisch, scharf angebraten – mit Gemüse, Curry, Erdnuss oder Mango.',
  'ente': 'Knusprige Ente – nach Hongkong-Art und in vielen weiteren Variationen.',
  'meeresfruechte': 'Gebackenes Fischfilet und Großgarnelen – frisch aus dem Wok.',
  'grossgerichte': 'Große Portionen für den großen Hunger.',
  'entengrossgerichte': 'Die knusprige halbe Ente – der Klassiker für alle Entenliebhaber.',
  'thai-spezialitaeten': 'Rotes Curry, Kokosmilch und Zitronengras – aromatische Küche aus Thailand.',
  'udon': 'Dicke Weizennudeln aus dem Wok – mit Soße nach Wahl.',
  'extra-sossen': 'Unsere Soßen als Extra zu Ihrem Gericht.',
  'nachspeisen': 'Der süße Abschluss: gebackene Früchte mit Honig.',
  'getraenke': 'Erfrischungen und Bier – Preis je Flasche.',
};
