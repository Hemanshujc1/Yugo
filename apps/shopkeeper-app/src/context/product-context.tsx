import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types/product';
import {
  CatalogProduct,
  ShopInventoryItem,
  ExcelImportRow,
  ValidatedImportRow,
  ImportSummaryResult,
  ImportHistoryRecord,
} from '../types/inventory';
import { inventoryService } from '../services/inventory-service';
import { returnService } from '../services/return-service';
import { productService } from '../services/product-service';
import { CounterSaleRecord } from '../services/financial-service';

export interface ProductContextType {
  products: Product[];
  shopInventory: ShopInventoryItem[];
  catalogProducts: CatalogProduct[];
  importHistory: ImportHistoryRecord[];
  loading: boolean;
  lastStockUpdateTimestamp: string | null;
  refreshProducts: () => Promise<void>;
  addProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<boolean>;
  updateStock: (id: string, quantity: number) => Promise<ShopInventoryItem>;
  recordOfflineStockUpdate: (items: { productId: string; quantitySold: number }[]) => Promise<ShopInventoryItem[]>;
  updateAvailability: (id: string, availability: boolean) => Promise<ShopInventoryItem>;
  updateShopInventoryItem: (
    id: string,
    updates: Partial<Omit<ShopInventoryItem, 'id' | 'catalogProductId' | 'catalogProduct'>>
  ) => Promise<ShopInventoryItem>;
  // Catalog & Inventory specific methods
  getCatalogProductById: (id: string) => Promise<CatalogProduct | undefined>;
  createCatalogProduct: (data: {
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
  }) => Promise<CatalogProduct>;
  updateCatalogProduct: (id: string, updates: Partial<CatalogProduct>) => Promise<CatalogProduct>;
  deactivateCatalogProduct: (id: string) => Promise<CatalogProduct>;
  searchCatalog: (query: string, category?: string) => Promise<CatalogProduct[]>;
  findProductByBarcode: (barcode: string) => Promise<CatalogProduct | undefined>;
  findShopInventoryItemByBarcode: (barcode: string) => Promise<ShopInventoryItem | undefined>;
  addCatalogProductToShop: (
    catalogProductId: string,
    sellingPrice: number,
    stockQuantity: number,
    lowStockThreshold?: number
  ) => Promise<ShopInventoryItem>;
  parseExcelOrCsv: (fileContent: string) => Promise<ExcelImportRow[]>;
  validateAndMatchRows: (rows: ExcelImportRow[]) => Promise<ValidatedImportRow[]>;
  executeImport: (validatedRows: ValidatedImportRow[], fileName?: string) => Promise<ImportSummaryResult>;
  refreshImportHistory: () => Promise<void>;
  // Stock Adjustment & Counter Sale Engine
  adjustStock: (
    id: string,
    params: {
      mode: 'set' | 'adjust';
      value: number;
      reason: import('../types/inventory').StockMovementReason | string;
      source?: import('../types/inventory').StockMovement['source'];
    }
  ) => Promise<ShopInventoryItem>;
  recordCounterSale: (
    saleItems: { shopInventoryItemId: string; quantity: number }[],
    paymentMethod?: 'Cash' | 'UPI' | 'Card'
  ) => Promise<ShopInventoryItem[]>;
  getCounterSaleRecords: () => Promise<CounterSaleRecord[]>;
  getStockMovements: (filterType?: string, searchQuery?: string) => Promise<import('../types/inventory').StockMovement[]>;
  getPendingStockAudits: () => Promise<{ item: ShopInventoryItem; expectedStock: number; recordedStock: number }[]>;
  recordStockReceipt: (params: {
    supplierId: string;
    items: {
      shopInventoryItemId: string;
      quantityReceived: number;
      purchaseCost?: number;
    }[];
    notes?: string;
  }) => Promise<import('../types/inventory').StockReceipt>;
  getStockReceipts: (
    filterRange?: 'all' | 'today' | 'week' | 'month',
    searchQuery?: string
  ) => Promise<import('../types/inventory').StockReceipt[]>;
  getStockReceiptById: (id: string) => Promise<import('../types/inventory').StockReceipt | undefined>;
  recordCustomerReturn: (params: {
    orderId: string;
    itemsToReturn: {
      productId: string;
      quantityReturning: number;
      disposition: import('../types/return').InventoryDisposition;
    }[];
    reason: import('../types/return').ReturnReason | string;
    notes?: string;
  }) => Promise<import('../types/return').CustomerReturn>;
  getReturns: (
    filterStatus?: 'all' | 'pending' | 'refunded' | 'partial' | 'full',
    searchQuery?: string
  ) => Promise<import('../types/return').CustomerReturn[]>;
  getReturnById: (id: string) => Promise<import('../types/return').CustomerReturn | undefined>;
  getReturnsForOrder: (orderId: string) => Promise<import('../types/return').CustomerReturn[]>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export interface ProductProviderProps {
  children: React.ReactNode;
}

// Utility mapper converting ShopInventoryItem to existing Product interface for backward compatibility
function mapInventoryToProduct(item: ShopInventoryItem): Product {
  return {
    id: item.id,
    catalogProductId: item.catalogProductId,
    name: item.catalogProduct.name,
    brand: item.catalogProduct.brand,
    variant: item.catalogProduct.variant,
    category: item.catalogProduct.category,
    images: item.catalogProduct.images || [],
    price: item.sellingPrice,
    stockQuantity: item.stockQuantity,
    lowStockThreshold: item.lowStockThreshold,
    isAvailable: item.isAvailable,
    availability: item.isAvailable,
    barcode: item.catalogProduct.barcode,
    sku: item.catalogProductId,
    description: item.catalogProduct.description,
    createdAt: item.lastUpdated,
    updatedAt: item.lastUpdated,
  };
}

export function ProductProvider({ children }: ProductProviderProps) {
  const [shopInventory, setShopInventory] = useState<ShopInventoryItem[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
  const [importHistory, setImportHistory] = useState<ImportHistoryRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastStockUpdateTimestamp, setLastStockUpdateTimestamp] = useState<string | null>(null);

  const refreshProducts = async () => {
    setLoading(true);
    try {
      const invData = await inventoryService.getShopInventory();
      const catData = await inventoryService.getCatalogProducts();
      const historyData = await inventoryService.getImportHistory();
      const ts = await productService.getLastStockUpdateTimestamp();

      setShopInventory(invData);
      setCatalogProducts(catData);
      setImportHistory(historyData);
      setProducts(invData.map(mapInventoryToProduct));
      setLastStockUpdateTimestamp(ts);
    } catch (error) {
      console.error('Failed to fetch shop inventory or catalog:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const initLoad = async () => {
      if (isMounted) {
        await refreshProducts();
      }
    };
    setTimeout(() => {
      initLoad();
    }, 0);
    return () => {
      isMounted = false;
    };
  }, []);

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct = await productService.createProduct(productData);
    await refreshProducts();
    return newProduct;
  };

  const updateProduct = async (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => {
    const updated = await productService.updateProduct(id, updates);
    await refreshProducts();
    return updated;
  };

  const deleteProduct = async (id: string) => {
    const success = await productService.deleteProduct(id);
    if (success) {
      await refreshProducts();
    }
    return success;
  };

  const updateStock = async (id: string, quantity: number) => {
    const updated = await inventoryService.updateStock(id, quantity);
    await refreshProducts();
    return updated;
  };

  const recordOfflineStockUpdate = async (items: { productId: string; quantitySold: number }[]) => {
    const mappedItems = items.map((i) => ({ id: i.productId, quantitySold: i.quantitySold }));
    const updated = await inventoryService.recordOfflineStockUpdate(mappedItems);
    await refreshProducts();
    return updated;
  };

  const updateAvailability = async (id: string, availability: boolean) => {
    const updated = await inventoryService.updateShopInventoryItem(id, { isAvailable: availability });
    await refreshProducts();
    return updated;
  };

  const searchCatalog = async (query: string, category?: string) => {
    return inventoryService.searchCatalog(query, category);
  };

  const addCatalogProductToShop = async (
    catalogProductId: string,
    sellingPrice: number,
    stockQuantity: number,
    lowStockThreshold = 5
  ) => {
    const item = await inventoryService.addCatalogProductToShop(
      catalogProductId,
      sellingPrice,
      stockQuantity,
      lowStockThreshold
    );
    await refreshProducts();
    return item;
  };

  const parseExcelOrCsv = async (fileContent: string) => {
    return inventoryService.parseExcelOrCsv(fileContent);
  };

  const validateAndMatchRows = async (rows: ExcelImportRow[]) => {
    return inventoryService.validateAndMatchRows(rows);
  };

  const executeImport = async (validatedRows: ValidatedImportRow[], fileName?: string) => {
    const summary = await inventoryService.executeImport(validatedRows, fileName);
    await refreshProducts();
    return summary;
  };

  const refreshImportHistory = async () => {
    const history = await inventoryService.getImportHistory();
    setImportHistory(history);
  };

  const getCatalogProductById = async (id: string) => {
    return inventoryService.getCatalogProductById(id);
  };

  const createCatalogProduct = async (data: {
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
  }) => {
    const created = await inventoryService.createCatalogProduct(data);
    await refreshProducts();
    return created;
  };

  const updateCatalogProduct = async (id: string, updates: Partial<CatalogProduct>) => {
    const updated = await inventoryService.updateCatalogProduct(id, updates);
    await refreshProducts();
    return updated;
  };

  const deactivateCatalogProduct = async (id: string) => {
    const deactivated = await inventoryService.deactivateCatalogProduct(id);
    await refreshProducts();
    return deactivated;
  };

  const findProductByBarcode = async (barcode: string) => {
    return inventoryService.findProductByBarcode(barcode);
  };

  const findShopInventoryItemByBarcode = async (barcode: string) => {
    return inventoryService.findShopInventoryItemByBarcode(barcode);
  };

  const adjustStock = async (
    id: string,
    params: {
      mode: 'set' | 'adjust';
      value: number;
      reason: import('../types/inventory').StockMovementReason | string;
      source?: import('../types/inventory').StockMovement['source'];
    }
  ) => {
    const updated = await inventoryService.adjustStock(id, params);
    await refreshProducts();
    return updated;
  };

  const recordCounterSale = async (
    saleItems: { shopInventoryItemId: string; quantity: number }[],
    paymentMethod: 'Cash' | 'UPI' | 'Card' = 'Cash'
  ) => {
    const updated = await inventoryService.recordCounterSale(saleItems, paymentMethod);
    await refreshProducts();
    return updated;
  };

  const getCounterSaleRecords = async () => {
    return inventoryService.getCounterSaleRecords();
  };

  const getStockMovements = async (filterType?: string, searchQuery?: string) => {
    return inventoryService.getStockMovements(filterType, searchQuery);
  };

  const getPendingStockAudits = async () => {
    return inventoryService.getPendingStockAudits();
  };

  const recordStockReceipt = async (params: {
    supplierId: string;
    items: {
      shopInventoryItemId: string;
      quantityReceived: number;
      purchaseCost?: number;
    }[];
    notes?: string;
  }) => {
    const receipt = await inventoryService.recordStockReceipt(params);
    await refreshProducts();
    return receipt;
  };

  const getStockReceipts = async (
    filterRange?: 'all' | 'today' | 'week' | 'month',
    searchQuery?: string
  ) => {
    return inventoryService.getStockReceipts(filterRange, searchQuery);
  };

  const getStockReceiptById = async (id: string) => {
    return inventoryService.getStockReceiptById(id);
  };

  const recordCustomerReturn = async (params: {
    orderId: string;
    itemsToReturn: {
      productId: string;
      quantityReturning: number;
      disposition: import('../types/return').InventoryDisposition;
    }[];
    reason: import('../types/return').ReturnReason | string;
    notes?: string;
  }) => {
    const res = await returnService.recordCustomerReturn(params);
    await refreshProducts();
    return res;
  };

  const getReturns = async (
    filterStatus?: 'all' | 'pending' | 'refunded' | 'partial' | 'full',
    searchQuery?: string
  ) => {
    return returnService.getReturns(filterStatus, searchQuery);
  };

  const getReturnById = async (id: string) => {
    return returnService.getReturnById(id);
  };

  const getReturnsForOrder = async (orderId: string) => {
    return returnService.getReturnsForOrder(orderId);
  };

  const updateShopInventoryItem = async (
    id: string,
    updates: Partial<Omit<ShopInventoryItem, 'id' | 'catalogProductId' | 'catalogProduct'>>
  ) => {
    const updated = await inventoryService.updateShopInventoryItem(id, updates);
    await refreshProducts();
    return updated;
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        shopInventory,
        catalogProducts,
        importHistory,
        loading,
        lastStockUpdateTimestamp,
        refreshProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        recordOfflineStockUpdate,
        updateAvailability,
        updateShopInventoryItem,
        getCatalogProductById,
        createCatalogProduct,
        updateCatalogProduct,
        deactivateCatalogProduct,
        searchCatalog,
        findProductByBarcode,
        findShopInventoryItemByBarcode,
        addCatalogProductToShop,
        parseExcelOrCsv,
        validateAndMatchRows,
        executeImport,
        refreshImportHistory,
        adjustStock,
        recordCounterSale,
        getCounterSaleRecords,
        getStockMovements,
        getPendingStockAudits,
        recordStockReceipt,
        getStockReceipts,
        getStockReceiptById,
        recordCustomerReturn,
        getReturns,
        getReturnById,
        getReturnsForOrder,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
