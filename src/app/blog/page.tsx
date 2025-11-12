"use client";
import SiteLayout from "@/components/site/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

const posts = [
  { title: "Top 10 Luxury Escapes", img: "https://picsum.photos/seed/blog1/800/500", excerpt: "From Maldives to Santorini, discover destinations that define luxury." },
  { title: "Family-Friendly City Breaks", img: "https://picsum.photos/seed/blog2/800/500", excerpt: "Plan the perfect weekend with kids across Europe’s charming cities." },
  { title: "Adventure Tours to Remember", img: "https://picsum.photos/seed/blog3/800/500", excerpt: "Safari, trekking, and more—curated adventures around the globe." },
];

export default function BlogPage() {
  return (
    <SiteLayout>
      <div className="container py-12 md:py-16">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-headline font-bold">Blog</h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-lg">Inspiration, tips, and travel stories.</p>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {posts.map((p, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="relative h-44">
                <Image src={p.img} alt={p.title} fill className="object-cover" />
              </div>
              <CardHeader>
                <CardTitle className="font-headline">{p.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{p.excerpt}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}

