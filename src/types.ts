export type UserRole = 'customer' | 'provider' | 'admin';
export type BookingStatus = 'pending' | 'ongoing' | 'completed' | 'cancelled';
export type NotificationType = 'booking_request' | 'booking_status' | 'message';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location?: string;
  phone?: string;
  createdAt: string;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  profession: string;
  experience: number;
  description: string;
  rating: number;
  totalReviews: number;
}

export interface Service {
  id: string;
  providerId: string;
  title: string;
  description: string;
  price: number;
}

export interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  status: BookingStatus;
  date: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
}

export interface Review {
  id: string;
  customerId: string;
  providerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}
