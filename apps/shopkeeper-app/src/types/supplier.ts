export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  notes?: string;
  isActive: boolean;
  receiptCount: number;
  totalPurchaseValue: number;
  lastReceivedAt?: string;
  createdAt: string;
  updatedAt: string;
}
