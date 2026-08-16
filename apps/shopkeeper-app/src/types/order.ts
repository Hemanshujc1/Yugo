export type OrderStatus =
  | 'new'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'COD' | 'UPI' | 'Card';
export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded';

export type FulfillmentMethod =
  | 'yugo_partner'
  | 'self_delivery'
  | 'customer_pickup'
  | 'unassigned';

export type DeliveryStatus =
  | 'pending_assignment'
  | 'assigned'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'waiting_for_pickup';

export type DeliveryMode = 'self_delivery' | 'yugo_delivery' | 'smart_delivery';

export interface ShopkeeperDeliveryConfig {
  deliveryMode: DeliveryMode;
  smartDeliveryThreshold: number;
}

export interface DeliveryPartnerInfo {
  id: string;
  name: string;
  phone: string;
  vehicleType: 'EV Scooter' | 'Motorbike' | 'Bicycle';
  rating: number;
  status: 'Available' | 'On Delivery' | 'Offline';
  currentLocation?: string;
}

export interface DeliveryDetails {
  fulfillmentMethod: FulfillmentMethod;
  status: DeliveryStatus;
  providerOverride?: 'self_delivery' | 'yugo_partner' | null;
  partner?: DeliveryPartnerInfo;
  assignedAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  notes?: string;
  smartDeliveryAssigned?: boolean;
}

export interface OrderItemDetail {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  finalPrice: number;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  address: string;
  city: string;
}

export interface DeliveryPartner {
  name: string;
  phone: string;
  type: string;
}

export interface TimelineEvent {
  status: OrderStatus | 'delivery_assigned';
  timestamp: string;
  label: string;
  completed: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: OrderCustomer;
  items: OrderItemDetail[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  estimatedDeliveryTime?: string;
  deliveryType: 'Delivery' | 'Pickup';
  deliveryPartner?: DeliveryPartner;
  deliveryDetails?: DeliveryDetails;
  timeline: TimelineEvent[];
  cancellationReason?: string;
}
