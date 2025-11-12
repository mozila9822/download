import { NextRequest } from 'next/server';
import { eventSearch } from '@/ai/flows/event-search';

type EventItem = {
  id: string;
  title: string;
  date: string;
  venue: string;
  city: string;
  price: string;
  category: string;
  description: string;
  link?: string;
  tags?: string[];
};

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}
function fmt(d: Date) {
  return d.toISOString().slice(0, 10);
}
function sampleEvents(area: string, categories?: string[]): EventItem[] {
  const city = area || 'Your City';
  const today = new Date();
  const picks: EventItem[] = [
    {
      id: 'evt-1',
      title: 'Sunset Music Festival',
      date: fmt(addDays(today, 7)),
      venue: 'Riverside Park',
      city,
      price: '€29–€99',
      category: 'Music',
      description: 'Open-air performances from local and international artists.',
      link: 'https://example.com/events/sunset-music-fest',
      tags: ['festival', 'live', 'outdoor'],
    },
    {
      id: 'evt-2',
      title: 'Tech Innovators Meetup',
      date: fmt(addDays(today, 14)),
      venue: 'Innovation Hub',
      city,
      price: 'Free',
      category: 'Tech',
      description: 'Talks and demos from local startups and builders.',
      link: 'https://example.com/events/tech-innovators',
      tags: ['startups', 'networking', 'ai'],
    },
    {
      id: 'evt-3',
      title: 'Street Food Fiesta',
      date: fmt(addDays(today, 21)),
      venue: 'Central Square',
      city,
      price: '€5 entry',
      category: 'Food',
      description: 'Taste dishes from 30+ vendors with live music.',
      link: 'https://example.com/events/street-food',
      tags: ['food', 'family', 'market'],
    },
    {
      id: 'evt-4',
      title: 'Contemporary Art Walk',
      date: fmt(addDays(today, 28)),
      venue: 'Gallery District',
      city,
      price: '€12',
      category: 'Art',
      description: 'Curated tour of pop-up galleries and studios.',
      link: 'https://example.com/events/art-walk',
      tags: ['gallery', 'tour', 'culture'],
    },
    {
      id: 'evt-5',
      title: 'City Marathon 10K',
      date: fmt(addDays(today, 35)),
      venue: 'City Stadium',
      city,
      price: '€25–€45',
      category: 'Sports',
      description: 'Community run with 5k and 10k routes.',
      link: 'https://example.com/events/city-10k',
      tags: ['run', 'fitness', 'outdoor'],
    },
    {
      id: 'evt-6',
      title: 'Indie Film Night',
      date: fmt(addDays(today, 42)),
      venue: 'Grand Cinema',
      city,
      price: '€9',
      category: 'Film',
      description: 'Screenings and Q&A with directors.',
      link: 'https://example.com/events/indie-film',
      tags: ['cinema', 'indie', 'q&a'],
    },
  ];
  const catSet = (categories || []).map((c) => c.toLowerCase());
  if (!catSet.length) return picks;
  return picks.filter((p) => catSet.includes(p.category.toLowerCase()));
}

function parseYear(str: string): number | null {
  const m = str.match(/\b(20\d{2})\b/);
  return m ? parseInt(m[1], 10) : null;
}
function parseDate(str: string): Date | null {
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}
function filterUpcoming(list: EventItem[]): EventItem[] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return list.filter((e) => {
    const y = parseYear(e.date);
    if (y !== null && y < now.getFullYear()) return false;
    const d = parseDate(e.date);
    if (d && d < startOfToday) return false;
    return true;
  }).sort((a, b) => a.date.localeCompare(b.date));
}

function parseBody(obj: any): { area: string; dateRange?: string; categories?: string[] } {
  const area = (obj?.area || obj?.city || '').toString().trim();
  const dateRange = obj?.dateRange ? obj.dateRange.toString().trim() : undefined;
  const categories = Array.isArray(obj?.categories)
    ? obj.categories.map((c: any) => c?.toString?.().trim()).filter(Boolean)
    : typeof obj?.categories === 'string'
    ? obj.categories.split(',').map((c: string) => c.trim()).filter(Boolean)
    : undefined;
  return { area, dateRange, categories };
}

function dedupeByKey(list: EventItem[]): EventItem[] {
  const seen = new Set<string>();
  const out: EventItem[] = [];
  for (const e of list) {
    const key = `${(e.title || '').toLowerCase()}|${e.date}|${(e.venue || '').toLowerCase()}|${(e.city || '').toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out;
}

const PROVIDER_TIMEOUT_MS = 5000;
async function fetchWithTimeout(url: string, init?: RequestInit, ms = PROVIDER_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { ...(init || {}), signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

function normalizeCategory(input?: string) {
  if (!input) return 'Event';
  const s = input.toLowerCase();
  if (s.includes('music')) return 'Music';
  if (s.includes('tech') || s.includes('conference')) return 'Tech';
  if (s.includes('food')) return 'Food';
  if (s.includes('film') || s.includes('movie')) return 'Film';
  if (s.includes('art')) return 'Art';
  if (s.includes('sport')) return 'Sports';
  return input;
}

async function fromTicketmaster(area: string, categories?: string[]): Promise<EventItem[]> {
  const apikey = process.env.TICKETMASTER_API_KEY;
  if (!apikey) return [];
  const params = new URLSearchParams({ apikey, size: '50', sort: 'date,asc' });
  if (area) params.set('city', area);
  if (categories && categories.length) params.set('classificationName', categories.join(','));
  const url = `https://app.ticketmaster.com/discovery/v2/events.json?${params.toString()}`;
  try {
    const res = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return [];
    const json = await res.json();
    const events: any[] = json?._embedded?.events || [];
    return events.map((e) => {
      const date = e?.dates?.start?.localDate || (e?.dates?.start?.dateTime ? e.dates.start.dateTime.slice(0, 10) : fmt(new Date()));
      const venueObj = Array.isArray(e?._embedded?.venues) ? e._embedded.venues[0] : null;
      const venueName = venueObj?.name || '—';
      const cityName = venueObj?.city?.name || area;
      const priceRanges = e?.priceRanges && e.priceRanges[0];
      const priceStr = priceRanges ? `${priceRanges?.min ?? ''}${priceRanges?.min ? '–' : ''}${priceRanges?.max ?? ''} ${priceRanges?.currency ?? ''}`.trim() || '—' : '—';
      const category = normalizeCategory(e?.classifications?.[0]?.genre?.name || e?.classifications?.[0]?.segment?.name || 'Event');
      return {
        id: `tm:${e?.id || `${e?.name}-${date}`}`,
        title: e?.name || 'Untitled',
        date,
        venue: venueName,
        city: cityName || area,
        price: priceStr,
        category,
        description: e?.info || e?.pleaseNote || '',
        link: e?.url,
        tags: (e?.classifications || [])
          .map((c: any) => c?.genre?.name || c?.segment?.name)
          .filter(Boolean),
      } as EventItem;
    });
  } catch {
    return [];
  }
}

async function fromEventbrite(area: string, categories?: string[]): Promise<EventItem[]> {
  const token = process.env.EVENTBRITE_TOKEN;
  if (!token) return [];
  const params = new URLSearchParams();
  if (area) params.set('location.address', area);
  if (categories && categories.length) params.set('q', categories.join(' '));
  params.set('expand', 'venue');
  params.set('page', '1');
  const url = `https://www.eventbriteapi.com/v3/events/search/?${params.toString()}`;
  try {
    const res = await fetchWithTimeout(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const events: any[] = json?.events || [];
    return events.map((e) => {
      const date = e?.start?.local ? e.start.local.slice(0, 10) : fmt(new Date());
      const venueName = e?.venue?.name || '—';
      const cityName = e?.venue?.address?.city || area;
      const category = normalizeCategory(e?.category_id ? String(e.category_id) : e?.category?.name);
      return {
        id: `eb:${e?.id || `${e?.name?.text}-${date}`}`,
        title: e?.name?.text || 'Untitled',
        date,
        venue: venueName,
        city: cityName || area,
        price: e?.is_free ? 'Free' : '—',
        category: category || 'Event',
        description: e?.description?.text || '',
        link: e?.url,
        tags: e?.format?.short_name ? [e.format.short_name] : [],
      } as EventItem;
    });
  } catch {
    return [];
  }
}

async function fromSeatGeek(area: string, categories?: string[]): Promise<EventItem[]> {
  const id = process.env.SEATGEEK_CLIENT_ID;
  const secret = process.env.SEATGEEK_CLIENT_SECRET;
  if (!id || !secret) return [];
  const params = new URLSearchParams({ per_page: '50', client_id: id, client_secret: secret });
  if (area) params.set('venue.city', area);
  const url = `https://api.seatgeek.com/2/events?${params.toString()}`;
  try {
    const res = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return [];
    const json = await res.json();
    const events: any[] = json?.events || [];
    return events.map((e) => {
      const date = e?.datetime_local ? e.datetime_local.slice(0, 10) : fmt(new Date());
      const venueName = e?.venue?.name || '—';
      const cityName = e?.venue?.city || area;
      const category = normalizeCategory(e?.type || e?.performers?.[0]?.type);
      return {
        id: `sg:${e?.id || `${e?.title}-${date}`}`,
        title: e?.title || 'Untitled',
        date,
        venue: venueName,
        city: cityName || area,
        price: e?.stats?.lowest_price ? `${e.stats.lowest_price}` : '—',
        category: category || 'Event',
        description: e?.description || '',
        link: e?.url,
        tags: e?.performers ? e.performers.map((p: any) => p?.type).filter(Boolean) : [],
      } as EventItem;
    });
  } catch {
    return [];
  }
}

async function fromMeetup(area: string, categories?: string[]): Promise<EventItem[]> {
  const key = process.env.MEETUP_API_KEY;
  if (!key) return [];
  const params = new URLSearchParams({ key, sign: 'true', page: '50' });
  if (area) params.set('text', area);
  const url = `https://api.meetup.com/find/upcoming_events?${params.toString()}`;
  try {
    const res = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return [];
    const json = await res.json();
    const events: any[] = json?.events || [];
    return events.map((e) => {
      const date = e?.local_date || (e?.time ? new Date(e.time).toISOString().slice(0, 10) : fmt(new Date()));
      const venueName = e?.venue?.name || e?.group?.name || '—';
      const cityName = e?.venue?.city || area;
      const category = normalizeCategory(e?.group?.topics?.[0]?.name || e?.group?.name);
      return {
        id: `mu:${e?.id || `${e?.name}-${date}`}`,
        title: e?.name || 'Untitled',
        date,
        venue: venueName,
        city: cityName || area,
        price: e?.is_free ? 'Free' : '—',
        category: category || 'Event',
        description: e?.description || '',
        link: e?.link,
        tags: Array.isArray(e?.group?.topics) ? e.group.topics.map((t: any) => t?.name).filter(Boolean) : [],
      } as EventItem;
    });
  } catch {
    return [];
  }
}

async function aggregate(area: string, dateRange?: string, categories?: string[]) {
  const cats = categories && categories.length ? categories : undefined;
  const [tm, eb, sg, mu] = await Promise.all([
    fromTicketmaster(area, cats),
    fromEventbrite(area, cats),
    fromSeatGeek(area, cats),
    fromMeetup(area, cats),
  ]);

  let combined = dedupeByKey([...tm, ...eb, ...sg, ...mu]);
  if (cats) {
    const catSet = new Set(cats.map((c) => c.toLowerCase()));
    combined = combined.filter((e) => catSet.has((e.category || '').toLowerCase()));
  }
  combined = filterUpcoming(combined);

  if (combined.length === 0) {
    try {
      const result = await eventSearch({ area, dateRange, categories: cats });
      combined = filterUpcoming(result.events || []);
    } catch {
      combined = filterUpcoming(sampleEvents(area, cats));
    }
  }
  return combined;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { area, dateRange, categories } = parseBody(body);
    if (!area) return new Response(JSON.stringify({ error: 'Area is required' }), { status: 400 });
    const events = await aggregate(area, dateRange, categories);
    return Response.json({ events });
  } catch {
    return new Response('Invalid request', { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const area = searchParams.get('area')?.trim() || '';
  const dateRange = searchParams.get('dateRange')?.trim() || undefined;
  const categoriesParam = searchParams.get('categories')?.trim() || undefined;
  const categories = categoriesParam
    ? categoriesParam.split(',').map((c) => c.trim()).filter(Boolean)
    : undefined;

  if (!area) return new Response(JSON.stringify({ error: 'Area is required' }), { status: 400 });
  const events = await aggregate(area, dateRange, categories);
  return Response.json({ events });
}

