export type CabinClass = 'economy' | 'premium' | 'business'

function seededRandom(seed: number) {
  let t = seed + 0x6D2B79F5
  return function () {
    t += 0x6D2B79F5
    let x = Math.imul(t ^ (t >>> 15), 1 | t)
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

function makeSeed(origin: string, destination: string) {
  const s1 = Array.from(origin).reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const s2 = Array.from(destination).reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return s1 * 131 + s2 * 137
}

function baseMidPrice(origin: string, destination: string) {
  const seed = makeSeed(origin, destination)
  const rnd = seededRandom(seed)
  // Base between 80 and 500 depending on pair
  return 80 + Math.floor(rnd() * 420)
}

function cabinMultiplier(cabin: CabinClass) {
  if (cabin === 'premium') return 1.35
  if (cabin === 'business') return 2.2
  return 1
}

function dowFactor(dow: number) {
  // 0=Sun .. 6=Sat; weekends pricier
  if (dow === 0 || dow === 6) return 1.15
  if (dow === 5) return 1.1
  return 1
}

function monthSeasonFactor(monthIndex: number) {
  // Summer and holiday season pricier; Jan/Feb cheaper
  if (monthIndex === 11 || monthIndex === 6 || monthIndex === 7) return 1.2
  if (monthIndex === 0 || monthIndex === 1) return 0.9
  return 1
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function generateMonthCalendar(
  origin: string,
  destination: string,
  year: number,
  monthIndexZeroBased: number,
  cabin: CabinClass = 'economy',
) {
  const daysInMonth = new Date(year, monthIndexZeroBased + 1, 0).getDate()
  const currency = 'GBP'
  const base = baseMidPrice(origin, destination)
  const seed = makeSeed(origin, destination) + year * 17 + monthIndexZeroBased * 31
  const rnd = seededRandom(seed)
  const days: Array<{ date: string; price: number }> = []

  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, monthIndexZeroBased, d)
    const dow = dt.getDay()
    const jitter = (rnd() - 0.5) * 0.2 // ±10%
    let price = base * cabinMultiplier(cabin) * dowFactor(dow) * monthSeasonFactor(monthIndexZeroBased)
    // Closer dates slightly pricier (last-minute effect)
    const today = new Date()
    const diffDays = Math.max(0, Math.floor((dt.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)))
    const urgency = diffDays < 14 ? 1.15 : diffDays < 30 ? 1.05 : 1
    price = price * urgency * (1 + jitter)
    price = clamp(Math.round(price), 49, 1299)
    days.push({ date: dt.toISOString().split('T')[0], price })
  }

  return { currency, days }
}
