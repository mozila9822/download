'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlaneTakeoff, Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSettings } from '@/hooks/use-settings'
import { useEffect, useState } from 'react';
// Firebase removed: no auth-dependent UI

function useNav() {
  const { settings } = useSettings()
  const serviceCategories = (settings?.sections ?? []).filter((s) => s.visible)
  const navLinks = (settings?.navigation ?? []).filter((n) => n.visible)
  const title = settings?.siteTitle || 'VoyagerHub'
  const logoUrl = settings?.logoUrl || null
  return { serviceCategories, navLinks, title, logoUrl }
}

export default function Header() {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');
  const { serviceCategories, navLinks, title, logoUrl } = useNav()
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
    <header className={isAuthPage ? "relative z-50 w-full bg-background" : "sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"}>
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={title} className="h-6 w-6 object-contain" />
          ) : (
            <PlaneTakeoff className="h-6 w-6 text-primary" />
          )}
          <span className="font-bold font-headline text-lg">{title}</span>
        </Link>
        <div className="flex-1">
          {!isMobile && (
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              {serviceCategories.map(({ href, name }) => (
                <Link
                  key={href + name}
                  href={href}
                  className="transition-colors hover:text-primary"
                >
                  {name}
                </Link>
              ))}

              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="transition-colors hover:text-primary"
                >
                  {label}
                </Link>
              ))}
            </nav>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {!auth && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </>
          )}
          {auth && (
            <>
              {auth.isAdmin && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/workers">Admin</Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" asChild>
                <Link href="/profile">Profile</Link>
              </Button>
              <Button size="sm" onClick={signOut}>Sign Out</Button>
            </>
          )}

          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4">
                  <Link href="/" className="mr-6 flex items-center space-x-2">
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoUrl} alt={title} className="h-6 w-6 object-contain" />
                    ) : (
                      <PlaneTakeoff className="h-6 w-6 text-primary" />
                    )}
                    <span className="font-bold font-headline text-lg">{title}</span>
                  </Link>
                  <nav className="flex flex-col space-y-2">
                     <p className="px-3 py-2 text-sm font-semibold">Services</p>
                    {serviceCategories.map(({ href, name }) => (
                       <SheetClose asChild key={href+name}>
                        <Link
                          href={href}
                          className="px-3 py-2 rounded-md transition-colors hover:bg-accent text-muted-foreground"
                        >
                          {name}
                        </Link>
                      </SheetClose>
                    ))}
                    <div className='pt-4'>
                    {navLinks.map(({ href, label }) => (
                      <SheetClose asChild key={href}>
                        <Link
                          href={href}
                          className="px-3 py-2 rounded-md transition-colors hover:bg-accent"
                        >
                          {label}
                        </Link>
                      </SheetClose>
                    ))}
                    </div>
                    <div className='pt-4 flex gap-2'>
                      {!auth && (
                        <>
                          <SheetClose asChild>
                            <Link href="/auth/signin" className="px-3 py-2 rounded-md transition-colors hover:bg-accent">Sign In</Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link href="/auth/signup" className="px-3 py-2 rounded-md transition-colors hover:bg-accent">Sign Up</Link>
                          </SheetClose>
                        </>
                      )}
                      {auth && (
                        <>
                          {auth.isAdmin && (
                            <SheetClose asChild>
                              <Link href="/admin/workers" className="px-3 py-2 rounded-md transition-colors hover:bg-accent">Admin</Link>
                            </SheetClose>
                          )}
                          <SheetClose asChild>
                            <Link href="/profile" className="px-3 py-2 rounded-md transition-colors hover:bg-accent">Profile</Link>
                          </SheetClose>
                          <Button size="sm" onClick={signOut}>Sign Out</Button>
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
