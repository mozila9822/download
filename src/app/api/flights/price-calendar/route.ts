import { NextRequest, NextResponse } from 'next/server'
import { generateMonthCalendar } from '@/lib/pricing'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const origin = (searchParams.get('origin') || '').trim().toUpperCase()
    const destination = (searchParams.get('destination') || '').trim().toUpperCase()
    const monthParam = (searchParams.get('month') || '').trim() // YYYY-MM
    const cabin = (searchParams.get('cabin') || 'economy').trim().toLowerCase() as any

    if (!origin || !destination) {
      return NextResponse.json({ error: 'origin and destination are required' }, { status: 400 })
    }

    const now = new Date()
    const [yStr, mStr] = monthParam && /^(\d{4})-(\d{2})$/.test(monthParam)
      ? monthParam.split('-')
      : [String(now.getFullYear()), String(now.getMonth() + 1).padStart(2, '0')]
    const year = Number(yStr)
    const monthIndexZeroBased = Number(mStr) - 1

    const result = generateMonthCalendar(origin, destination, year, monthIndexZeroBased, cabin)
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal Server Error' }, { status: 500 })
  }
}

