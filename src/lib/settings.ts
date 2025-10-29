import { prisma } from '@/lib/db'
import type { PublicSettings, SiteSettingsPayload, SiteSettingsDto } from '@/lib/types'

const defaultSettings: SiteSettingsDto = {
  siteTitle: 'VoyagerHub',
  domains: [],
  logoUrl: null,
  faviconUrl: null,
  footer: {
    contactEmail: '',
    contactPhone: '',
    address: '',
    disclaimer: 'Your ultimate partner for seamless and unforgettable travel adventures.',
    social: { twitter: '', facebook: '', instagram: '', linkedin: '', youtube: '' },
  },
  navigation: [
    { label: 'AI Itinerary', href: '/ai-itinerary', visible: true },
  ],
  sections: [
    { name: 'City Break', href: '/city-break', visible: true },
    { name: 'Tour', href: '/tours', visible: true },
    { name: 'Hotel', href: '/hotels', visible: true },
    { name: 'Flight', href: '/flights', visible: true },
    { name: 'Coach Ride', href: '/coach-ride', visible: true },
    { name: 'Last Offers', href: '/offers', visible: true },
  ],
  theme: { primaryColor: '#0ea5e9', secondaryColor: '#f59e0b', fontFamily: 'PT Sans' },
  seoTitle: 'VoyagerHub - Your Ultimate Travel Partner',
  seoDescription:
    'Explore and book city breaks, tours, hotels, and flights with VoyagerHub. Your adventure starts here.',
  seoKeywords: 'voyagerhub, travel, tours, city breaks, hotels, flights, offers',
  version: 1,
  updatedAt: new Date().toISOString(),
}

export async function getSiteSettings(): Promise<SiteSettingsDto> {
  try {
    if (!prisma) return defaultSettings
    const row = await prisma.siteSettings.findFirst({ orderBy: { updatedAt: 'desc' } })
    if (!row) {
      const created = await prisma.siteSettings.create({ data: { siteTitle: defaultSettings.siteTitle } })
      return {
        ...defaultSettings,
        updatedAt: created.updatedAt.toISOString(),
        version: created.version,
      }
    }
    return {
      siteTitle: row.siteTitle,
      domains: (row.domains as any) ?? [],
      logoUrl: row.logoUrl ?? null,
      faviconUrl: row.faviconUrl ?? null,
      footer: (row.footer as any) ?? defaultSettings.footer,
      navigation: (row.navigation as any) ?? defaultSettings.navigation,
      sections: (row.sections as any) ?? defaultSettings.sections,
      theme: (row.theme as any) ?? defaultSettings.theme,
      seoTitle: row.seoTitle ?? defaultSettings.seoTitle,
      seoDescription: row.seoDescription ?? defaultSettings.seoDescription,
      seoKeywords: row.seoKeywords ?? defaultSettings.seoKeywords,
      version: row.version,
      updatedAt: row.updatedAt.toISOString(),
    }
  } catch {
    return defaultSettings
  }
}

export async function updateSiteSettings(payload: SiteSettingsPayload): Promise<SiteSettingsDto> {
  if (!prisma) return defaultSettings
  const current = await prisma.siteSettings.findFirst({ orderBy: { updatedAt: 'desc' } })
  let settingsId: string | null = current?.id ?? null
  if (!settingsId) {
    const created = await prisma.siteSettings.create({ data: { siteTitle: payload.siteTitle || defaultSettings.siteTitle } })
    settingsId = created.id
  }

  const before = current
    ? {
        siteTitle: current.siteTitle,
        domains: current.domains,
        logoUrl: current.logoUrl,
        faviconUrl: current.faviconUrl,
        footer: current.footer,
        navigation: current.navigation,
        sections: current.sections,
        theme: current.theme,
        seoTitle: current.seoTitle,
        seoDescription: current.seoDescription,
        seoKeywords: current.seoKeywords,
        version: current.version,
        updatedAt: current.updatedAt,
      }
    : null

  if (before) {
    await prisma.siteSettingsHistory.create({
      data: {
        settingsId: settingsId!,
        version: before.version ?? 1,
        data: before as any,
      },
    })
  }

  const updated = await prisma.siteSettings.update({
    where: { id: settingsId! },
    data: {
      siteTitle: payload.siteTitle ?? current?.siteTitle ?? defaultSettings.siteTitle,
      domains: payload.domains ?? (current?.domains as any) ?? [],
      logoUrl: payload.logoUrl ?? current?.logoUrl ?? null,
      faviconUrl: payload.faviconUrl ?? current?.faviconUrl ?? null,
      footer: (payload.footer as any) ?? current?.footer ?? (defaultSettings.footer as any),
      navigation: (payload.navigation as any) ?? current?.navigation ?? (defaultSettings.navigation as any),
      sections: (payload.sections as any) ?? current?.sections ?? (defaultSettings.sections as any),
      theme: (payload.theme as any) ?? current?.theme ?? (defaultSettings.theme as any),
      seoTitle: payload.seoTitle ?? current?.seoTitle ?? defaultSettings.seoTitle,
      seoDescription: payload.seoDescription ?? current?.seoDescription ?? defaultSettings.seoDescription,
      seoKeywords: payload.seoKeywords ?? current?.seoKeywords ?? defaultSettings.seoKeywords,
      version: (current?.version ?? 1) + 1,
    },
  })

  return {
    siteTitle: updated.siteTitle,
    domains: (updated.domains as any) ?? [],
    logoUrl: updated.logoUrl ?? null,
    faviconUrl: updated.faviconUrl ?? null,
    footer: (updated.footer as any) ?? defaultSettings.footer,
    navigation: (updated.navigation as any) ?? defaultSettings.navigation,
    sections: (updated.sections as any) ?? defaultSettings.sections,
    theme: (updated.theme as any) ?? defaultSettings.theme,
    seoTitle: updated.seoTitle ?? defaultSettings.seoTitle,
    seoDescription: updated.seoDescription ?? defaultSettings.seoDescription,
    seoKeywords: updated.seoKeywords ?? defaultSettings.seoKeywords,
    version: updated.version,
    updatedAt: updated.updatedAt.toISOString(),
  }
}

export function toPublicSettings(s: SiteSettingsDto): PublicSettings {
  return {
    siteTitle: s.siteTitle,
    logoUrl: s.logoUrl,
    faviconUrl: s.faviconUrl,
    footer: s.footer,
    navigation: s.navigation,
    sections: s.sections,
    theme: s.theme,
    seoTitle: s.seoTitle,
    seoDescription: s.seoDescription,
    seoKeywords: s.seoKeywords,
    updatedAt: s.updatedAt,
    version: s.version,
  }
}
