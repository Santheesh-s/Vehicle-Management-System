export interface Vehicle {
  id: string;
  registrationNumber: string;
  type: VehicleType;
  ownerName?: string;
  phoneNumber?: string;
  entryTime: Date;
  exitTime?: Date;
  slotId?: string;
  status: VehicleStatus;
}

export interface ParkingSlot {
  id: string;
  number: string;
  type: VehicleType;
  status: SlotStatus;
  position: {
    x: number;
    y: number;
  };
  vehicleId?: string;
  reservedUntil?: Date;
}

export interface ParkingRecord {
  id: string;
  vehicleId: string;
  slotId: string;
  entryTime: Date;
  exitTime?: Date;
  duration?: number; // in minutes
  amount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  receiptId?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  name: string;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

export interface ParkingRate {
  id: string;
  vehicleType: VehicleType;
  baseRate: number; // per hour
  additionalRate: number; // after first hour
  currency: string;
  effectiveFrom: Date;
  effectiveUntil?: Date;
}

export interface PaymentTransaction {
  id: string;
  recordId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  timestamp: Date;
  receiptUrl?: string;
}

export interface DashboardStats {
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
  reservedSlots: number;
  todayRevenue: number;
  todayVehicles: number;
  averageStayDuration: number;
  peakHours: string[];
}

export interface NotificationConfig {
  id: string;
  type: NotificationType;
  enabled: boolean;
  recipients: string[];
  conditions: Record<string, any>;
}

// Enums
export enum VehicleType {
  TWO_WHEELER = 'two_wheeler',
  FOUR_WHEELER = 'four_wheeler',
  TRUCK = 'truck',
  BUS = 'bus'
}

export enum VehicleStatus {
  PARKED = 'parked',
  EXITED = 'exited',
  RESERVED = 'reserved'
}

export enum SlotStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  MAINTENANCE = 'maintenance'
}

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  CUSTOMER = 'customer'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  UPI = 'upi',
  WALLET = 'wallet'
}

export enum NotificationType {
  SLOT_FULL = 'slot_full',
  PAYMENT_CONFIRMATION = 'payment_confirmation',
  VEHICLE_EXIT = 'vehicle_exit',
  MAINTENANCE_ALERT = 'maintenance_alert'
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request types
export interface VehicleEntryRequest {
  registrationNumber: string;
  type: VehicleType;
  ownerName?: string;
  phoneNumber?: string;
}

export interface VehicleExitRequest {
  vehicleId: string;
  paymentMethod: PaymentMethod;
}

export interface SlotReservationRequest {
  slotId: string;
  vehicleId: string;
  reservationDuration: number; // in minutes
}

export interface RateUpdateRequest {
  vehicleType: VehicleType;
  baseRate: number;
  additionalRate: number;
}
