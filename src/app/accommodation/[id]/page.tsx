"use client";
import SiteLayout from "@/components/site/SiteLayout";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

type Service = { id: string; category: string; title: string; description: string; price: number; offerPrice?: number; location: string; imageUrl: string };
type DaySlot = { start: string; end: string; available: boolean }

export default function AccommodationDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const [svc, setSvc] = useState<Service | null>(null);
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<DaySlot[]>([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/services?q=${encodeURIComponent(id)}`);
        const data = await res.json();
        if (mounted && Array.isArray(data)) {
          const found = data.find((s: Service) => s.id === id) || null;
          setSvc(found);
        }
      } catch { if (mounted) setSvc(null) }
    })();
    return () => { mounted = false };
  }, [id]);

  useEffect(() => {
    const loadSlots = async () => {
      setSlots([]);
      try {
        const res = await fetch(`/api/services/${id}/availability?date=${encodeURIComponent(date)}`, { cache: 'no-store' });
        const data = await res.json();
        if (data?.ok && Array.isArray(data.slots)) setSlots(data.slots);
      } catch { setSlots([]) }
    };
    loadSlots();
  }, [id, date]);

  const price = svc ? (svc.offerPrice ?? svc.price) : 0;

  return (
    <SiteLayout>
      <div className="container py-12 md:py-16">
        {svc ? (
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <div className="relative h-64 rounded-xl overflow-hidden">
                <Image src={svc.imageUrl || `https://picsum.photos/seed/${svc.id}/1200/800`} alt={svc.title} fill className="object-cover" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[1,2,3].map((i) => (
                  <div key={i} className="relative h-24 rounded-lg overflow-hidden">
                    <Image src={`https://picsum.photos/seed/${svc.id}-${i}/600/400`} alt={`${svc.title} ${i}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <h2 className="text-xl font-headline font-semibold">Description</h2>
                <p className="mt-2 text-muted-foreground">{svc.description || 'Comfortable rooms, premium amenities, and great location.'}</p>
              </div>
              <div className="mt-6">
                <h2 className="text-xl font-headline font-semibold">Amenities</h2>
                <ul className="mt-2 list-disc pl-5 text-muted-foreground">
                  <li>Free WiFi</li>
                  <li>Pool & Spa</li>
                  <li>On-site Restaurant</li>
                  <li>24/7 Concierge</li>
                </ul>
              </div>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Availability & Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">From</div>
                      <div className="text-2xl font-semibold">£{Number(price).toFixed(2)}</div>
                    </div>
                    <div>
                      <label className="text-sm">Date</label>
                      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full rounded-md border bg-background p-2" />
                    </div>
                    <div>
                      <div className="text-sm mb-2">Time Slots</div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {slots.length === 0 && <div className="text-sm text-muted-foreground">No slots available.</div>}
                        {slots.map((slot) => {
                          const startLocal = new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          const endLocal = new Date(slot.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          return (
                            <Button key={slot.start} variant={slot.available ? 'outline' : 'secondary'} disabled={!slot.available} asChild>
                              <a href={`/book?serviceId=${encodeURIComponent(id)}&date=${encodeURIComponent(date)}`}>{startLocal} - {endLocal}</a>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild><a href={`/book?serviceId=${encodeURIComponent(id)}`}>Book & Pay</a></Button>
                      <Button variant="secondary" asChild><a href={`/contact`}>Request a Callback</a></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Loading accommodation…</p>
        )}
      </div>
    </SiteLayout>
  );
}

