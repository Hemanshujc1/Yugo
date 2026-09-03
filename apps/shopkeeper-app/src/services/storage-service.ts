import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_VERSION = 1;

export const STORAGE_KEYS = {
  META: `@yugo_shopkeeper_meta_v${STORAGE_VERSION}`,
  ORDERS: `@yugo_shopkeeper_orders_v${STORAGE_VERSION}`,
  INVENTORY: `@yugo_shopkeeper_inventory_v${STORAGE_VERSION}`,
  CATALOG: `@yugo_shopkeeper_catalog_v${STORAGE_VERSION}`,
  SUPPLIERS: `@yugo_shopkeeper_suppliers_v${STORAGE_VERSION}`,
  STOCK_RECEIPTS: `@yugo_shopkeeper_stock_receipts_v${STORAGE_VERSION}`,
  RETURNS: `@yugo_shopkeeper_returns_v${STORAGE_VERSION}`,
  COUNTER_SALES: `@yugo_shopkeeper_counter_sales_v${STORAGE_VERSION}`,
  STOCK_MOVEMENTS: `@yugo_shopkeeper_stock_movements_v${STORAGE_VERSION}`,
  CUSTOMERS: `@yugo_shopkeeper_customers_v${STORAGE_VERSION}`,
  NOTIFICATIONS: `@yugo_shopkeeper_notifications_v${STORAGE_VERSION}`,
  SHOP_SETTINGS: `@yugo_shopkeeper_shop_settings_v${STORAGE_VERSION}`,
  DELIVERY_STAFF: `@yugo_shopkeeper_delivery_staff_v${STORAGE_VERSION}`,
} as const;

export interface StorageMetadata {
  version: number;
  initializedAt: string;
  lastUpdated: string;
}

export const storageService = {
  /**
   * Safely retrieve and parse a JSON item from local storage.
   * Returns fallback value if key does not exist or if JSON parsing fails.
   */
  async getItem<T>(key: string, fallback: T): Promise<T> {
    try {
      const json = await AsyncStorage.getItem(key);
      if (json === null || json === undefined) {
        return fallback;
      }
      return JSON.parse(json) as T;
    } catch (err) {
      console.warn(`[StorageService] Failed to read key "${key}", using fallback:`, err);
      return fallback;
    }
  },

  /**
   * Safely serialize and store an item in local storage.
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const json = JSON.stringify(value);
      await AsyncStorage.setItem(key, json);
    } catch (err) {
      console.error(`[StorageService] Failed to save key "${key}":`, err);
    }
  },

  /**
   * Remove a specific key from local storage.
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (err) {
      console.error(`[StorageService] Failed to remove key "${key}":`, err);
    }
  },

  /**
   * Check if local storage has been initialized for this schema version.
   */
  async isInitialized(): Promise<boolean> {
    const meta = await this.getItem<StorageMetadata | null>(STORAGE_KEYS.META, null);
    return meta !== null && meta.version === STORAGE_VERSION;
  },

  /**
   * Mark storage as initialized with metadata.
   */
  async markInitialized(): Promise<void> {
    const meta: StorageMetadata = {
      version: STORAGE_VERSION,
      initializedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    await this.setItem(STORAGE_KEYS.META, meta);
  },

  /**
   * Clear all persisted Shopkeeper data (for Reset Demo Data action).
   */
  async clearAllData(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (err) {
      console.error('[StorageService] Failed to clear demo data:', err);
    }
  },
};
