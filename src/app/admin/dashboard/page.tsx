'use client';
import React from 'react';
import {
  BedDouble,
  Briefcase,
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import '../calendar-style.css';

const dashboardStats = [
  {
    title: 'Occupancy %',
    value: '78%',
    icon: BedDouble,
  },
  {
    title: 'Total Rooms',
    value: '250',
    icon: Briefcase,
  },
  {
    title: 'Active Workers',
    value: '45',
    icon: Users,
  },
  {
    title: 'Company Clients',
    value: '12',
    icon: Briefcase,
  },
  {
    title: 'Booked Nights',
    value: '1,280',
    icon: CalendarDays,
  },
];

const rooms = Array.from({ length: 15 }, (_, i) => ({
  id: `R${101 + i}`,
  type: i % 3 === 0 ? 'Suite' : i % 2 === 0 ? 'Double' : 'Single',
  bookings: [
    {
      start: 2,
      end: 5,
      status: 'booked',
      label: 'Guest Name',
    },
    {
      start: 8,
      end: 10,
      status: 'company',
      label: 'TechCorp',
    },
    {
      start: 12,
      end: 12,
      status: 'cleaning',
      label: 'Cleaning',
    },
     {
      start: 15,
      end: 18,
      status: 'blocked',
      label: 'Maintenance',
    },
  ],
}));

const days = Array.from({ length: 30 }, (_, i) => i + 1);

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Top Bar Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft />
          </Button>
          <h2 className="text-lg font-semibold">June 2024</h2>
          <Button variant="outline" size="icon">
            <ChevronRight />
          </Button>
          <Select defaultValue="week">
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              <SelectItem value="prop1">VoyageHub Downtown</SelectItem>
              <SelectItem value="prop2">VoyageHub Seaside</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Room Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Room Types</SelectItem>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="double">Double</SelectItem>
              <SelectItem value="suite">Suite</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Housekeeping Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="clean">Clean</SelectItem>
              <SelectItem value="dirty">Dirty</SelectItem>
              <SelectItem value="cleaning">In Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>
         <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Quick Actions
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem>Add Booking</DropdownMenuItem>
                    <DropdownMenuItem>Assign Worker</DropdownMenuItem>
                    <DropdownMenuItem>Block Room</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {dashboardStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Calendar View */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="grid calendar-grid min-w-[1200px]">
              {/* Header */}
              <div className="grid-cell header-cell sticky left-0 z-10 font-semibold">
                Room
              </div>
              {days.map((day) => (
                <div key={day} className="grid-cell header-cell text-center font-semibold">
                  {day}
                </div>
              ))}

              {/* Room Rows */}
              {rooms.map((room, roomIndex) => (
                <React.Fragment key={room.id}>
                  <div
                    className="grid-cell room-cell sticky left-0 z-10"
                    style={{ gridRow: roomIndex + 2 }}
                  >
                    <div className="font-bold">{room.id}</div>
                    <div className="text-xs text-muted-foreground">
                      {room.type}
                    </div>
                  </div>
                  {room.bookings.map((booking, bookingIndex) => (
                    <div
                      key={bookingIndex}
                      className={`booking-bar status-${booking.status}`}
                      style={{
                        gridColumn: `${booking.start + 1} / span ${
                          booking.end - booking.start + 1
                        }`,
                        gridRow: roomIndex + 2,
                      }}
                    >
                      <span className="truncate">{booking.label}</span>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
        
        {/* Alerts */}
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Check-ins</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        <li className="flex justify-between items-center text-sm"><span>John Doe (R101)</span> <span className="text-muted-foreground">Today, 3:00 PM</span></li>
                        <li className="flex justify-between items-center text-sm"><span>TechCorp Worker (R105)</span> <span className="text-muted-foreground">Tomorrow, 11:00 AM</span></li>
                    </ul>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Check-outs</CardTitle>
                </CardHeader>
                <CardContent>
                     <ul className="space-y-2">
                        <li className="flex justify-between items-center text-sm"><span>Jane Smith (R102)</span> <span className="text-muted-foreground">Today, 11:00 AM</span></li>
                         <li className="flex justify-between items-center text-sm"><span>Alice Johnson (R108)</span> <span className="text-muted-foreground">Tomorrow, 12:00 PM</span></li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
