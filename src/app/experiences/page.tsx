"use client";
import SiteLayout from "@/components/site/SiteLayout";
import ServiceCard from "@/components/site/ServiceCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import type { Service } from "@/lib/types";

const categories = [
  { key: "Luxury Escapes", value: "City Break" },
  { key: "Adventure", value: "Tour" },
  { key: "Family Holidays", value: "City Break" },
  { key: "Romantic Trips", value: "City Break" },
  { key: "City Breaks", value: "City Break" },
];

export default function ExperiencesPage() {
  const [all, setAll] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/services`);
        const data: Service[] = await res.json();
        if (mounted) setAll(data);
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
          <h1 className="text-3xl md:text-5xl font-headline font-bold">Experiences</h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-lg">Curated packages across luxury, adventure, family, and romantic themes.</p>
        </div>
        <div className="mt-10">
          <Tabs defaultValue={categories[0].key} className="w-full">
            <div className="flex justify-center">
              <TabsList className="grid w-full max-w-3xl grid-cols-2 md:grid-cols-5">
                {categories.map((c) => (
                  <TabsTrigger key={c.key} value={c.key}>{c.key}</TabsTrigger>
                ))}
              </TabsList>
            </div>
            {categories.map((c) => (
              <TabsContent key={c.key} value={c.key} className="mt-8">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {loading && Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
                  ))}
                  {!loading && all.filter(s => s.category === c.value).map(s => (
                    <ServiceCard key={s.id} service={s} />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </SiteLayout>
  );
}

