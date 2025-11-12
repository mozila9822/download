import { NextRequest, NextResponse } from 'next/server'
import { airports } from '@/lib/airports'
import { generateMonthCalendar, type CabinClass } from '@/lib/pricing'

type FlightOption = {
  id: string
  airline: string
  flightNumber: string
  origin: { code: string; city?: string; country: string }
  destination: { code: string; city?: string; country: string }
  departTime: string // ISO
  arriveTime: string // ISO
  durationMinutes: number
  stops: number
  cabin: CabinClass
  price: number
  currency: string
  seatsAvailable: number
}

const AIRLINES = ['SkyJet', 'Air Nova', 'Europa Air', 'TransAtlantic', 'Pacific Wings', 'GlobalAir', 'Aurora Airways']

function seededRandom(seed: number) {
  let t = seed + 0x6D2B79F5
  return function () {
    t += 0x6D2B79F5
    let x = Math.imul(t ^ (t >>> 15), 1 | t)
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

function makeSeed(...parts: string[]) {
  return parts.join('|').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
}

function regionOfCountry(country: string): string {
  const NA = ['US','CA','MX']
  const EU = ['GB','FR','DE','NL','ES','IT']
  const AS = ['CN','IN','JP','KR','SG']
  const AF = ['ZA','KE','MA']
  const ME = ['AE','TR','SA']
  const OC = ['AU','NZ']
  if (NA.includes(country)) return 'NA'
  if (EU.includes(country)) return 'EU'
  if (AS.includes(country)) return 'AS'
  if (AF.includes(country)) return 'AF'
  if (ME.includes(country)) return 'ME'
  if (OC.includes(country)) return 'OC'
  return 'OTHER'
}

function estimateDurationMinutes(originCountry: string, destCountry: string, seedStr: string): number {
  const r = seededRandom(makeSeed(originCountry, destCountry, seedStr))
  const ro = regionOfCountry(originCountry)
  const rd = regionOfCountry(destCountry)
  if (originCountry === destCountry) {
    // In-country: short-haul
    return Math.round(75 + r() * 120) // 1.25h–3.25h
  }
  if (ro === 'NA' && rd === 'NA') {
    return Math.round(150 + r() * 240) // 2.5h–6.5h
  }
  const pair = `${ro}-${rd}`
  switch (pair) {
    case 'NA-EU':
    case 'EU-NA':
      return Math.round(420 + r() * 120) // 7–9h
    case 'EU-AS':
    case 'AS-EU':
      return Math.round(540 + r() * 240) // 9–13h
    case 'NA-AS':
    case 'AS-NA':
      return Math.round(660 + r() * 300) // 11–16h
    case 'EU-AF':
    case 'AF-EU':
      return Math.round(360 + r() * 180) // 6–9h
    case 'EU-ME':
    case 'ME-EU':
      return Math.round(240 + r() * 180) // 4–7h
    case 'NA-SA':
    case 'SA-NA':
      return Math.round(480 + r() * 240) // 8–12h
    default:
      return Math.round(240 + r() * 240) // 4–8h fallback
  }
}

function pickPrice(origin: string, destination: string, dateIso: string, cabin: CabinClass): number {
  const dt = new Date(dateIso)
  const year = dt.getFullYear()
  const month = dt.getMonth()
  const calendar = generateMonthCalendar(origin, destination, year, month, cabin)
  const dayStr = dateIso.split('T')[0]
  const entry = calendar.days.find(d => d.date === dayStr)
  const base = entry?.price ?? calendar.days[Math.floor(calendar.days.length / 2)].price
  // Small real-time jitter ±3%
  const rnd = seededRandom(makeSeed(origin, destination, dateIso))
  const jitter = (rnd() - 0.5) * 0.06
  return Math.round(base * (1 + jitter))
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const origin = (searchParams.get('origin') || '').trim().toUpperCase()
    const destination = (searchParams.get('destination') || '').trim().toUpperCase()
    const dateStr = (searchParams.get('date') || '').trim() // YYYY-MM-DD
    const cabin = ((searchParams.get('cabin') || 'economy').trim().toLowerCase() as CabinClass)
    const limitRaw = Number(searchParams.get('limit') || '8')
    const limit = Math.max(3, Math.min(15, Number.isFinite(limitRaw) ? limitRaw : 8))

    if (!origin || !destination || !dateStr) {
      return NextResponse.json({ error: 'origin, destination and date are required' }, { status: 400 })
    }

    const originAirport = airports.find(a => a.code.toUpperCase() === origin)
    const destinationAirport = airports.find(a => a.code.toUpperCase() === destination)
    if (!originAirport || !destinationAirport) {
      return NextResponse.json({ error: 'Unknown origin or destination' }, { status: 404 })
    }

    const seedStr = `${origin}-${destination}-${dateStr}-${cabin}`
    const rnd = seededRandom(makeSeed(seedStr))
    const currency = 'GBP'

    // Base departure slots throughout the day
    const slots = [
      { h: 6, m: 40 }, { h: 8, m: 20 }, { h: 10, m: 15 }, { h: 13, m: 5 }, { h: 15, m: 30 }, { h: 18, m: 10 }, { h: 21, m: 5 }
    ]
    // Randomize slot subset
    const take = Math.min(limit, slots.length)
    const chosenSlots = [...slots].sort(() => rnd() - 0.5).slice(0, take)

    const durationBase = estimateDurationMinutes(originAirport.country, destinationAirport.country, seedStr)

    const flights: FlightOption[] = chosenSlots.map((slot, idx) => {
      const airline = AIRLINES[Math.floor(rnd() * AIRLINES.length)]
      const flightNumber = `${airline.split(' ').map(s=>s[0]).join('')}${Math.floor(100 + rnd() * 899)}`
      const dep = new Date(`${dateStr}T${String(slot.h).padStart(2,'0')}:${String(slot.m).padStart(2,'0')}:00.000Z`)
      // Time-of-day multiplier affects duration slightly (winds, congestion)
      const todFactor = slot.h < 8 ? 0.95 : slot.h > 20 ? 1.08 : 1.0
      const stops = rnd() < 0.25 ? 1 : 0
      const durationWithJitter = Math.round(durationBase * todFactor * (0.92 + rnd() * 0.18) + (stops ? 60 + rnd() * 30 : 0))
      const arr = new Date(dep.getTime() + durationWithJitter * 60 * 1000)
      const price = Math.round(pickPrice(origin, destination, dep.toISOString(), cabin) * (stops ? 0.95 : 1))
      const seatsAvailable = Math.max(0, Math.floor(10 + rnd() * 40))
      return {
        id: `${origin}-${destination}-${dateStr}-${idx}`,
        airline,
        flightNumber,
        origin: { code: origin, city: originAirport.city, country: originAirport.country },
        destination: { code: destination, city: destinationAirport.city, country: destinationAirport.country },
        departTime: dep.toISOString(),
        arriveTime: arr.toISOString(),
        durationMinutes: durationWithJitter,
        stops,
        cabin,
        price,
        currency,
        seatsAvailable,
      }
    })

    // Sort by price ascending by default
    flights.sort((a, b) => a.price - b.price)
    return NextResponse.json({ ok: true, flights })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Internal Server Error' }, { status: 500 })
  }
}

