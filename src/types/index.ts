export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  createdAt: Date;
}

export type CarType = 'sedan' | 'suv' | 'sports' | 'luxury' | 'compact' | 'van';
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid';
export type CarStatus = 'available' | 'rented' | 'maintenance';

export interface Car {
  id: string;
  brand: string;
  model: string;
  type: CarType;
  fuelType: FuelType;
  seats: number;
  pricePerDay: number;
  images: string[];
  status: CarStatus;
  rating: number;
  year: number;
  transmission: 'automatic' | 'manual';
  features: string[];
}

export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';

export interface Addon {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface Booking {
  id: string;
  carId: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: BookingStatus;
  cancellationReason?: string;
  rating?: number;
  review?: string;
  addons: Addon[];
  createdAt: Date;
}

export type PaymentMethod = 'card' | 'wallet' | 'paypal';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: Date;
}

export interface Maintenance {
  id: string;
  carId: string;
  description: string;
  date: Date;
  cost: number;
  nextDue: Date;
}

export interface SearchFilters {
  type?: CarType;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  fuelType?: FuelType;
  seats?: number;
}
