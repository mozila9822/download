'use client';

import Link from 'next/link';
import { PlaneTakeoff, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSettings } from '@/hooks/use-settings'
import { useEffect, useState } from 'react';

function useNav() {
  const { settings } = useSettings()
  const navLinks = (settings?.navigation ?? []).filter((n) => n.visible)
  const title = settings?.siteTitle || 'VoyagerHub'
  const logoUrl = settings?.logoUrl || null
  return { navLinks, title, logoUrl }
}

export default function Header() {
  const isMobile = useIsMobile();
  const { navLinks, title, logoUrl } = useNav()
  const [auth, setAuth] = useState<{ email: string; role: string; isAdmin: boolean } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/session', { method: 'GET' });
        if (!res.ok) {
          if (!cancelled) setAuth(null);
          return;
        }
        const data = await res.json().catch(() => ({}));
        if (data?.authenticated && data?.user) {
          if (!cancelled) setAuth({ email: data.user.email, role: data.user.role, isAdmin: !!data.user.isAdmin });
        } else {
          if (!cancelled) setAuth(null);
        }
      } catch {
        if (!cancelled) setAuth(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    window.location.href = '/';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 w-full bg-gradient-to-b from-black/60 via-black/30 to-transparent backdrop-blur border-b border-white/10">
      <div className="container flex items-center justify-between px-4 py-3">
        <Link href="/" className="mr-2 flex items-center space-x-2 text-white">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={title} className="h-6 w-6 object-contain" />
          ) : (
            <PlaneTakeoff className="h-6 w-6 text-white" />
          )}
          <span className="font-bold font-headline text-lg text-white">{title}</span>
        </Link>
        <div className="flex-1">
          {!isMobile && (
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              {navLinks.map(({ href, label }, j) => (
                <motion.div key={href} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * j }}>
                  <Link href={href} className="px-3 py-1 rounded-md transition-colors text-white hover:bg-white/10">
                    {label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/book" className="hidden md:inline-flex">
            <Button size="sm" className="font-bold">Book Now</Button>
          </Link>
          {!auth && (
            <>
              <Link href="/auth/signin" className="transition-colors text-white hover:underline">Sign In</Link>
              <Link href="/auth/signup" className="transition-colors text-white hover:underline">Sign Up</Link>
            </>
          )}
          {auth && (
            <>
              {auth.isAdmin && (
                <Link href="/admin/workers" className="transition-colors text-white hover:underline">Admin</Link>
              )}
              <Link href="/profile" className="transition-colors text-white hover:underline">Profile</Link>
              <button onClick={signOut} className="transition-colors text-white hover:underline">Sign Out</button>
            </>
          )}

          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="border-white text-white hover:bg-white/10">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-black/50 text-white backdrop-blur-md border-0">
                <div className="flex flex-col space-y-4">
                  <Link href="/" className="mr-6 flex items-center space-x-2 text-white">
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoUrl} alt={title} className="h-6 w-6 object-contain" />
                    ) : (
                      <PlaneTakeoff className="h-6 w-6 text-white" />
                    )}
                    <span className="font-bold font-headline text-lg text-white">{title}</span>
                  </Link>
                  <nav className="flex flex-col space-y-2">
                    <div>
                      {navLinks.map(({ href, label }) => (
                        <SheetClose asChild key={href}>
                          <Link
                            href={href}
                            className="px-3 py-2 rounded-md transition-colors hover:bg-white/10 text-white"
                          >
                            {label}
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                    <div className='pt-4'>
                      <SheetClose asChild>
                        <Link href="/book" className="px-3 py-2 rounded-md transition-colors bg-white/10 text-white">
                          Book Now
                        </Link>
                      </SheetClose>
                    </div>
                    <div className='pt-4 flex gap-2'>
                      {!auth && (
                        <>
                          <SheetClose asChild>
                            <Link href="/auth/signin" className="px-3 py-2 rounded-md transition-colors hover:bg-white/10 text-white">Sign In</Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link href="/auth/signup" className="px-3 py-2 rounded-md transition-colors hover:bg-white/10 text-white">Sign Up</Link>
                          </SheetClose>
                        </>
                      )}
                      {auth && (
                        <>
                          {auth.isAdmin && (
                            <SheetClose asChild>
                              <Link href="/admin/workers" className="px-3 py-2 rounded-md transition-colors hover:bg-white/10 text-white">Admin</Link>
                            </SheetClose>
                          )}
                          <SheetClose asChild>
                            <Link href="/profile" className="px-3 py-2 rounded-md transition-colors hover:bg-white/10 text-white">Profile</Link>
                          </SheetClose>
                          <Button variant="outline" size="sm" onClick={signOut} className="border-white text-white hover:bg-transparent">Sign Out</Button>
                        </>
                      )}
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}
