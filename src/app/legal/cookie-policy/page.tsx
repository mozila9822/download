"use client";
import SiteLayout from "@/components/site/SiteLayout";

export default function CookiePolicyPage() {
  return (
    <SiteLayout>
      <div className="container py-12 md:py-16">
        <h1 className="text-3xl md:text-5xl font-headline font-bold">Cookie Policy</h1>
        <p className="mt-4 text-muted-foreground md:text-lg">We use necessary and analytics cookies to improve the site. You can manage preferences through your browser settings.</p>
      </div>
    </SiteLayout>
  );
}

