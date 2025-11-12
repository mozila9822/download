import type { LocationNode } from '@/lib/locations'
import data from './airports.json'

export const airports: LocationNode[] = (data.airports || []).map((a) => ({
  code: a.code,
  name: a.name,
  city: a.city,
  country: a.country,
  type: 'airport',
}))

export function searchAirports(q: string): LocationNode[] {
  const s = q.trim().toLowerCase()
  if (!s) return airports
  return airports.filter((a) =>
    (a.name || '').toLowerCase().includes(s) ||
    (a.city || '').toLowerCase().includes(s) ||
    (a.country || '').toLowerCase().includes(s) ||
    (a.code || '').toLowerCase().includes(s)
  )
}
