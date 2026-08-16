import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Order,
  OrderStatus,
  DeliveryPartnerInfo,
  DeliveryStatus,
  ShopkeeperDeliveryConfig,
} from '../types/order';
import { orderService } from '../services/order-service';
import { deliveryService } from '../services/delivery-service';

export interface OrderContextType {
  orders: Order[];
  loading: boolean;
  deliveryConfig: ShopkeeperDeliveryConfig;
  activeSelfDeliveryCount: number;
  refreshOrders: () => Promise<void>;
  updateDeliveryConfig: (config: Partial<ShopkeeperDeliveryConfig>) => Promise<ShopkeeperDeliveryConfig>;
  getOrderById: (id: string) => Order | undefined;
  updateOrderStatus: (id: string, newStatus: OrderStatus, reason?: string) => Promise<Order>;
  acceptOrder: (id: string) => Promise<Order>;
  rejectOrder: (id: string, reason?: string) => Promise<Order>;
  markOrderReady: (id: string) => Promise<Order>;
  assignDeliveryPartner: (id: string, partner: DeliveryPartnerInfo) => Promise<Order>;
  simulateRiderAcceptance: (id: string) => Promise<Order>;
  setSelfDelivery: (id: string) => Promise<Order>;
  updateDeliveryStatus: (id: string, status: DeliveryStatus) => Promise<Order>;
  overrideOrderDeliveryProvider: (
    id: string,
    targetProvider: 'self_delivery' | 'yugo_partner'
  ) => Promise<Order>;
  markDeliveryPickedUp: (id: string) => Promise<Order>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export interface OrderProviderProps {
  children: React.ReactNode;
}

export function OrderProvider({ children }: OrderProviderProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [deliveryConfig, setDeliveryConfig] = useState<ShopkeeperDeliveryConfig>({
    deliveryMode: 'self_delivery',
    smartDeliveryThreshold: 3,
  });

  const activeSelfDeliveryCount = orders.filter((o) => {
    const isSelf = o.deliveryDetails?.fulfillmentMethod === 'self_delivery';
    const isActive =
      o.orderStatus === 'new' ||
      o.orderStatus === 'preparing' ||
      o.orderStatus === 'ready_for_pickup' ||
      o.orderStatus === 'out_for_delivery';
    return isSelf && isActive;
  }).length;

  const refreshOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrders();
      const cfg = await deliveryService.getDeliveryConfig();
      setDeliveryConfig(cfg);
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders or delivery config:', error);
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

  const updateDeliveryConfig = async (config: Partial<ShopkeeperDeliveryConfig>) => {
    const updated = await deliveryService.updateDeliveryConfig(config);
    setDeliveryConfig(updated);
    return updated;
  };

  const getOrderById = (id: string): Order | undefined => {
    return orders.find((o) => o.id === id || o.orderNumber === id);
  };

  const updateOrderStatus = async (id: string, newStatus: OrderStatus, reason?: string) => {
    const updated = await orderService.updateOrderStatus(id, newStatus, reason);
    await refreshOrders();
    return updated;
  };

  const acceptOrder = async (id: string) => {
    const targetOrder = orders.find((o) => o.id === id || o.orderNumber === id);
    let updated = await orderService.acceptOrder(id);

    // Apply delivery configuration decision if fulfillment method is not yet assigned
    if (targetOrder && targetOrder.deliveryType === 'Delivery') {
      const provider = deliveryService.determineDeliveryProvider(
        'Delivery',
        deliveryConfig,
        activeSelfDeliveryCount,
        targetOrder
      );
      if (provider === 'self_delivery') {
        updated = await orderService.setSelfDelivery(id);
      } else if (provider === 'yugo_partner') {
        updated = await orderService.updateDeliveryStatus(id, 'pending_assignment');
      }
    } else if (targetOrder && targetOrder.deliveryType === 'Pickup') {
      updated = await orderService.updateDeliveryStatus(id, 'waiting_for_pickup');
    }

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

  const assignDeliveryPartner = async (id: string, partner: DeliveryPartnerInfo) => {
    const updated = await orderService.assignDeliveryPartner(id, partner);
    await refreshOrders();
    return updated;
  };

  const simulateRiderAcceptance = async (id: string) => {
    const updated = await orderService.simulateRiderAcceptance(id);
    await refreshOrders();
    return updated;
  };

  const setSelfDelivery = async (id: string) => {
    const updated = await orderService.setSelfDelivery(id);
    await refreshOrders();
    return updated;
  };

  const updateDeliveryStatus = async (id: string, status: DeliveryStatus) => {
    const updated = await orderService.updateDeliveryStatus(id, status);
    await refreshOrders();
    return updated;
  };

  const overrideOrderDeliveryProvider = async (
    id: string,
    targetProvider: 'self_delivery' | 'yugo_partner'
  ) => {
    const updated = await orderService.overrideOrderDeliveryProvider(id, targetProvider);
    await refreshOrders();
    return updated;
  };

  const markDeliveryPickedUp = async (id: string) => {
    const updated = await orderService.markDeliveryPickedUp(id);
    await refreshOrders();
    return updated;
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        deliveryConfig,
        activeSelfDeliveryCount,
        refreshOrders,
        updateDeliveryConfig,
        getOrderById,
        updateOrderStatus,
        acceptOrder,
        rejectOrder,
        markOrderReady,
        assignDeliveryPartner,
        simulateRiderAcceptance,
        setSelfDelivery,
        updateDeliveryStatus,
        overrideOrderDeliveryProvider,
        markDeliveryPickedUp,
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
