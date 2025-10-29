"use client";
import SiteLayout from "@/components/site/SiteLayout";
import ServiceCard from "@/components/site/ServiceCard";
import { useEffect, useState } from "react";
import type { Service } from "@/lib/types";

export default function OffersPage() {
  const [offers, setOffers] = useState<Service[] | null>(null);
  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/services');
        const data: Service[] = await res.json();
        const filtered = data.filter((s) => !!s.offerPrice);
        if (mounted) setOffers(filtered);
      } catch (e) {
        console.error('Failed to load offers', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false };
  }, []);

  return (
    <SiteLayout>
      <div className="container py-12 md:py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">Last Offer</h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-lg">
            Grab these exclusive deals before they're gone!
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-12">
          {isLoading && <p>Loading offers...</p>}
          {offers && offers.map((offer) => (
            <ServiceCard key={offer.id} service={offer} />
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}

