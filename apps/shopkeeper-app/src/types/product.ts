import { CatalogProduct, ShopInventoryItem } from './inventory';

export interface Product {
  id: string;
  catalogProductId?: string;
  name: string;
  brand?: string;
  variant?: string;
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

export type { CatalogProduct, ShopInventoryItem };
