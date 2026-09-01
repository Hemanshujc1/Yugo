import { Customer } from '../types/customer';
import { Order } from '../types/order';
import { orderService } from './order-service';
import { financialService } from './financial-service';

function cleanPhone(phone: string): string {
  return phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
}

export const customerService = {
  async init(): Promise<void> {
    // Customers are dynamically derived from orders; ensure orderService is initialized
    await orderService.init();
  },

  async getCustomers(
    sortBy: 'recent' | 'orders' | 'spending' = 'recent',
    searchQuery = ''
  ): Promise<Customer[]> {
    const orders = await orderService.getOrders();
    const customerMap = new Map<string, { customerInfo: Order['customer']; orders: Order[] }>();

    // 1. Group orders by unique cleaned phone number
    for (const o of orders) {
      const phoneKey = cleanPhone(o.customer.phone);
      const existing = customerMap.get(phoneKey);
      if (existing) {
        existing.orders.push(o);
      } else {
        customerMap.set(phoneKey, { customerInfo: o.customer, orders: [o] });
      }
    }

    // 2. Aggregate metrics dynamically for each unique customer
    const customerList: Customer[] = [];

    customerMap.forEach(({ customerInfo, orders: custOrders }, phoneKey) => {
      // Sort orders descending by createdAt date
      custOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const validCompletedOrders = custOrders.filter((o) => o.orderStatus !== 'cancelled');
      const totalOrders = validCompletedOrders.length;

      const totalSpent = validCompletedOrders.reduce((acc, o) => {
        const fin = financialService.calculateOrderFinancials(o);
        return acc + (fin.paymentStatus === 'Paid' || o.orderStatus === 'delivered' ? fin.grossTotal : 0);
      }, 0);

      const averageOrderValue = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;
      const lastOrder = custOrders[0];
      const activeOrder = custOrders.find(
        (o) =>
          o.orderStatus === 'new' ||
          o.orderStatus === 'preparing' ||
          o.orderStatus === 'ready_for_pickup' ||
          o.orderStatus === 'out_for_delivery'
      );

      const custId = `cust-${phoneKey.replace(/[^\d]/g, '')}`;

      customerList.push({
        id: custId,
        name: customerInfo.name,
        phone: customerInfo.phone,
        email: customerInfo.email || `${customerInfo.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        address: customerInfo.address,
        city: customerInfo.city,
        totalOrders,
        totalSpent,
        averageOrderValue,
        lastOrderAt: lastOrder ? lastOrder.createdAt : new Date().toISOString(),
        activeOrderId: activeOrder?.id,
        createdAt: custOrders[custOrders.length - 1]?.createdAt || new Date().toISOString(),
      });
    });

    // 3. Filter by search query
    let result = customerList;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q)
      );
    }

    // 4. Sort results
    if (sortBy === 'recent') {
      result.sort((a, b) => new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime());
    } else if (sortBy === 'orders') {
      result.sort((a, b) => b.totalOrders - a.totalOrders);
    } else if (sortBy === 'spending') {
      result.sort((a, b) => b.totalSpent - a.totalSpent);
    }

    return result;
  },

  async getCustomerById(id: string): Promise<Customer | undefined> {
    const customers = await this.getCustomers('recent');
    return customers.find((c) => c.id === id || cleanPhone(c.phone) === cleanPhone(id));
  },

  async getCustomerOrders(
    customerPhoneOrId: string,
    statusFilter: 'all' | 'delivered' | 'active' | 'cancelled' = 'all'
  ): Promise<Order[]> {
    const orders = await orderService.getOrders();
    const cleanTarget = cleanPhone(customerPhoneOrId);

    const filtered = orders.filter((o) => {
      const custPhone = cleanPhone(o.customer.phone);
      return custPhone === cleanTarget || o.customer.name.toLowerCase().includes(customerPhoneOrId.toLowerCase());
    });

    if (statusFilter === 'delivered') {
      return filtered.filter((o) => o.orderStatus === 'delivered');
    }
    if (statusFilter === 'active') {
      return filtered.filter(
        (o) =>
          o.orderStatus === 'new' ||
          o.orderStatus === 'preparing' ||
          o.orderStatus === 'ready_for_pickup' ||
          o.orderStatus === 'out_for_delivery'
      );
    }
    if (statusFilter === 'cancelled') {
      return filtered.filter((o) => o.orderStatus === 'cancelled');
    }

    return filtered;
  },
};
