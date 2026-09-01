import { orderService } from './order-service';
import { inventoryService } from './inventory-service';
import { customerService } from './customer-service';
import { returnService } from './return-service';
import { supplierService } from './supplier-service';
import { Order } from '../types/order';
import { CounterSaleRecord } from './financial-service';
import { ShopInventoryItem, StockMovement, StockReceipt } from '../types/inventory';
import { CustomerReturn, ReturnItem } from '../types/return';
import { Customer } from '../types/customer';
import {
  AnalyticsDateRange,
  ComparisonMetric,
  FullAnalyticsReport,
  DailySalesTrendPoint,
  TopProductAnalytics,
} from '../types/analytics';

export function calculateComparisonMetric(current: number, previous: number): ComparisonMetric {
  if (previous === 0) {
    if (current === 0) {
      return {
        value: current,
        previousValue: previous,
        percentageChange: 0,
        trend: 'flat',
        formattedChange: '0%',
      };
    }
    return {
      value: current,
      previousValue: previous,
      percentageChange: null,
      trend: 'new',
      formattedChange: 'New',
    };
  }

  const diff = current - previous;
  const pct = (diff / previous) * 100;
  const absPct = Math.abs(pct).toFixed(1);

  if (Math.abs(pct) < 0.1) {
    return {
      value: current,
      previousValue: previous,
      percentageChange: 0,
      trend: 'flat',
      formattedChange: '0%',
    };
  }

  return {
    value: current,
    previousValue: previous,
    percentageChange: pct,
    trend: pct > 0 ? 'up' : 'down',
    formattedChange: `${pct > 0 ? '↑' : '↓'} ${absPct}%`,
  };
}

export function getDateBounds(range: AnalyticsDateRange) {
  const now = new Date();
  const endDate = new Date(now);
  let startDate = new Date(now);
  let prevEndDate = new Date(now);
  let prevStartDate = new Date(now);

  if (range === 'today') {
    startDate.setHours(0, 0, 0, 0);
    prevEndDate = new Date(startDate);
    prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - 1);
  } else if (range === '7days') {
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    prevEndDate = new Date(startDate.getTime() - 1);
    prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - 7);
  } else if (range === '30days') {
    startDate.setDate(startDate.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);

    prevEndDate = new Date(startDate.getTime() - 1);
    prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - 30);
  } else if (range === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);

    const elapsedDays = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 3600 * 24)));
    prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    prevEndDate = new Date(prevStartDate);
    prevEndDate.setDate(prevEndDate.getDate() + elapsedDays);
  }

  return { startDate, endDate, prevStartDate, prevEndDate };
}

export const analyticsService = {
  async getAnalyticsReport(range: AnalyticsDateRange = '7days'): Promise<FullAnalyticsReport> {
    const { startDate, endDate, prevStartDate, prevEndDate } = getDateBounds(range);

    // Fetch all underlying data
    const [orders, counterSales, inventoryItems, movements, receipts, suppliers, returns, customers] =
      await Promise.all([
        orderService.getOrders(),
        inventoryService.getCounterSaleRecords(),
        inventoryService.getShopInventory(),
        inventoryService.getStockMovements(),
        inventoryService.getStockReceipts('all', ''),
        supplierService.getSuppliers(),
        returnService.getReturns(),
        customerService.getCustomers(),
      ]);

    const isCurrentPeriod = (dateISO: string) => {
      const t = new Date(dateISO).getTime();
      return t >= startDate.getTime() && t <= endDate.getTime();
    };

    const isPreviousPeriod = (dateISO: string) => {
      const t = new Date(dateISO).getTime();
      return t >= prevStartDate.getTime() && t <= prevEndDate.getTime();
    };

    // Filter current vs previous period datasets
    const curOrders: Order[] = orders.filter((o: Order) => isCurrentPeriod(o.createdAt));
    const prevOrders: Order[] = orders.filter((o: Order) => isPreviousPeriod(o.createdAt));

    const curCounterSales: CounterSaleRecord[] = counterSales.filter((cs: CounterSaleRecord) => isCurrentPeriod(cs.createdAt));
    const prevCounterSales: CounterSaleRecord[] = counterSales.filter((cs: CounterSaleRecord) => isPreviousPeriod(cs.createdAt));

    const curReturns: CustomerReturn[] = returns.filter((r: CustomerReturn) => isCurrentPeriod(r.createdAt));
    const prevReturns: CustomerReturn[] = returns.filter((r: CustomerReturn) => isPreviousPeriod(r.createdAt));

    const curMovements: StockMovement[] = movements.filter((m: StockMovement) => isCurrentPeriod(m.createdAt));
    const curReceipts: StockReceipt[] = receipts.filter((rc: StockReceipt) => isCurrentPeriod(rc.createdAt));

    // 1. BUSINESS OVERVIEW
    const curYugoSales = curOrders.reduce((sum: number, o: Order) => sum + (o.orderStatus !== 'cancelled' ? o.subtotal : 0), 0);
    const curCSGross = curCounterSales.reduce((sum: number, cs: CounterSaleRecord) => sum + cs.totalAmount, 0);
    const curGrossSales = curYugoSales + curCSGross;

    const prevYugoSales = prevOrders.reduce((sum: number, o: Order) => sum + (o.orderStatus !== 'cancelled' ? o.subtotal : 0), 0);
    const prevCSGross = prevCounterSales.reduce((sum: number, cs: CounterSaleRecord) => sum + cs.totalAmount, 0);
    const prevGrossSales = prevYugoSales + prevCSGross;

    const curRefunds = curReturns.reduce((sum: number, r: CustomerReturn) => sum + r.refundAmount, 0);
    const prevRefunds = prevReturns.reduce((sum: number, r: CustomerReturn) => sum + r.refundAmount, 0);

    const curNetEarnings = Math.max(0, curGrossSales - curRefunds);
    const prevNetEarnings = Math.max(0, prevGrossSales - prevRefunds);

    const curOrderCount = curOrders.length + curCounterSales.length;
    const prevOrderCount = prevOrders.length + prevCounterSales.length;

    const curAvgOrderValue = curOrderCount > 0 ? Math.round(curGrossSales / curOrderCount) : 0;
    const prevAvgOrderValue = prevOrderCount > 0 ? Math.round(prevGrossSales / prevOrderCount) : 0;

    const salesSummary = {
      grossSales: calculateComparisonMetric(curGrossSales, prevGrossSales),
      netEarnings: calculateComparisonMetric(curNetEarnings, prevNetEarnings),
      ordersCount: calculateComparisonMetric(curOrderCount, prevOrderCount),
      avgOrderValue: calculateComparisonMetric(curAvgOrderValue, prevAvgOrderValue),
      refundsTotal: calculateComparisonMetric(curRefunds, prevRefunds),
    };

    // 2. SALES TREND CHART POINTS
    const numDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)));
    const trendPoints: DailySalesTrendPoint[] = [];

    for (let i = 0; i < Math.min(numDays, 30); i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const dayOrders = orders.filter((o: Order) => {
        const t = new Date(o.createdAt).getTime();
        return t >= dayStart.getTime() && t <= dayEnd.getTime() && o.orderStatus !== 'cancelled';
      });

      const dayCS = counterSales.filter((cs: CounterSaleRecord) => {
        const t = new Date(cs.createdAt).getTime();
        return t >= dayStart.getTime() && t <= dayEnd.getTime();
      });

      const dayYugoSales = dayOrders.reduce((sum: number, o: Order) => sum + o.subtotal, 0);
      const dayCSSales = dayCS.reduce((sum: number, cs: CounterSaleRecord) => sum + cs.totalAmount, 0);

      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayDate = d.getDate();
      const label = range === 'today' ? `${d.getHours()}:00` : range === '7days' ? dayName : `${dayDate} ${dayName.charAt(0)}`;

      trendPoints.push({
        label,
        dateISO: d.toISOString(),
        grossSales: dayYugoSales + dayCSSales,
        ordersCount: dayOrders.length + dayCS.length,
      });
    }

    // 3. CHANNEL BREAKDOWN
    const yugoAmount = curYugoSales;
    const counterAmount = curCSGross;
    const totalChannelSales = yugoAmount + counterAmount;

    const channelBreakdown = {
      yugoAmount,
      yugoPercentage: totalChannelSales > 0 ? Math.round((yugoAmount / totalChannelSales) * 100) : 0,
      yugoCount: curOrders.length,
      counterAmount,
      counterPercentage: totalChannelSales > 0 ? Math.round((counterAmount / totalChannelSales) * 100) : 0,
      counterCount: curCounterSales.length,
      totalSales: totalChannelSales,
    };

    // 4. ORDER STATUS INSIGHTS
    const deliveredCount = curOrders.filter((o: Order) => o.orderStatus === 'delivered').length;
    const activeCount = curOrders.filter(
      (o: Order) => o.orderStatus === 'new' || o.orderStatus === 'preparing' || o.orderStatus === 'ready_for_pickup' || o.orderStatus === 'out_for_delivery'
    ).length;
    const cancelledCount = curOrders.filter((o: Order) => o.orderStatus === 'cancelled').length;
    const returnedCount = curOrders.filter(
      (o: Order) => o.returnStatus === 'Partially_Returned' || o.returnStatus === 'Fully_Returned'
    ).length;

    const totalOrdersCount = curOrders.length;
    const completedOrCancelled = deliveredCount + cancelledCount;
    const deliverySuccessRate = completedOrCancelled > 0 ? Math.round((deliveredCount / completedOrCancelled) * 100) : 100;

    const orderStatus = {
      delivered: deliveredCount,
      active: activeCount,
      cancelled: cancelledCount,
      returned: returnedCount,
      totalOrders: totalOrdersCount,
      deliverySuccessRate,
    };

    // 5. PRODUCT SALES ANALYTICS (Top Selling & Top Revenue)
    const productStatsMap = new Map<string, TopProductAnalytics>();

    // Initialize from catalog
    inventoryItems.forEach((item: ShopInventoryItem) => {
      const pid = item.catalogProductId;
      productStatsMap.set(pid, {
        productId: pid,
        productName: item.catalogProduct.name,
        category: item.catalogProduct.category,
        quantitySold: 0,
        grossRevenue: 0,
        refundedQuantity: 0,
        netQuantitySold: 0,
        netRevenue: 0,
        currentStock: item.stockQuantity,
        unitPrice: item.sellingPrice,
        estimatedUnitMargin: item.latestPurchaseCost ? Math.max(0, item.sellingPrice - item.latestPurchaseCost) : undefined,
      });
    });

    // Aggregate Yugo Order Items
    curOrders.forEach((o: Order) => {
      if (o.orderStatus !== 'cancelled') {
        o.items.forEach((item) => {
          let p = productStatsMap.get(item.productId);
          if (!p) {
            p = {
              productId: item.productId,
              productName: item.productName,
              quantitySold: 0,
              grossRevenue: 0,
              refundedQuantity: 0,
              netQuantitySold: 0,
              netRevenue: 0,
              currentStock: 0,
              unitPrice: item.unitPrice,
            };
            productStatsMap.set(item.productId, p);
          }
          p.quantitySold += item.quantity;
          p.grossRevenue += item.finalPrice;
        });
      }
    });

    // Aggregate Counter Sales Items
    curCounterSales.forEach((cs: CounterSaleRecord) => {
      cs.items.forEach((item) => {
        let p = productStatsMap.get(item.shopInventoryItemId);
        if (!p) {
          p = {
            productId: item.shopInventoryItemId,
            productName: item.productName,
            quantitySold: 0,
            grossRevenue: 0,
            refundedQuantity: 0,
            netQuantitySold: 0,
            netRevenue: 0,
            currentStock: 0,
            unitPrice: item.unitPrice,
          };
          productStatsMap.set(item.shopInventoryItemId, p);
        }
        p.quantitySold += item.quantity;
        p.grossRevenue += item.totalPrice;
      });
    });

    // Subtract Returns
    curReturns.forEach((r: CustomerReturn) => {
      r.items.forEach((ri: ReturnItem) => {
        const p = productStatsMap.get(ri.productId);
        if (p) {
          p.refundedQuantity += ri.quantityReturning;
          p.netRevenue = Math.max(0, p.netRevenue - ri.totalItemRefund);
        }
      });
    });

    // Compute Net Totals
    productStatsMap.forEach((p: TopProductAnalytics) => {
      p.netQuantitySold = Math.max(0, p.quantitySold - p.refundedQuantity);
      p.netRevenue = Math.max(0, p.grossRevenue - (p.refundedQuantity * p.unitPrice));
    });

    const allProductStats = Array.from(productStatsMap.values());

    const topSellingProducts = [...allProductStats]
      .filter((p: TopProductAnalytics) => p.netQuantitySold > 0)
      .sort((a: TopProductAnalytics, b: TopProductAnalytics) => b.netQuantitySold - a.netQuantitySold)
      .slice(0, 5);

    const topRevenueProducts = [...allProductStats]
      .filter((p: TopProductAnalytics) => p.netRevenue > 0)
      .sort((a: TopProductAnalytics, b: TopProductAnalytics) => b.netRevenue - a.netRevenue)
      .slice(0, 5);

    // 6. INVENTORY HEALTH
    const totalProducts = inventoryItems.length;
    const inStockCount = inventoryItems.filter((i: ShopInventoryItem) => i.isAvailable && i.stockQuantity > (i.lowStockThreshold ?? 10)).length;
    const lowStockCount = inventoryItems.filter((i: ShopInventoryItem) => i.isAvailable && i.stockQuantity <= (i.lowStockThreshold ?? 10) && i.stockQuantity > 0).length;
    const outOfStockCount = inventoryItems.filter((i: ShopInventoryItem) => i.isAvailable && i.stockQuantity === 0).length;
    const unavailableCount = inventoryItems.filter((i: ShopInventoryItem) => !i.isAvailable).length;

    const needsRestocking = inventoryItems
      .filter((i: ShopInventoryItem) => i.isAvailable && i.stockQuantity <= (i.lowStockThreshold ?? 10))
      .map((i: ShopInventoryItem) => ({
        id: i.id,
        name: i.catalogProduct.name,
        stockQuantity: i.stockQuantity,
        threshold: i.lowStockThreshold ?? 10,
        status: i.stockQuantity === 0 ? ('out' as const) : ('low' as const),
      }));

    const inventoryHealth = {
      totalProducts,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      unavailableCount,
      needsRestocking,
    };

    // 7. STOCK MOVEMENTS
    let receivedUnits = 0;
    let soldUnits = 0;
    let returnedToStockUnits = 0;
    let damagedUnits = 0;

    curMovements.forEach((m: StockMovement) => {
      if (m.type === 'STOCK_RECEIVED') receivedUnits += m.quantityChange;
      else if (m.type === 'SALE') soldUnits += Math.abs(m.quantityChange);
      else if (m.type === 'RETURN') returnedToStockUnits += m.quantityChange;
      else if (m.type === 'DAMAGED' || m.type === 'EXPIRED') damagedUnits += Math.abs(m.quantityChange);
    });

    const stockMovements = {
      receivedUnits,
      soldUnits,
      returnedToStockUnits,
      damagedUnits,
    };

    // 8. PROCUREMENT & SUPPLIER SUMMARY
    let totalPurchaseValue = 0;
    let hasUnknownCosts = false;

    curReceipts.forEach((rc: StockReceipt) => {
      if (rc.totalPurchaseValue && rc.totalPurchaseValue > 0) {
        totalPurchaseValue += rc.totalPurchaseValue;
      } else {
        hasUnknownCosts = true;
      }
    });

    // Top Supplier
    const supplierSpendMap = new Map<string, { name: string; spend: number }>();
    curReceipts.forEach((rc: StockReceipt) => {
      const sup = suppliers.find((s) => s.id === rc.supplierId);
      const name = sup ? sup.name : rc.supplierName || 'Unknown Supplier';
      const prev = supplierSpendMap.get(name) || { name, spend: 0 };
      prev.spend += rc.totalPurchaseValue || 0;
      supplierSpendMap.set(name, prev);
    });

    let topSupplierName = 'None';
    let topSupplierAmount = 0;
    supplierSpendMap.forEach((v: { name: string; spend: number }) => {
      if (v.spend > topSupplierAmount) {
        topSupplierAmount = v.spend;
        topSupplierName = v.name;
      }
    });

    const procurementSummary = {
      totalPurchaseValue,
      receiptsCount: curReceipts.length,
      topSupplierName,
      topSupplierAmount,
      hasUnknownCosts,
    };

    // 9. CUSTOMER INSIGHTS
    const uniqueCustomersCount = customers.length;
    const repeatCustomersList = customers.filter((c: Customer) => c.totalOrders > 1);
    const repeatCustomersCount = repeatCustomersList.length;
    const newCustomersCount = Math.max(0, uniqueCustomersCount - repeatCustomersCount);
    const repeatCustomerRate = uniqueCustomersCount > 0 ? Math.round((repeatCustomersCount / uniqueCustomersCount) * 100) : 0;

    const totalCustomerSpend = customers.reduce((sum: number, c: Customer) => sum + c.totalSpent, 0);
    const avgCustomerSpend = uniqueCustomersCount > 0 ? Math.round(totalCustomerSpend / uniqueCustomersCount) : 0;

    const sortedCustomers = [...customers].sort((a: Customer, b: Customer) => b.totalSpent - a.totalSpent);
    const topCustomer = sortedCustomers[0];

    const customerInsights = {
      uniqueCustomersCount,
      repeatCustomersCount,
      newCustomersCount,
      repeatCustomerRate,
      avgCustomerSpend,
      topCustomerName: topCustomer ? topCustomer.name : 'None',
      topCustomerSpend: topCustomer ? topCustomer.totalSpent : 0,
    };

    // 10. RETURNS INSIGHTS
    const totalReturnsCount = curReturns.length;
    const totalReturnedItemsCount = curReturns.reduce(
      (sum: number, r: CustomerReturn) => sum + r.items.reduce((iSum: number, item: ReturnItem) => iSum + item.quantityReturning, 0),
      0
    );
    const totalRefundAmount = curRefunds;

    const totalUnitsSold = allProductStats.reduce((sum: number, p: TopProductAnalytics) => sum + p.quantitySold, 0);
    const returnRatePercentage = totalUnitsSold > 0 ? parseFloat(((totalReturnedItemsCount / totalUnitsSold) * 100).toFixed(1)) : 0;

    // Top return reason
    const reasonMap = new Map<string, number>();
    curReturns.forEach((r: CustomerReturn) => {
      reasonMap.set(r.reason, (reasonMap.get(r.reason) || 0) + 1);
    });
    let topReturnReason = 'None';
    let maxReasonCount = 0;
    reasonMap.forEach((cnt: number, reason: string) => {
      if (cnt > maxReasonCount) {
        maxReasonCount = cnt;
        topReturnReason = reason;
      }
    });

    const returnsSummary = {
      totalReturnsCount,
      totalReturnedItemsCount,
      totalRefundAmount,
      returnRatePercentage,
      topReturnReason,
    };

    return {
      dateRange: range,
      salesSummary,
      salesTrend: trendPoints,
      channelBreakdown,
      orderStatus,
      topSellingProducts,
      topRevenueProducts,
      inventoryHealth,
      stockMovements,
      procurementSummary,
      customerInsights,
      returnsSummary,
    };
  },
};
