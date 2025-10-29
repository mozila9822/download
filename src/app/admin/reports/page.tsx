'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { properties } from '@/lib/data';
import StatCard from '@/components/admin/StatCard';
import { DollarSign, BedDouble, Users, Percent } from 'lucide-react';
import BookingChart from '@/components/admin/BookingChart';
import OccupancyChart from '@/components/admin/OccupancyChart';


const reportStats = [
    {
        title: "Total Revenue",
        value: "$125,430",
        change: "+15.2% vs last period",
        changeType: 'increase' as const,
        icon: DollarSign
    },
    {
        title: "Avg. Occupancy",
        value: "82.5%",
        change: "+5.1% vs last period",
        changeType: 'increase' as const,
        icon: Percent
    },
    {
        title: "Booked Nights",
        value: "2,104",
        change: "+210 vs last period",
        changeType: 'increase' as const,
        icon: BedDouble
    },
    {
        title: "New Clients",
        value: "45",
        change: "-5 vs last period",
        changeType: 'decrease' as const,
        icon: Users
    }
]

export default function ReportsPage() {

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">
            View detailed reports and analytics on your properties.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Select defaultValue='all'>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {properties && properties.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <DateRangePicker />
        </div>
      </div>
      
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {reportStats.map(stat => (
            <StatCard key={stat.title} stat={stat} />
        ))}
      </div>

      {/* Charts */}
       <div className="grid gap-6 md:grid-cols-5">
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Occupancy Over Time</CardTitle>
                <CardDescription>
                  Monthly occupancy rate across selected properties.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OccupancyChart />
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
               <CardHeader>
                <CardTitle>Booking Source Breakdown</CardTitle>
                <CardDescription>
                  Distribution of bookings from different channels.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BookingChart />
              </CardContent>
            </Card>
        </div>

    </div>
  );
}
