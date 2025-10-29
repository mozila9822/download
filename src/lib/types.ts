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

export type NavItem = {
  label: string;
  href: string;
  visible: boolean;
};

export type SectionItem = {
  name: string;
  href: string;
  visible: boolean;
};

export type FooterInfo = {
  contactEmail: string;
  contactPhone: string;
  address: string;
  disclaimer: string;
  social: { twitter: string; facebook: string; instagram: string; linkedin: string; youtube: string };
};

export type ThemeSettings = {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
};

export type SiteSettingsDto = {
  siteTitle: string;
  domains: string[];
  logoUrl: string | null;
  faviconUrl: string | null;
  footer: FooterInfo;
  navigation: NavItem[];
  sections: SectionItem[];
  theme: ThemeSettings;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  version: number;
  updatedAt: string;
};

export type SiteSettingsPayload = Partial<SiteSettingsDto>;

export type PublicSettings = Omit<SiteSettingsDto, 'domains'>;

// Help & Support types
export type SupportStatus = 'Open' | 'InProgress' | 'Pending' | 'Resolved' | 'Urgent';

export type SupportAttachment = { name: string; url: string; type?: string; size?: number };

export type SupportThreadDto = {
  id: string;
  subject?: string | null;
  userId: number;
  userEmail?: string;
  assignedAdminId?: number | null;
  assignedAdminEmail?: string | null;
  status: SupportStatus;
  createdAt: string;
  updatedAt: string;
};

export type SupportMessageDto = {
  id: string;
  threadId: string;
  userId?: number | null;
  adminId?: number | null;
  sender: 'User' | 'Admin';
  messageText: string;
  attachments?: SupportAttachment[] | null;
  readByUser: boolean;
  readByAdmin: boolean;
  createdAt: string;
};

export type CreateThreadPayload = {
  subject?: string;
  messageText: string;
  attachments?: SupportAttachment[];
};

export type SendMessagePayload = {
  threadId: string;
  messageText: string;
  attachments?: SupportAttachment[];
};
