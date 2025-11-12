"use client";
import SiteLayout from "@/components/site/SiteLayout";

export default function TermsPage() {
  return (
    <SiteLayout>
      <div className="container py-12 md:py-16">
        <h1 className="text-3xl md:text-5xl font-headline font-bold">Terms & Conditions</h1>
        <p className="mt-4 text-muted-foreground md:text-lg">Bookings are subject to availability and provider terms. Refunds and changes follow the policies outlined at checkout.</p>
      </div>
    </SiteLayout>
  );
}

