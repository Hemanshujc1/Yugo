import { storageService } from './storage-service';
import { orderService } from './order-service';
import { inventoryService } from './inventory-service';
import { supplierService } from './supplier-service';
import { returnService } from './return-service';
import { customerService } from './customer-service';
import { notificationService } from './notification-service';
import { shopSettingsService } from './shop-settings-service';

let isHydrated = false;

export const initService = {
  /**
   * Hydrates all domain services from local storage on app startup.
   * If local storage is empty, domain services save their initial mock data.
   */
  async hydrateAll(): Promise<void> {
    if (isHydrated) return;

    try {
      await Promise.all([
        orderService.init(),
        inventoryService.init(),
        supplierService.init(),
        returnService.init(),
        customerService.init(),
        notificationService.init(),
        shopSettingsService.init(),
      ]);

      await storageService.markInitialized();
      isHydrated = true;
    } catch (err) {
      console.error('[InitService] Error during app data hydration:', err);
    }
  },

  /**
   * Reset Demo Data action:
   * Clears all local storage keys, resets all domain service memory states
   * back to initial mock datasets, and re-persists them.
   */
  async resetDemoData(): Promise<void> {
    await storageService.clearAllData();
    isHydrated = false;
    await this.hydrateAll();
  },

  isAppHydrated(): boolean {
    return isHydrated;
  },
};
