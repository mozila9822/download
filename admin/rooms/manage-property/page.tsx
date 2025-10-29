
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, MoreVertical, Trash2, Star } from 'lucide-react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const existingPhotos = [
    { id: '1', url: 'https://picsum.photos/seed/prop-img-1/400/300', caption: 'Lobby Area', isCover: true },
    { id: '2', url: 'https://picsum.photos/seed/prop-img-2/400/300', caption: 'Outdoor Pool', isCover: false },
    { id: '3', url: 'https://picsum.photos/seed/prop-img-3/400/300', caption: 'King Suite', isCover: false },
    { id: '4', url: 'https://picsum.photos/seed/prop-img-4/400/300', caption: 'Restaurant', isCover: false },
]

export default function ManagePropertyPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Property Information</CardTitle>
        <CardDescription>
          Update your property's details, policies, and contact information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8">
          {/* Property Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">
              Property Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="propertyName">Property Name</Label>
                <Input
                  id="propertyName"
                  defaultValue="VoyageHub Downtown"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type</Label>
                <Select defaultValue="hotel">
                  <SelectTrigger id="propertyType">
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="guesthouse">Guesthouse</SelectItem>
                    <SelectItem value="resort">Resort</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="A short description of the property, including key selling points."
                rows={4}
              />
            </div>
            <div className="space-y-2">
                <Label htmlFor="languages">Languages Spoken</Label>
                <Input id="languages" placeholder="e.g., English, Spanish, French" />
            </div>
          </div>

          {/* Contact Information Section */}
           <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input id="email" type="email" placeholder="e.g., contact@voyagehub.com" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Contact Phone</Label>
                    <Input id="phone" type="tel" placeholder="e.g., +1 234 567 890" />
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" placeholder="123 Main Street, New York, NY 10001" />
            </div>
          </div>
          
            {/* Photos & Media Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">
                    Photos & Media
                </h3>
                <div className="space-y-2">
                    <Label>Upload New Photos</Label>
                    <div className="flex items-center justify-center w-full">
                        <Label
                            htmlFor="dropzone-file"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground">PNG, JPG, GIF (MAX. 2MB)</p>
                            </div>
                            <Input id="dropzone-file" type="file" className="hidden" multiple />
                        </Label>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Photo Gallery</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {existingPhotos.map(photo => (
                            <Card key={photo.id} className="relative group overflow-hidden">
                                <Image src={photo.url} alt={photo.caption} width={400} height={300} className="object-cover aspect-video" />
                                {photo.isCover && (
                                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                                        <Star className="w-3 h-3" /> Cover
                                    </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white text-xs truncate">
                                    {photo.caption}
                                </div>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="secondary" size="icon" className="h-7 w-7">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                                <Star className="mr-2 h-4 w-4" /> Set as cover
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Rates & Pricing Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">
                    Rates & Pricing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="baseRate">Base Rate (per night)</Label>
                        <Input id="baseRate" type="number" placeholder="e.g., 150" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select defaultValue="usd">
                            <SelectTrigger id="currency">
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="usd">USD</SelectItem>
                                <SelectItem value="eur">EUR</SelectItem>
                                <SelectItem value="gbp">GBP</SelectItem>
                                <SelectItem value="jpy">JPY</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="taxes">Taxes & Fees (%)</Label>
                        <Input id="taxes" type="number" placeholder="e.g., 8.5" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="minStay">Min Stay (nights)</Label>
                        <Input id="minStay" type="number" placeholder="e.g., 1" defaultValue={1} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="maxStay">Max Stay (nights)</Label>
                        <Input id="maxStay" type="number" placeholder="e.g., 30" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="seasonalPricing">Seasonal Pricing Rules</Label>
                    <Textarea id="seasonalPricing" placeholder="e.g., 20% surcharge during December." rows={2} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="discounts">Discounts & Promotions</Label>
                    <Textarea id="discounts" placeholder="e.g., 15% off for stays longer than 7 nights." rows={2} />
                </div>
            </div>

          {/* Policies Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">
              Policies & Rules
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="checkIn">Check-in Time</Label>
                <Input id="checkIn" type="time" defaultValue="15:00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOut">Check-out Time</Label>
                <Input id="checkOut" type="time" defaultValue="11:00" />
              </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="houseRules">House Rules</Label>
                <Textarea id="houseRules" placeholder="e.g., No smoking, no pets, quiet hours after 10 PM." rows={3} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="accessibility">Accessibility Information</Label>
                <Textarea id="accessibility" placeholder="e.g., Wheelchair accessible, elevator available." rows={3} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
