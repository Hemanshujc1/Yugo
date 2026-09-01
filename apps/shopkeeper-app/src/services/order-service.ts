import { Order, OrderStatus } from '../types/order';
import { deliveryService } from './delivery-service';
import { inventoryService } from './inventory-service';
import { notificationService } from './notification-service';
import { storageService, STORAGE_KEYS } from './storage-service';
import { ShopInventoryItem } from '../types/inventory';

const INITIAL_MOCK_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: '#YGO-1048',
    customer: {
      name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      address: 'Flat 402, Green Valley Apartments, MG Road',
      city: 'Mumbai',
    },
    items: [
      {
        productId: 'prod-1',
        productName: 'Premium Coffee Beans (500g)',
        brand: 'RoastMaster',
        packSize: '500 g',
        quantity: 2,
        unitPrice: 320,
        finalPrice: 640,
      },
      {
        productId: 'prod-4',
        productName: 'Sparkling Water (1L)',
        brand: 'Bisleri',
        packSize: '1 L',
        quantity: 2,
        unitPrice: 45,
        finalPrice: 90,
      },
    ],
    subtotal: 730,
    discount: 80,
    deliveryFee: 30,
    tax: 4,
    total: 684,
    paymentMethod: 'COD',
    paymentStatus: 'Pending',
    orderStatus: 'new',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    estimatedDeliveryTime: '25 mins',
    deliveryType: 'Delivery',
    deliveryDetails: {
      fulfillmentMethod: 'yugo_partner',
      status: 'pending_assignment',
      otp: '123456',
    },
    timeline: [
      { status: 'new', timestamp: '9:40 AM', label: 'Order Received', completed: true },
      { status: 'preparing', timestamp: '--', label: 'Accepted & Preparing', completed: false },
      { status: 'ready_for_pickup', timestamp: '--', label: 'Ready for Pickup', completed: false },
      { status: 'out_for_delivery', timestamp: '--', label: 'Out for Delivery', completed: false },
      { status: 'delivered', timestamp: '--', label: 'Delivered', completed: false },
    ],
    statusHistory: [
      {
        id: 'evt-1',
        orderId: 'ord-101',
        status: 'new',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        actorType: 'Customer',
        actorName: 'Rahul Sharma',
        note: 'Order placed by customer via Yugo app',
      },
    ],
  },
  {
    id: 'ord-102',
    orderNumber: '#YGO-1049',
    customer: {
      name: 'Priya Verma',
      phone: '+91 91234 56789',
      address: 'House 12B, Sundar Nagar, Near City Mall',
      city: 'Delhi',
    },
    items: [
      {
        productId: 'prod-2',
        productName: 'Organic Yogurt (1kg)',
        brand: 'Epigamia',
        packSize: '1 kg',
        quantity: 3,
        unitPrice: 180,
        finalPrice: 540,
      },
      {
        productId: 'prod-3',
        productName: 'Gluten-Free Bread (400g)',
        brand: 'English Oven',
        packSize: '400 g',
        quantity: 2,
        unitPrice: 120,
        finalPrice: 240,
      },
    ],
    subtotal: 1100,
    discount: 100,
    deliveryFee: 40,
    tax: 200,
    total: 1240,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    orderStatus: 'accepted',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    estimatedDeliveryTime: '30 mins',
    deliveryType: 'Delivery',
    deliveryDetails: {
      fulfillmentMethod: 'yugo_partner',
      status: 'assigned',
      otp: '123456',
      partner: {
        id: 'partner-1',
        name: 'Rahul Sharma',
        phone: '+91 98765 11111',
        vehicleType: 'EV Scooter',
        rating: 4.9,
        status: 'Available',
      },
    },
    timeline: [
      { status: 'new', timestamp: '8:15 AM', label: 'Order Received', completed: true },
      { status: 'accepted', timestamp: '8:18 AM', label: 'Order Accepted', completed: true },
      { status: 'preparing', timestamp: '--', label: 'Preparing Items', completed: false },
      { status: 'ready_for_pickup', timestamp: '--', label: 'Ready for Pickup', completed: false },
      { status: 'out_for_delivery', timestamp: '--', label: 'Out for Delivery', completed: false },
      { status: 'delivered', timestamp: '--', label: 'Delivered', completed: false },
    ],
    statusHistory: [
      {
        id: 'evt-2b',
        orderId: 'ord-102',
        status: 'accepted',
        timestamp: new Date(Date.now() - 3600000 * 3.8).toISOString(),
        actorType: 'Shopkeeper',
        note: 'Order accepted by store manager',
      },
      {
        id: 'evt-2a',
        orderId: 'ord-102',
        status: 'new',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        actorType: 'Customer',
        actorName: 'Priya Verma',
        note: 'Order placed by customer via Yugo app',
      },
    ],
  },
  {
    id: 'ord-103',
    orderNumber: '#YGO-1050',
    customer: {
      name: 'Amit Patel',
      phone: '+91 99887 76655',
      address: 'Shopkeeper Pickup Counter',
      city: 'Bengaluru',
    },
    items: [
      {
        productId: 'cat-002',
        productName: 'Aashirvaad Shuddh Chakki Atta',
        brand: 'Aashirvaad',
        packSize: '5 kg',
        quantity: 1,
        unitPrice: 320,
        finalPrice: 320,
      },
    ],
    subtotal: 320,
    discount: 0,
    deliveryFee: 0,
    tax: 0,
    total: 320,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    orderStatus: 'ready_for_pickup',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    deliveryType: 'Pickup',
    deliveryDetails: {
      fulfillmentMethod: 'customer_pickup',
      status: 'waiting_for_pickup',
      otp: '123456',
    },
    timeline: [
      { status: 'new', timestamp: '10:00 AM', label: 'Order Received', completed: true },
      { status: 'accepted', timestamp: '10:02 AM', label: 'Accepted', completed: true },
      { status: 'preparing', timestamp: '10:05 AM', label: 'Preparing', completed: true },
      { status: 'ready_for_pickup', timestamp: '10:15 AM', label: 'Ready for Customer Pickup', completed: true },
      { status: 'delivered', timestamp: '--', label: 'Picked Up', completed: false },
    ],
    statusHistory: [
      {
        id: 'evt-3c',
        orderId: 'ord-103',
        status: 'ready_for_pickup',
        timestamp: new Date(Date.now() - 3600000 * 0.8).toISOString(),
        actorType: 'Shopkeeper',
        note: 'Order packed and placed at pickup counter',
      },
    ],
  },
  {
    id: 'ord-104',
    orderNumber: '#YGO-1051',
    customer: {
      name: 'Sneha Kapur',
      phone: '+91 97654 32109',
      address: 'Plot 88, Jubilee Hills',
      city: 'Hyderabad',
    },
    items: [
      {
        productId: 'cat-001',
        productName: 'Tata Salt Vacuum Evaporated',
        brand: 'Tata',
        packSize: '1 kg',
        quantity: 2,
        unitPrice: 28,
        finalPrice: 56,
      },
    ],
    subtotal: 56,
    discount: 0,
    deliveryFee: 30,
    tax: 0,
    total: 86,
    paymentMethod: 'COD',
    paymentStatus: 'Pending',
    orderStatus: 'out_for_delivery',
    inventoryDeducted: true,
    createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    deliveryType: 'Delivery',
    deliveryDetails: {
      fulfillmentMethod: 'self_delivery',
      status: 'out_for_delivery',
      assignedStaff: {
        id: 'staff-1',
        name: 'Ramesh Kumar',
        phone: '+91 98765 00011',
        role: 'Shop Delivery Staff',
      },
      otp: '123456',
    },
    timeline: [
      { status: 'new', timestamp: '11:00 AM', label: 'Order Received', completed: true },
      { status: 'accepted', timestamp: '11:05 AM', label: 'Accepted', completed: true },
      { status: 'preparing', timestamp: '11:10 AM', label: 'Preparing', completed: true },
      { status: 'ready_for_pickup', timestamp: '11:20 AM', label: 'Ready', completed: true },
      { status: 'out_for_delivery', timestamp: '11:25 AM', label: 'Dispatched with Ramesh Kumar', completed: true },
    ],
    statusHistory: [
      {
        id: 'evt-4d',
        orderId: 'ord-104',
        status: 'out_for_delivery',
        timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString(),
        actorType: 'Shopkeeper',
        note: 'Assigned shop delivery staff: Ramesh Kumar',
      },
    ],
  },
  {
    id: 'ord-105',
    orderNumber: '#YGO-1052',
    customer: {
      name: 'Vikas Rao',
      phone: '+91 98220 11223',
      address: 'Flat 104, Sunrise Heights',
      city: 'Pune',
    },
    items: [
      {
        productId: 'cat-003',
        productName: 'Fortune Sunlite Refined Sunflower Oil',
        brand: 'Fortune',
        packSize: '1 L pouch',
        quantity: 1,
        unitPrice: 145,
        finalPrice: 145,
      },
    ],
    subtotal: 145,
    discount: 10,
    deliveryFee: 30,
    tax: 0,
    total: 165,
    paymentMethod: 'COD',
    paymentStatus: 'Pending',
    orderStatus: 'delivered',
    inventoryDeducted: true,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    deliveryType: 'Delivery',
    deliveryDetails: {
      fulfillmentMethod: 'self_delivery',
      status: 'delivered',
      assignedStaff: {
        id: 'staff-1',
        name: 'Ramesh Kumar',
        phone: '+91 98765 00011',
        role: 'Shop Delivery Staff',
      },
      otp: '123456',
    },
    timeline: [
      { status: 'new', timestamp: '9:00 AM', label: 'Order Received', completed: true },
      { status: 'accepted', timestamp: '9:05 AM', label: 'Accepted', completed: true },
      { status: 'preparing', timestamp: '9:15 AM', label: 'Preparing', completed: true },
      { status: 'ready_for_pickup', timestamp: '9:30 AM', label: 'Ready', completed: true },
      { status: 'out_for_delivery', timestamp: '9:35 AM', label: 'Out for Delivery', completed: true },
      { status: 'delivered', timestamp: '9:55 AM', label: 'Delivered (COD Pending)', completed: true },
    ],
    statusHistory: [
      {
        id: 'evt-5f',
        orderId: 'ord-105',
        status: 'delivered',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        actorType: 'Shop Staff',
        actorName: 'Ramesh Kumar',
        note: 'OTP verified by shop delivery person in Delivery App',
      },
    ],
  },
];

let activeOrdersState = [...INITIAL_MOCK_ORDERS];

export function canTransition(currentStatus: OrderStatus, nextStatus: OrderStatus): boolean {
  if (currentStatus === nextStatus) return true;

  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    new: ['accepted', 'rejected', 'cancelled'],
    accepted: ['preparing', 'cancelled'],
    preparing: ['ready_for_pickup', 'cancelled'],
    ready_for_pickup: ['out_for_delivery', 'delivered', 'cancelled'],
    out_for_delivery: ['delivered', 'cancelled'],
    delivered: [],
    rejected: [],
    cancelled: [],
  };

  return validTransitions[currentStatus]?.includes(nextStatus) ?? false;
}

export const orderService = {
  async init(): Promise<Order[]> {
    const isInit = await storageService.isInitialized();
    if (isInit) {
      const stored = await storageService.getItem<Order[] | null>(STORAGE_KEYS.ORDERS, null);
      if (stored && Array.isArray(stored)) {
        activeOrdersState = stored;
        return [...activeOrdersState];
      }
    }
    // First run or missing storage: load initial mock and persist immediately
    activeOrdersState = [...INITIAL_MOCK_ORDERS];
    await storageService.setItem(STORAGE_KEYS.ORDERS, activeOrdersState);
    return [...activeOrdersState];
  },

  async persist(): Promise<void> {
    await storageService.setItem(STORAGE_KEYS.ORDERS, activeOrdersState);
  },

  async getOrders(): Promise<Order[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...activeOrdersState]), 50);
    });
  },

  async getOrderById(id: string): Promise<Order | undefined> {
    return activeOrdersState.find((o) => o.id === id || o.orderNumber === id);
  },

  async updateOrderStatus(
    id: string,
    newStatus: OrderStatus,
    reason?: string,
    actorType: import('../types/order').OrderStatusEvent['actorType'] = 'Shopkeeper',
    actorName?: string
  ): Promise<Order> {
    const orderIndex = activeOrdersState.findIndex((o) => o.id === id || o.orderNumber === id);
    if (orderIndex === -1) {
      throw new Error(`Order with ID ${id} not found.`);
    }

    const currentOrder = activeOrdersState[orderIndex];

    if (newStatus !== currentOrder.orderStatus && !canTransition(currentOrder.orderStatus, newStatus)) {
      throw new Error(
        `Invalid status transition from "${currentOrder.orderStatus.replace('_', ' ')}" to "${newStatus.replace('_', ' ')}".`
      );
    }

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowIso = new Date().toISOString();

    let updatedTimeline = currentOrder.timeline || [];
    if (newStatus === 'cancelled' || newStatus === 'rejected') {
      const existingCompleted = updatedTimeline.filter(
        (event) => event.completed && event.status !== 'cancelled' && event.status !== 'rejected'
      );
      updatedTimeline = [
        ...existingCompleted,
        {
          status: newStatus,
          timestamp: nowStr,
          label: `${newStatus === 'rejected' ? 'Rejected' : 'Cancelled'} (${reason || 'Shopkeeper'})`,
          completed: true,
        },
      ];
    } else {
      updatedTimeline = updatedTimeline.map((event) => {
        if (event.status === newStatus) {
          return { ...event, completed: true, timestamp: nowStr };
        }
        return event;
      });
    }

    const newHistoryEvent: import('../types/order').OrderStatusEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderId: currentOrder.id,
      status: newStatus,
      timestamp: nowIso,
      actorType,
      actorName: actorName || 'Shopkeeper',
      note: reason || `Order status updated to ${newStatus.replace('_', ' ')}`,
    };

    const currentHistory = currentOrder.statusHistory || [];

    let targetPaymentStatus = currentOrder.paymentStatus;
    if (newStatus === 'delivered' && currentOrder.paymentMethod !== 'COD') {
      targetPaymentStatus = 'Paid';
    } else if (newStatus === 'cancelled' || newStatus === 'rejected') {
      targetPaymentStatus = currentOrder.paymentStatus === 'Paid' ? 'Refunded' : currentOrder.paymentStatus;
    }

    const updatedOrder: Order = {
      ...currentOrder,
      orderStatus: newStatus,
      paymentStatus: targetPaymentStatus,
      rejectionReason: newStatus === 'rejected' ? reason || 'Rejected by shopkeeper' : currentOrder.rejectionReason,
      cancellationReason: newStatus === 'cancelled' ? reason || 'Cancelled by shopkeeper' : currentOrder.cancellationReason,
      timeline: updatedTimeline,
      statusHistory: [newHistoryEvent, ...currentHistory],
    };

    activeOrdersState[orderIndex] = updatedOrder;
    await this.persist();
    return updatedOrder;
  },

  async acceptOrder(id: string): Promise<Order> {
    const order = await this.getOrderById(id);
    if (!order) throw new Error(`Order not found.`);

    if (!canTransition(order.orderStatus, 'accepted')) {
      throw new Error(`Cannot accept order in status "${order.orderStatus}".`);
    }

    // 1. Validate Inventory before Acceptance
    const inventory = await inventoryService.getShopInventory();
    for (const item of order.items) {
      const shopItem = inventory.find(
        (i: ShopInventoryItem) =>
          i.catalogProductId === item.productId ||
          i.id === item.productId ||
          i.catalogProduct?.name.toLowerCase() === item.productName.toLowerCase()
      );
      if (shopItem && item.quantity > shopItem.stockQuantity) {
        throw new Error(
          `Insufficient stock for "${item.productName}". Ordered: ${item.quantity} packets, Available: ${shopItem.stockQuantity} packets.`
        );
      }
    }

    // 2. Deduct inventory stock exactly ONCE
    if (!order.inventoryDeducted) {
      await inventoryService.deductOrderStock(order);
    }

    // 3. Transition status to accepted
    const updated = await this.updateOrderStatus(id, 'accepted', 'Order accepted by store', 'Shopkeeper');
    
    const idx = activeOrdersState.findIndex((o) => o.id === id || o.orderNumber === id);
    if (idx !== -1) {
      activeOrdersState[idx] = { ...activeOrdersState[idx], inventoryDeducted: true };
    }

    try {
      await notificationService.notifyEvent({
        category: 'ORDER',
        type: 'ORDER_ACCEPTED',
        title: `Order ${order.orderNumber} Accepted`,
        message: `Order ${order.orderNumber} is accepted and ready for preparation.`,
        entityType: 'ORDER',
        entityId: order.id,
      });
    } catch {
      // Ignore notification failures
    }

    return activeOrdersState[idx] || updated;
  },

  async startPreparingOrder(id: string): Promise<Order> {
    const updated = await this.updateOrderStatus(id, 'preparing', 'Started preparing order items', 'Shopkeeper');
    return updated;
  },

  async rejectOrder(id: string, reason = 'Out of stock / Shop busy'): Promise<Order> {
    const order = await this.getOrderById(id);
    if (order && order.inventoryDeducted) {
      await inventoryService.restoreOrderStock(order);
      const idx = activeOrdersState.findIndex((o) => o.id === id || o.orderNumber === id);
      if (idx !== -1) {
        activeOrdersState[idx] = { ...activeOrdersState[idx], inventoryDeducted: false };
      }
    }

    const updated = await this.updateOrderStatus(id, 'rejected', reason, 'Shopkeeper');

    try {
      if (order) {
        await notificationService.notifyEvent({
          category: 'ORDER',
          type: 'ORDER_CANCELLED',
          title: `Order ${order.orderNumber} Rejected`,
          message: `Order ${order.orderNumber} was rejected: ${reason}`,
          entityType: 'ORDER',
          entityId: order.id,
        });
      }
    } catch {
      // Ignore notification failures
    }

    return updated;
  },

  async cancelOrder(id: string, reason: string, cancelledBy = 'Shopkeeper'): Promise<Order> {
    const order = await this.getOrderById(id);
    if (order && order.inventoryDeducted) {
      await inventoryService.restoreOrderStock(order);
      const idx = activeOrdersState.findIndex((o) => o.id === id || o.orderNumber === id);
      if (idx !== -1) {
        activeOrdersState[idx] = { ...activeOrdersState[idx], inventoryDeducted: false };
      }
    }

    const updated = await this.updateOrderStatus(id, 'cancelled', reason, 'Shopkeeper', cancelledBy);

    try {
      if (order) {
        await notificationService.notifyEvent({
          category: 'ORDER',
          type: 'ORDER_CANCELLED',
          title: `Order ${order.orderNumber} Cancelled`,
          message: `Order ${order.orderNumber} was cancelled by ${cancelledBy}: ${reason}`,
          entityType: 'ORDER',
          entityId: order.id,
        });
      }
    } catch {
      // Ignore notification failures
    }

    return updated;
  },

  async markCodCashCollected(id: string, amountCollected: number, actorName = 'Shopkeeper'): Promise<Order> {
    const idx = activeOrdersState.findIndex((o) => o.id === id || o.orderNumber === id);
    if (idx === -1) throw new Error(`Order matching ID ${id} not found.`);

    const currentOrder = activeOrdersState[idx];
    const nowIso = new Date().toISOString();

    const newHistoryEvent: import('../types/order').OrderStatusEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderId: currentOrder.id,
      status: currentOrder.orderStatus,
      timestamp: nowIso,
      actorType: 'Shopkeeper',
      actorName,
      note: `COD Cash payment of ₹${amountCollected} collected by ${actorName}`,
    };

    const updatedOrder: Order = {
      ...currentOrder,
      paymentStatus: 'Paid',
      statusHistory: [newHistoryEvent, ...(currentOrder.statusHistory || [])],
    };

    activeOrdersState[idx] = updatedOrder;
    await this.persist();

    try {
      await notificationService.notifyEvent({
        category: 'ORDER',
        type: 'PAYMENT_RECEIVED',
        title: 'COD Cash Collected',
        message: `Collected ₹${amountCollected} cash for Order ${currentOrder.orderNumber}`,
        entityType: 'ORDER',
        entityId: currentOrder.id,
      });
    } catch {
      // Ignore notification errors
    }

    return updatedOrder;
  },

  async markOrderReady(id: string): Promise<Order> {
    const order = await this.getOrderById(id);
    const updated = await this.updateOrderStatus(id, 'ready_for_pickup', 'Order packed and ready for pickup/dispatch', 'Shopkeeper');

    try {
      if (order) {
        await notificationService.notifyEvent({
          category: 'DELIVERY',
          type: 'ORDER_READY_FOR_PICKUP',
          title: `Order ${order.orderNumber} Ready`,
          message: `Order ${order.orderNumber} is ready for delivery pickup.`,
          entityType: 'ORDER',
          entityId: order.id,
        });
      }
    } catch {
      // Ignore notification failures
    }

    return updated;
  },

  async assignDeliveryPartner(id: string, partner: import('../types/order').DeliveryPartnerInfo): Promise<Order> {
    const orderIndex = activeOrdersState.findIndex((o) => o.id === id || o.orderNumber === id);
    if (orderIndex === -1) throw new Error(`Order with ID ${id} not found.`);

    const currentOrder = activeOrdersState[orderIndex];
    if (currentOrder.orderStatus === 'cancelled') {
      throw new Error('Cannot assign delivery partner to a cancelled order.');
    }

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedOrder: Order = {
      ...currentOrder,
      deliveryType: 'Delivery',
      deliveryPartner: {
        name: partner.name,
        phone: partner.phone,
        type: 'YuGo Delivery Partner',
      },
      deliveryDetails: {
        fulfillmentMethod: 'yugo_partner',
        status: 'assigned',
        partner: partner,
        assignedAt: nowStr,
        otp: currentOrder.deliveryDetails?.otp || '123456',
        notes: 'YuGo Delivery Partner assigned to order',
      },
    };

    activeOrdersState[orderIndex] = updatedOrder;
    return updatedOrder;
  },

  async simulateRiderAcceptance(id: string): Promise<Order> {
    const partner = await deliveryService.getRandomAvailablePartner();
    return this.assignDeliveryPartner(id, partner);
  },

  async setSelfDelivery(id: string): Promise<Order> {
    const orderIndex = activeOrdersState.findIndex((o) => o.id === id || o.orderNumber === id);
    if (orderIndex === -1) throw new Error(`Order with ID ${id} not found.`);

    const currentOrder = activeOrdersState[orderIndex];
    if (currentOrder.orderStatus === 'cancelled') {
      throw new Error('Cannot set self delivery on a cancelled order.');
    }

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedOrder: Order = {
      ...currentOrder,
      deliveryType: 'Delivery',
      deliveryPartner: {
        name: 'Self Delivery (Ramesh Kumar)',
        phone: '+91 98765 00011',
        type: 'Self Delivery Staff',
      },
      deliveryDetails: {
        fulfillmentMethod: 'self_delivery',
        status: 'assigned',
        assignedStaff: {
          name: 'Ramesh Kumar',
          phone: '+91 98765 00011',
          role: 'Shop Delivery Staff',
        },
        notes: 'Assigned to Shop Staff: Ramesh Kumar (+91 98765 00011)',
        assignedAt: nowStr,
        otp: currentOrder.deliveryDetails?.otp || '123456',
      },
    };

    activeOrdersState[orderIndex] = updatedOrder;
    return updatedOrder;
  },

  async updateDeliveryStatus(id: string, status: import('../types/order').DeliveryStatus): Promise<Order> {
    const orderIndex = activeOrdersState.findIndex((o) => o.id === id || o.orderNumber === id);
    if (orderIndex === -1) throw new Error(`Order with ID ${id} not found.`);

    const currentOrder = activeOrdersState[orderIndex];
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let targetOrderStatus = currentOrder.orderStatus;
    if (status === 'out_for_delivery') targetOrderStatus = 'out_for_delivery';
    if (status === 'delivered') targetOrderStatus = 'delivered';
    if (status === 'cancelled') targetOrderStatus = 'cancelled';

    const updatedOrder = await this.updateOrderStatus(id, targetOrderStatus);

    const finalOrder: Order = {
      ...updatedOrder,
      deliveryDetails: {
        ...(updatedOrder.deliveryDetails || {
          fulfillmentMethod: 'yugo_partner',
          status: status,
          otp: '123456',
        }),
        status: status,
        dispatchedAt: status === 'out_for_delivery' ? nowStr : updatedOrder.deliveryDetails?.dispatchedAt,
        deliveredAt: status === 'delivered' ? nowStr : updatedOrder.deliveryDetails?.deliveredAt,
      },
    };

    activeOrdersState[orderIndex] = updatedOrder;
    return finalOrder;
  },

  async reassignShopStaffDelivery(
    id: string,
    staffId: string,
    staffName: string,
    staffPhone: string
  ): Promise<Order> {
    const orderIndex = activeOrdersState.findIndex((o) => o.id === id || o.orderNumber === id);
    if (orderIndex === -1) throw new Error(`Order with ID ${id} not found.`);

    const currentOrder = activeOrdersState[orderIndex];
    const prevStaff = currentOrder.deliveryDetails?.assignedStaff?.name || 'Previous Staff';
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedOrder = await this.updateOrderStatus(
      id,
      'out_for_delivery',
      `Reassigned delivery from ${prevStaff} to ${staffName}`,
      'Shopkeeper'
    );

    const finalOrder: Order = {
      ...updatedOrder,
      deliveryType: 'Delivery',
      deliveryPartner: {
        name: staffName,
        phone: staffPhone,
        type: 'Shop Delivery Staff',
      },
      deliveryDetails: {
        ...(updatedOrder.deliveryDetails || {
          fulfillmentMethod: 'self_delivery',
          status: 'out_for_delivery',
        }),
        fulfillmentMethod: 'self_delivery',
        status: 'out_for_delivery',
        assignedStaff: {
          id: staffId,
          name: staffName,
          phone: staffPhone,
          role: 'Shop Delivery Staff',
        },
        dispatchedAt: nowStr,
        notes: `Reassigned delivery to ${staffName} (${staffPhone})`,
      },
    };

    activeOrdersState[orderIndex] = finalOrder;

    try {
      await notificationService.notifyEvent({
        category: 'DELIVERY',
        type: 'RIDER_ASSIGNED',
        title: `Delivery Reassigned`,
        message: `Order ${currentOrder.orderNumber} reassigned to ${staffName}`,
        entityType: 'ORDER',
        entityId: currentOrder.id,
      });
    } catch {
      // Ignore notification errors
    }

    return finalOrder;
  },

  async reportDeliveryIssue(
    id: string,
    issueType: import('../types/order').DeliveryIssueType,
    note?: string
  ): Promise<Order> {
    const orderIndex = activeOrdersState.findIndex((o) => o.id === id || o.orderNumber === id);
    if (orderIndex === -1) throw new Error(`Order with ID ${id} not found.`);

    const currentOrder = activeOrdersState[orderIndex];
    const issueReport: import('../types/order').DeliveryIssueReport = {
      id: `issue-${Date.now()}`,
      orderId: currentOrder.id,
      issueType,
      note: note ? note.trim() : undefined,
      reportedAt: new Date().toISOString(),
      reportedBy: 'Shopkeeper',
    };

    const updatedOrder = await this.updateOrderStatus(
      id,
      currentOrder.orderStatus,
      `Delivery issue reported: ${issueType.replace('_', ' ')} ${note ? `- ${note}` : ''}`,
      'Shopkeeper'
    );

    const finalOrder: Order = {
      ...updatedOrder,
      deliveryDetails: {
        ...(updatedOrder.deliveryDetails || {
          fulfillmentMethod: 'self_delivery',
          status: 'out_for_delivery',
        }),
        issueReport,
        notes: `Issue: ${issueType.replace('_', ' ')}${note ? ` (${note})` : ''}`,
      },
    };

    activeOrdersState[orderIndex] = finalOrder;
    await this.persist();

    try {
      await notificationService.notifyEvent({
        category: 'DELIVERY',
        type: 'DELIVERY_COMPLETED',
        title: `Delivery Issue Reported`,
        message: `Order ${currentOrder.orderNumber}: ${issueType.replace('_', ' ')}`,
        entityType: 'ORDER',
        entityId: currentOrder.id,
        priority: 'HIGH',
      });
    } catch {
      // Ignore notification errors
    }

    return finalOrder;
  },

  async overrideOrderDeliveryProvider(
    id: string,
    targetProvider: 'self_delivery' | 'yugo_partner'
  ): Promise<Order> {
    const orderIndex = activeOrdersState.findIndex((o) => o.id === id || o.orderNumber === id);
    if (orderIndex === -1) throw new Error(`Order with ID ${id} not found.`);

    const currentOrder = activeOrdersState[orderIndex];

    const isLocked =
      currentOrder.orderStatus === 'cancelled' ||
      currentOrder.orderStatus === 'out_for_delivery' ||
      currentOrder.orderStatus === 'delivered' ||
      currentOrder.deliveryDetails?.status === 'assigned' ||
      currentOrder.deliveryDetails?.status === 'out_for_delivery' ||
      currentOrder.deliveryDetails?.status === 'delivered';

    if (isLocked) {
      return currentOrder;
    }

    if (targetProvider === 'yugo_partner') {
      const updatedOrder: Order = {
        ...currentOrder,
        deliveryType: 'Delivery',
        deliveryPartner: undefined,
        deliveryDetails: {
          fulfillmentMethod: 'yugo_partner',
          status: 'pending_assignment',
          providerOverride: 'yugo_partner',
          otp: currentOrder.deliveryDetails?.otp || '123456',
        },
      };
      activeOrdersState[orderIndex] = updatedOrder;
      await this.persist();
      return updatedOrder;
    } else {
      const updatedOrder: Order = {
        ...currentOrder,
        deliveryType: 'Delivery',
        deliveryPartner: {
          name: 'Self Delivery (Ramesh Kumar)',
          phone: '+91 98765 00011',
          type: 'Self Delivery Staff',
        },
        deliveryDetails: {
          fulfillmentMethod: 'self_delivery',
          status: 'assigned',
          providerOverride: 'self_delivery',
          assignedStaff: {
            name: 'Ramesh Kumar',
            phone: '+91 98765 00011',
            role: 'Shop Delivery Staff',
          },
          notes: 'Assigned to Shop Staff: Ramesh Kumar (+91 98765 00011)',
          otp: currentOrder.deliveryDetails?.otp || '123456',
        },
      };
      activeOrdersState[orderIndex] = updatedOrder;
      await this.persist();
      return updatedOrder;
    }
  },

  async markDeliveryPickedUp(id: string): Promise<Order> {
    return this.updateDeliveryStatus(id, 'out_for_delivery');
  },

  async verifyCustomerPickupOtp(
    id: string,
    otpInput: string
  ): Promise<{ success: boolean; message?: string; order?: Order }> {
    const orderIndex = activeOrdersState.findIndex((o) => o.id === id || o.orderNumber === id);
    if (orderIndex === -1) {
      return { success: false, message: `Order matching ID "${id}" not found.` };
    }

    const currentOrder = activeOrdersState[orderIndex];
    const expectedOtp = currentOrder.deliveryDetails?.otp || '123456';

    if (otpInput.trim() !== expectedOtp.trim()) {
      return {
        success: false,
        message: 'Invalid OTP. Please check with the customer and try again.',
      };
    }

    const updatedOrder = await this.updateDeliveryStatus(id, 'delivered');
    return { success: true, order: updatedOrder };
  },

  async simulateDeliveryCompletion(
    id: string,
    actor: 'yugo_rider' | 'shop_staff'
  ): Promise<Order> {
    const orderIndex = activeOrdersState.findIndex((o) => o.id === id || o.orderNumber === id);
    if (orderIndex === -1) throw new Error(`Order with ID ${id} not found.`);

    const currentOrder = activeOrdersState[orderIndex];
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const note =
      actor === 'yugo_rider'
        ? 'OTP verified by YuGo delivery partner in Delivery App'
        : 'OTP verified by shop delivery person in Delivery App';

    const updatedOrder = await this.updateOrderStatus(id, 'delivered', note, actor === 'yugo_rider' ? 'Yugo Delivery Person' : 'Shop Staff');
    const finalOrder: Order = {
      ...updatedOrder,
      deliveryDetails: {
        ...(updatedOrder.deliveryDetails || {
          fulfillmentMethod: currentOrder.deliveryDetails?.fulfillmentMethod || 'yugo_partner',
          status: 'delivered',
        }),
        status: 'delivered',
        deliveredAt: nowStr,
        notes: note,
      },
    };

    activeOrdersState[orderIndex] = finalOrder;
    return finalOrder;
  },

  async updateOrderReturnState(
    id: string,
    updates: {
      returnStatus: 'Not_Returned' | 'Partially_Returned' | 'Fully_Returned';
      totalRefundedAmount: number;
      returnedItemQuantities: Record<string, number>;
      paymentStatus?: import('../types/order').PaymentStatus;
    }
  ): Promise<Order> {
    const idx = activeOrdersState.findIndex((o) => o.id === id || o.orderNumber === id);
    if (idx === -1) throw new Error(`Order with ID ${id} not found.`);

    const current = activeOrdersState[idx];
    const updated: Order = {
      ...current,
      returnStatus: updates.returnStatus,
      totalRefundedAmount: updates.totalRefundedAmount,
      returnedItemQuantities: updates.returnedItemQuantities,
      paymentStatus: updates.paymentStatus || current.paymentStatus,
    };

    activeOrdersState[idx] = updated;
    return updated;
  },
};
