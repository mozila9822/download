"use client";
import SiteLayout from "@/components/site/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function AboutPage() {
  return (
    <SiteLayout>
      <div className="container py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-headline font-bold">Our Story</h1>
            <p className="mt-4 text-muted-foreground md:text-lg">Voyager Hub is a UK-based travel agency dedicated to crafting modern, luxurious journeys. We combine expert knowledge with seamless technology to deliver unforgettable experiences.</p>
            <p className="mt-4 text-muted-foreground md:text-lg">Our mission is to make planning and booking effortless, with transparent pricing, tailored packages, and trusted partners worldwide.</p>
          </div>
          <div className="relative h-72 rounded-xl overflow-hidden">
            <Image src="https://picsum.photos/seed/team/1200/800" alt="Voyager Hub Team" fill className="object-cover" />
          </div>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {[
            { name: "Ava Brown", role: "Travel Advisor" },
            { name: "Liam Johnson", role: "Operations Lead" },
            { name: "Emma Jones", role: "Customer Success" },
          ].map((m, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="font-headline">{m.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{m.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}

