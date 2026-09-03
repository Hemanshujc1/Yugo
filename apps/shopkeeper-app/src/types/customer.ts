export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderAt: string;
  activeOrderId?: string;
  createdAt: string;
}
