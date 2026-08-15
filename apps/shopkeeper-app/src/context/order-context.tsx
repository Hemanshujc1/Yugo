import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types/order';
import { orderService } from '../services/order-service';

export interface OrderContextType {
  orders: Order[];
  loading: boolean;
  refreshOrders: () => Promise<void>;
  getOrderById: (id: string) => Order | undefined;
  updateOrderStatus: (id: string, newStatus: OrderStatus, reason?: string) => Promise<Order>;
  acceptOrder: (id: string) => Promise<Order>;
  rejectOrder: (id: string, reason?: string) => Promise<Order>;
  markOrderReady: (id: string) => Promise<Order>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export interface OrderProviderProps {
  children: React.ReactNode;
}

export function OrderProvider({ children }: OrderProviderProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const initLoad = async () => {
      if (isMounted) {
        await refreshOrders();
      }
    };
    setTimeout(() => {
      initLoad();
    }, 0);
    return () => {
      isMounted = false;
    };
  }, []);

  const getOrderById = (id: string): Order | undefined => {
    return orders.find((o) => o.id === id || o.orderNumber === id);
  };

  const updateOrderStatus = async (id: string, newStatus: OrderStatus, reason?: string) => {
    const updated = await orderService.updateOrderStatus(id, newStatus, reason);
    await refreshOrders();
    return updated;
  };

  const acceptOrder = async (id: string) => {
    const updated = await orderService.acceptOrder(id);
    await refreshOrders();
    return updated;
  };

  const rejectOrder = async (id: string, reason?: string) => {
    const updated = await orderService.rejectOrder(id, reason);
    await refreshOrders();
    return updated;
  };

  const markOrderReady = async (id: string) => {
    const updated = await orderService.markOrderReady(id);
    await refreshOrders();
    return updated;
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        refreshOrders,
        getOrderById,
        updateOrderStatus,
        acceptOrder,
        rejectOrder,
        markOrderReady,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders(): OrderContextType {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
