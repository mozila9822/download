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
  });
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { area, dateRange, categories } = parseBody(body);
    if (!area) return new Response(JSON.stringify({ error: 'Area is required' }), { status: 400 });

    try {
      const result = await eventSearch({ area, dateRange, categories });
      return Response.json({ events: filterUpcoming(result.events || []) });
    } catch (err) {
      const fallback = { events: filterUpcoming(sampleEvents(area, categories)) };
      return Response.json(fallback, { status: 200 });
    }
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
  try {
    const result = await eventSearch({ area, dateRange, categories });
    return Response.json({ events: filterUpcoming(result.events || []) });
  } catch (err) {
    const fallback = { events: filterUpcoming(sampleEvents(area, categories)) };
    return Response.json(fallback, { status: 200 });
  }
}
