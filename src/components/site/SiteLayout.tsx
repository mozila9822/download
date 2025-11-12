"use client";
import type { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

type SiteLayoutProps = {
  children: ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
};

export default function SiteLayout({ children, hideHeader, hideFooter }: SiteLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      {!hideHeader && <Header />}
      <main className="flex-1 pt-0 text-foreground">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}
