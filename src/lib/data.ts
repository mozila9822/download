import type { Service, Booking, AdminStat, Property, Client } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Users, DollarSign, Activity, ShoppingCart } from 'lucide-react';

export const services: Service[] = [
  {
    id: '1',
    category: 'City Break',
    title: 'Weekend in Paris',
    location: 'Paris, France',
    description:
      'Experience the romance of Paris with a 3-day city break. Includes flights and a charming hotel near the city center.',
    price: 499,
    imageUrl:
      PlaceHolderImages.find((img) => img.id === 'city-break-paris')?.imageUrl ??
      '',
  },
  {
    id: '2',
    category: 'Tour',
    title: 'Machu Picchu Adventure',
    location: 'Cusco, Peru',
    description:
      "A 5-day guided tour to the ancient Incan city of Machu Picchu. An unforgettable journey through history and nature.",
    price: 1299,
    imageUrl:
      PlaceHolderImages.find((img) => img.id === 'tour-machu-picchu')?.imageUrl ??
      '',
  },
  {
    id: '3',
    category: 'Hotel',
    title: 'Maldives Overwater Bungalow',
    location: 'Malé, Maldives',
    description:
      'Stay in a luxurious overwater bungalow with breathtaking ocean views. The ultimate tropical getaway.',
    price: 899,
    offerPrice: 699,
    imageUrl:
      PlaceHolderImages.find((img) => img.id === 'hotel-maldives')?.imageUrl ??
      '',
  },
  {
    id: '4',
    category: 'Flight',
    title: 'Round Trip to New York',
    location: 'New York, USA',
    description:
      'Book your round-trip flight to the city that never sleeps. Explore Times Square, Central Park, and more.',
    price: 650,
    imageUrl:
      PlaceHolderImages.find((img) => img.id === 'flight-window')?.imageUrl ??
      '',
  },
  {
    id: '5',
    category: 'Coach Ride',
    title: 'Scenic Mountain Pass',
    location: 'Swiss Alps, Switzerland',
    description:
      'A comfortable coach ride through the stunning landscapes of the Swiss Alps. Perfect for sightseeing.',
    price: 120,
    imageUrl:
      PlaceHolderImages.find((img) => img.id === 'coach-ride-mountains')?.imageUrl ??
      '',
  },
  {
    id: '6',
    category: 'City Break',
    title: 'Tokyo Neon Nights',
    location: 'Tokyo, Japan',
    description:
      'Immerse yourself in the vibrant culture and futuristic cityscapes of Tokyo with this 4-day package.',
    price: 950,
    offerPrice: 850,
    imageUrl:
      PlaceHolderImages.find((img) => img.id === 'city-break-tokyo')?.imageUrl ??
      '',
  },
  {
    id: '7',
    category: 'Tour',
    title: 'African Safari Expedition',
    location: 'Serengeti, Tanzania',
    description:
      'A 7-day safari adventure in the heart of the Serengeti. Witness the great migration and stunning wildlife.',
    price: 2500,
    imageUrl:
      PlaceHolderImages.find((img) => img.id === 'tour-safari')?.imageUrl ??
      '',
  },
   {
    id: '8',
    category: 'Hotel',
    title: 'Luxury Stay in Dubai',
    location: 'Dubai, UAE',
    description:
      'Experience unparalleled luxury at a 5-star hotel in Dubai, with views of the Burj Khalifa.',
    price: 750,
    imageUrl: 'https://picsum.photos/seed/108/600/400',
  },
];

export const lastMinuteOffers: Service[] = services
  .filter(service => service.offerPrice)
  .slice(0, 3);

export const adminStats: AdminStat[] = [
  {
    title: 'Total Revenue',
    value: '£45,231.89',
    change: '+20.1% from last month',
    changeType: 'increase',
    icon: DollarSign,
  },
  {
    title: 'Bookings',
    value: '+2350',
    change: '+180.1% from last month',
    changeType: 'increase',
    icon: ShoppingCart,
  },
  {
    title: 'New Customers',
    value: '+124',
    change: '+19% from last month',
    changeType: 'increase',
    icon: Users,
  },
  {
    title: 'Active Tours',
    value: '+573',
    change: '+201 since last hour',
    changeType: 'increase',
    icon: Activity,
  },
];

export const recentBookings: Booking[] = [
  {
    id: '1',
    userId: 'user1',
    serviceType: 'CityBreak',
    serviceId: '1',
    bookingDate: '2023-11-23',
    travelDate: '2023-12-10',
    numberOfTravelers: 2,
    totalPrice: 499.0,
    paymentStatus: 'completed'
  },
  {
    id: '2',
    userId: 'user2',
    serviceType: 'Tour',
    serviceId: '2',
    bookingDate: '2023-11-22',
    travelDate: '2024-01-15',
    numberOfTravelers: 1,
    totalPrice: 1299.0,
    paymentStatus: 'pending'
  },
  {
    id: '3',
    userId: 'user3',
    serviceType: 'Hotel',
    serviceId: '3',
    bookingDate: '2023-11-21',
    travelDate: '2023-12-01',
    numberOfTravelers: 2,
    totalPrice: 899.0,
    paymentStatus: 'completed'
  },
];

export const properties: Property[] = [
    {
        id: 'prop1',
        name: 'VoyageHub Downtown',
        location: 'New York, USA',
        roomCount: 50,
        amenities: ['Pool', 'Gym', 'Free WiFi'],
        imageUrl: 'https://picsum.photos/seed/prop1/600/400',
    },
    {
        id: 'prop2',
        name: 'VoyageHub Seaside',
        location: 'Malibu, USA',
        roomCount: 30,
        amenities: ['Beach Access', 'Spa', 'Restaurant'],
        imageUrl: 'https://picsum.photos/seed/prop2/600/400',
    },
    {
        id: 'prop3',
        name: 'VoyageHub Mountain View',
        location: 'Aspen, USA',
        roomCount: 40,
        amenities: ['Ski-in/Ski-out', 'Hot Tub', 'Fireplace'],
        imageUrl: 'https://picsum.photos/seed/prop3/600/400',
    }
];

export const clients: Client[] = [
    { id: '1', name: 'Liam Johnson', email: 'liam.j@example.com', company: 'Tech Solutions', status: 'Active', addedDate: '2023-10-15' },
    { id: '2', name: 'Ava Brown', email: 'ava.b@example.com', company: 'Innovate Inc.', status: 'Active', addedDate: '2023-10-12' },
    { id: '3', name: 'Noah Williams', email: 'noah.w@example.com', company: 'Global Exports', status: 'Inactive', addedDate: '2023-09-28' },
    { id: '4', name: 'Emma Jones', email: 'emma.j@example.com', company: 'Tech Solutions', status: 'Active', addedDate: '2023-09-25' },
    { id: '5', name: 'Oliver Garcia', email: 'oliver.g@example.com', company: 'Market Movers', status: 'Active', addedDate: '2023-09-11' },
];

export const chartData = [
  { month: 'Jan', total: Math.floor(Math.random() * 100) },
  { month: 'Feb', total: Math.floor(Math.random() * 100) },
  { month: 'Mar', total: Math.floor(Math.random() * 100) },
  { month: 'Apr', total: Math.floor(Math.random() * 100) },
  { month: 'May', total: Math.floor(Math.random() * 100) },
  { month: 'Jun', total: Math.floor(Math.random() * 100) },
  { month: 'Jul', total: Math.floor(Math.random() * 100) },
  { month: 'Aug', total: Math.floor(Math.random() * 100) },
  { month: 'Sep', total: Math.floor(Math.random() * 100) },
  { month: 'Oct', total: Math.floor(Math.random() * 100) },
  { month: 'Nov', total: Math.floor(Math.random() * 100) },
  { month: 'Dec', total: Math.floor(Math.random() * 100) },
];

export const pieChartData = [
    { name: 'Flights', value: 400, fill: 'hsl(var(--chart-1))' },
    { name: 'Hotels', value: 300, fill: 'hsl(var(--chart-2))' },
    { name: 'Tours', value: 300, fill: 'hsl(var(--chart-3))' },
    { name: 'Coach', value: 200, fill: 'hsl(var(--chart-4))' },
]
