import { Order, OrderStatus } from '../types/order';
import { deliveryService } from './delivery-service';

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
        quantity: 2,
        unitPrice: 320,
        finalPrice: 640,
      },
      {
        productId: 'prod-4',
        productName: 'Sparkling Water (1L)',
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
    createdAt: '2026-08-15T09:40:00Z',
    estimatedDeliveryTime: '25 mins',
    deliveryType: 'Delivery',
    deliveryDetails: {
      fulfillmentMethod: 'yugo_partner',
      status: 'pending_assignment',
    },
    timeline: [
      { status: 'new', timestamp: '9:40 AM', label: 'Order Received', completed: true },
      { status: 'preparing', timestamp: '--', label: 'Accepted & Preparing', completed: false },
      { status: 'ready_for_pickup', timestamp: '--', label: 'Ready for Pickup', completed: false },
      { status: 'out_for_delivery', timestamp: '--', label: 'Out for Delivery', completed: false },
      { status: 'delivered', timestamp: '--', label: 'Delivered', completed: false },
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
        quantity: 3,
        unitPrice: 180,
        finalPrice: 540,
      },
      {
        productId: 'prod-3',
        productName: 'Gluten-Free Bread (400g)',
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
    orderStatus: 'new',
    createdAt: '2026-08-15T09:35:00Z',
    estimatedDeliveryTime: '30 mins',
    deliveryType: 'Delivery',
    deliveryDetails: {
      fulfillmentMethod: 'yugo_partner',
      status: 'assigned',
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
      { status: 'new', timestamp: '9:35 AM', label: 'Order Received', completed: true },
      { status: 'preparing', timestamp: '--', label: 'Accepted & Preparing', completed: false },
      { status: 'ready_for_pickup', timestamp: '--', label: 'Ready for Pickup', completed: false },
      { status: 'out_for_delivery', timestamp: '--', label: 'Out for Delivery', completed: false },
      { status: 'delivered', timestamp: '--', label: 'Delivered', completed: false },
    ],
  },
  {
    id: 'ord-103',
    orderNumber: '#YGO-1046',
    customer: {
      name: 'Amit Patel',
      phone: '+91 99887 76655',
      address: 'B-104, Sunrise Towers, SG Highway',
      city: 'Ahmedabad',
    },
    items: [
      {
        productId: 'prod-2',
        productName: 'Organic Yogurt (1kg)',
        quantity: 2,
        unitPrice: 180,
        finalPrice: 360,
      },
    ],
    subtotal: 450,
    discount: 30,
    deliveryFee: 30,
    tax: 0,
    total: 450,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    orderStatus: 'preparing',
    createdAt: '2026-08-15T09:20:00Z',
    estimatedDeliveryTime: '20 mins',
    deliveryType: 'Delivery',
    deliveryDetails: {
      fulfillmentMethod: 'self_delivery',
      status: 'assigned',
      notes: 'Shopkeeper will handle local delivery directly',
    },
    timeline: [
      { status: 'new', timestamp: '9:20 AM', label: 'Order Received', completed: true },
      { status: 'preparing', timestamp: '9:22 AM', label: 'Accepted & Preparing', completed: true },
      { status: 'ready_for_pickup', timestamp: '--', label: 'Ready for Pickup', completed: false },
      { status: 'out_for_delivery', timestamp: '--', label: 'Out for Delivery', completed: false },
      { status: 'delivered', timestamp: '--', label: 'Delivered', completed: false },
    ],
  },
  {
    id: 'ord-105',
    orderNumber: '#YGO-1044',
    customer: {
      name: 'Vikram Singh',
      phone: '+91 94567 89012',
      address: 'C-3, Sector 15',
      city: 'Noida',
    },
    items: [
      {
        productId: 'prod-3',
        productName: 'Gluten-Free Bread (400g)',
        quantity: 2,
        unitPrice: 120,
        finalPrice: 240,
      },
    ],
    subtotal: 330,
    discount: 30,
    deliveryFee: 0,
    tax: 0,
    total: 320,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    orderStatus: 'ready_for_pickup',
    createdAt: '2026-08-15T08:50:00Z',
    estimatedDeliveryTime: '10 mins',
    deliveryType: 'Pickup',
    deliveryDetails: {
      fulfillmentMethod: 'customer_pickup',
      status: 'waiting_for_pickup',
      notes: 'Customer will pick up from store directly',
    },
    timeline: [
      { status: 'new', timestamp: '8:50 AM', label: 'Order Received', completed: true },
      { status: 'preparing', timestamp: '8:52 AM', label: 'Preparing', completed: true },
      { status: 'ready_for_pickup', timestamp: '9:05 AM', label: 'Ready for Pickup', completed: true },
      { status: 'out_for_delivery', timestamp: '--', label: 'Waiting for Customer Pickup', completed: false },
      { status: 'delivered', timestamp: '--', label: 'Completed', completed: false },
    ],
  },
  {
    id: 'ord-110',
    orderNumber: '#YGO-1039',
    customer: {
      name: 'Manish Mehta',
      phone: '+91 95432 10987',
      address: '22, FC Road',
      city: 'Pune',
    },
    items: [
      {
        productId: 'prod-3',
        productName: 'Gluten-Free Bread (400g)',
        quantity: 2,
        unitPrice: 120,
        finalPrice: 240,
      },
    ],
    subtotal: 330,
    discount: 50,
    deliveryFee: 30,
    tax: 0,
    total: 310,
    paymentMethod: 'COD',
    paymentStatus: 'Refunded',
    orderStatus: 'cancelled',
    cancellationReason: 'Out of stock items requested by customer',
    createdAt: '2026-08-15T06:30:00Z',
    deliveryType: 'Delivery',
    deliveryDetails: {
      fulfillmentMethod: 'yugo_partner',
      status: 'cancelled',
    },
    timeline: [
      { status: 'new', timestamp: '6:30 AM', label: 'Order Received', completed: true },
      { status: 'cancelled', timestamp: '6:35 AM', label: 'Cancelled by Shopkeeper', completed: true },
    ],
  },
];

let activeOrdersState = [...INITIAL_MOCK_ORDERS];

export const orderService = {
  async getOrders(): Promise<Order[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...activeOrdersState]), 0);
    });
  },

  async getOrderById(id: string): Promise<Order | undefined> {
    return activeOrdersState.find((o) => o.id === id || o.orderNumber === id);
  },

  async updateOrderStatus(
    id: string,
    newStatus: OrderStatus,
    reason?: string
  ): Promise<Order> {
    const orderIndex = activeOrdersState.findIndex((o) => o.id === id || o.orderNumber === id);
    if (orderIndex === -1) {
      throw new Error(`Order with ID ${id} not found.`);
    }

    const currentOrder = activeOrdersState[orderIndex];
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let updatedTimeline: typeof currentOrder.timeline;
    if (newStatus === 'cancelled') {
      const existingCompleted = currentOrder.timeline.filter(
        (event) => event.completed && event.status !== 'cancelled'
      );
      updatedTimeline = [
        ...existingCompleted,
        {
          status: 'cancelled',
          timestamp: nowStr,
          label: 'Cancelled',
          completed: true,
        },
      ];
    } else {
      updatedTimeline = currentOrder.timeline.map((event) => {
        if (event.status === newStatus) {
          return { ...event, completed: true, timestamp: nowStr };
        }
        return event;
      });
    }

    const updatedOrder: Order = {
      ...currentOrder,
      orderStatus: newStatus,
      paymentStatus: newStatus === 'delivered' ? 'Paid' : newStatus === 'cancelled' ? 'Refunded' : currentOrder.paymentStatus,
      cancellationReason: reason || currentOrder.cancellationReason,
      timeline: updatedTimeline,
    };

    activeOrdersState[orderIndex] = updatedOrder;
    return updatedOrder;
  },

  async acceptOrder(id: string): Promise<Order> {
    return this.updateOrderStatus(id, 'preparing');
  },

  async rejectOrder(id: string, reason = 'Rejected by shopkeeper'): Promise<Order> {
    return this.updateOrderStatus(id, 'cancelled', reason);
  },

  async markOrderReady(id: string): Promise<Order> {
    return this.updateOrderStatus(id, 'ready_for_pickup');
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
        name: 'Self Delivery (Shopkeeper)',
        phone: 'Store Contact',
        type: 'Self Delivery',
      },
      deliveryDetails: {
        fulfillmentMethod: 'self_delivery',
        status: 'assigned',
        notes: 'Shopkeeper will handle local delivery directly',
        assignedAt: nowStr,
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
        }),
        status: status,
        dispatchedAt: status === 'out_for_delivery' ? nowStr : updatedOrder.deliveryDetails?.dispatchedAt,
        deliveredAt: status === 'delivered' ? nowStr : updatedOrder.deliveryDetails?.deliveredAt,
      },
    };

    activeOrdersState[orderIndex] = finalOrder;
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

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (targetProvider === 'yugo_partner') {
      const updatedOrder: Order = {
        ...currentOrder,
        deliveryType: 'Delivery',
        deliveryPartner: undefined,
        deliveryDetails: {
          fulfillmentMethod: 'yugo_partner',
          status: 'pending_assignment',
          providerOverride: 'yugo_partner',
        },
      };
      activeOrdersState[orderIndex] = updatedOrder;
      return updatedOrder;
    } else {
      const updatedOrder: Order = {
        ...currentOrder,
        deliveryType: 'Delivery',
        deliveryPartner: {
          name: 'Self Delivery (Shopkeeper)',
          phone: 'Store Contact',
          type: 'Self Delivery',
        },
        deliveryDetails: {
          fulfillmentMethod: 'self_delivery',
          status: 'assigned',
          providerOverride: 'self_delivery',
          notes: 'Shopkeeper will handle local delivery directly',
          assignedAt: nowStr,
        },
      };
      activeOrdersState[orderIndex] = updatedOrder;
      return updatedOrder;
    }
  },

  async markDeliveryPickedUp(id: string): Promise<Order> {
    return this.updateDeliveryStatus(id, 'out_for_delivery');
  },
};
