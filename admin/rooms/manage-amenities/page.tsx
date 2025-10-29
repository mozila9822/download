import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ManageAmenitiesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Rooms & Amenities</CardTitle>
        <CardDescription>
          View, add, or edit room types and their amenities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Room and amenity management interface will be here.</p>
      </CardContent>
    </Card>
  );
}
