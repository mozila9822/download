"use client";
import Link from 'next/link';
import { PlaneTakeoff, Twitter, Facebook, Instagram } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings'

export default function Footer() {
  const { settings } = useSettings()
  const title = settings?.siteTitle || 'VoyagerHub'
  const logoUrl = settings?.logoUrl || null
  const social = settings?.footer?.social || { twitter: '', facebook: '', instagram: '', linkedin: '', youtube: '' }
  const disclaimer = settings?.footer?.disclaimer || 'Your ultimate partner for seamless and unforgettable travel adventures.'
  return (
    <footer className="bg-transparent">
      <div className="container py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={title} className="h-6 w-6 object-contain" />
              ) : (
                <PlaneTakeoff className="h-6 w-6 text-primary" />
              )}
              <span className="font-bold font-headline text-lg">{title}</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {disclaimer}
            </p>
          </div>
          <div className="grid grid-cols-2 md:col-span-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Services</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/services" className="text-muted-foreground hover:text-primary">City Breaks</Link></li>
                <li><Link href="/services" className="text-muted-foreground hover:text-primary">Tours</Link></li>
                <li><Link href="/services" className="text-muted-foreground hover:text-primary">Hotels</Link></li>
                <li><Link href="/services" className="text-muted-foreground hover:text-primary">Flights</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-primary">About Us</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Contact</Link></li>
                <li><Link href="/ai-itinerary" className="text-muted-foreground hover:text-primary">AI Planner</Link></li>
                <li><Link href="/admin" className="text-muted-foreground hover:text-primary">Admin Login</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {title}. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            {social.twitter ? <Link href={social.twitter} className="hover:text-primary"><Twitter className="h-5 w-5" /></Link> : null}
            {social.facebook ? <Link href={social.facebook} className="hover:text-primary"><Facebook className="h-5 w-5" /></Link> : null}
            {social.instagram ? <Link href={social.instagram} className="hover:text-primary"><Instagram className="h-5 w-5" /></Link> : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
