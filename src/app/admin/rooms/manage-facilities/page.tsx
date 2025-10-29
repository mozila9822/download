'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const generalAmenities = [
    { id: 'wifi', label: 'Wi-Fi' },
    { id: 'parking', label: 'Parking' },
    { id: 'pets', label: 'Pets Allowed' },
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'bar', label: 'Bar/Lounge' },
    { id: 'laundry', label: 'Laundry Service' },
    { id: 'shuttle', label: 'Airport Shuttle' },
];

const wellnessAmenities = [
    { id: 'pool', label: 'Swimming Pool' },
    { id: 'gym', label: 'Fitness Center / Gym' },
    { id: 'spa', label: 'Spa / Wellness Center' },
    { id: 'hottub', label: 'Hot Tub / Jacuzzi' },
]

export default function ManageFacilitiesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Property Facilities</CardTitle>
        <CardDescription>
          Select the facilities and amenities available at your property.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8">
            {/* General Amenities */}
            <div className="space-y-4">
                 <h3 className="text-lg font-medium">General Amenities</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {generalAmenities.map(amenity => (
                         <div key={amenity.id} className="flex items-center space-x-2">
                            <Checkbox id={amenity.id} />
                            <Label htmlFor={amenity.id} className="text-base font-normal">{amenity.label}</Label>
                        </div>
                    ))}
                 </div>
            </div>

            <Separator />
            
            {/* Wellness & Recreation */}
            <div className="space-y-4">
                 <h3 className="text-lg font-medium">Wellness & Recreation</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wellnessAmenities.map(amenity => (
                         <div key={amenity.id} className="flex items-center space-x-2">
                            <Checkbox id={amenity.id} />
                            <Label htmlFor={amenity.id} className="text-base font-normal">{amenity.label}</Label>
                        </div>
                    ))}
                 </div>
            </div>

            <Separator />

            {/* Detailed Options */}
            <div className="space-y-6">
                 <div className="space-y-4 p-4 border rounded-lg">
                    <Label className="text-base">Wi-Fi Details</Label>
                    <RadioGroup defaultValue="free" className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="free" id="wifi-free" />
                            <Label htmlFor="wifi-free">Free</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="paid" id="wifi-paid" />
                            <Label htmlFor="wifi-paid">Paid</Label>
                        </div>
                    </RadioGroup>
                </div>
                
                 <div className="space-y-4 p-4 border rounded-lg">
                    <Label className="text-base">Parking Details</Label>
                    <RadioGroup defaultValue="free" className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="free" id="parking-free" />
                            <Label htmlFor="parking-free">Free</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="paid" id="parking-paid" />
                            <Label htmlFor="parking-paid">Paid</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no-parking" id="no-parking" />
                            <Label htmlFor="no-parking">No Parking Available</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-4 p-4 border rounded-lg">
                    <Label className="text-base">Breakfast Details</Label>
                    <RadioGroup defaultValue="included" className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="included" id="breakfast-included" />
                            <Label htmlFor="breakfast-included">Included</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="optional" id="breakfast-optional" />
                            <Label htmlFor="breakfast-optional">Optional (Paid)</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <RadioGroupItem value="not-available" id="breakfast-not-available" />
                            <Label htmlFor="breakfast-not-available">Not Available</Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>
            
            <Separator />
            
            {/* Custom Amenities */}
            <div className="space-y-4">
                 <h3 className="text-lg font-medium">Add Custom Facility or Amenity</h3>
                 <div className="flex gap-4">
                    <Input placeholder="e.g., Rooftop Terrace" />
                    <Button variant="outline">Add</Button>
                 </div>
                 {/* This would be a list of custom added amenities */}
            </div>


          <div className="flex justify-end">
            <Button type="submit">Save Facilities & Amenities</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
