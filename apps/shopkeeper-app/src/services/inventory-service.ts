import {
  CatalogProduct,
  ShopInventoryItem,
  ExcelImportRow,
  ValidatedImportRow,
  ImportSummaryResult,
  ImportHistoryRecord,
  StockMovement,
  StockMovementType,
  StockMovementReason,
  StockReceipt,
  StockReceiptItem,
} from '../types/inventory';
import { MASTER_YUGO_CATALOG } from './catalog-mock-data';
import { notificationService } from './notification-service';
import type { CounterSaleRecord } from './financial-service';
import { supplierService } from './supplier-service';
import { storageService, STORAGE_KEYS } from './storage-service';

// Initial shop inventory: ~70 stocked items referencing catalog products
const INITIAL_SHOP_INVENTORY: ShopInventoryItem[] = MASTER_YUGO_CATALOG.slice(0, 70).map((cat, idx) => {
  let stockQuantity = 25;
  let lowStockThreshold = 5;
  let isAvailable = true;

  if (idx % 7 === 0) {
    stockQuantity = 3; // Low stock
    lowStockThreshold = 5;
  } else if (idx % 11 === 0) {
    stockQuantity = 0; // Out of stock
    lowStockThreshold = 5;
  } else if (idx % 13 === 0) {
    stockQuantity = 15;
    isAvailable = false; // Unavailable
  } else {
    stockQuantity = Math.floor(10 + (idx * 3) % 60); // In stock
  }

  const discountAmount = idx % 5 === 0 ? Math.round(cat.mrp * 0.05) : 0;
  const sellingPrice = Math.max(1, cat.mrp - discountAmount);

  return {
    id: `shop-inv-${cat.id}`,
    catalogProductId: cat.id,
    catalogProduct: cat,
    sellingPrice,
    stockQuantity,
    lowStockThreshold,
    isAvailable,
    lastUpdated: new Date(Date.now() - idx * 3600000 * 4).toISOString(),
  };
});

let activeShopInventory: ShopInventoryItem[] = [...INITIAL_SHOP_INVENTORY];

let mockImportHistory: ImportHistoryRecord[] = [
  {
    id: 'imp-001',
    date: '2026-08-20',
    fileName: 'Store_Inventory_Aug20.csv',
    totalProcessed: 65,
    added: 55,
    updated: 8,
    skipped: 2,
  },
  {
    id: 'imp-002',
    date: '2026-08-15',
    fileName: 'New_Stock_Arrivals.xlsx',
    totalProcessed: 32,
    added: 28,
    updated: 4,
    skipped: 0,
  },
];

let mockStockMovements: StockMovement[] = [
  {
    id: 'mov-101',
    shopInventoryItemId: 'shop-inv-cat-001',
    catalogProductId: 'cat-001',
    productName: 'Tata Salt',
    brand: 'Tata',
    variant: '1 kg',
    type: 'SALE',
    quantityChange: -2,
    previousQuantity: 27,
    newQuantity: 25,
    reason: 'Offline sale',
    source: 'COUNTER_SALE',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'mov-102',
    shopInventoryItemId: 'shop-inv-cat-002',
    catalogProductId: 'cat-002',
    productName: 'Aashirvaad Shuddh Chakki Atta',
    brand: 'Aashirvaad',
    variant: '5 kg',
    type: 'STOCK_RECEIVED',
    quantityChange: 20,
    previousQuantity: 5,
    newQuantity: 25,
    reason: 'Stock received',
    source: 'MANUAL_ADJUSTMENT',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'mov-103',
    shopInventoryItemId: 'shop-inv-cat-016',
    catalogProductId: 'cat-016',
    productName: 'Maggi 2-Minute Masala Noodles',
    brand: 'Maggi',
    variant: '70 g',
    type: 'DAMAGED',
    quantityChange: -1,
    previousQuantity: 100,
    newQuantity: 99,
    reason: 'Damaged',
    source: 'MANUAL_ADJUSTMENT',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

let activeCounterSaleRecords: CounterSaleRecord[] = [
  {
    id: 'cs-101',
    items: [
      {
        shopInventoryItemId: 'shop-inv-cat-001',
        productName: 'Tata Salt',
        brand: 'Tata',
        variant: '1 kg',
        quantity: 2,
        unitPrice: 27,
        totalPrice: 54,
      },
      {
        shopInventoryItemId: 'shop-inv-cat-016',
        productName: 'Maggi 2-Minute Masala Noodles',
        brand: 'Maggi',
        variant: '70 g',
        quantity: 3,
        unitPrice: 15,
        totalPrice: 45,
      },
    ],
    totalAmount: 99,
    paymentMethod: 'Cash',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'cs-102',
    items: [
      {
        shopInventoryItemId: 'shop-inv-cat-002',
        productName: 'Aashirvaad Shuddh Chakki Atta',
        brand: 'Aashirvaad',
        variant: '5 kg',
        quantity: 1,
        unitPrice: 310,
        totalPrice: 310,
      },
    ],
    totalAmount: 310,
    paymentMethod: 'UPI',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];

let activeStockReceipts: StockReceipt[] = [
  {
    id: 'REC-1028',
    supplierId: 'sup-101',
    supplierName: 'Shree Traders',
    items: [
      {
        shopInventoryItemId: 'shop-inv-cat-001',
        catalogProductId: 'cat-001',
        productName: 'Tata Salt',
        brand: 'Tata',
        variant: '1 kg',
        quantityReceived: 20,
        previousQuantity: 24,
        newQuantity: 44,
        purchaseCost: 22,
        totalItemValue: 440,
      },
      {
        shopInventoryItemId: 'shop-inv-cat-002',
        catalogProductId: 'cat-002',
        productName: 'Aashirvaad Shuddh Chakki Atta',
        brand: 'Aashirvaad',
        variant: '5 kg',
        quantityReceived: 10,
        previousQuantity: 20,
        newQuantity: 30,
        purchaseCost: 210,
        totalItemValue: 2100,
      },
    ],
    totalProductsCount: 2,
    totalUnitsReceived: 30,
    totalPurchaseValue: 2540,
    hasUnknownCosts: false,
    notes: 'Regular weekly stock delivery.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'REC-1027',
    supplierId: 'sup-102',
    supplierName: 'Metro Wholesale',
    items: [
      {
        shopInventoryItemId: 'shop-inv-cat-016',
        catalogProductId: 'cat-016',
        productName: 'Maggi 2-Minute Masala Noodles',
        brand: 'Maggi',
        variant: '70 g',
        quantityReceived: 50,
        previousQuantity: 49,
        newQuantity: 99,
        purchaseCost: 12,
        totalItemValue: 600,
      },
    ],
    totalProductsCount: 1,
    totalUnitsReceived: 50,
    totalPurchaseValue: 600,
    hasUnknownCosts: false,
    notes: 'Bulk noodle replenishment.',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

export const inventoryService = {
  async init(): Promise<void> {
    const isInit = await storageService.isInitialized();
    if (isInit) {
      const storedInv = await storageService.getItem<ShopInventoryItem[] | null>(STORAGE_KEYS.INVENTORY, null);
      if (storedInv && Array.isArray(storedInv)) {
        activeShopInventory = storedInv;
      }
      const storedCat = await storageService.getItem<CatalogProduct[] | null>(STORAGE_KEYS.CATALOG, null);
      if (storedCat && Array.isArray(storedCat)) {
        MASTER_YUGO_CATALOG.length = 0;
        MASTER_YUGO_CATALOG.push(...storedCat);
      }
      const storedMov = await storageService.getItem<StockMovement[] | null>(STORAGE_KEYS.STOCK_MOVEMENTS, null);
      if (storedMov && Array.isArray(storedMov)) {
        mockStockMovements = storedMov;
      }
      const storedRec = await storageService.getItem<StockReceipt[] | null>(STORAGE_KEYS.STOCK_RECEIPTS, null);
      if (storedRec && Array.isArray(storedRec)) {
        activeStockReceipts = storedRec;
      }
      const storedCS = await storageService.getItem<CounterSaleRecord[] | null>(STORAGE_KEYS.COUNTER_SALES, null);
      if (storedCS && Array.isArray(storedCS)) {
        activeCounterSaleRecords = storedCS;
      }
      return;
    }

    // First run initialization: persist initial mock state immediately
    await this.persistAll();
  },

  async persistAll(): Promise<void> {
    await Promise.all([
      storageService.setItem(STORAGE_KEYS.INVENTORY, activeShopInventory),
      storageService.setItem(STORAGE_KEYS.CATALOG, MASTER_YUGO_CATALOG),
      storageService.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, mockStockMovements),
      storageService.setItem(STORAGE_KEYS.STOCK_RECEIPTS, activeStockReceipts),
      storageService.setItem(STORAGE_KEYS.COUNTER_SALES, activeCounterSaleRecords),
    ]);
  },

  async getCatalogProducts(includeInactive = false): Promise<CatalogProduct[]> {
    if (includeInactive) return [...MASTER_YUGO_CATALOG];
    return MASTER_YUGO_CATALOG.filter((p) => p.isActive !== false);
  },

  async getCatalogProductById(id: string): Promise<CatalogProduct | undefined> {
    return MASTER_YUGO_CATALOG.find((p) => p.id === id);
  },

  async searchCatalog(query: string, category?: string, includeInactive = false): Promise<CatalogProduct[]> {
    const q = query.trim().toLowerCase();
    return MASTER_YUGO_CATALOG.filter((p) => {
      if (!includeInactive && p.isActive === false) return false;
      const matchesCategory = !category || category === 'All' || p.category.toLowerCase() === category.toLowerCase();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.variant.toLowerCase().includes(q) ||
        (p.packSize && p.packSize.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.includes(q));
      return matchesCategory && matchesQuery;
    });
  },

  async createCatalogProduct(data: {
    name: string;
    brand: string;
    variant?: string;
    category: string;
    subcategory?: string;
    unitType?: string;
    packSize?: string;
    barcode?: string;
    mrp: number;
    unit?: string;
    description?: string;
  }): Promise<CatalogProduct> {
    if (!data.name || !data.name.trim()) throw new Error('Product name is required.');
    if (!data.category || !data.category.trim()) throw new Error('Category is required.');
    if (isNaN(data.mrp) || data.mrp <= 0) throw new Error('Valid MRP is required.');

    const cleanBarcode = data.barcode ? data.barcode.trim() : undefined;
    if (cleanBarcode) {
      const existingBarcodeProd = MASTER_YUGO_CATALOG.find((p) => p.barcode === cleanBarcode && p.isActive !== false);
      if (existingBarcodeProd) {
        throw new Error(`This barcode is already assigned to "${existingBarcodeProd.name}".`);
      }
    }

    const newProd: CatalogProduct = {
      id: `cat-${Date.now()}`,
      name: data.name.trim(),
      brand: data.brand ? data.brand.trim() : 'Generic',
      variant: data.packSize || data.variant || 'Standard',
      category: data.category.trim(),
      subcategory: data.subcategory ? data.subcategory.trim() : undefined,
      unitType: data.unitType ? data.unitType.trim() : 'Packet',
      packSize: data.packSize ? data.packSize.trim() : 'Standard',
      barcode: cleanBarcode,
      mrp: data.mrp,
      unit: data.unit || 'pc',
      description: data.description ? data.description.trim() : undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MASTER_YUGO_CATALOG.unshift(newProd);
    await this.persistAll();
    return newProd;
  },

  async updateCatalogProduct(id: string, updates: Partial<CatalogProduct>): Promise<CatalogProduct> {
    const idx = MASTER_YUGO_CATALOG.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error(`Catalog product not found.`);

    if (updates.barcode) {
      const cleanBarcode = updates.barcode.trim();
      const existingBarcode = MASTER_YUGO_CATALOG.find(
        (p) => p.barcode === cleanBarcode && p.id !== id && p.isActive !== false
      );
      if (existingBarcode) {
        throw new Error(`This barcode is already assigned to "${existingBarcode.name}".`);
      }
    }

    const updated = {
      ...MASTER_YUGO_CATALOG[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    MASTER_YUGO_CATALOG[idx] = updated;

    // Update referenced shop inventory items without overwriting sellingPrice, stock, or purchaseCost
    activeShopInventory.forEach((item) => {
      if (item.catalogProductId === id) {
        item.catalogProduct = updated;
      }
    });

    await this.persistAll();
    return updated;
  },

  async deactivateCatalogProduct(id: string): Promise<CatalogProduct> {
    return this.updateCatalogProduct(id, { isActive: false });
  },

  async getShopInventory(): Promise<ShopInventoryItem[]> {
    return [...activeShopInventory];
  },

  async getShopInventoryItemById(id: string): Promise<ShopInventoryItem | undefined> {
    return activeShopInventory.find((item) => item.id === id || item.catalogProductId === id);
  },

  async findProductByBarcode(barcode: string): Promise<CatalogProduct | undefined> {
    const cleanBarcode = barcode.trim();
    if (!cleanBarcode) return undefined;
    return MASTER_YUGO_CATALOG.find((p) => p.barcode === cleanBarcode);
  },

  async findShopInventoryItemByBarcode(barcode: string): Promise<ShopInventoryItem | undefined> {
    const cleanBarcode = barcode.trim();
    if (!cleanBarcode) return undefined;
    return activeShopInventory.find((item) => item.catalogProduct.barcode === cleanBarcode);
  },

  async addCatalogProductToShop(
    catalogProductId: string,
    sellingPrice: number,
    stockQuantity: number,
    lowStockThreshold = 5
  ): Promise<ShopInventoryItem> {
    const existing = activeShopInventory.find((item) => item.catalogProductId === catalogProductId);
    if (existing) {
      throw new Error(`Product is already present in your shop inventory.`);
    }

    const catalogProd = MASTER_YUGO_CATALOG.find((c) => c.id === catalogProductId);
    if (!catalogProd) {
      throw new Error(`Catalog product not found.`);
    }

    const newItem: ShopInventoryItem = {
      id: `shop-inv-${catalogProd.id}-${Date.now()}`,
      catalogProductId: catalogProd.id,
      catalogProduct: catalogProd,
      sellingPrice: sellingPrice > 0 ? sellingPrice : catalogProd.mrp,
      stockQuantity: Math.max(0, stockQuantity),
      lowStockThreshold: Math.max(1, lowStockThreshold),
      isAvailable: true,
      lastUpdated: new Date().toISOString(),
    };

    activeShopInventory.unshift(newItem);
    return newItem;
  },

  async updateShopInventoryItem(
    id: string,
    updates: Partial<Omit<ShopInventoryItem, 'id' | 'catalogProductId' | 'catalogProduct'>>
  ): Promise<ShopInventoryItem> {
    const idx = activeShopInventory.findIndex((item) => item.id === id || item.catalogProductId === id);
    if (idx === -1) {
      throw new Error(`Shop inventory item not found.`);
    }

    const current = activeShopInventory[idx];
    const updated: ShopInventoryItem = {
      ...current,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };

    activeShopInventory[idx] = updated;

    // Trigger operational notifications on stock state transitions
    if (updates.stockQuantity !== undefined) {
      const newStock = updates.stockQuantity;
      const thresh = updated.lowStockThreshold;
      const prodName = `${updated.catalogProduct.name} ${updated.catalogProduct.variant}`;

      if (newStock === 0 && current.stockQuantity > 0) {
        this.notifyEvent({
          category: 'INVENTORY',
          type: 'OUT_OF_STOCK',
          title: 'Out of stock alert',
          message: `${prodName} is now completely out of stock`,
          priority: 'HIGH',
          entityType: 'INVENTORY_ITEM',
          entityId: updated.id,
          stateKey: `out_of_stock_${updated.id}`,
        });
      } else if (newStock > 0 && newStock <= thresh && current.stockQuantity > thresh) {
        this.notifyEvent({
          category: 'INVENTORY',
          type: 'LOW_STOCK',
          title: 'Low stock alert',
          message: `${prodName} has only ${newStock} units left in stock`,
          priority: 'NORMAL',
          entityType: 'INVENTORY_ITEM',
          entityId: updated.id,
          stateKey: `low_stock_${updated.id}`,
        });
      }
    }

    return updated;
  },

  async notifyEvent(event: {
    category: import('../types/notification').NotificationCategory;
    type: string;
    title: string;
    message: string;
    priority?: import('../types/notification').NotificationPriority;
    entityType?: import('../types/notification').AppNotification['entityType'];
    entityId?: import('../types/notification').AppNotification['entityId'];
    stateKey?: string;
  }) {
    return notificationService.notifyEvent(event);
  },

  async updateStock(id: string, newStock: number): Promise<ShopInventoryItem> {
    return this.updateShopInventoryItem(id, { stockQuantity: Math.max(0, newStock) });
  },

  async deductOrderStock(order: import('../types/order').Order): Promise<void> {
    for (const item of order.items) {
      const idx = activeShopInventory.findIndex(
        (inv) =>
          inv.catalogProductId === item.productId ||
          inv.id === item.productId ||
          inv.catalogProduct.name.toLowerCase() === item.productName.toLowerCase()
      );
      if (idx !== -1) {
        const current = activeShopInventory[idx];
        const prevQty = current.stockQuantity;
        const newQty = Math.max(0, prevQty - item.quantity);

        await this.updateShopInventoryItem(current.id, { stockQuantity: newQty });

        await this.recordStockMovementEntry({
          shopInventoryItemId: current.id,
          catalogProductId: current.catalogProductId,
          productName: current.catalogProduct.name,
          brand: current.catalogProduct.brand,
          variant: current.catalogProduct.variant,
          type: 'SALE',
          quantityChange: -item.quantity,
          previousQuantity: prevQty,
          newQuantity: newQty,
          reason: `Online order acceptance: ${order.orderNumber}`,
          source: 'ORDER_FULFILLMENT',
        });
      }
    }
  },

  async restoreOrderStock(order: import('../types/order').Order): Promise<void> {
    for (const item of order.items) {
      const idx = activeShopInventory.findIndex(
        (inv) =>
          inv.catalogProductId === item.productId ||
          inv.id === item.productId ||
          inv.catalogProduct.name.toLowerCase() === item.productName.toLowerCase()
      );
      if (idx !== -1) {
        const current = activeShopInventory[idx];
        const prevQty = current.stockQuantity;
        const newQty = prevQty + item.quantity;

        await this.updateShopInventoryItem(current.id, { stockQuantity: newQty });

        await this.recordStockMovementEntry({
          shopInventoryItemId: current.id,
          catalogProductId: current.catalogProductId,
          productName: current.catalogProduct.name,
          brand: current.catalogProduct.brand,
          variant: current.catalogProduct.variant,
          type: 'RETURN',
          quantityChange: item.quantity,
          previousQuantity: prevQty,
          newQuantity: newQty,
          reason: `Restocked from cancelled order ${order.orderNumber}`,
          source: 'CUSTOMER_RETURN',
        });
      }
    }
  },

  async recordOfflineStockUpdate(
    soldItems: { id: string; quantitySold: number }[]
  ): Promise<ShopInventoryItem[]> {
    const updatedList: ShopInventoryItem[] = [];
    for (const sold of soldItems) {
      const idx = activeShopInventory.findIndex((item) => item.id === sold.id || item.catalogProductId === sold.id);
      if (idx !== -1) {
        const item = activeShopInventory[idx];
        const prevQty = item.stockQuantity;
        const newStock = Math.max(0, prevQty - sold.quantitySold);
        const updated = await this.updateShopInventoryItem(item.id, { stockQuantity: newStock });
        updatedList.push(updated);

        await this.recordStockMovementEntry({
          shopInventoryItemId: item.id,
          catalogProductId: item.catalogProductId,
          productName: item.catalogProduct.name,
          brand: item.catalogProduct.brand,
          variant: item.catalogProduct.variant,
          type: 'SALE',
          quantityChange: -sold.quantitySold,
          previousQuantity: prevQty,
          newQuantity: newStock,
          reason: 'Counter Sale (Point of Sale)',
          source: 'COUNTER_SALE',
        });
      }
    }
    return updatedList;
  },

  // EXCEL / CSV IMPORT PARSING & MATCHING PIPELINE
  async parseExcelOrCsv(fileContent: string): Promise<ExcelImportRow[]> {
    const lines = fileContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
    const rows: ExcelImportRow[] = [];

    const nameIdx = headers.findIndex((h) => h.includes('name') || h.includes('product'));
    const barcodeIdx = headers.findIndex((h) => h.includes('barcode') || h.includes('code') || h.includes('upc') || h.includes('ean'));
    const brandIdx = headers.findIndex((h) => h.includes('brand'));
    const categoryIdx = headers.findIndex((h) => h.includes('cat'));
    const variantIdx = headers.findIndex((h) => h.includes('variant') || h.includes('size') || h.includes('weight'));
    const mrpIdx = headers.findIndex((h) => h.includes('mrp'));
    const priceIdx = headers.findIndex((h) => h.includes('price') || h.includes('selling'));
    const stockIdx = headers.findIndex((h) => h.includes('stock') || h.includes('qty') || h.includes('quantity'));
    const threshIdx = headers.findIndex((h) => h.includes('threshold') || h.includes('low'));

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim());
      if (!cols.some((c) => c.length > 0)) continue;

      const productName = nameIdx >= 0 ? cols[nameIdx] || '' : cols[0] || '';
      const barcode = barcodeIdx >= 0 ? cols[barcodeIdx] : undefined;
      const brand = brandIdx >= 0 ? cols[brandIdx] : undefined;
      const category = categoryIdx >= 0 ? cols[categoryIdx] : undefined;
      const variant = variantIdx >= 0 ? cols[variantIdx] : undefined;
      const mrp = mrpIdx >= 0 ? parseFloat(cols[mrpIdx]) || undefined : undefined;
      const sellingPrice = priceIdx >= 0 ? parseFloat(cols[priceIdx]) || undefined : undefined;
      const stockQuantity = stockIdx >= 0 ? parseInt(cols[stockIdx], 10) || undefined : undefined;
      const lowStockThreshold = threshIdx >= 0 ? parseInt(cols[threshIdx], 10) || undefined : undefined;

      rows.push({
        rowNumber: i,
        productName,
        barcode,
        brand,
        category,
        variant,
        mrp,
        sellingPrice,
        stockQuantity,
        lowStockThreshold,
      });
    }

    return rows;
  },

  async validateAndMatchRows(
    rows: ExcelImportRow[]
  ): Promise<ValidatedImportRow[]> {
    return rows.map((row) => {
      const errors: string[] = [];

      if (!row.productName || row.productName.trim().length === 0) {
        errors.push('Product name is required.');
      }

      let matchedProduct: CatalogProduct | undefined;
      let matchConfidence: ValidatedImportRow['matchConfidence'] = 'none';

      const cleanName = (row.productName || '').trim().toLowerCase();
      const cleanBarcode = (row.barcode || '').trim();

      // 1. Exact Barcode match
      if (cleanBarcode) {
        matchedProduct = MASTER_YUGO_CATALOG.find((c) => c.barcode === cleanBarcode);
        if (matchedProduct) {
          matchConfidence = 'exact_barcode';
        }
      }

      // 2. Exact Name + Variant match
      if (!matchedProduct && cleanName) {
        matchedProduct = MASTER_YUGO_CATALOG.find(
          (c) =>
            c.name.toLowerCase() === cleanName ||
            `${c.brand} ${c.name}`.toLowerCase() === cleanName ||
            `${c.name} ${c.variant}`.toLowerCase() === cleanName
        );
        if (matchedProduct) {
          matchConfidence = 'exact_name_variant';
        }
      }

      // 3. Name & Brand match
      if (!matchedProduct && cleanName) {
        matchedProduct = MASTER_YUGO_CATALOG.find((c) => {
          const catFull = `${c.brand} ${c.name} ${c.variant}`.toLowerCase();
          return catFull.includes(cleanName) || cleanName.includes(c.name.toLowerCase());
        });
        if (matchedProduct) {
          matchConfidence = 'name_brand';
        }
      }

      // Check if already in shop inventory
      const existingInventoryItem = activeShopInventory.find(
        (inv) =>
          (matchedProduct && inv.catalogProductId === matchedProduct.id) ||
          inv.catalogProduct.name.toLowerCase() === cleanName
      );

      let status: ValidatedImportRow['status'] = 'valid';
      if (errors.length > 0) {
        status = 'invalid';
      } else if (!matchedProduct || matchConfidence === 'none') {
        status = 'needs_review';
      }

      return {
        rowNumber: row.rowNumber,
        raw: row,
        matchedProduct,
        matchConfidence,
        existingInventoryItem,
        status,
        validationErrors: errors,
        userChoice: existingInventoryItem ? 'replace_stock' : undefined,
      };
    });
  },

  async executeImport(
    validatedRows: ValidatedImportRow[],
    fileName = 'Import_Batch.xlsx'
  ): Promise<ImportSummaryResult> {
    let addedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let invalidCount = 0;

    for (const row of validatedRows) {
      if (row.status === 'invalid' || row.userChoice === 'skip') {
        if (row.status === 'invalid') invalidCount++;
        else skippedCount++;
        continue;
      }

      // Target catalog product
      const targetCatalog: CatalogProduct = row.matchedProduct || {
        id: `custom-cat-${Date.now()}-${row.rowNumber}`,
        name: row.raw.productName,
        brand: row.raw.brand || 'Custom',
        variant: row.raw.variant || 'Standard',
        category: row.raw.category || 'General',
        barcode: row.raw.barcode,
        mrp: row.raw.mrp || row.raw.sellingPrice || 100,
        unit: 'pcs',
      };

      const price = row.raw.sellingPrice || row.raw.mrp || targetCatalog.mrp;
      const stock = row.raw.stockQuantity !== undefined ? row.raw.stockQuantity : 10;
      const thresh = row.raw.lowStockThreshold || 5;

      const existingIdx = activeShopInventory.findIndex(
        (item) => item.catalogProductId === targetCatalog.id || item.id === row.existingInventoryItem?.id
      );

      if (existingIdx !== -1) {
        const current = activeShopInventory[existingIdx];
        const newStock = row.userChoice === 'add_stock' ? current.stockQuantity + stock : stock;
        activeShopInventory[existingIdx] = {
          ...current,
          sellingPrice: price,
          stockQuantity: newStock,
          lowStockThreshold: thresh,
          lastUpdated: new Date().toISOString(),
        };
        updatedCount++;
      } else {
        const newItem: ShopInventoryItem = {
          id: `shop-inv-${targetCatalog.id}-${Date.now()}`,
          catalogProductId: targetCatalog.id,
          catalogProduct: targetCatalog,
          sellingPrice: price,
          stockQuantity: stock,
          lowStockThreshold: thresh,
          isAvailable: true,
          lastUpdated: new Date().toISOString(),
        };
        activeShopInventory.unshift(newItem);
        addedCount++;
      }
    }

    const summary: ImportSummaryResult = {
      totalRows: validatedRows.length,
      addedCount,
      updatedCount,
      skippedCount,
      invalidCount,
      timestamp: new Date().toISOString(),
    };

    // Add to persistent import history log
    mockImportHistory.unshift({
      id: `imp-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      fileName,
      totalProcessed: validatedRows.length,
      added: addedCount,
      updated: updatedCount,
      skipped: skippedCount + invalidCount,
    });

    return summary;
  },

  async getImportHistory(): Promise<ImportHistoryRecord[]> {
    return [...mockImportHistory];
  },

  async adjustStock(
    id: string,
    params: {
      mode: 'set' | 'adjust';
      value: number;
      reason: StockMovementReason | string;
      source?: StockMovement['source'];
    }
  ): Promise<ShopInventoryItem> {
    const idx = activeShopInventory.findIndex((item) => item.id === id || item.catalogProductId === id);
    if (idx === -1) {
      throw new Error(`Shop inventory item not found.`);
    }

    const current = activeShopInventory[idx];
    const prevQty = current.stockQuantity;
    let newQty = prevQty;

    if (params.mode === 'set') {
      newQty = Math.max(0, params.value);
    } else {
      newQty = Math.max(0, prevQty + params.value);
    }

    const qtyChange = newQty - prevQty;
    const updated = await this.updateShopInventoryItem(current.id, { stockQuantity: newQty });

    // Map reason string to type
    let type: StockMovementType = 'ADJUSTMENT';
    const reasonStr = (params.reason || '').toLowerCase();
    if (reasonStr.includes('sale')) type = 'SALE';
    else if (reasonStr.includes('received')) type = 'STOCK_RECEIVED';
    else if (reasonStr.includes('damage')) type = 'DAMAGED';
    else if (reasonStr.includes('expire')) type = 'EXPIRED';
    else if (reasonStr.includes('return')) type = 'RETURN';
    else if (reasonStr.includes('correct')) type = 'CORRECTION';

    // Record StockMovement
    const movement: StockMovement = {
      id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      shopInventoryItemId: current.id,
      catalogProductId: current.catalogProductId,
      productName: current.catalogProduct.name,
      brand: current.catalogProduct.brand,
      variant: current.catalogProduct.variant,
      type,
      quantityChange: qtyChange,
      previousQuantity: prevQty,
      newQuantity: newQty,
      reason: params.reason || 'Stock correction',
      source: params.source || 'MANUAL_ADJUSTMENT',
      createdAt: new Date().toISOString(),
    };

    mockStockMovements.unshift(movement);
    return updated;
  },

  async getCounterSaleRecords(): Promise<CounterSaleRecord[]> {
    return [...activeCounterSaleRecords];
  },

  async recordCounterSale(
    saleItems: { shopInventoryItemId: string; quantity: number }[],
    paymentMethod: 'Cash' | 'UPI' | 'Card' = 'Cash'
  ): Promise<ShopInventoryItem[]> {
    if (!saleItems || saleItems.length === 0) {
      throw new Error('Please add at least one product to record a counter sale.');
    }

    // 1. ATOMIC VALIDATION: Validate stock for ALL items before mutating any item
    for (const saleItem of saleItems) {
      const item = activeShopInventory.find(
        (inv) => inv.id === saleItem.shopInventoryItemId || inv.catalogProductId === saleItem.shopInventoryItemId
      );
      if (!item) {
        throw new Error(`Inventory item not found.`);
      }
      if (saleItem.quantity <= 0) {
        throw new Error(`Quantity for ${item.catalogProduct.name} must be greater than zero.`);
      }
      if (saleItem.quantity > item.stockQuantity) {
        throw new Error(
          `Insufficient stock for ${item.catalogProduct.name}. Only ${item.stockQuantity} available.`
        );
      }
    }

    // 2. ATOMIC EXECUTION: Deduct stock, log stock movement, and record counter sale financial record
    const updatedItems: ShopInventoryItem[] = [];
    const recordItems: import('./financial-service').CounterSaleRecordItem[] = [];
    let totalSaleAmount = 0;

    for (const saleItem of saleItems) {
      const idx = activeShopInventory.findIndex(
        (inv) => inv.id === saleItem.shopInventoryItemId || inv.catalogProductId === saleItem.shopInventoryItemId
      );
      const current = activeShopInventory[idx];
      const prevQty = current.stockQuantity;
      const newQty = prevQty - saleItem.quantity;

      const updated = await this.updateShopInventoryItem(current.id, { stockQuantity: newQty });
      updatedItems.push(updated);

      const itemTotal = current.sellingPrice * saleItem.quantity;
      totalSaleAmount += itemTotal;

      recordItems.push({
        shopInventoryItemId: current.id,
        productName: current.catalogProduct.name,
        brand: current.catalogProduct.brand,
        variant: current.catalogProduct.variant,
        quantity: saleItem.quantity,
        unitPrice: current.sellingPrice,
        totalPrice: itemTotal,
      });

      mockStockMovements.unshift({
        id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        shopInventoryItemId: current.id,
        catalogProductId: current.catalogProductId,
        productName: current.catalogProduct.name,
        brand: current.catalogProduct.brand,
        variant: current.catalogProduct.variant,
        type: 'SALE',
        quantityChange: -saleItem.quantity,
        previousQuantity: prevQty,
        newQuantity: newQty,
        reason: 'Offline sale',
        source: 'COUNTER_SALE',
        createdAt: new Date().toISOString(),
      });
    }

    // Persist counter sale record for financial earnings calculation
    const counterSaleRecord: import('./financial-service').CounterSaleRecord = {
      id: `cs-${Date.now()}`,
      items: recordItems,
      totalAmount: totalSaleAmount,
      paymentMethod,
      createdAt: new Date().toISOString(),
    };
    activeCounterSaleRecords.unshift(counterSaleRecord);

    return updatedItems;
  },

  async recordStockMovementEntry(movementData: Omit<StockMovement, 'id' | 'createdAt'> & { createdAt?: string }): Promise<StockMovement> {
    const movement: StockMovement = {
      ...movementData,
      id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: movementData.createdAt || new Date().toISOString(),
    };
    mockStockMovements.unshift(movement);
    return movement;
  },

  async getStockMovements(filterType?: string, searchQuery?: string): Promise<StockMovement[]> {
    let list = [...mockStockMovements];
    if (filterType && filterType !== 'all') {
      const ft = filterType.toLowerCase();
      list = list.filter((m) => {
        if (ft === 'sales') return m.type === 'SALE';
        if (ft === 'received') return m.type === 'STOCK_RECEIVED';
        if (ft === 'adjustments') return m.type === 'ADJUSTMENT' || m.type === 'CORRECTION';
        if (ft === 'damaged') return m.type === 'DAMAGED' || m.type === 'EXPIRED';
        if (ft === 'returns') return m.type === 'RETURN';
        return true;
      });
    }

    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (m) =>
          m.productName.toLowerCase().includes(q) ||
          m.brand.toLowerCase().includes(q) ||
          m.reason.toLowerCase().includes(q)
      );
    }

    return list;
  },

  async getPendingStockAudits(): Promise<{ item: ShopInventoryItem; expectedStock: number; recordedStock: number }[]> {
    // Return sample pending stock reconciliation items
    const sampleItems = activeShopInventory.slice(0, 4);
    return sampleItems.map((item, idx) => ({
      item,
      expectedStock: item.stockQuantity + (idx % 2 === 0 ? 2 : -1),
      recordedStock: item.stockQuantity,
    }));
  },

  async getStockReceipts(
    filterRange: 'all' | 'today' | 'week' | 'month' = 'all',
    searchQuery = ''
  ): Promise<StockReceipt[]> {
    let list = [...activeStockReceipts];
    const q = searchQuery.trim().toLowerCase();

    if (q) {
      list = list.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.supplierName.toLowerCase().includes(q) ||
          (r.notes && r.notes.toLowerCase().includes(q))
      );
    }
    if (filterRange !== 'all') {
      const now = new Date();
      const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let startTime = todayDate.getTime();

      if (filterRange === 'week') {
        const startOfWeek = new Date(todayDate);
        startOfWeek.setDate(todayDate.getDate() - 7);
        startTime = startOfWeek.getTime();
      } else if (filterRange === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        startTime = startOfMonth.getTime();
      }

      list = list.filter((r) => new Date(r.createdAt).getTime() >= startTime);
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getStockReceiptById(id: string): Promise<StockReceipt | undefined> {
    return activeStockReceipts.find((r) => r.id === id);
  },

  async recordStockReceipt(params: {
    supplierId: string;
    items: {
      shopInventoryItemId: string;
      quantityReceived: number;
      purchaseCost?: number;
    }[];
    notes?: string;
  }): Promise<StockReceipt> {
    if (!params.items || params.items.length === 0) {
      throw new Error('Please add at least one product to record stock receiving.');
    }

    const supplier = await supplierService.getSupplierById(params.supplierId);
    if (!supplier) {
      throw new Error('Supplier not found.');
    }

    // 1. ATOMIC VALIDATION: Validate all items exist & quantities are valid
    for (const itemParam of params.items) {
      const invItem = activeShopInventory.find(
        (inv) => inv.id === itemParam.shopInventoryItemId || inv.catalogProductId === itemParam.shopInventoryItemId
      );
      if (!invItem) {
        throw new Error('Inventory item not found.');
      }
      if (itemParam.quantityReceived <= 0) {
        throw new Error(`Received quantity for ${invItem.catalogProduct.name} must be greater than zero.`);
      }
    }

    // 2. ATOMIC EXECUTION: Update inventory, create movements, construct receipt
    const receiptId = `REC-${1029 + activeStockReceipts.length}`;
    const nowISO = new Date().toISOString();
    const receiptItems: StockReceiptItem[] = [];
    let totalUnitsReceived = 0;
    let totalPurchaseValue = 0;
    let hasUnknownCosts = false;

    for (const itemParam of params.items) {
      const idx = activeShopInventory.findIndex(
        (inv) => inv.id === itemParam.shopInventoryItemId || inv.catalogProductId === itemParam.shopInventoryItemId
      );
      const current = activeShopInventory[idx];
      const prevQty = current.stockQuantity;
      const newQty = prevQty + itemParam.quantityReceived;

      // Update inventory item stock & latest purchase cost (without modifying selling price or MRP)
      const updates: Partial<ShopInventoryItem> = {
        stockQuantity: newQty,
        isAvailable: newQty > 0 ? true : current.isAvailable,
        lastUpdated: nowISO,
      };
      if (itemParam.purchaseCost !== undefined && itemParam.purchaseCost > 0) {
        updates.latestPurchaseCost = itemParam.purchaseCost;
      }
      await this.updateShopInventoryItem(current.id, updates);

      const hasCost = itemParam.purchaseCost !== undefined && itemParam.purchaseCost > 0;
      const itemTotalVal = hasCost ? itemParam.purchaseCost! * itemParam.quantityReceived : undefined;

      if (hasCost && itemTotalVal) {
        totalPurchaseValue += itemTotalVal;
      } else {
        hasUnknownCosts = true;
      }

      totalUnitsReceived += itemParam.quantityReceived;

      receiptItems.push({
        shopInventoryItemId: current.id,
        catalogProductId: current.catalogProductId,
        productName: current.catalogProduct.name,
        brand: current.catalogProduct.brand,
        variant: current.catalogProduct.variant,
        quantityReceived: itemParam.quantityReceived,
        previousQuantity: prevQty,
        newQuantity: newQty,
        purchaseCost: itemParam.purchaseCost,
        totalItemValue: itemTotalVal,
      });

      // Push StockMovement entry with supplierId & receiptId
      mockStockMovements.unshift({
        id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        shopInventoryItemId: current.id,
        catalogProductId: current.catalogProductId,
        productName: current.catalogProduct.name,
        brand: current.catalogProduct.brand,
        variant: current.catalogProduct.variant,
        type: 'STOCK_RECEIVED',
        quantityChange: itemParam.quantityReceived,
        previousQuantity: prevQty,
        newQuantity: newQty,
        reason: `Stock received from ${supplier.name}`,
        source: 'SUPPLIER_RECEIPT',
        supplierId: supplier.id,
        supplierName: supplier.name,
        receiptId,
        purchaseCost: itemParam.purchaseCost,
        createdAt: nowISO,
      });
    }

    const stockReceipt: StockReceipt = {
      id: receiptId,
      supplierId: supplier.id,
      supplierName: supplier.name,
      items: receiptItems,
      totalProductsCount: receiptItems.length,
      totalUnitsReceived,
      totalPurchaseValue: hasUnknownCosts && totalPurchaseValue === 0 ? undefined : totalPurchaseValue,
      hasUnknownCosts,
      notes: params.notes ? params.notes.trim() : undefined,
      createdAt: nowISO,
    };

    activeStockReceipts.unshift(stockReceipt);

    // Update supplier lifetime statistics
    await supplierService.updateSupplierStats(supplier.id, totalPurchaseValue, nowISO);
    await this.persistAll();

    return stockReceipt;
  },
};
