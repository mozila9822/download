import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import ThemeVars from '@/components/site/ThemeVars';
import './globals.css';
import { cn } from '@/lib/utils';
// Firebase removed: provider no longer used

export const metadata: Metadata = {
  title: 'VoyagerHub - Your Ultimate Travel Partner',
  description:
    'Explore and book city breaks, tours, hotels, and flights with VoyagerHub. Your adventure starts here.',
};

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
      <body className={cn('font-body antialiased min-h-screen bg-background text-foreground')}>
        <ThemeVars />
        <div className="flex flex-col min-h-screen">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
