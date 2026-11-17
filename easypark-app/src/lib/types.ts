// EasyPark Core Types

export type UserRole = 'customer' | 'owner' | 'operator' | 'government' | 'checker' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string;
  avatar?: string;
  createdAt: string;
  status: 'active' | 'suspended';
}

export type ParkingType = 'private' | 'government';

export interface ParkingLocation {
  id: string;
  name: string;
  type: ParkingType;
  address: string;
  city: string;
  lat: number;
  lng: number;
  coordinatesVerified?: boolean;
  totalCapacity: number;
  bookedCount: number;
  hourlyRate: number;
  operatingHours: { open: string; close: string };
  facilities: string[];
  photos: string[];
  ownerId?: string;
  operatorId?: string;
  governmentOrgId?: string;
  qrToken: string;
  status: 'active' | 'inactive' | 'pending';
  description: string;
  distance?: number;
}

export interface Booking {
  id: string;
  bookingRef: string;
  customerId: string;
  locationId: string;
  vehicleReg: string;
  startTime: string;
  endTime: string;
  hours: number;
  amount: number;
  status: 'confirmed' | 'active' | 'completed' | 'cancelled';
  paymentId: string;
  createdAt: string;
  checkInTime?: string;
  checkOutTime?: string;
}

export interface GovernmentSession {
  id: string;
  sessionRef: string;
  locationId: string;
  vehicleReg: string;
  startTime: string;
  endTime: string;
  hours: number;
  amount: number;
  status: 'active' | 'expired' | 'completed';
  paymentId: string;
  createdAt: string;
  checkerId?: string;
}

export interface Payment {
  id: string;
  amount: number;
  method: 'card' | 'mobile' | 'bank';
  status: 'completed' | 'failed' | 'refunded' | 'pending';
  referenceId: string; // bookingId or sessionId
  referenceType: 'booking' | 'session';
  createdAt: string;
  gateway: string;
}

export interface Fine {
  id: string;
  fineRef: string;
  vehicleReg: string;
  locationId: string;
  checkerId: string;
  reason: string;
  amount: number;
  status: 'pending' | 'paid' | 'disputed';
  issuedAt: string;
  paidAt?: string;
  notes?: string;
}

export interface Operator {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  locationIds: string[];
  status: 'active' | 'inactive';
}

export interface GovernmentOrg {
  id: string;
  name: string;
  code: string;
  locationIds: string[];
  checkerIds: string[];
  status: 'active' | 'inactive';
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details: string;
  ip: string;
  createdAt: string;
}
