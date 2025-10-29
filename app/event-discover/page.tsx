"use client";

import { useEffect, useMemo, useState } from "react";
import SiteLayout from "@/components/site/SiteLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, MapPin, Calendar, Search } from "lucide-react";

type EventItem = {
  id: string;
  title: string;
  date: string;
  venue: string;
  city: string;
  price: string;
  category: string;
  description: string;
  link?: string;
  tags?: string[];
};

const allCategories = ["All", "Music", "Sports", "Tech", "Food", "Art", "Film"] as const;

export default function EventDiscoverPage() {
  const [area, setArea] = useState("");
  const [dateRange, setDateRange] = useState<string>("");
  const [category, setCategory] = useState<(typeof allCategories)[number]>("All");
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedCategories = useMemo(() => {
    if (category === "All") return undefined;
    return [category];
  }, [category]);

  const doSearch = async () => {
    setError(null);
    setLoading(true);
    setEvents(null);
    try {
      const res = await fetch("/api/events/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area, dateRange: dateRange || undefined, categories: selectedCategories }),
      });
      const data = await res.json();
      if (!res.ok && data?.error) {
        setError(data.error || "Search failed");
        setEvents(null);
      } else {
        setEvents((data?.events || []) as EventItem[]);
      }
    } catch (e) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <main className="min-h-[70vh]">
        {/* Animated Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-purple-300/20 to-blue-300/20">
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary/20 blur-3xl animate-pulse" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-indigo-400/20 blur-3xl animate-[pulse_6s_ease_infinite]" />
          <div className="container py-12 md:py-16 relative z-10">
            <div className="text-center">
              <Sparkles className="mx-auto h-12 w-12 text-primary animate-bounce" />
              <h1 className="mt-4 text-4xl md:text-5xl font-headline font-bold">
                Event Discover
              </h1>
              <p className="mt-4 text-muted-foreground md:text-lg max-w-2xl mx-auto">
                Search with AI to find events in any area. Music, tech, food, sports, and more.
              </p>
            </div>
            {/* Search Controls */}
            <div className="mt-10 max-w-3xl mx-auto">
              <Tabs defaultValue="ai" className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="ai">Search with AI</TabsTrigger>
                  <TabsTrigger value="manual">Manual Filters</TabsTrigger>
                </TabsList>
                <TabsContent value="ai" className="pt-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <Input placeholder="Area or city" value={area} onChange={(e) => setArea(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <Input placeholder="Date or range (optional)" value={dateRange} onChange={(e) => setDateRange(e.target.value)} />
                    </div>
                    <div>
                      <Select value={category} onValueChange={(v) => setCategory(v as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {allCategories.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-center">
                    <Button size="lg" onClick={doSearch} className="gap-2">
                      <Search className="h-5 w-5" /> Search with AI
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="manual" className="pt-6">
                  <p className="text-muted-foreground text-center">Use filters above, then click Search. AI improves relevance automatically.</p>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="py-12 md:py-16">
          <div className="container">
            {loading && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="text-center text-red-600">{error}</div>
            )}

            {!loading && events && events.length === 0 && (
              <div className="text-center text-muted-foreground">No events found. Try a broader search.</div>
            )}

            {!loading && events && events.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((evt) => (
                  <Card
                    key={evt.id}
                    className="transition-transform hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20"
                  >
                    <CardHeader>
                      <CardTitle className="font-headline text-lg">
                        {evt.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <p className="text-muted-foreground">{evt.description}</p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div>
                          <span className="block font-medium">Date</span>
                          <span className="text-muted-foreground">{evt.date}</span>
                        </div>
                        <div>
                          <span className="block font-medium">Venue</span>
                          <span className="text-muted-foreground">{evt.venue}</span>
                        </div>
                        <div>
                          <span className="block font-medium">City</span>
                          <span className="text-muted-foreground">{evt.city}</span>
                        </div>
                        <div>
                          <span className="block font-medium">Price</span>
                          <span className="text-muted-foreground">{evt.price}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">
                          {evt.category}
                        </span>
                        {evt.link && (
                          <Button asChild variant="outline" size="sm">
                            <a href={evt.link} target="_blank" rel="noreferrer">Details</a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}

