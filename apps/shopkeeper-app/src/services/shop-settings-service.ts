import {
  ShopProfile,
  DayOperatingHours,
  ShopAvailability,
  OrderSettings,
  DeliverySettings,
  DeliveryStaffMember,
} from '../types/shop-settings';
import { storageService, STORAGE_KEYS } from './storage-service';

const INITIAL_SHOP_PROFILE: ShopProfile = {
  id: 'shop-101',
  shopName: 'Yugo Fresh Mart',
  shopkeeperName: 'Ankur Sharma',
  phone: '+91 98765 43210',
  email: 'shop@example.com',
  address: '12 MG Road, Indiranagar',
  city: 'Bengaluru',
  pincode: '560038',
  logoUri: undefined,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: new Date().toISOString(),
};

const INITIAL_SHOP_AVAILABILITY: ShopAvailability = {
  isOpen: true,
  updatedAt: new Date().toISOString(),
};

const INITIAL_OPERATING_HOURS: DayOperatingHours[] = [
  { day: 'Monday', isOpen: true, openTime: '09:00 AM', closeTime: '09:00 PM' },
  { day: 'Tuesday', isOpen: true, openTime: '09:00 AM', closeTime: '09:00 PM' },
  { day: 'Wednesday', isOpen: true, openTime: '09:00 AM', closeTime: '09:00 PM' },
  { day: 'Thursday', isOpen: true, openTime: '09:00 AM', closeTime: '09:00 PM' },
  { day: 'Friday', isOpen: true, openTime: '09:00 AM', closeTime: '09:00 PM' },
  { day: 'Saturday', isOpen: true, openTime: '09:00 AM', closeTime: '09:00 PM' },
  { day: 'Sunday', isOpen: true, openTime: '10:00 AM', closeTime: '06:00 PM' },
];

const INITIAL_ORDER_SETTINGS: OrderSettings = {
  minimumOrderValue: 199,
  maximumOrderValue: 5000,
  allowCOD: true,
  allowOnlinePayment: true,
  defaultPrepTimeMinutes: 30,
};

const INITIAL_DELIVERY_SETTINGS: DeliverySettings = {
  deliveryMode: 'both',
};

const INITIAL_DELIVERY_STAFF: DeliveryStaffMember[] = [
  {
    id: 'staff-101',
    name: 'Rahul',
    phone: '+91 98765 43210',
    isActive: true,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'staff-102',
    name: 'Priya',
    phone: '+91 98765 43211',
    isActive: true,
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'staff-103',
    name: 'Amit',
    phone: '+91 98765 43212',
    isActive: false,
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
];

// In-memory mock states
let currentProfile: ShopProfile = { ...INITIAL_SHOP_PROFILE };
let currentAvailability: ShopAvailability = { ...INITIAL_SHOP_AVAILABILITY };
let currentOperatingHours: DayOperatingHours[] = [...INITIAL_OPERATING_HOURS];
let currentOrderSettings: OrderSettings = { ...INITIAL_ORDER_SETTINGS };
let currentDeliverySettings: DeliverySettings = { ...INITIAL_DELIVERY_SETTINGS };
let currentDeliveryStaff: DeliveryStaffMember[] = [...INITIAL_DELIVERY_STAFF];

export const shopSettingsService = {
  async init(): Promise<void> {
    const isInit = await storageService.isInitialized();
    if (isInit) {
      const storedSettings = await storageService.getItem<{
        profile: ShopProfile;
        availability: ShopAvailability;
        operatingHours: DayOperatingHours[];
        orderSettings: OrderSettings;
        deliverySettings: DeliverySettings;
      } | null>(STORAGE_KEYS.SHOP_SETTINGS, null);

      if (storedSettings) {
        currentProfile = storedSettings.profile;
        currentAvailability = storedSettings.availability;
        currentOperatingHours = storedSettings.operatingHours;
        currentOrderSettings = storedSettings.orderSettings;
        currentDeliverySettings = storedSettings.deliverySettings;
      }

      const storedStaff = await storageService.getItem<DeliveryStaffMember[] | null>(STORAGE_KEYS.DELIVERY_STAFF, null);
      if (storedStaff && Array.isArray(storedStaff)) {
        currentDeliveryStaff = storedStaff;
      }
      return;
    }

    await this.persistAll();
  },

  async persistAll(): Promise<void> {
    await Promise.all([
      storageService.setItem(STORAGE_KEYS.SHOP_SETTINGS, {
        profile: currentProfile,
        availability: currentAvailability,
        operatingHours: currentOperatingHours,
        orderSettings: currentOrderSettings,
        deliverySettings: currentDeliverySettings,
      }),
      storageService.setItem(STORAGE_KEYS.DELIVERY_STAFF, currentDeliveryStaff),
    ]);
  },

  async getShopProfile(): Promise<ShopProfile> {
    return { ...currentProfile };
  },

  async updateShopProfile(updates: Partial<Omit<ShopProfile, 'id' | 'createdAt'>>): Promise<ShopProfile> {
    if (updates.shopName !== undefined && !updates.shopName.trim()) {
      throw new Error('Shop Name is required.');
    }
    if (updates.pincode !== undefined && updates.pincode.trim()) {
      const pincodeClean = updates.pincode.trim();
      if (!/^\d{6}$/.test(pincodeClean)) {
        throw new Error('Please enter a valid 6-digit Indian Pincode.');
      }
    }
    if (updates.email !== undefined && updates.email.trim()) {
      const emailClean = updates.email.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
        throw new Error('Please enter a valid Email address.');
      }
    }

    currentProfile = {
      ...currentProfile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await this.persistAll();

    return { ...currentProfile };
  },

  async getShopAvailability(): Promise<ShopAvailability> {
    return { ...currentAvailability };
  },

  async setShopAvailability(isOpen: boolean, closedReason?: string): Promise<ShopAvailability> {
    currentAvailability = {
      isOpen,
      closedReason: !isOpen ? closedReason : undefined,
      updatedAt: new Date().toISOString(),
    };
    await this.persistAll();
    return { ...currentAvailability };
  },

  async getOperatingHours(): Promise<DayOperatingHours[]> {
    return [...currentOperatingHours];
  },

  async updateOperatingHours(hours: DayOperatingHours[]): Promise<DayOperatingHours[]> {
    currentOperatingHours = [...hours];
    await this.persistAll();
    return [...currentOperatingHours];
  },

  async getOrderSettings(): Promise<OrderSettings> {
    return { ...currentOrderSettings };
  },

  async updateOrderSettings(settings: Partial<OrderSettings>): Promise<OrderSettings> {
    const updated = { ...currentOrderSettings, ...settings };

    if (updated.minimumOrderValue < 0) {
      throw new Error('Minimum order value cannot be negative.');
    }
    if (updated.maximumOrderValue <= updated.minimumOrderValue) {
      throw new Error('Maximum order value must be greater than minimum order value.');
    }
    if (!updated.allowCOD && !updated.allowOnlinePayment) {
      throw new Error('At least one payment method (COD or Online Payment) must be enabled.');
    }

    currentOrderSettings = updated;
    await this.persistAll();
    return { ...currentOrderSettings };
  },

  async getDeliverySettings(): Promise<DeliverySettings> {
    return { ...currentDeliverySettings };
  },

  async updateDeliverySettings(settings: Partial<DeliverySettings>): Promise<DeliverySettings> {
    currentDeliverySettings = { ...currentDeliverySettings, ...settings };
    await this.persistAll();
    return { ...currentDeliverySettings };
  },

  async getDeliveryStaff(): Promise<DeliveryStaffMember[]> {
    return [...currentDeliveryStaff];
  },

  async addDeliveryStaff(data: { name: string; phone: string }): Promise<DeliveryStaffMember> {
    if (!data.name || !data.name.trim()) {
      throw new Error('Staff Name is required.');
    }
    if (!data.phone || !data.phone.trim()) {
      throw new Error('Phone Number is required.');
    }

    const newStaff: DeliveryStaffMember = {
      id: `staff-${Date.now()}`,
      name: data.name.trim(),
      phone: data.phone.trim(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    currentDeliveryStaff.unshift(newStaff);
    await this.persistAll();
    return newStaff;
  },

  async updateDeliveryStaff(id: string, updates: Partial<Omit<DeliveryStaffMember, 'id' | 'createdAt'>>): Promise<DeliveryStaffMember> {
    const idx = currentDeliveryStaff.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Delivery staff member not found.');

    const updated = {
      ...currentDeliveryStaff[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    currentDeliveryStaff[idx] = updated;
    await this.persistAll();
    return updated;
  },
};
