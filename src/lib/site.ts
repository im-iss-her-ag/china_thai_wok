import menu from '../../data/menu.json';

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
  hours: [
    { label: 'Mittag', time: '10:30 – 15:00' },
    { label: 'Abend', time: '17:00 – 21:30' },
  ],
  delivery: { hours: '11:00 – 14:00 · 17:00 – 21:00', min: R.delivery.minimumOrderSchmalkalden, promoFrom: 60 },
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
