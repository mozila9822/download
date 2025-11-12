"use client";
import SiteLayout from "@/components/site/SiteLayout";

export default function PrivacyPolicyPage() {
  return (
    <SiteLayout>
      <div className="container py-12 md:py-16">
        <h1 className="text-3xl md:text-5xl font-headline font-bold">Privacy Policy</h1>
        <p className="mt-4 text-muted-foreground md:text-lg">We respect your privacy and comply with GDPR. Personal data is processed securely and only for providing services you request.</p>
      </div>
    </SiteLayout>
  );
}

