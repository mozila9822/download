'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlaneTakeoff, Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/use-settings'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
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
          <Button variant="outline" size="sm" asChild>
            <Link href="/support">Support</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/signup">Sign Up</Link>
          </Button>

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
                    <SheetClose asChild>
                      <Link
                        href="/support"
                        className="px-3 py-2 rounded-md transition-colors hover:bg-accent"
                      >
                        Support
                      </Link>
                    </SheetClose>
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
