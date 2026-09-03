import { CustomerReturn, ReturnItem, InventoryDisposition, ReturnReason } from '../types/return';
import { Order } from '../types/order';
import { orderService } from './order-service';
import { inventoryService } from './inventory-service';
import { notificationService } from './notification-service';
import { storageService, STORAGE_KEYS } from './storage-service';

const INITIAL_MOCK_RETURNS: CustomerReturn[] = [
  {
    id: 'RET-1004',
    returnNumber: '#RET-1004',
    orderId: 'ord-108',
    orderNumber: '#YGO-1041',
    customerId: 'cust-9321098765',
    customerName: 'Kavita Sharma',
    customerPhone: '+91 93210 98765',
    items: [
      {
        productId: 'prod-1',
        productName: 'Premium Coffee Beans (500g)',
        quantityOrdered: 2,
        quantityPreviouslyReturned: 0,
        quantityReturning: 1,
        unitPrice: 320,
        allocatedDiscountPerUnit: 20,
        refundAmountPerUnit: 300,
        totalItemRefund: 300,
        disposition: 'sellable',
      },
    ],
    reason: 'Customer changed mind',
    disposition: 'sellable',
    status: 'REFUNDED',
    paymentMethod: 'UPI',
    refundStatus: 'Refunded',
    refundAmount: 300,
    inventoryUpdated: true,
    notes: 'Unopened packet returned at counter.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'RET-1003',
    returnNumber: '#RET-1003',
    orderId: 'ord-110',
    orderNumber: '#YGO-1039',
    customerId: 'cust-9543210987',
    customerName: 'Manish Mehta',
    customerPhone: '+91 95432 10987',
    items: [
      {
        productId: 'prod-3',
        productName: 'Gluten-Free Bread (400g)',
        quantityOrdered: 2,
        quantityPreviouslyReturned: 0,
        quantityReturning: 1,
        unitPrice: 120,
        allocatedDiscountPerUnit: 25,
        refundAmountPerUnit: 95,
        totalItemRefund: 95,
        disposition: 'damaged',
      },
    ],
    reason: 'Damaged',
    disposition: 'damaged',
    status: 'RECEIVED',
    paymentMethod: 'COD',
    refundStatus: 'Pending',
    refundAmount: 95,
    inventoryUpdated: true,
    notes: 'Packaging torn upon arrival.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'RET-1002',
    returnNumber: '#RET-1002',
    orderId: 'ord-111',
    orderNumber: '#YGO-1030',
    customerId: 'cust-9876543210',
    customerName: 'Rahul Sharma',
    customerPhone: '+91 98765 43210',
    items: [
      {
        productId: 'prod-2',
        productName: 'Organic Yogurt (1kg)',
        quantityOrdered: 2,
        quantityPreviouslyReturned: 0,
        quantityReturning: 1,
        unitPrice: 180,
        allocatedDiscountPerUnit: 10,
        refundAmountPerUnit: 170,
        totalItemRefund: 170,
        disposition: 'sellable',
      },
    ],
    reason: 'Wrong item',
    disposition: 'sellable',
    status: 'REFUNDED',
    paymentMethod: 'UPI',
    refundStatus: 'Refunded',
    refundAmount: 170,
    inventoryUpdated: true,
    notes: 'Exchanged item at store.',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

let activeReturns: CustomerReturn[] = [...INITIAL_MOCK_RETURNS];

export const returnService = {
  async init(): Promise<CustomerReturn[]> {
    const isInit = await storageService.isInitialized();
    if (isInit) {
      const stored = await storageService.getItem<CustomerReturn[] | null>(STORAGE_KEYS.RETURNS, null);
      if (stored && Array.isArray(stored)) {
        activeReturns = stored;
        return [...activeReturns];
      }
    }
    activeReturns = [...INITIAL_MOCK_RETURNS];
    await storageService.setItem(STORAGE_KEYS.RETURNS, activeReturns);
    return [...activeReturns];
  },

  async persist(): Promise<void> {
    await storageService.setItem(STORAGE_KEYS.RETURNS, activeReturns);
  },

  async getReturns(
    filterStatus: 'all' | 'pending' | 'refunded' | 'partial' | 'full' = 'all',
    searchQuery = ''
  ): Promise<CustomerReturn[]> {
    let list = [...activeReturns];
    const q = searchQuery.trim().toLowerCase();

    if (q) {
      list = list.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.orderNumber.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.customerPhone.toLowerCase().includes(q)
      );
    }

    if (filterStatus === 'pending') {
      list = list.filter((r) => r.refundStatus === 'Pending');
    } else if (filterStatus === 'refunded') {
      list = list.filter((r) => r.refundStatus === 'Refunded');
    } else if (filterStatus === 'partial' || filterStatus === 'full') {
      const orders = await orderService.getOrders();
      list = list.filter((r) => {
        const order = orders.find((o) => o.id === r.orderId);
        if (!order) return filterStatus === 'partial';
        return filterStatus === 'partial'
          ? order.returnStatus === 'Partially_Returned'
          : order.returnStatus === 'Fully_Returned';
      });
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getReturnById(id: string): Promise<CustomerReturn | undefined> {
    return activeReturns.find((r) => r.id === id || r.returnNumber === id);
  },

  async getReturnsForOrder(orderId: string): Promise<CustomerReturn[]> {
    return activeReturns.filter((r) => r.orderId === orderId);
  },

  calculateItemRefund(
    order: Order,
    productId: string,
    quantityReturning: number
  ): { refundAmountPerUnit: number; totalItemRefund: number; allocatedDiscountPerUnit: number } {
    const item = order.items.find((i) => i.productId === productId);
    if (!item) return { refundAmountPerUnit: 0, totalItemRefund: 0, allocatedDiscountPerUnit: 0 };

    const itemTotalGross = item.unitPrice * item.quantity;
    const totalOrderSubtotal = order.subtotal > 0 ? order.subtotal : 1;

    // Proportional discount allocation for this item
    const itemTotalDiscount = Math.round((order.discount * itemTotalGross) / totalOrderSubtotal);
    const allocatedDiscountPerUnit = Math.round(itemTotalDiscount / item.quantity);
    const refundAmountPerUnit = Math.max(0, item.unitPrice - allocatedDiscountPerUnit);
    const totalItemRefund = Math.round(refundAmountPerUnit * quantityReturning);

    return { refundAmountPerUnit, totalItemRefund, allocatedDiscountPerUnit };
  },

  async recordCustomerReturn(params: {
    orderId: string;
    itemsToReturn: {
      productId: string;
      quantityReturning: number;
      disposition: InventoryDisposition;
    }[];
    reason: ReturnReason | string;
    notes?: string;
  }): Promise<CustomerReturn> {
    const order = await orderService.getOrderById(params.orderId);
    if (!order) {
      throw new Error('Order not found.');
    }

    if (order.orderStatus === 'cancelled') {
      throw new Error('Returns cannot be initiated for cancelled orders.');
    }

    if (!params.itemsToReturn || params.itemsToReturn.length === 0) {
      throw new Error('Please select at least one item to return.');
    }

    const existingReturnedMap = order.returnedItemQuantities || {};
    const returnItems: ReturnItem[] = [];
    let totalRefundAmount = 0;

    // 1. ATOMIC VALIDATION & QUANTITY LIMIT GUARD
    for (const reqItem of params.itemsToReturn) {
      const orderItem = order.items.find((i) => i.productId === reqItem.productId);
      if (!orderItem) {
        throw new Error(`Item with product ID ${reqItem.productId} was not found in this order.`);
      }

      const prevReturned = existingReturnedMap[reqItem.productId] || 0;
      const maxAllowed = orderItem.quantity - prevReturned;

      if (reqItem.quantityReturning <= 0) {
        throw new Error(`Return quantity for ${orderItem.productName} must be greater than zero.`);
      }

      if (reqItem.quantityReturning > maxAllowed) {
        throw new Error(
          `Cannot return ${reqItem.quantityReturning} units of ${orderItem.productName}. Maximum returnable quantity is ${maxAllowed}.`
        );
      }

      const { refundAmountPerUnit, totalItemRefund, allocatedDiscountPerUnit } =
        this.calculateItemRefund(order, reqItem.productId, reqItem.quantityReturning);

      totalRefundAmount += totalItemRefund;

      returnItems.push({
        productId: reqItem.productId,
        productName: orderItem.productName,
        quantityOrdered: orderItem.quantity,
        quantityPreviouslyReturned: prevReturned,
        quantityReturning: reqItem.quantityReturning,
        unitPrice: orderItem.unitPrice,
        allocatedDiscountPerUnit,
        refundAmountPerUnit,
        totalItemRefund,
        disposition: reqItem.disposition,
      });
    }

    const returnId = `RET-${1005 + activeReturns.length}`;
    const nowISO = new Date().toISOString();

    // 2. ATOMIC INVENTORY & STOCK MOVEMENT EXECUTION
    const shopInventory = await inventoryService.getShopInventory();

    for (const item of returnItems) {
      const invItem = shopInventory.find(
        (inv) => inv.catalogProductId === item.productId || inv.id === item.productId
      );

      if (invItem) {
        const prevQty = invItem.stockQuantity;

        if (item.disposition === 'sellable') {
          // Increase sellable inventory quantity
          const newQty = prevQty + item.quantityReturning;
          await inventoryService.updateShopInventoryItem(invItem.id, {
            stockQuantity: newQty,
            isAvailable: true, // Out of stock status cleared
            lastUpdated: nowISO,
          });

          await inventoryService.recordStockMovementEntry({
            shopInventoryItemId: invItem.id,
            catalogProductId: invItem.catalogProductId,
            productName: invItem.catalogProduct.name,
            brand: invItem.catalogProduct.brand,
            variant: invItem.catalogProduct.variant,
            type: 'RETURN',
            quantityChange: item.quantityReturning,
            previousQuantity: prevQty,
            newQuantity: newQty,
            reason: `Customer return (${params.reason})`,
            source: 'CUSTOMER_RETURN',
            orderId: order.id,
            returnId,
          });
        } else if (item.disposition === 'damaged') {
          // Keep sellable inventory unchanged, record DAMAGED movement
          await inventoryService.recordStockMovementEntry({
            shopInventoryItemId: invItem.id,
            catalogProductId: invItem.catalogProductId,
            productName: invItem.catalogProduct.name,
            brand: invItem.catalogProduct.brand,
            variant: invItem.catalogProduct.variant,
            type: 'DAMAGED',
            quantityChange: -item.quantityReturning,
            previousQuantity: prevQty,
            newQuantity: prevQty,
            reason: `Customer return - damaged (${params.reason})`,
            source: 'CUSTOMER_RETURN',
            orderId: order.id,
            returnId,
          });
        } else {
          // Unsellable disposition
          await inventoryService.recordStockMovementEntry({
            shopInventoryItemId: invItem.id,
            catalogProductId: invItem.catalogProductId,
            productName: invItem.catalogProduct.name,
            brand: invItem.catalogProduct.brand,
            variant: invItem.catalogProduct.variant,
            type: 'RETURN',
            quantityChange: 0,
            previousQuantity: prevQty,
            newQuantity: prevQty,
            reason: `Customer return - unsellable (${params.reason})`,
            source: 'CUSTOMER_RETURN',
            orderId: order.id,
            returnId,
          });
        }
      }
    }

    // 3. UPDATE ORDER RETURN STATE
    const updatedReturnedMap = { ...existingReturnedMap };
    for (const item of returnItems) {
      updatedReturnedMap[item.productId] = (updatedReturnedMap[item.productId] || 0) + item.quantityReturning;
    }

    const totalOrderedQty = order.items.reduce((sum, i) => sum + i.quantity, 0);
    const totalReturnedQty = Object.values(updatedReturnedMap).reduce((sum, qty) => sum + qty, 0);
    const newReturnStatus = totalReturnedQty >= totalOrderedQty ? 'Fully_Returned' : 'Partially_Returned';
    const newTotalRefunded = (order.totalRefundedAmount || 0) + totalRefundAmount;

    await orderService.updateOrderReturnState(order.id, {
      returnStatus: newReturnStatus,
      totalRefundedAmount: newTotalRefunded,
      returnedItemQuantities: updatedReturnedMap,
      paymentStatus: newReturnStatus === 'Fully_Returned' ? 'Refunded' : order.paymentStatus,
    });

    // 4. CONSTRUCT & PERSIST RETURN RECORD
    const primaryDisposition = returnItems[0]?.disposition || 'sellable';

    const customerReturn: CustomerReturn = {
      id: returnId,
      returnNumber: `#${returnId}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customer.phone.replace(/[^\d]/g, ''),
      customerName: order.customer.name,
      customerPhone: order.customer.phone,
      items: returnItems,
      reason: params.reason,
      disposition: primaryDisposition,
      status: 'REFUNDED',
      paymentMethod: order.paymentMethod,
      refundStatus: 'Refunded',
      refundAmount: totalRefundAmount,
      inventoryUpdated: true,
      notes: params.notes ? params.notes.trim() : undefined,
      createdAt: nowISO,
      updatedAt: nowISO,
    };

    activeReturns.unshift(customerReturn);
    await this.persist();

    // 5. TRIGGER NOTIFICATION
    try {
      await notificationService.notifyEvent({
        category: 'SYSTEM',
        type: 'REFUND_PROCESSED',
        title: `Refund Processed (${customerReturn.id})`,
        message: `₹${totalRefundAmount} refunded for order ${order.orderNumber} (${order.customer.name}).`,
        priority: 'NORMAL',
        entityType: 'ORDER',
        entityId: order.id,
      });
    } catch (err) {
      console.warn('Failed to send refund notification:', err);
    }

    return customerReturn;
  },
};
