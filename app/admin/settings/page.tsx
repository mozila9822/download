"use client";
import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import type { SiteSettingsPayload, NavItem, SectionItem, SiteSettingsDto } from '@/lib/types'

type SettingsForm = Omit<SiteSettingsDto, 'seoKeywords'> & { seoKeywords: string[] }

function isValidUrl(url: string): boolean {
  try {
    if (!url) return true
    if (url.startsWith('/')) return true
    const u = new URL(url)
    return !!u
  } catch {
    return false
  }
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<SettingsForm>({
    siteTitle: 'VoyagerHub',
    domains: [],
    logoUrl: '',
    faviconUrl: '',
    navigation: [],
    sections: [],
    footer: { disclaimer: '', contactEmail: '', contactPhone: '', address: '', social: { twitter: '', facebook: '', instagram: '', linkedin: '', youtube: '' } },
    theme: { primaryColor: '', secondaryColor: '', fontFamily: '' },
    seoTitle: '',
    seoDescription: '',
    seoKeywords: [],
    version: 1,
    updatedAt: new Date().toISOString(),
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        // Try admin route first
        let res = await fetch('/api/admin/settings', { method: 'GET' })
        if (!res.ok) {
          // Fallback to public route for basic values
          res = await fetch('/api/settings', { method: 'GET' })
        }
        const data = await res.json().catch(() => null)
        if (!data) throw new Error('Failed to load settings')
        const s = data.settings || data
        const payload: SettingsForm = {
          siteTitle: s.siteTitle || 'VoyagerHub',
          domains: s.domains || [],
          logoUrl: s.logoUrl || '',
          faviconUrl: s.faviconUrl || '',
          navigation: s.navigation || [],
          sections: s.sections || [],
          footer: s.footer || { disclaimer: '', contactEmail: '', contactPhone: '', address: '', social: { twitter: '', facebook: '', instagram: '', linkedin: '', youtube: '' } },
          theme: s.theme || { primaryColor: '', secondaryColor: '', fontFamily: '' },
          seoTitle: s.seoTitle || '',
          seoDescription: s.seoDescription || '',
          seoKeywords: Array.isArray(s.seoKeywords)
            ? (s.seoKeywords as any)
            : String(s.seoKeywords || '')
                .split(',')
                .map((k) => k.trim())
                .filter(Boolean),
          version: s.version || 1,
          updatedAt: s.updatedAt || new Date().toISOString(),
        }
        if (!cancelled) setForm(payload)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load settings')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const addDomain = (d: string) => {
    if (!d) return
    setForm((f) => ({ ...f, domains: Array.from(new Set([...(f.domains || []), d])) }))
  }
  const removeDomain = (d: string) => setForm((f) => ({ ...f, domains: (f.domains || []).filter(x => x !== d) }))

  const addNavItem = () => setForm((f) => ({ ...f, navigation: [...(f.navigation || []), { label: 'New', href: '/', visible: true } as NavItem] }))
  const updateNavItem = (idx: number, item: Partial<NavItem>) => setForm((f) => ({ ...f, navigation: f.navigation.map((n, i) => i === idx ? { ...n, ...item } : n) }))
  const moveNavItem = (idx: number, dir: -1 | 1) => setForm((f) => {
    const arr = [...f.navigation]
    const ni = arr[idx]
    const to = idx + dir
    if (to < 0 || to >= arr.length) return f
    arr.splice(idx, 1)
    arr.splice(to, 0, ni)
    return { ...f, navigation: arr }
  })
  const removeNavItem = (idx: number) => setForm((f) => ({ ...f, navigation: f.navigation.filter((_, i) => i !== idx) }))

  const addSection = () => setForm((f) => ({ ...f, sections: [...(f.sections || []), { name: 'New Section', href: '/', visible: true } as SectionItem] }))
  const updateSection = (idx: number, item: Partial<SectionItem>) => setForm((f) => ({ ...f, sections: f.sections.map((n, i) => i === idx ? { ...n, ...item } : n) }))
  const moveSection = (idx: number, dir: -1 | 1) => setForm((f) => {
    const arr = [...f.sections]
    const ni = arr[idx]
    const to = idx + dir
    if (to < 0 || to >= arr.length) return f
    arr.splice(idx, 1)
    arr.splice(to, 0, ni)
    return { ...f, sections: arr }
  })
  const removeSection = (idx: number) => setForm((f) => ({ ...f, sections: f.sections.filter((_, i) => i !== idx) }))

  const canSave = useMemo(() => {
    if (!form.siteTitle?.trim()) return false
    if (form.logoUrl && !isValidUrl(form.logoUrl)) return false
    if (form.faviconUrl && !isValidUrl(form.faviconUrl)) return false
    for (const n of form.navigation) {
      if (!n.label?.trim()) return false
      if (n.href && !isValidUrl(n.href)) return false
    }
    for (const s of form.sections) {
      if (!s.name?.trim()) return false
      if (s.href && !isValidUrl(s.href)) return false
    }
    return true
  }, [form])

  const save = async () => {
    setSaving(true)
    try {
      const payload: SiteSettingsPayload = {
        ...form,
        seoKeywords: Array.isArray(form.seoKeywords) ? form.seoKeywords.join(', ') : (form.seoKeywords as any),
      }
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || 'Save failed')
      }
      toast({ title: 'Settings saved', description: 'Global configuration updated.' })
    } catch (e: any) {
      toast({ title: 'Save failed', description: e?.message || 'An error occurred' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Manage global site configuration.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-sm text-muted-foreground">Loading settings...</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {!loading && (
          <Tabs defaultValue="general" className="w-full">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="navigation">Navigation</TabsTrigger>
              <TabsTrigger value="sections">Sections</TabsTrigger>
              <TabsTrigger value="footer">Footer</TabsTrigger>
              <TabsTrigger value="theme">Theme</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6 pt-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteTitle">Site Title</Label>
                  <Input id="siteTitle" value={form.siteTitle} onChange={(e) => setForm({ ...form, siteTitle: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Domains</Label>
                  <div className="flex gap-2">
                    <Input placeholder="example.com" onKeyDown={(e) => { if (e.key === 'Enter') addDomain((e.target as HTMLInputElement).value); }} />
                    <Button type="button" variant="outline" onClick={() => {
                      const el = document.querySelector<HTMLInputElement>('input[placeholder="example.com"]')
                      if (el) { addDomain(el.value); el.value = '' }
                    }}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 py-2">
                    {(form.domains || []).map((d) => (
                      <span key={d} className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
                        {d}
                        <button className="text-muted-foreground hover:text-destructive" onClick={() => removeDomain(d)}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <Separator />
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input id="logoUrl" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
                  {form.logoUrl && isValidUrl(form.logoUrl) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.logoUrl} alt="Logo" className="mt-2 h-12 w-12 object-contain" />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="faviconUrl">Favicon URL</Label>
                  <Input id="faviconUrl" value={form.faviconUrl} onChange={(e) => setForm({ ...form, faviconUrl: e.target.value })} />
                  {form.faviconUrl && isValidUrl(form.faviconUrl) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.faviconUrl} alt="Favicon" className="mt-2 h-8 w-8 object-contain" />
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="navigation" className="space-y-6 pt-4">
              <div className="space-y-4">
                {(form.navigation || []).map((n, i) => (
                  <div key={i} className="grid md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2">
                      <Label>Label</Label>
                      <Input value={n.label} onChange={(e) => updateNavItem(i, { label: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Href</Label>
                      <Input value={n.href} onChange={(e) => updateNavItem(i, { href: e.target.value })} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={n.visible} onCheckedChange={(v) => updateNavItem(i, { visible: v })} />
                      <span className="text-sm">Visible</span>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" size="sm" onClick={() => moveNavItem(i, -1)}>Up</Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => moveNavItem(i, 1)}>Down</Button>
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeNavItem(i)}>Remove</Button>
                    </div>
                  </div>
                ))}
                <Button type="button" onClick={addNavItem}>Add Navigation Item</Button>
              </div>
            </TabsContent>

            <TabsContent value="sections" className="space-y-6 pt-4">
              <div className="space-y-4">
                {(form.sections || []).map((n, i) => (
                  <div key={i} className="grid md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input value={n.name} onChange={(e) => updateSection(i, { name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Href</Label>
                      <Input value={n.href} onChange={(e) => updateSection(i, { href: e.target.value })} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={n.visible} onCheckedChange={(v) => updateSection(i, { visible: v })} />
                      <span className="text-sm">Visible</span>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" size="sm" onClick={() => moveSection(i, -1)}>Up</Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => moveSection(i, 1)}>Down</Button>
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeSection(i)}>Remove</Button>
                    </div>
                  </div>
                ))}
                <Button type="button" onClick={addSection}>Add Section</Button>
              </div>
            </TabsContent>

            <TabsContent value="footer" className="space-y-6 pt-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Disclaimer</Label>
                  <Textarea value={form.footer.disclaimer} onChange={(e) => setForm({ ...form, footer: { ...form.footer, disclaimer: e.target.value } })} />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input value={form.footer.contactEmail} onChange={(e) => setForm({ ...form, footer: { ...form.footer, contactEmail: e.target.value } })} />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input value={form.footer.contactPhone} onChange={(e) => setForm({ ...form, footer: { ...form.footer, contactPhone: e.target.value } })} />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea value={form.footer.address} onChange={(e) => setForm({ ...form, footer: { ...form.footer, address: e.target.value } })} />
                </div>
              </div>
              <Separator />
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Twitter</Label>
                  <Input value={form.footer.social.twitter} onChange={(e) => setForm({ ...form, footer: { ...form.footer, social: { ...form.footer.social, twitter: e.target.value } } })} />
                </div>
                <div className="space-y-2">
                  <Label>Facebook</Label>
                  <Input value={form.footer.social.facebook} onChange={(e) => setForm({ ...form, footer: { ...form.footer, social: { ...form.footer.social, facebook: e.target.value } } })} />
                </div>
                <div className="space-y-2">
                  <Label>Instagram</Label>
                  <Input value={form.footer.social.instagram} onChange={(e) => setForm({ ...form, footer: { ...form.footer, social: { ...form.footer.social, instagram: e.target.value } } })} />
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn</Label>
                  <Input value={form.footer.social.linkedin} onChange={(e) => setForm({ ...form, footer: { ...form.footer, social: { ...form.footer.social, linkedin: e.target.value } } })} />
                </div>
                <div className="space-y-2">
                  <Label>YouTube</Label>
                  <Input value={form.footer.social.youtube} onChange={(e) => setForm({ ...form, footer: { ...form.footer, social: { ...form.footer.social, youtube: e.target.value } } })} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="theme" className="space-y-6 pt-4">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Primary Color (HSL)</Label>
                  <Input value={form.theme.primaryColor} onChange={(e) => setForm({ ...form, theme: { ...form.theme, primaryColor: e.target.value } })} placeholder="210 96% 45%" />
                  <div className="mt-2 h-6 w-full rounded" style={{ backgroundColor: `hsl(${form.theme.primaryColor || '208 35% 28%'})` }} />
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color (HSL)</Label>
                  <Input value={form.theme.secondaryColor} onChange={(e) => setForm({ ...form, theme: { ...form.theme, secondaryColor: e.target.value } })} placeholder="160 84% 44%" />
                  <div className="mt-2 h-6 w-full rounded" style={{ backgroundColor: `hsl(${form.theme.secondaryColor || '0 0% 96.1%'})` }} />
                </div>
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Input value={form.theme.fontFamily} onChange={(e) => setForm({ ...form, theme: { ...form.theme, fontFamily: e.target.value } })} placeholder="Inter, system-ui, sans-serif" />
                  <div className="mt-2 h-10 w-full rounded border grid place-items-center" style={{ fontFamily: form.theme.fontFamily || 'inherit' }}>Aa</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label>SEO Title</Label>
                <Input value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>SEO Description</Label>
                <Textarea value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>SEO Keywords (comma separated)</Label>
                <Input value={(form.seoKeywords || []).join(', ')} onChange={(e) => setForm({ ...form, seoKeywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) })} />
              </div>
            </TabsContent>
          </Tabs>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => window.location.reload()}>Reset</Button>
          <Button type="button" disabled={!canSave || saving} onClick={save}>{saving ? 'Saving...' : 'Save Settings'}</Button>
        </div>
      </CardContent>
    </Card>
  )
}
