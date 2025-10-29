'use client';
import SiteLayout from '@/components/site/SiteLayout';
import ServiceCard from '@/components/site/ServiceCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import type { Service } from '@/lib/types';

const categories = [
  'All',
  'City Break',
  'Tour',
  'Hotel',
  'Flight',
  'Coach Ride',
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        if (mounted) setServices(data);
      } catch (e) {
        console.error('Failed to load services', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);


  const CategoryServices = ({ category }: { category: string }) => {
    const [categoryServices, setCategoryServices] = useState<Service[] | null>(null);
    const [isCategoryLoading, setCategoryLoading] = useState<boolean>(true);

    useEffect(() => {
      let mounted = true;
      const load = async () => {
        setCategoryLoading(true);
        try {
          const q = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
          const res = await fetch(`/api/services${q}`);
          const data = await res.json();
          if (mounted) setCategoryServices(data);
        } catch (e) {
          console.error('Failed to load category services', e);
        } finally {
          if (mounted) setCategoryLoading(false);
        }
      };
      load();
      return () => {
        mounted = false;
      };
    }, [category]);

    if (isCategoryLoading) return <p>Loading services...</p>;

    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-8">
        {categoryServices?.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    );
  };

  return (
    <SiteLayout>
      <div className="container py-12 md:py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">
            Explore Our Services
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-lg">
            From relaxing city breaks to adventurous tours, we have something
            for every traveler.
          </p>
        </div>

        <Tabs defaultValue="All" className="mt-12">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-2xl grid-cols-3 md:grid-cols-6">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="All">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-8">
              {isLoading && <p>Loading services...</p>}
              {services && services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </TabsContent>

          {categories.slice(1).map((category) => (
            <TabsContent key={category} value={category}>
              <CategoryServices category={category} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </SiteLayout>
  );
}
