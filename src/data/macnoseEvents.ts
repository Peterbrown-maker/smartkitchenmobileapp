// The Butcher · Monate Corner events and home-screen promos (prototype content).
// PROTOTYPE: dates, times and entry prices below are placeholders — replace them
// with the confirmed details before going live.

export interface MacnoseEvent {
  id: string;
  title: string;
  artist: string;
  genre: string;
  image: any; // require()'d local asset
  /** Event date in South African time, YYYY-MM-DD. */
  date: string;
  /** 24h local times, e.g. "20:00". An end earlier than the start runs past midnight. */
  startTime: string;
  endTime: string;
  /** Entry price in rand; 0 = free entry. */
  entry: number;
  description: string;
  perks: string[];
  /** Set for weekly events, e.g. "Every Sunday". */
  recurring?: string;
}

export const MACNOSE_EVENTS: MacnoseEvent[] = [
  ...monateSundays(),
  {
    id: "dj-maphorisa-2026-11-28",
    title: "Amapiano Saturday",
    artist: "DJ Maphorisa",
    genre: "Amapiano",
    image: require("../assets/butcher/events/dj_maphorisa.jpg"),
    date: "2026-11-28",
    startTime: "20:00",
    endTime: "02:00",
    entry: 150, // PROTOTYPE placeholder
    description:
      "Phori takes over The Butcher for a full amapiano night. Shisanyama off the fire, ice-cold drinks and feel good music till late. See you there!",
    perks: ["Book a table for your crew", "Bottle specials all night", "Kitchen open till late"],
  },
  {
    id: "mdu-aka-trp-2026-12-04",
    title: "Amapiano Friday",
    artist: "Mdu aka TRP",
    genre: "Amapiano · Private School",
    image: require("../assets/butcher/events/mdu_aka_trp.jpg"),
    date: "2026-12-04",
    startTime: "20:00",
    endTime: "02:00",
    entry: 100, // PROTOTYPE placeholder
    description:
      "Mdu aka TRP brings the deep, soulful private school piano sound to Monate Corner. Come early, grab a platter and stay for the set.",
    perks: ["Book a table for your crew", "Sharing platters & bubbles", "Kitchen open till late"],
  },
];

// ----- Monate Sunday: weekly event (from The Butcher's poster) -----

/** The next `count` Sundays (SA time) from today, as YYYY-MM-DD; today counts if it is Sunday. */
function nextSundays(count: number, now = new Date()): string[] {
  const [y, m, d] = todaySAST(now).split("-").map(Number);
  const start = Date.UTC(y, m - 1, d);
  const first = start + ((7 - new Date(start).getUTCDay()) % 7) * 86400000;
  return Array.from({ length: count }, (_, i) => new Date(first + i * 7 * 86400000).toISOString().slice(0, 10));
}

function monateSundays(): MacnoseEvent[] {
  return nextSundays(4).map((date) => ({
    id: `monate-sunday-${date}`,
    title: "Monate Sunday",
    artist: "Monate Sunday",
    genre: "Sunday session · DJs",
    image: require("../assets/butcher/monate_sunday_poster.jpg"),
    date,
    startTime: "12:00",
    endTime: "18:00",
    entry: 0, // PROTOTYPE placeholder: confirm entry
    description:
      "Sundays at Monate Corner: shisanyama off the fire, cocktails and DJs on the decks all afternoon. Buy a wrap combo and a cocktail for R200.",
    perks: ["Wrap combo & a cocktail for R200", "DJs on the decks all afternoon", "Load shedding back-up generator", "Book a table for your crew"],
    recurring: "Every Sunday",
  }));
}

/** Id of the next Monate Sunday (today if it is Sunday). */
export const NEXT_MONATE_SUNDAY_ID = `monate-sunday-${nextSundays(1)[0]}`;

// ----- date helpers (no Intl dependency, safe on Hermes) -----

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Today's date in South Africa (UTC+2, no DST) as YYYY-MM-DD. */
export function todaySAST(now = new Date()): string {
  return new Date(now.getTime() + 2 * 3600 * 1000).toISOString().slice(0, 10);
}

function parts(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return { y, m, d, dow: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
}

/** "Sat 28 Nov" */
export function formatEventDay(e: MacnoseEvent): string {
  const { m, d, dow } = parts(e.date);
  return `${DAYS[dow]} ${d} ${MONTHS[m - 1]}`;
}

/** "SAT" / "28" / "NOV" for date badges. */
export function eventBadge(e: MacnoseEvent) {
  const { m, d, dow } = parts(e.date);
  return { dow: DAYS[dow].toUpperCase(), day: String(d), month: MONTHS[m - 1].toUpperCase() };
}

/** "Sat 28 Nov · 20:00 – 02:00" */
export function formatEventWhen(e: MacnoseEvent): string {
  return `${formatEventDay(e)} · ${e.startTime} – ${e.endTime}`;
}

export function formatEntry(e: MacnoseEvent): string {
  return e.entry === 0 ? "Free entry" : `R${e.entry} entry`;
}

/** Events today or later (an event stays listed on its own date), soonest first. */
export function upcomingEvents(now = new Date()): MacnoseEvent[] {
  const today = todaySAST(now);
  const seen = new Set<string>();
  return MACNOSE_EVENTS.filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    // Weekly events: list only the next one.
    .filter((e) => !e.recurring || (!seen.has(e.title) && !!seen.add(e.title)));
}

export function isTonight(e: MacnoseEvent, now = new Date()): boolean {
  return e.date === todaySAST(now);
}

// ----- home-screen promo carousel -----

export type PromoTarget =
  | { type: "event"; id: string }
  | { type: "category"; id: string };

export interface Promo {
  id: string;
  kicker: string;
  title: string;
  sub: string;
  image: any;
  cta: string;
  target: PromoTarget;
}

const ev = (id: string) => MACNOSE_EVENTS.find((e) => e.id === id)!;

export const PROMOS: Promo[] = [
  {
    id: "promo-maphorisa",
    kicker: `LIVE · ${formatEventDay(ev("dj-maphorisa-2026-11-28")).toUpperCase()}`,
    title: "DJ Maphorisa",
    sub: "Amapiano Saturday at The Butcher. Book your table before it's full.",
    image: require("../assets/butcher/events/dj_maphorisa.jpg"),
    cta: "See event",
    target: { type: "event", id: "dj-maphorisa-2026-11-28" },
  },
  {
    id: "promo-monate-sunday",
    kicker: "EVERY SUNDAY · 12:00 – 18:00",
    title: "Monate Sunday",
    sub: "Our Sunday session: DJs on the decks, wrap combo & a cocktail for R200.",
    image: require("../assets/butcher/monate_sunday_poster.jpg"),
    cta: "See event",
    target: { type: "event", id: NEXT_MONATE_SUNDAY_ID },
  },
  {
    id: "promo-mdu",
    kicker: `LIVE · ${formatEventDay(ev("mdu-aka-trp-2026-12-04")).toUpperCase()}`,
    title: "Mdu aka TRP",
    sub: "Amapiano Friday. Private school piano at Monate Corner.",
    image: require("../assets/butcher/events/mdu_aka_trp.jpg"),
    cta: "See event",
    target: { type: "event", id: "mdu-aka-trp-2026-12-04" },
  },
  {
    id: "promo-shisanyama",
    kicker: "MEAT & SHISANYAMA",
    title: "Fresh off the fire",
    sub: "Wings, wors, steak, lamb chops and sticky ribs, flame grilled to order.",
    image: require("../assets/butcher/mixed_grill_platter.jpg"),
    cta: "See the grill",
    target: { type: "category", id: "grills" },
  },
  {
    id: "promo-cocktails",
    kicker: "BAR",
    title: "Cocktails & bubbles",
    sub: "Strawberry daiquiri, mojito, piña colada and more from the bar.",
    image: require("../assets/butcher/cocktails.jpg"),
    cta: "See cocktails",
    target: { type: "category", id: "cocktails" },
  },
];
