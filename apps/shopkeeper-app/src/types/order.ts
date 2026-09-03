export type OrderStatus =
  | 'new'
  | 'accepted'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'rejected';

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

export type DeliveryIssueType =
  | 'customer_unavailable'
  | 'wrong_address'
  | 'reschedule_requested'
  | 'delivery_delayed'
  | 'payment_issue'
  | 'other';

export interface DeliveryIssueReport {
  id: string;
  orderId: string;
  issueType: DeliveryIssueType;
  note?: string;
  reportedAt: string;
  reportedBy: string;
}

export interface DeliveryDetails {
  fulfillmentMethod: FulfillmentMethod;
  status: DeliveryStatus;
  providerOverride?: 'self_delivery' | 'yugo_partner' | null;
  partner?: DeliveryPartnerInfo;
  assignedStaff?: {
    id?: string;
    name: string;
    phone: string;
    role: string;
  };
  assignedAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  otp?: string;
  notes?: string;
  smartDeliveryAssigned?: boolean;
  issueReport?: DeliveryIssueReport;
}

export interface OrderItemDetail {
  productId: string;
  productName: string;
  brand?: string;
  packSize?: string; // e.g. "5 kg", "1 L", "500 g"
  quantity: number; // Packets / Units
  unitPrice: number;
  discount?: number;
  finalPrice: number;
}

export interface OrderCustomer {
  id?: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  email?: string;
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

export interface OrderStatusEvent {
  id: string;
  orderId: string;
  status: OrderStatus;
  timestamp: string;
  actorType: 'System' | 'Shopkeeper' | 'Shop Staff' | 'Yugo Delivery Person' | 'Customer';
  actorName?: string;
  note?: string;
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
  statusHistory?: OrderStatusEvent[];
  rejectionReason?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  notes?: string;
  returnStatus?: 'Not_Returned' | 'Partially_Returned' | 'Fully_Returned';
  totalRefundedAmount?: number;
  returnedItemQuantities?: Record<string, number>;
  inventoryDeducted?: boolean;
}
