import { Order, OrderStatus } from '../types/order';

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
      {
        productId: 'prod-1',
        productName: 'Premium Coffee Beans (500g)',
        quantity: 1,
        unitPrice: 320,
        finalPrice: 320,
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
      {
        productId: 'prod-4',
        productName: 'Sparkling Water (1L)',
        quantity: 2,
        unitPrice: 45,
        finalPrice: 90,
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
    timeline: [
      { status: 'new', timestamp: '9:20 AM', label: 'Order Received', completed: true },
      { status: 'preparing', timestamp: '9:22 AM', label: 'Accepted & Preparing', completed: true },
      { status: 'ready_for_pickup', timestamp: '--', label: 'Ready for Pickup', completed: false },
      { status: 'out_for_delivery', timestamp: '--', label: 'Out for Delivery', completed: false },
      { status: 'delivered', timestamp: '--', label: 'Delivered', completed: false },
    ],
  },
  {
    id: 'ord-104',
    orderNumber: '#YGO-1047',
    customer: {
      name: 'Sneha Gupta',
      phone: '+91 97654 32109',
      address: 'Plot 45, Jubilee Hills',
      city: 'Hyderabad',
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
        productId: 'prod-3',
        productName: 'Gluten-Free Bread (400g)',
        quantity: 2,
        unitPrice: 120,
        finalPrice: 240,
      },
    ],
    subtotal: 880,
    discount: 40,
    deliveryFee: 50,
    tax: 0,
    total: 890,
    paymentMethod: 'Card',
    paymentStatus: 'Paid',
    orderStatus: 'preparing',
    createdAt: '2026-08-15T09:15:00Z',
    estimatedDeliveryTime: '15 mins',
    deliveryType: 'Delivery',
    timeline: [
      { status: 'new', timestamp: '9:15 AM', label: 'Order Received', completed: true },
      { status: 'preparing', timestamp: '9:18 AM', label: 'Accepted & Preparing', completed: true },
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
      {
        productId: 'prod-4',
        productName: 'Sparkling Water (1L)',
        quantity: 2,
        unitPrice: 45,
        finalPrice: 90,
      },
    ],
    subtotal: 330,
    discount: 30,
    deliveryFee: 20,
    tax: 0,
    total: 320,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    orderStatus: 'ready_for_pickup',
    createdAt: '2026-08-15T08:50:00Z',
    estimatedDeliveryTime: '10 mins',
    deliveryType: 'Pickup',
    deliveryPartner: {
      name: 'Self Pickup',
      phone: '+91 94567 89012',
      type: 'Customer Pickup',
    },
    timeline: [
      { status: 'new', timestamp: '8:50 AM', label: 'Order Received', completed: true },
      { status: 'preparing', timestamp: '8:52 AM', label: 'Preparing', completed: true },
      { status: 'ready_for_pickup', timestamp: '9:05 AM', label: 'Ready for Pickup', completed: true },
      { status: 'out_for_delivery', timestamp: '--', label: 'Out for Delivery', completed: false },
      { status: 'delivered', timestamp: '--', label: 'Completed', completed: false },
    ],
  },
  {
    id: 'ord-106',
    orderNumber: '#YGO-1045',
    customer: {
      name: 'Neha Kapoor',
      phone: '+91 93456 78901',
      address: 'Apt 12, Koramangala 4th Block',
      city: 'Bengaluru',
    },
    items: [
      {
        productId: 'prod-1',
        productName: 'Premium Coffee Beans (500g)',
        quantity: 3,
        unitPrice: 320,
        finalPrice: 960,
      },
      {
        productId: 'prod-2',
        productName: 'Organic Yogurt (1kg)',
        quantity: 1,
        unitPrice: 180,
        finalPrice: 180,
      },
    ],
    subtotal: 1140,
    discount: 40,
    deliveryFee: 50,
    tax: 0,
    total: 1150,
    paymentMethod: 'Card',
    paymentStatus: 'Paid',
    orderStatus: 'ready_for_pickup',
    createdAt: '2026-08-15T08:45:00Z',
    estimatedDeliveryTime: '15 mins',
    deliveryType: 'Delivery',
    deliveryPartner: {
      name: 'Yugo Express Rider',
      phone: '+91 98888 11111',
      type: 'Yugo Fleet',
    },
    timeline: [
      { status: 'new', timestamp: '8:45 AM', label: 'Order Received', completed: true },
      { status: 'preparing', timestamp: '8:48 AM', label: 'Preparing', completed: true },
      { status: 'ready_for_pickup', timestamp: '9:02 AM', label: 'Ready for Pickup', completed: true },
      { status: 'out_for_delivery', timestamp: '--', label: 'Out for Delivery', completed: false },
      { status: 'delivered', timestamp: '--', label: 'Delivered', completed: false },
    ],
  },
  {
    id: 'ord-107',
    orderNumber: '#YGO-1042',
    customer: {
      name: 'Rajesh Iyer',
      phone: '+91 92345 67890',
      address: 'Flat 501, Adyar Park',
      city: 'Chennai',
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
        productId: 'prod-3',
        productName: 'Gluten-Free Bread (400g)',
        quantity: 1,
        unitPrice: 120,
        finalPrice: 120,
      },
    ],
    subtotal: 760,
    discount: 40,
    deliveryFee: 40,
    tax: 0,
    total: 760,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    orderStatus: 'out_for_delivery',
    createdAt: '2026-08-15T08:15:00Z',
    estimatedDeliveryTime: '5 mins',
    deliveryType: 'Delivery',
    deliveryPartner: {
      name: 'Karan Kumar',
      phone: '+91 98765 00000',
      type: 'Yugo Express Rider',
    },
    timeline: [
      { status: 'new', timestamp: '8:15 AM', label: 'Order Received', completed: true },
      { status: 'preparing', timestamp: '8:18 AM', label: 'Preparing', completed: true },
      { status: 'ready_for_pickup', timestamp: '8:30 AM', label: 'Ready for Pickup', completed: true },
      { status: 'out_for_delivery', timestamp: '8:35 AM', label: 'Out for Delivery', completed: true },
      { status: 'delivered', timestamp: '--', label: 'Delivered', completed: false },
    ],
  },
  {
    id: 'ord-108',
    orderNumber: '#YGO-1040',
    customer: {
      name: 'Suresh Nair',
      phone: '+91 90123 45678',
      address: '14/A, Marine Drive',
      city: 'Kochi',
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
        productId: 'prod-2',
        productName: 'Organic Yogurt (1kg)',
        quantity: 2,
        unitPrice: 180,
        finalPrice: 360,
      },
    ],
    subtotal: 1000,
    discount: 120,
    deliveryFee: 40,
    tax: 0,
    total: 920,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    orderStatus: 'delivered',
    createdAt: '2026-08-15T07:30:00Z',
    deliveryType: 'Delivery',
    deliveryPartner: {
      name: 'Mahesh Babu',
      phone: '+91 98111 22233',
      type: 'Yugo Express Rider',
    },
    timeline: [
      { status: 'new', timestamp: '7:30 AM', label: 'Order Received', completed: true },
      { status: 'preparing', timestamp: '7:35 AM', label: 'Preparing', completed: true },
      { status: 'ready_for_pickup', timestamp: '7:48 AM', label: 'Ready for Pickup', completed: true },
      { status: 'out_for_delivery', timestamp: '7:52 AM', label: 'Out for Delivery', completed: true },
      { status: 'delivered', timestamp: '8:15 AM', label: 'Delivered', completed: true },
    ],
  },
  {
    id: 'ord-109',
    orderNumber: '#YGO-1041',
    customer: {
      name: 'Kavita Joshi',
      phone: '+91 96789 01234',
      address: 'Villa 8, DLF Phase 5',
      city: 'Gurugram',
    },
    items: [
      {
        productId: 'prod-1',
        productName: 'Premium Coffee Beans (500g)',
        quantity: 4,
        unitPrice: 320,
        finalPrice: 1280,
      },
      {
        productId: 'prod-3',
        productName: 'Gluten-Free Bread (400g)',
        quantity: 2,
        unitPrice: 120,
        finalPrice: 240,
      },
    ],
    subtotal: 1520,
    discount: 90,
    deliveryFee: 50,
    tax: 0,
    total: 1480,
    paymentMethod: 'Card',
    paymentStatus: 'Paid',
    orderStatus: 'delivered',
    createdAt: '2026-08-15T07:00:00Z',
    deliveryType: 'Delivery',
    timeline: [
      { status: 'new', timestamp: '7:00 AM', label: 'Order Received', completed: true },
      { status: 'preparing', timestamp: '7:04 AM', label: 'Preparing', completed: true },
      { status: 'ready_for_pickup', timestamp: '7:18 AM', label: 'Ready for Pickup', completed: true },
      { status: 'out_for_delivery', timestamp: '7:22 AM', label: 'Out for Delivery', completed: true },
      { status: 'delivered', timestamp: '7:42 AM', label: 'Delivered', completed: true },
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
      {
        productId: 'prod-4',
        productName: 'Sparkling Water (1L)',
        quantity: 2,
        unitPrice: 45,
        finalPrice: 90,
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
};
