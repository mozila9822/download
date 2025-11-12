"use client";
import SiteLayout from "@/components/site/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

type Destination = { slug: string; name: string };

export default function DestinationsPage() {
  const [list, setList] = useState<Destination[]>([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/destinations', { cache: 'no-store' });
        const data = await res.json();
        if (mounted && Array.isArray(data)) setList(data);
      } catch { if (mounted) setList([]) }
    })();
    return () => { mounted = false };
  }, []);
  return (
    <SiteLayout>
      <div className="container py-12 md:py-16">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-headline font-bold">Destinations</h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-lg">Explore regions and discover curated guides, hotels, and experiences.</p>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {list.map((r) => (
            <Card key={r.slug} className="overflow-hidden">
              <div className="relative h-48">
                <Image src={`https://picsum.photos/seed/${r.slug}/1080/720`} alt={r.name} fill className="object-cover" />
              </div>
              <CardHeader>
                <CardTitle className="font-headline">{r.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild variant="secondary">
                  <Link href={`/destinations/${r.slug}`}>Explore</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
