export type OrderStatus = 'placed' | 'accepted' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  shopName: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryAddress: string;
  createdAt: string;
  estimatedDelivery?: string;
  deliveryPartner?: {
    name: string;
    phone: string;
  };
}
