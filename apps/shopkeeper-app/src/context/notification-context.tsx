import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppNotification, NotificationPreferences } from '../types/notification';
import { notificationService } from '../services/notification-service';

export interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotification: (id: string) => Promise<void>;
  updatePreferences: (newPrefs: NotificationPreferences) => Promise<void>;
  notifyEvent: (event: {
    category: AppNotification['category'];
    type: string;
    title: string;
    message: string;
    priority?: AppNotification['priority'];
    entityType?: AppNotification['entityType'];
    entityId?: AppNotification['entityId'];
    stateKey?: string;
  }) => Promise<AppNotification | null>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    orders: { newOrders: true, orderCancellations: true, deliveryUpdates: true },
    inventory: { lowStock: true, outOfStock: true, stockAudits: true },
    system: { shopAlerts: true },
  });
  const [loading, setLoading] = useState<boolean>(false);

  const refreshNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      const count = await notificationService.getUnreadCount();
      const prefs = await notificationService.getPreferences();
      setNotifications(data);
      setUnreadCount(count);
      setPreferences(prefs);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    notificationService
      .getNotifications()
      .then((data) => {
        if (isMounted) {
          setNotifications(data);
          setUnreadCount(data.filter((n) => !n.isRead).length);
        }
      })
      .catch((err) => console.error('Failed to load notifications:', err));

    notificationService
      .getPreferences()
      .then((prefs) => {
        if (isMounted) setPreferences(prefs);
      })
      .catch((err) => console.error('Failed to load preferences:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  const markAsRead = async (id: string) => {
    const updated = await notificationService.markAsRead(id);
    setNotifications(updated);
    setUnreadCount(updated.filter((n) => !n.isRead).length);
  };

  const markAllAsRead = async () => {
    const updated = await notificationService.markAllAsRead();
    setNotifications(updated);
    setUnreadCount(0);
  };

  const clearNotification = async (id: string) => {
    const updated = await notificationService.clearNotification(id);
    setNotifications(updated);
    setUnreadCount(updated.filter((n) => !n.isRead).length);
  };

  const updatePreferences = async (newPrefs: NotificationPreferences) => {
    const updated = await notificationService.updatePreferences(newPrefs);
    setPreferences(updated);
  };

  const notifyEvent = async (event: Parameters<NotificationContextType['notifyEvent']>[0]) => {
    const created = await notificationService.notifyEvent(event);
    if (created) {
      await refreshNotifications();
    }
    return created;
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        preferences,
        loading,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        clearNotification,
        updatePreferences,
        notifyEvent,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
