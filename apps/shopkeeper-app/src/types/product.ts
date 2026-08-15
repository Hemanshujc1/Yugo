export interface Product {
  id: string;
  name: string;
  category: string;
  images: string[];
  price: number;
  discountPercentage?: number;
  finalPrice?: number;
  stockQuantity: number;
  lowStockThreshold?: number;
  purchaseDate?: string;
  expiryDate?: string;
  description?: string;
  sku?: string;
  barcode?: string;
  isAvailable: boolean;
  availability?: boolean;
  createdAt: string;
  updatedAt: string;
}

