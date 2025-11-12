"use client";
import Link from 'next/link';
import { useSettings } from '@/hooks/use-settings'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function Footer() {
  const { settings } = useSettings()
  const title = settings?.siteTitle || 'VoyagerHub'
  const disclaimer = settings?.footer?.disclaimer || 'Your ultimate partner for seamless and unforgettable travel adventures.'
  const [auth, setAuth] = useState<{ email: string; role: string; isAdmin: boolean } | null>(null)
  useEffect(() => { let cancelled = false; (async () => { try { const res = await fetch('/api/auth/session', { method: 'GET' }); if (!res.ok) { if (!cancelled) setAuth(null); return; } const data = await res.json().catch(() => ({})); if (data?.authenticated && data?.user) { if (!cancelled) setAuth({ email: data.user.email, role: data.user.role, isAdmin: !!data.user.isAdmin }); } else { if (!cancelled) setAuth(null); } } catch { if (!cancelled) setAuth(null); } })(); return () => { cancelled = true } }, [])

  return (
    <footer className="relative bg-transparent text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute bottom-[-6rem] left-[-8rem] h-[22rem] w-[22rem] rounded-full bg-gradient-to-tr from-secondary/30 via-primary/20 to-accent/20 blur-2xl page-orb" />
      </div>
      <div className="container py-12">
        <div className="space-y-4">
          <p className="text-sm">
            {disclaimer}
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <ul className="space-y-2 text-sm">
              <li><Link href="/services" className="hover:underline">City Breaks</Link></li>
              <li><Link href="/services" className="hover:underline">Tours</Link></li>
              <li><Link href="/services" className="hover:underline">Hotels</Link></li>
              <li><Link href="/services" className="hover:underline">Flights</Link></li>
            </ul>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:underline">About Us</Link></li>
              <li><Link href="#" className="hover:underline">Contact</Link></li>
              <li><Link href="/ai-itinerary" className="hover:underline">AI Planner</Link></li>
              <li><Link href="/admin" className="hover:underline">Admin Login</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-sm">
          &copy; {new Date().getFullYear()} {title}. All rights reserved.
        </div>
        {auth?.isAdmin && (
          <div className="mt-6 flex justify-end">
            <Button asChild variant="secondary">
              <Link href="/admin/settings">Theme Settings</Link>
            </Button>
          </div>
        )}
      </div>
    </footer>
  );
}
