import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { cn } from '@/lib/utils';
import { getSiteSettings } from '@/lib/settings';
import ThemeVars from '@/components/site/ThemeVars';
// Firebase removed: provider no longer used

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
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased scroll-smooth')}>
        <ThemeVars />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
