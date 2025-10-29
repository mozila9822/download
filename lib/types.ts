export type Service = {
  id: string;
  category: 'City Break' | 'Tour' | 'Hotel' | 'Flight' | 'Coach Ride';
  title: string;
  description: string;
  price: number;
  offerPrice?: number;
  location: string;
  imageUrl: string;
  status?: 'Active' | 'Inactive' | 'Archived';
  available?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  isOffer?: boolean;
};

export type Booking = {
  id: string;
  userId: string;
  serviceType: string;
  serviceId: string;
  bookingDate: string;
  travelDate: string;
  numberOfTravelers: number;
  totalPrice: number;
  paymentStatus: string;
};

export type AdminStat = {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ElementType;
};

export type Property = {
    id: string;
    name: string;
    location: string;
    roomCount: number;
    amenities: string[];
    imageUrl: string;
}

export type Client = {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'Active' | 'Inactive';
  addedDate: string;
};
