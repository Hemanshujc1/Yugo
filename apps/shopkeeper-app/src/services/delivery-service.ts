import {
  DeliveryPartnerInfo,
  ShopkeeperDeliveryConfig,
  FulfillmentMethod,
  Order,
} from '../types/order';

const MOCK_DELIVERY_PARTNERS: DeliveryPartnerInfo[] = [
  {
    id: 'partner-1',
    name: 'Rahul Sharma',
    phone: '+91 98765 11111',
    vehicleType: 'EV Scooter',
    rating: 4.9,
    status: 'Available',
    currentLocation: 'MG Road Hub (0.8 km away)',
  },
  {
    id: 'partner-2',
    name: 'Amit Kumar',
    phone: '+91 98765 22222',
    vehicleType: 'Motorbike',
    rating: 4.8,
    status: 'Available',
    currentLocation: 'Andheri West (1.2 km away)',
  },
  {
    id: 'partner-3',
    name: 'Neeraj Singh',
    phone: '+91 98765 33333',
    vehicleType: 'EV Scooter',
    rating: 4.7,
    status: 'Available',
    currentLocation: 'Bandra Station (1.5 km away)',
  },
  {
    id: 'partner-4',
    name: 'Priya Sundaram',
    phone: '+91 98765 44444',
    vehicleType: 'Bicycle',
    rating: 4.9,
    status: 'Available',
    currentLocation: 'City Market (0.5 km away)',
  },
];

let activeDeliveryConfig: ShopkeeperDeliveryConfig = {
  deliveryMode: 'self_delivery',
  smartDeliveryThreshold: 3,
};

export const deliveryService = {
  async getDeliveryConfig(): Promise<ShopkeeperDeliveryConfig> {
    return new Promise((resolve) => {
      resolve({ ...activeDeliveryConfig });
    });
  },

  async updateDeliveryConfig(
    config: Partial<ShopkeeperDeliveryConfig>
  ): Promise<ShopkeeperDeliveryConfig> {
    return new Promise((resolve) => {
      let threshold = config.smartDeliveryThreshold ?? activeDeliveryConfig.smartDeliveryThreshold;
      if (typeof threshold === 'number') {
        threshold = Math.max(1, Math.min(50, Math.floor(threshold)));
      } else {
        threshold = 3;
      }

      activeDeliveryConfig = {
        deliveryMode: config.deliveryMode ?? activeDeliveryConfig.deliveryMode,
        smartDeliveryThreshold: threshold,
      };
      resolve({ ...activeDeliveryConfig });
    });
  },

  determineDeliveryProvider(
    customerChoice: 'Delivery' | 'Pickup',
    config: ShopkeeperDeliveryConfig,
    activeSelfDeliveryCount: number,
    order?: Order
  ): FulfillmentMethod {
    // 1. Manual order-level override priority check
    if (order?.deliveryDetails?.providerOverride) {
      return order.deliveryDetails.providerOverride;
    }

    // 2. Customer choice check
    if (customerChoice === 'Pickup') {
      return 'customer_pickup';
    }

    // 3. Shop-level delivery strategy
    if (config.deliveryMode === 'self_delivery') {
      return 'self_delivery';
    }

    if (config.deliveryMode === 'yugo_delivery') {
      return 'yugo_partner';
    }

    if (config.deliveryMode === 'smart_delivery') {
      if (activeSelfDeliveryCount < config.smartDeliveryThreshold) {
        return 'self_delivery';
      } else {
        return 'yugo_partner';
      }
    }

    return 'self_delivery';
  },

  async getAvailablePartners(): Promise<DeliveryPartnerInfo[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...MOCK_DELIVERY_PARTNERS.filter((p) => p.status === 'Available')]);
      }, 0);
    });
  },

  async getPartnerById(id: string): Promise<DeliveryPartnerInfo | undefined> {
    return MOCK_DELIVERY_PARTNERS.find((p) => p.id === id);
  },

  async getRandomAvailablePartner(): Promise<DeliveryPartnerInfo> {
    return new Promise((resolve) => {
      const available = MOCK_DELIVERY_PARTNERS.filter((p) => p.status === 'Available');
      const randomIndex = Math.floor(Math.random() * available.length);
      resolve(available[randomIndex] || MOCK_DELIVERY_PARTNERS[0]);
    });
  },
};
