import { MOCK_ORDERS } from '@/constants/mock-data';
import type { CartItem } from '@/types/cart.types';
import type { Order } from '@/types/order.types';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getOrders(): Promise<Order[]> {
  await delay(500);
  return MOCK_ORDERS;
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  await delay(500);
  return MOCK_ORDERS.find((o) => o.id === id);
}

export async function placeOrder(
  items: CartItem[],
  deliveryAddress: string,
): Promise<Order> {
  await delay(800);
  const newOrder: Order = {
    id: `ORD-${Date.now()}`,
    status: 'placed',
    shopName: 'QuickMart',
    items: items.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
    })),
    totalAmount: items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    ),
    deliveryAddress,
    createdAt: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };
  return newOrder;
}
