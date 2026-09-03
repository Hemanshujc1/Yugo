export type NotificationCategory = 'ORDER' | 'INVENTORY' | 'DELIVERY' | 'SYSTEM';
export type NotificationPriority = 'NORMAL' | 'HIGH';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  priority: NotificationPriority;
  entityType?: 'ORDER' | 'INVENTORY_ITEM' | 'STOCK_AUDIT' | 'IMPORT_HISTORY';
  entityId?: string;
}

export interface NotificationPreferences {
  orders: {
    newOrders: boolean;
    orderCancellations: boolean;
    deliveryUpdates: boolean;
  };
  inventory: {
    lowStock: boolean;
    outOfStock: boolean;
    stockAudits: boolean;
  };
  system: {
    shopAlerts: boolean;
  };
}
