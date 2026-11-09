/**
 * Öffnungszeiten – einzige Quelle für Anzeige, JSON-LD und den Live-Status.
 * Zeiten als "HH:MM", Zeitzone Europe/Berlin. Montag Ruhetag.
 */
export const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const;
export const SCHEMA_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const OPEN_DAYS = [1, 2, 3, 4, 5, 6]; // Index in DAYS (Di–So)
export const SLOTS = [
  { label: 'Mittag', from: '10:30', to: '15:00' },
  { label: 'Abend', from: '17:00', to: '21:30' },
];

const min = (t: string) => +t.slice(0, 2) * 60 + +t.slice(3);

export type OpenStatus =
  | { open: true; until: string; soon: boolean }
  | { open: false; next: { day: string; today: boolean; tomorrow: boolean; at: string } };

/** Status für einen Zeitpunkt in Berlin (dayIdx 0 = Mo, minutes seit 0:00). */
export function openStatus(dayIdx: number, minutes: number): OpenStatus {
  if (OPEN_DAYS.includes(dayIdx)) {
    for (const s of SLOTS) {
      if (minutes >= min(s.from) && minutes < min(s.to)) return { open: true, until: s.to, soon: min(s.to) - minutes <= 30 };
    }
  }
  for (let add = 0; add < 8; add++) {
    const d = (dayIdx + add) % 7;
    if (!OPEN_DAYS.includes(d)) continue;
    const slot = SLOTS.find((s) => add > 0 || min(s.from) > minutes);
    if (slot) return { open: false, next: { day: DAYS[d], today: add === 0, tomorrow: add === 1, at: slot.from } };
  }
  throw new Error('Keine Öffnungszeiten konfiguriert');
}

/** Aktuelle Zeit in Berlin → [dayIdx, minutes] */
export function berlinNow(date = new Date()): [number, number] {
  const p = new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date);
  const v = (t: string) => p.find((x) => x.type === t)!.value;
  return [DAYS.indexOf(v('weekday').replace('.', '') as (typeof DAYS)[number]), +v('hour') * 60 + +v('minute')];
}

export function statusText(s: OpenStatus): string {
  if (s.open) return `${s.soon ? 'Schließt bald' : 'Jetzt geöffnet'} · bis ${s.until}`;
  const { day, today, tomorrow, at } = s.next;
  return `Geschlossen · öffnet ${today ? 'heute' : tomorrow ? 'morgen' : day} ${at}`;
}
