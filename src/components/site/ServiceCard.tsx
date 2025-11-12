"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import type { Service } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type ServiceCardProps = {
  service: Service;
};

export default function ServiceCard({ service }: ServiceCardProps) {
  const hasOffer = service.offerPrice && service.offerPrice < service.price;
  const fallbackImage =
    PlaceHolderImages.find((img) => img.id === 'tour-safari')?.imageUrl ||
    'https://picsum.photos/seed/service-card-fallback/1200/800';
  const imageSrc = service.imageUrl || fallbackImage;
  const todayIso = new Date().toISOString().split('T')[0]
  const withinWindow = (() => {
    const s = service.startDate ? new Date(service.startDate) : null
    const e = service.endDate ? new Date(service.endDate as any) : null
    const t = new Date(todayIso)
    if (s && t < s) return false
    if (e && t > e) return false
    return true
  })()
  const isAvail = (service.available ?? true) && withinWindow

  return (
    <>
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group rounded-xl border border-white/10 bg-black/30 backdrop-blur">
      <CardHeader className="p-0 relative">
        <div className="relative aspect-video">
          <Image
            src={imageSrc}
            alt={service.title}
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition" />
        </div>
        <Badge variant={isAvail ? "default" : "destructive"} className="absolute top-3 left-3 text-xs rounded-full px-2 py-1">
          {isAvail ? 'Available' : 'Unavailable'}
        </Badge>
        {hasOffer && (
          <Badge variant="destructive" className="absolute top-3 right-3 text-xs rounded-full px-2 py-1">
            DEAL!
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex-1 pt-4">
        <CardTitle className="font-headline text-lg leading-snug group-hover:text-primary transition-colors">
          {service.title}
        </CardTitle>
        <div className="mt-1 flex items-center text-xs text-white/80">
          <MapPin className="w-4 h-4 mr-1.5" />
          <span>{service.location}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className='flex flex-col items-start'>
            {hasOffer ? (
                <>
                    <p className="text-xs text-white/70 line-through">
                        £{service.price.toLocaleString()}
                    </p>
                    <p className="text-lg font-bold text-accent">
                        £{service.offerPrice?.toLocaleString()}
                    </p>
                </>
            ) : (
                <p className="text-lg font-bold text-primary">
                    £{service.price.toLocaleString()}
                </p>
            )}
        </div>
        <Button asChild className="rounded-lg">
          <Link href={`/book?serviceId=${encodeURIComponent(service.id)}`}>
            Book & Pay
          </Link>
        </Button>
      </CardFooter>
    </Card>
    
    </>
  );
}
