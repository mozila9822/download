'use client';
import Image from 'next/image';
import Link from 'next/link';
import {
  Building,
  Plus,
  PlusCircle,
  MoreVertical,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { properties } from '@/lib/data';

export default function RoomsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline">
            Rooms & Properties
          </h1>
          <p className="text-muted-foreground">
            Manage all your properties and their rooms.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/rooms/add-property">
            <Plus className="mr-2" /> Add Property
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {properties && properties.map((property) => (
          <Card key={property.id} className="flex flex-col">
            <CardHeader className="p-0 relative">
              <Image
                src={property.imageUrl}
                alt={property.name}
                width={600}
                height={400}
                className="rounded-t-lg object-cover aspect-video"
              />
            </CardHeader>
            <CardContent className="flex-1 pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="font-headline text-xl">
                    {property.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Building className="w-4 h-4" /> {property.location}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="-mt-2">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/admin/rooms/manage-facilities">Manage Property Facilities</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/rooms/manage-amenities">Manage Rooms & Amenities</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {property.amenities?.map((amenity: string) => (
                  <Badge key={amenity} variant="secondary">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex-col items-start gap-4">
               <div className="text-sm text-muted-foreground font-medium">
                {property.roomCount} Rooms
              </div>
              <div className="flex w-full gap-2">
                 <Button variant="outline" className="w-full" asChild>
                    <Link href="/admin/rooms/manage-property">Manage Property</Link>
                </Button>
                <Button className="w-full" asChild>
                    <Link href="/admin/rooms/add-room"><PlusCircle className="mr-2" /> Add Room</Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
