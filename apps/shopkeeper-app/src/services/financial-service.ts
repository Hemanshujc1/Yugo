import { Order, PaymentMethod, PaymentStatus } from '../types/order';

export interface CounterSaleRecordItem {
  shopInventoryItemId: string;
  productName: string;
  brand: string;
  variant: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CounterSaleRecord {
  id: string;
  items: CounterSaleRecordItem[];
  totalAmount: number;
  paymentMethod: 'Cash' | 'UPI' | 'Card';
  createdAt: string;
}

export interface OrderFinancials {
  orderId: string;
  orderNumber: string;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  grossTotal: number;
  platformCommission: number;
  netEarnings: number;
  paymentMethod: PaymentMethod | string;
  paymentStatus: PaymentStatus | string;
  amountPaid: number;
  amountPending: number;
  refundAmount: number;
  refundReason?: string;
}

export interface EarningsSummary {
  dateRangeLabel: string;
  grossSales: number;
  yugoOrdersSales: number;
  counterSales: number;
  yugoOrdersCount: number;
  counterSalesCount: number;
  totalOrdersCount: number;
  refundsTotal: number;
  platformDeductions: number;
  netEarnings: number;
  pendingPaymentsTotal: number;
  pendingOrdersCount: number;
}

export interface PaymentBadgeConfig {
  label: string;
  bgColor: string;
  textColor: string;
}

export const financialService = {
  getPaymentBadgeConfig(status: string): PaymentBadgeConfig {
    const s = (status || '').toUpperCase();
    if (s === 'PAID') {
      return { label: 'PAID', bgColor: '#E6F4EA', textColor: '#10B981' };
    }
    if (s === 'PENDING' || s === 'COD_PENDING') {
      return { label: 'PENDING', bgColor: '#FEF3C7', textColor: '#D97706' };
    }
    if (s === 'PARTIALLY_PAID') {
      return { label: 'PARTIALLY PAID', bgColor: '#E0F2FE', textColor: '#0284C7' };
    }
    if (s === 'REFUNDED') {
      return { label: 'REFUNDED', bgColor: '#F3F4F6', textColor: '#6B7280' };
    }
    if (s === 'FAILED') {
      return { label: 'FAILED', bgColor: '#FEE2E2', textColor: '#DC2626' };
    }
    return { label: status.toUpperCase(), bgColor: '#F3F4F6', textColor: '#374151' };
  },

  calculateOrderFinancials(order: Order): OrderFinancials {
    const isPaid = order.paymentStatus === 'Paid';
    const isRefunded = order.paymentStatus === 'Refunded';
    const isPending = !isPaid && !isRefunded;

    const grossTotal = order.total;
    const platformCommission = Math.round(grossTotal * 0.05); // 5% Yugo platform fee
    const refundAmount = order.totalRefundedAmount || (isRefunded ? grossTotal : 0);
    const amountPaid = isPaid ? Math.max(0, grossTotal - refundAmount) : 0;
    const amountPending = isPending ? grossTotal : 0;
    const netEarnings = isPaid ? Math.max(0, grossTotal - refundAmount - platformCommission) : 0;

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      subtotal: order.subtotal,
      discount: order.discount,
      deliveryFee: order.deliveryFee,
      tax: order.tax,
      grossTotal,
      platformCommission,
      netEarnings,
      paymentMethod: order.paymentMethod,
      paymentStatus: isPaid ? 'Paid' : isRefunded ? 'Refunded' : 'Pending',
      amountPaid,
      amountPending,
      refundAmount,
      refundReason: order.cancellationReason || (isRefunded ? 'Customer cancellation' : undefined),
    };
  },

  calculateEarnings(
    orders: Order[],
    counterSales: CounterSaleRecord[],
    range: 'today' | 'yesterday' | 'week' | 'month'
  ): EarningsSummary {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let startTime = startOfToday.getTime();
    let endTime = Date.now();
    let rangeLabel = 'Today';

    if (range === 'yesterday') {
      const yesterday = new Date(startOfToday);
      yesterday.setDate(startOfToday.getDate() - 1);
      startTime = yesterday.getTime();
      endTime = startOfToday.getTime() - 1;
      rangeLabel = 'Yesterday';
    } else if (range === 'week') {
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfToday.getDate() - 7);
      startTime = startOfWeek.getTime();
      rangeLabel = 'This Week';
    } else if (range === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startTime = startOfMonth.getTime();
      rangeLabel = 'This Month';
    }

    const filteredOrders = orders.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= startTime && t <= endTime && o.orderStatus !== 'cancelled';
    });

    const filteredCounterSales = counterSales.filter((cs) => {
      const t = new Date(cs.createdAt).getTime();
      return t >= startTime && t <= endTime;
    });

    let yugoOrdersSales = 0;
    let yugoOrdersCount = 0;
    let refundsTotal = 0;
    let platformDeductions = 0;
    let pendingPaymentsTotal = 0;
    let pendingOrdersCount = 0;

    for (const o of filteredOrders) {
      const fin = this.calculateOrderFinancials(o);
      if (o.paymentStatus === 'Refunded') {
        refundsTotal += fin.refundAmount;
      } else {
        yugoOrdersSales += fin.grossTotal;
        yugoOrdersCount++;
        platformDeductions += fin.platformCommission;
      }

      if (fin.amountPending > 0) {
        pendingPaymentsTotal += fin.amountPending;
        pendingOrdersCount++;
      }
    }

    const counterSalesGross = filteredCounterSales.reduce((acc, cs) => acc + cs.totalAmount, 0);
    const counterSalesCount = filteredCounterSales.length;

    const grossSales = yugoOrdersSales + counterSalesGross;
    const netEarnings = Math.max(0, grossSales - refundsTotal - platformDeductions);

    return {
      dateRangeLabel: rangeLabel,
      grossSales,
      yugoOrdersSales,
      counterSales: counterSalesGross,
      yugoOrdersCount,
      counterSalesCount,
      totalOrdersCount: yugoOrdersCount + counterSalesCount,
      refundsTotal,
      platformDeductions,
      netEarnings,
      pendingPaymentsTotal,
      pendingOrdersCount,
    };
  },
};
