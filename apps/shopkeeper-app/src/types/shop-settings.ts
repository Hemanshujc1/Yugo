export interface ShopProfile {
  id: string;
  shopName: string;
  shopkeeperName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
  logoUri?: string;
  createdAt: string;
  updatedAt: string;
}

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface DayOperatingHours {
  day: DayOfWeek;
  isOpen: boolean;
  openTime: string; // e.g. "09:00 AM"
  closeTime: string; // e.g. "09:00 PM"
}

export interface ShopAvailability {
  isOpen: boolean;
  closedReason?: string;
  updatedAt: string;
}

export interface OrderSettings {
  minimumOrderValue: number;
  maximumOrderValue: number;
  allowCOD: boolean;
  allowOnlinePayment: boolean;
  defaultPrepTimeMinutes: number; // 15, 20, 30, 45, 60
}

export type DeliveryModeSetting = 'yugo_partner' | 'self_delivery' | 'both';

export interface DeliverySettings {
  deliveryMode: DeliveryModeSetting;
}

export interface DeliveryStaffMember {
  id: string;
  name: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
