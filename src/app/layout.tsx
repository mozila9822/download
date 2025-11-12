import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import './admin/calendar-style.css';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase';
import { getSiteSettings } from '@/lib/settings';
import ThemeVars from '@/components/site/ThemeVars';
import CookieConsent from '@/components/site/CookieConsent';

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const keywords = Array.isArray(s.seoKeywords)
    ? s.seoKeywords
    : String(s.seoKeywords || '')
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);
  return {
    title: s.seoTitle || s.siteTitle || 'VoyagerHub',
    description:
      s.seoDescription ||
      'Explore and book city breaks, tours, hotels, and flights with VoyagerHub. Your adventure starts here.',
    keywords,
    icons: { icon: s.faviconUrl || '/favicon.ico' },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=PT+Sans:wght@400;700&family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        {process.env.NEXT_PUBLIC_GTAG_ID && (
          <>
            <script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GTAG_ID}`} async />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${process.env.NEXT_PUBLIC_GTAG_ID}');`,
              }}
            />
          </>
        )}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'}); var f=d.getElementsByTagName(s)[0], j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:''; j.async=true; j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl; f.parentNode.insertBefore(j,f); })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');`,
            }}
          />
        )}
      </head>
      <body className={cn('font-body antialiased scroll-smooth')}>
        <ThemeVars />
        <FirebaseClientProvider>
          <div className="flex flex-col min-h-screen bg-background text-foreground">
            <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
              <div className="absolute -top-24 -left-24 h-[48rem] w-[48rem] rounded-full bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 blur-3xl page-aurora" />
              <div className="absolute top-1/3 right-[-12rem] h-[36rem] w-[36rem] rounded-full bg-gradient-to-br from-accent/10 via-primary/20 to-secondary/10 blur-3xl page-orb" />
            </div>
            {children}
          </div>
        </FirebaseClientProvider>
        <CookieConsent />
        <Toaster />
      </body>
    </html>
  );
}
