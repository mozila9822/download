"use client";
import SiteLayout from "@/components/site/SiteLayout";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

type Service = { id: string; category: string; title: string; description: string; price: number; offerPrice?: number; location: string; imageUrl: string };

export default function DestinationDetailPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const regionLabel = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const [hotels, setHotels] = useState<Service[]>([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/services?category=Hotel&q=${encodeURIComponent(regionLabel)}`);
        const data = await res.json();
        if (mounted && Array.isArray(data)) setHotels(data);
      } catch {
        if (mounted) setHotels([]);
      }
    })();
    return () => { mounted = false };
  }, [regionLabel]);

  return (
    <SiteLayout>
      <div className="container py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h1 className="text-3xl md:text-5xl font-headline font-bold">{regionLabel}</h1>
            <p className="mt-4 text-muted-foreground md:text-lg">Discover key attractions and luxury stays across {regionLabel}.</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[1,2,3,4].map((i) => (
                <div key={i} className="relative h-32 rounded-lg overflow-hidden">
                  <Image src={`https://picsum.photos/seed/${slug}-${i}/600/400`} alt={`${regionLabel} ${i}`} fill className="object-cover" />
                </div>
              ))}
            </div>
            <div className="mt-8">
              <h2 className="text-xl font-headline font-semibold">Key Attractions</h2>
              <ul className="mt-3 list-disc pl-5 text-muted-foreground">
                <li>Iconic landmarks and cultural sites</li>
                <li>Best dining and nightlife districts</li>
                <li>Scenic viewpoints and hidden gems</li>
                <li>Guided tours and unique local experiences</li>
              </ul>
            </div>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Featured Accommodation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {hotels.length === 0 && <p className="text-sm text-muted-foreground">No featured hotels found. Browse all accommodation.</p>}
                  {hotels.map((h) => (
                    <div key={h.id} className="flex gap-3 items-center">
                      <div className="relative w-24 h-16 rounded-md overflow-hidden">
                        <Image src={h.imageUrl || `https://picsum.photos/seed/${h.id}/300/200`} alt={h.title} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{h.title}</div>
                        <div className="text-sm text-muted-foreground">£{(h.offerPrice ?? h.price).toFixed(2)}</div>
                      </div>
                      <Button asChild size="sm"><Link href={`/book?serviceId=${encodeURIComponent(h.id)}`}>Book Now</Link></Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

