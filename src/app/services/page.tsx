"use client";
import SiteLayout from "@/components/site/SiteLayout";
import { HeroBanner } from "@/components/site/CityBreakTheme";
import ServiceCard from "@/components/site/ServiceCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Service } from "@/lib/types";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

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
  const searchParams = useSearchParams();
  const initialCategory = useMemo(() => {
    const cat = searchParams.get('category');
    if (!cat) return 'All';
    const match = categories.find((c) => c.toLowerCase() === cat.toLowerCase());
    return match || 'All';
  }, [searchParams]);
  const [tab, setTab] = useState<string>('All');

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

  useEffect(() => {
    setTab(initialCategory);
  }, [initialCategory]);

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
      {/* Full-bleed City Break-style Hero */}
      <HeroBanner
        title="Explore Our Services"
        subtitle="From relaxing city breaks to adventurous tours, there’s something for every traveler."
        imageUrl="https://picsum.photos/seed/services-hero/2400/1200"
        primaryLink={{ href: "#categories", label: "Browse Categories" }}
        secondaryLink={{ href: "/offers", label: "See Last Offers" }}
        heightClass="h-[60vh] md:h-[70vh] lg:h-[75vh]"
        fullBleed
        offsetHeader
        icon={
          <motion.div
            initial={{ rotate: -6, y: 0, scale: 1 }}
            animate={{ rotate: [-6, 6, -6], y: [0, -3, 0, 2, -1, 0], scale: [1, 1.06, 1.0, 1.03, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
            aria-hidden
          >
            <Sparkles className="h-8 w-8 text-white drop-shadow" />
          </motion.div>
        }
      />

      <div className="container py-12 md:py-16">
        
        <Tabs id="categories" value={tab} onValueChange={setTab} className="mt-12">
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
