import { AppNotification, NotificationPreferences } from '../types/notification';
import { storageService, STORAGE_KEYS } from './storage-service';

const INITIAL_MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_101',
    category: 'ORDER',
    type: 'NEW_ORDER',
    title: 'New order received',
    message: 'ORD-1058 • ₹486 • 4 items',
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    isRead: false,
    priority: 'HIGH',
    entityType: 'ORDER',
    entityId: 'ORD-1058',
  },
  {
    id: 'notif_102',
    category: 'INVENTORY',
    type: 'LOW_STOCK',
    title: 'Low stock alert',
    message: 'Tata Salt 1 kg has only 3 packets left in stock',
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    isRead: false,
    priority: 'NORMAL',
    entityType: 'INVENTORY_ITEM',
    entityId: 'shop-inv-cat-001',
  },
  {
    id: 'notif_103',
    category: 'DELIVERY',
    type: 'DELIVERY_COMPLETED',
    title: 'Delivery completed',
    message: 'ORD-1049 was delivered successfully to Priya Verma',
    createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    isRead: true,
    priority: 'NORMAL',
    entityType: 'ORDER',
    entityId: 'ORD-1049',
  },
  {
    id: 'notif_104',
    category: 'DELIVERY',
    type: 'RIDER_ASSIGNED',
    title: 'Yugo rider assigned',
    message: 'Rahul Kumar (Yugo Rider) assigned to pick up ORD-1053',
    createdAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    isRead: true,
    priority: 'NORMAL',
    entityType: 'ORDER',
    entityId: 'ORD-1053',
  },
  {
    id: 'notif_105',
    category: 'INVENTORY',
    type: 'STOCK_AUDIT_RECOMMENDED',
    title: 'Stock audit recommended',
    message: '4 products require stock reconciliation and audit verification',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    isRead: false,
    priority: 'NORMAL',
    entityType: 'STOCK_AUDIT',
  },
  {
    id: 'notif_106',
    category: 'INVENTORY',
    type: 'IMPORT_COMPLETED',
    title: 'Inventory import completed',
    message: '55 products added, 8 updated from Store_Inventory_Aug20.csv',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    isRead: true,
    priority: 'NORMAL',
    entityType: 'IMPORT_HISTORY',
  },
];

let activeNotifications: AppNotification[] = [...INITIAL_MOCK_NOTIFICATIONS];

let userPreferences: NotificationPreferences = {
  orders: {
    newOrders: true,
    orderCancellations: true,
    deliveryUpdates: true,
  },
  inventory: {
    lowStock: true,
    outOfStock: true,
    stockAudits: true,
  },
  system: {
    shopAlerts: true,
  },
};

// Anti-spam transition state map key -> lastNotifiedState (prevents spamming duplicate alerts)
const lastNotifiedStates = new Map<string, string>();

export const notificationService = {
  async init(): Promise<AppNotification[]> {
    const isInit = await storageService.isInitialized();
    if (isInit) {
      const stored = await storageService.getItem<AppNotification[] | null>(STORAGE_KEYS.NOTIFICATIONS, null);
      if (stored && Array.isArray(stored)) {
        activeNotifications = stored;
        return [...activeNotifications];
      }
    }
    activeNotifications = [...INITIAL_MOCK_NOTIFICATIONS];
    await storageService.setItem(STORAGE_KEYS.NOTIFICATIONS, activeNotifications);
    return [...activeNotifications];
  },

  async persist(): Promise<void> {
    await storageService.setItem(STORAGE_KEYS.NOTIFICATIONS, activeNotifications);
  },

  async getNotifications(): Promise<AppNotification[]> {
    return [...activeNotifications];
  },

  async getUnreadCount(): Promise<number> {
    return activeNotifications.filter((n) => !n.isRead).length;
  },

  async markAsRead(id: string): Promise<AppNotification[]> {
    activeNotifications = activeNotifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    await this.persist();
    return [...activeNotifications];
  },

  async markAllAsRead(): Promise<AppNotification[]> {
    activeNotifications = activeNotifications.map((n) => ({ ...n, isRead: true }));
    await this.persist();
    return [...activeNotifications];
  },

  async clearNotification(id: string): Promise<AppNotification[]> {
    activeNotifications = activeNotifications.filter((n) => n.id !== id);
    await this.persist();
    return [...activeNotifications];
  },

  async getPreferences(): Promise<NotificationPreferences> {
    return { ...userPreferences };
  },

  async updatePreferences(newPrefs: NotificationPreferences): Promise<NotificationPreferences> {
    userPreferences = { ...newPrefs };
    return { ...userPreferences };
  },

  async notifyEvent(event: {
    category: AppNotification['category'];
    type: string;
    title: string;
    message: string;
    priority?: AppNotification['priority'];
    entityType?: AppNotification['entityType'];
    entityId?: AppNotification['entityId'];
    stateKey?: string; // Optional unique key to prevent duplicate spam for identical state
  }): Promise<AppNotification | null> {
    // 1. Check user preferences
    if (event.category === 'ORDER') {
      if (event.type === 'NEW_ORDER' && !userPreferences.orders.newOrders) return null;
      if (event.type === 'ORDER_CANCELLED' && !userPreferences.orders.orderCancellations) return null;
    } else if (event.category === 'DELIVERY') {
      if (!userPreferences.orders.deliveryUpdates) return null;
    } else if (event.category === 'INVENTORY') {
      if (event.type === 'LOW_STOCK' && !userPreferences.inventory.lowStock) return null;
      if (event.type === 'OUT_OF_STOCK' && !userPreferences.inventory.outOfStock) return null;
      if (event.type === 'STOCK_AUDIT_RECOMMENDED' && !userPreferences.inventory.stockAudits) return null;
    } else if (event.category === 'SYSTEM') {
      if (!userPreferences.system.shopAlerts) return null;
    }

    // 2. Anti-spam check: prevent duplicate notification spam if state hasn't changed
    if (event.stateKey) {
      const lastState = lastNotifiedStates.get(event.stateKey);
      if (lastState === event.type) {
        return null; // Skip duplicate notification
      }
      lastNotifiedStates.set(event.stateKey, event.type);
    }

    const newNotif: AppNotification = {
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      category: event.category,
      type: event.type,
      title: event.title,
      message: event.message,
      createdAt: new Date().toISOString(),
      isRead: false,
      priority: event.priority || 'NORMAL',
      entityType: event.entityType,
      entityId: event.entityId,
    };

    activeNotifications.unshift(newNotif);
    await this.persist();
    return newNotif;
  },
};
