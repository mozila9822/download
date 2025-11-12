"use client"
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

type PublicSettings = {
  siteTitle: string
  logoUrl: string | null
  faviconUrl: string | null
  footer: any
  navigation: any
  sections: any
  theme: { primaryColor?: string; secondaryColor?: string; fontFamily?: string } | null
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords?: string | null
  version: number
  updatedAt: string
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<PublicSettings | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/settings', { cache: 'no-store' })
        const json = await res.json().catch(() => null)
        if (!cancelled && json) setData(json as PublicSettings)
      } catch {
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const save = async () => {
    try {
      setSaving(true)
      const payload = {
        siteTitle: data?.siteTitle,
        seoTitle: data?.seoTitle,
        seoDescription: data?.seoDescription,
        navigation: data?.navigation,
        theme: data?.theme,
      }
      const res = await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const json = await res.json().catch(() => null)
      if (res.ok && json?.ok) {
        setData((d) => ({ ...(json.settings as PublicSettings) }))
        toast({ title: 'Settings saved', description: 'Your changes have been persisted.' })
      } else {
        const err = json?.error || 'Unable to save settings'
        toast({ title: 'Save failed', description: err })
      }
    } catch (e: any) {
      toast({ title: 'Save failed', description: e?.message || 'Unexpected error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Manage application settings.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && <p>Loading...</p>}
        {!loading && data && (
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">General</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteTitle">Site Title</Label>
                  <Input id="siteTitle" value={data.siteTitle || ''} onChange={(e) => setData((d) => d ? { ...d, siteTitle: e.target.value } : d)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input id="seoTitle" value={data.seoTitle || ''} onChange={(e) => setData((d) => d ? { ...d, seoTitle: e.target.value } : d)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="seoDescription">SEO Description</Label>
                  <Textarea id="seoDescription" rows={3} value={data.seoDescription || ''} onChange={(e) => setData((d) => d ? { ...d, seoDescription: e.target.value } : d)} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Theme</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <Input id="primaryColor" value={data.theme?.primaryColor || ''} onChange={(e) => setData((d) => d ? { ...d, theme: { ...(d.theme || {}), primaryColor: e.target.value } } : d)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <Input id="secondaryColor" value={data.theme?.secondaryColor || ''} onChange={(e) => setData((d) => d ? { ...d, theme: { ...(d.theme || {}), secondaryColor: e.target.value } } : d)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fontFamily">Font Family</Label>
                  <Input id="fontFamily" value={data.theme?.fontFamily || ''} onChange={(e) => setData((d) => d ? { ...d, theme: { ...(d.theme || {}), fontFamily: e.target.value } } : d)} />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-medium">Hero Images</h4>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setData((d) => d ? { ...d, theme: { ...(d.theme || {}), heroImages: [...(d.theme?.heroImages || []), { url: '', alt: '', hint: '' }] } } : d)}>Add</Button>
                    <Button variant="secondary" size="sm" onClick={() => setData((d) => d ? { ...d, theme: { ...(d.theme || {}), heroImages: [
                      { url: 'https://picsum.photos/seed/hero-travel-mountain-lake/1080/720', hint: 'mountain lake', alt: 'A stunning mountain lake at sunset' },
                      { url: 'https://picsum.photos/seed/hero-travel-tropical-beach/1080/720', hint: 'tropical beach', alt: 'A serene tropical beach with palm trees' },
                      { url: 'https://picsum.photos/seed/hero-travel-city-night/1080/720', hint: 'city night skyline', alt: 'City skyline at night with lights' },
                      { url: 'https://picsum.photos/seed/hero-travel-desert-dunes/1080/720', hint: 'desert dunes', alt: 'Golden desert dunes under blue sky' },
                    ] } } : d)}>Use Sample</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {(data.theme?.heroImages || []).map((img, idx) => (
                    <div key={idx} className="grid md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label>URL</Label>
                        <Input value={img.url} onChange={(e) => setData((d) => {
                          if (!d) return d
                          const next = [...(d.theme?.heroImages || [])]
                          next[idx] = { ...next[idx], url: e.target.value }
                          return { ...d, theme: { ...(d.theme || {}), heroImages: next } }
                        })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Alt</Label>
                        <Input value={img.alt || ''} onChange={(e) => setData((d) => {
                          if (!d) return d
                          const next = [...(d.theme?.heroImages || [])]
                          next[idx] = { ...next[idx], alt: e.target.value }
                          return { ...d, theme: { ...(d.theme || {}), heroImages: next } }
                        })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Hint</Label>
                        <div className="flex gap-2">
                          <Input value={img.hint || ''} onChange={(e) => setData((d) => {
                            if (!d) return d
                            const next = [...(d.theme?.heroImages || [])]
                            next[idx] = { ...next[idx], hint: e.target.value }
                            return { ...d, theme: { ...(d.theme || {}), heroImages: next } }
                          })} />
                          <Button variant="destructive" onClick={() => setData((d) => {
                            if (!d) return d
                            const next = [...(d.theme?.heroImages || [])]
                            next.splice(idx, 1)
                            return { ...d, theme: { ...(d.theme || {}), heroImages: next } }
                          })}>Remove</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Navigation Menu</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Edit primary menu items</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setData((d) => d ? { ...d, navigation: [...(d.navigation || []), { label: '', href: '/', visible: true }] } : d)}>Add Item</Button>
                    <Button variant="secondary" size="sm" onClick={() => setData((d) => d ? { ...d, navigation: [
                      { label: 'Home', href: '/', visible: true },
                      { label: 'Destinations', href: '/destinations', visible: true },
                      { label: 'Accommodation', href: '/accommodation', visible: true },
                      { label: 'Experiences', href: '/experiences', visible: true },
                      { label: 'About', href: '/about', visible: true },
                      { label: 'Blog', href: '/blog', visible: true },
                      { label: 'Contact', href: '/contact', visible: true },
                      { label: 'Book Now', href: '/book', visible: true },
                    ] } : d)}>Use Primary Menu</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {(data.navigation || []).map((item, idx) => (
                    <div key={idx} className="grid md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label>Label</Label>
                        <Input value={item.label || ''} onChange={(e) => setData((d) => {
                          if (!d) return d
                          const next = [...(d.navigation || [])]
                          next[idx] = { ...next[idx], label: e.target.value }
                          return { ...d, navigation: next }
                        })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Href</Label>
                        <Input value={item.href || ''} onChange={(e) => setData((d) => {
                          if (!d) return d
                          const next = [...(d.navigation || [])]
                          next[idx] = { ...next[idx], href: e.target.value }
                          return { ...d, navigation: next }
                        })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Visible</Label>
                        <div className="flex gap-2 items-center">
                          <Button variant={item.visible ? 'default' : 'outline'} size="sm" onClick={() => setData((d) => {
                            if (!d) return d
                            const next = [...(d.navigation || [])]
                            next[idx] = { ...next[idx], visible: !next[idx].visible }
                            return { ...d, navigation: next }
                          })}>{item.visible ? 'Visible' : 'Hidden'}</Button>
                          <Button variant="destructive" size="sm" onClick={() => setData((d) => {
                            if (!d) return d
                            const next = [...(d.navigation || [])]
                            next.splice(idx, 1)
                            return { ...d, navigation: next }
                          })}>Remove</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
