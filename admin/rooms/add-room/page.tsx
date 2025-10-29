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

export default function AddRoomPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Room</CardTitle>
        <CardDescription>
          Fill in the details to add a new room to a property.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
           <div className="space-y-2">
              <Label htmlFor="roomNumber">Room Number/Name</Label>
              <Input id="roomNumber" placeholder="e.g., 101 or 'The Sunset Suite'" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="roomType">Room Type</Label>
              <Input id="roomType" placeholder="e.g., Single, Double, Suite" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="price">Price per night</Label>
              <Input id="price" type="number" placeholder="e.g., 150" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                <Input id="amenities" placeholder="e.g., King Bed, Ocean View, Balcony" />
            </div>
            <Button type="submit">Save Room</Button>
        </form>
      </CardContent>
    </Card>
  );
}
