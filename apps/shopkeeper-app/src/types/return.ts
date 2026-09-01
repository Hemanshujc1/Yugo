export type ReturnStatus = 'REQUESTED' | 'APPROVED' | 'RECEIVED' | 'REFUNDED' | 'REJECTED' | 'CANCELLED';

export type InventoryDisposition = 'sellable' | 'damaged' | 'unsellable';

export type ReturnReason =
  | 'Damaged'
  | 'Wrong item'
  | 'Quality issue'
  | 'Customer changed mind'
  | 'Expired'
  | 'Missing item'
  | 'Other';

export interface ReturnItem {
  productId: string;
  productName: string;
  quantityOrdered: number;
  quantityPreviouslyReturned: number;
  quantityReturning: number;
  unitPrice: number;
  allocatedDiscountPerUnit: number;
  refundAmountPerUnit: number;
  totalItemRefund: number;
  disposition: InventoryDisposition;
}

export interface CustomerReturn {
  id: string; // e.g. "RET-1004"
  returnNumber: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: ReturnItem[];
  reason: ReturnReason | string;
  disposition: InventoryDisposition;
  status: ReturnStatus;
  paymentMethod: string;
  refundStatus: 'Pending' | 'Refunded';
  refundAmount: number;
  inventoryUpdated: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
