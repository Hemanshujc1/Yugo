import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ShopProfile,
  DayOperatingHours,
  ShopAvailability,
  OrderSettings,
  DeliverySettings,
  DeliveryStaffMember,
} from '../types/shop-settings';
import { shopSettingsService } from '../services/shop-settings-service';

export interface ShopSettingsContextType {
  profile: ShopProfile | null;
  availability: ShopAvailability;
  operatingHours: DayOperatingHours[];
  orderSettings: OrderSettings;
  deliverySettings: DeliverySettings;
  deliveryStaff: DeliveryStaffMember[];
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateProfile: (updates: Partial<Omit<ShopProfile, 'id' | 'createdAt'>>) => Promise<ShopProfile>;
  toggleAvailability: (isOpen: boolean, closedReason?: string) => Promise<ShopAvailability>;
  updateOperatingHours: (hours: DayOperatingHours[]) => Promise<DayOperatingHours[]>;
  updateOrderSettings: (settings: Partial<OrderSettings>) => Promise<OrderSettings>;
  updateDeliverySettings: (settings: Partial<DeliverySettings>) => Promise<DeliverySettings>;
  addDeliveryStaff: (data: { name: string; phone: string }) => Promise<DeliveryStaffMember>;
  updateDeliveryStaff: (id: string, updates: Partial<Omit<DeliveryStaffMember, 'id' | 'createdAt'>>) => Promise<DeliveryStaffMember>;
}

const ShopSettingsContext = createContext<ShopSettingsContextType | undefined>(undefined);

export function ShopSettingsProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<ShopProfile | null>(null);
  const [availability, setAvailability] = useState<ShopAvailability>({ isOpen: true, updatedAt: new Date().toISOString() });
  const [operatingHours, setOperatingHours] = useState<DayOperatingHours[]>([]);
  const [orderSettings, setOrderSettings] = useState<OrderSettings>({
    minimumOrderValue: 199,
    maximumOrderValue: 5000,
    allowCOD: true,
    allowOnlinePayment: true,
    defaultPrepTimeMinutes: 30,
  });
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>({ deliveryMode: 'both' });
  const [deliveryStaff, setDeliveryStaff] = useState<DeliveryStaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      shopSettingsService.getShopProfile(),
      shopSettingsService.getShopAvailability(),
      shopSettingsService.getOperatingHours(),
      shopSettingsService.getOrderSettings(),
      shopSettingsService.getDeliverySettings(),
      shopSettingsService.getDeliveryStaff(),
    ])
      .then(([prof, avail, hours, ordSet, delSet, staff]) => {
        if (isMounted) {
          setProfile(prof);
          setAvailability(avail);
          setOperatingHours(hours);
          setOrderSettings(ordSet);
          setDeliverySettings(delSet);
          setDeliveryStaff(staff);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load shop settings:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshSettings = async () => {
    const [prof, avail, hours, ordSet, delSet, staff] = await Promise.all([
      shopSettingsService.getShopProfile(),
      shopSettingsService.getShopAvailability(),
      shopSettingsService.getOperatingHours(),
      shopSettingsService.getOrderSettings(),
      shopSettingsService.getDeliverySettings(),
      shopSettingsService.getDeliveryStaff(),
    ]);

    setProfile(prof);
    setAvailability(avail);
    setOperatingHours(hours);
    setOrderSettings(ordSet);
    setDeliverySettings(delSet);
    setDeliveryStaff(staff);
  };

  const updateProfile = async (updates: Partial<Omit<ShopProfile, 'id' | 'createdAt'>>) => {
    const updated = await shopSettingsService.updateShopProfile(updates);
    setProfile(updated);
    return updated;
  };

  const toggleAvailability = async (isOpen: boolean, closedReason?: string) => {
    const updated = await shopSettingsService.setShopAvailability(isOpen, closedReason);
    setAvailability(updated);
    return updated;
  };

  const updateOperatingHours = async (hours: DayOperatingHours[]) => {
    const updated = await shopSettingsService.updateOperatingHours(hours);
    setOperatingHours(updated);
    return updated;
  };

  const updateOrderSettings = async (settings: Partial<OrderSettings>) => {
    const updated = await shopSettingsService.updateOrderSettings(settings);
    setOrderSettings(updated);
    return updated;
  };

  const updateDeliverySettings = async (settings: Partial<DeliverySettings>) => {
    const updated = await shopSettingsService.updateDeliverySettings(settings);
    setDeliverySettings(updated);
    return updated;
  };

  const addDeliveryStaff = async (data: { name: string; phone: string }) => {
    const newStaff = await shopSettingsService.addDeliveryStaff(data);
    const updatedStaff = await shopSettingsService.getDeliveryStaff();
    setDeliveryStaff(updatedStaff);
    return newStaff;
  };

  const updateDeliveryStaff = async (id: string, updates: Partial<Omit<DeliveryStaffMember, 'id' | 'createdAt'>>) => {
    const updated = await shopSettingsService.updateDeliveryStaff(id, updates);
    const updatedStaff = await shopSettingsService.getDeliveryStaff();
    setDeliveryStaff(updatedStaff);
    return updated;
  };

  return (
    <ShopSettingsContext.Provider
      value={{
        profile,
        availability,
        operatingHours,
        orderSettings,
        deliverySettings,
        deliveryStaff,
        loading,
        refreshSettings,
        updateProfile,
        toggleAvailability,
        updateOperatingHours,
        updateOrderSettings,
        updateDeliverySettings,
        addDeliveryStaff,
        updateDeliveryStaff,
      }}
    >
      {children}
    </ShopSettingsContext.Provider>
  );
}

export function useShopSettings() {
  const context = useContext(ShopSettingsContext);
  if (!context) {
    throw new Error('useShopSettings must be used within a ShopSettingsProvider');
  }
  return context;
}
