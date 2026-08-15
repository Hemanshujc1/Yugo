export type OrderStatus =
  | 'new'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'COD' | 'UPI' | 'Card';
export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded';

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
  status: OrderStatus;
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
  timeline: TimelineEvent[];
  cancellationReason?: string;
}
