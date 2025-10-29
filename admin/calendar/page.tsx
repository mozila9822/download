import BookingCalendar from '@/components/admin/BookingCalendar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function CalendarPage() {
  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Booking Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <BookingCalendar />
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary text-primary-foreground rounded-md p-2 text-center">
                    <p className="text-xs">NOV</p>
                    <p className="font-bold">29</p>
                </div>
                <div>
                    <h4 className="font-semibold">Paris Tour Start</h4>
                    <p className="text-sm text-muted-foreground">Booking #1234 - Olivia Martin</p>
                </div>
              </div>
               <div className="flex items-start gap-4">
                <div className="bg-primary text-primary-foreground rounded-md p-2 text-center">
                    <p className="text-xs">DEC</p>
                    <p className="font-bold">02</p>
                </div>
                <div>
                    <h4 className="font-semibold">Safari Check-in</h4>
                    <p className="text-sm text-muted-foreground">Booking #1238 - Sofia Davis</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
