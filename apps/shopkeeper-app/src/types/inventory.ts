export interface CatalogProduct {
  id: string;
  name: string;
  brand: string;
  variant: string;
  category: string;
  subcategory?: string;
  unitType?: string; // Packet, Pack, Bottle, Box, Piece, Bar, Can, Jar, Tube, Other
  packSize?: string; // e.g. "5 kg", "1 L", "500 g"
  barcode?: string;
  mrp: number;
  unit: string;
  description?: string;
  images?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShopInventoryItem {
  id: string;
  catalogProductId: string;
  catalogProduct: CatalogProduct;
  sellingPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  isAvailable: boolean;
  latestPurchaseCost?: number; // Procurement cost per packet (does NOT overwrite sellingPrice or MRP)
  lastUpdated: string;
}

export interface StockReceiptItem {
  shopInventoryItemId: string;
  catalogProductId: string;
  productName: string;
  brand: string;
  variant: string;
  quantityReceived: number; // Sellable units
  previousQuantity: number;
  newQuantity: number;
  purchaseCost?: number; // Optional purchase cost / unit
  totalItemValue?: number; // quantityReceived * purchaseCost
}

export interface StockReceipt {
  id: string; // e.g. "REC-1028"
  supplierId: string;
  supplierName: string;
  items: StockReceiptItem[];
  totalProductsCount: number;
  totalUnitsReceived: number;
  totalPurchaseValue?: number; // Sum of totalItemValue; undefined if any item cost is unknown
  hasUnknownCosts?: boolean;
  notes?: string;
  createdAt: string;
}

export interface ExcelImportRow {
  rowNumber: number;
  productName: string;
  brand?: string;
  variant?: string;
  category?: string;
  barcode?: string;
  mrp?: number;
  sellingPrice?: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
}

export type MatchConfidence = 'exact_barcode' | 'exact_name_variant' | 'name_brand' | 'fuzzy' | 'none';

export interface ValidatedImportRow {
  rowNumber: number;
  raw: ExcelImportRow;
  matchedProduct?: CatalogProduct;
  matchConfidence: MatchConfidence;
  existingInventoryItem?: ShopInventoryItem;
  status: 'valid' | 'needs_review' | 'invalid';
  validationErrors: string[];
  userChoice?: 'replace_stock' | 'add_stock' | 'skip';
}

export interface ImportSummaryResult {
  totalRows: number;
  addedCount: number;
  updatedCount: number;
  skippedCount: number;
  invalidCount: number;
  timestamp: string;
}

export interface ImportHistoryRecord {
  id: string;
  date: string;
  fileName: string;
  totalProcessed: number;
  added: number;
  updated: number;
  skipped: number;
}

export type StockMovementType =
  | 'SALE'
  | 'STOCK_RECEIVED'
  | 'ADJUSTMENT'
  | 'DAMAGED'
  | 'EXPIRED'
  | 'RETURN'
  | 'CORRECTION';

export type StockMovementReason =
  | 'Offline sale'
  | 'Stock received'
  | 'Damaged'
  | 'Expired'
  | 'Returned'
  | 'Stock correction'
  | 'Other';

export interface StockMovement {
  id: string;
  shopInventoryItemId: string;
  catalogProductId: string;
  productName: string;
  brand: string;
  variant: string;
  type: StockMovementType;
  quantityChange: number;
  previousQuantity: number;
  newQuantity: number;
  reason: StockMovementReason | string;
  source: 'COUNTER_SALE' | 'MANUAL_ADJUSTMENT' | 'AUDIT_CORRECTION' | 'EXCEL_IMPORT' | 'ORDER_FULFILLMENT' | 'SUPPLIER_RECEIPT' | 'CUSTOMER_RETURN';
  supplierId?: string;
  supplierName?: string;
  receiptId?: string;
  orderId?: string;
  returnId?: string;
  purchaseCost?: number;
  createdAt: string;
}

export interface CounterSaleItem {
  shopInventoryItem: ShopInventoryItem;
  quantity: number;
}
