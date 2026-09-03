export type AnalyticsDateRange = 'today' | '7days' | '30days' | 'month';

export interface ComparisonMetric {
  value: number;
  previousValue: number;
  percentageChange: number | null; // null if no previous data
  trend: 'up' | 'down' | 'flat' | 'new';
  formattedChange: string; // e.g. "↑ 12.4%", "↓ 3.2%", "New"
}

export interface SalesSummaryAnalytics {
  grossSales: ComparisonMetric;
  netEarnings: ComparisonMetric;
  ordersCount: ComparisonMetric;
  avgOrderValue: ComparisonMetric;
  refundsTotal: ComparisonMetric;
}

export interface DailySalesTrendPoint {
  label: string; // e.g. "Mon", "Tue", "28 Aug"
  dateISO: string;
  grossSales: number;
  ordersCount: number;
}

export interface ChannelBreakdown {
  yugoAmount: number;
  yugoPercentage: number;
  yugoCount: number;
  counterAmount: number;
  counterPercentage: number;
  counterCount: number;
  totalSales: number;
}

export interface OrderStatusInsights {
  delivered: number;
  active: number;
  cancelled: number;
  returned: number;
  totalOrders: number;
  deliverySuccessRate: number; // Delivered / (Delivered + Cancelled) * 100
}

export interface TopProductAnalytics {
  productId: string;
  productName: string;
  category?: string;
  quantitySold: number;
  grossRevenue: number;
  refundedQuantity: number;
  netQuantitySold: number;
  netRevenue: number;
  currentStock: number;
  unitPrice: number;
  estimatedUnitMargin?: number;
}

export interface InventoryHealthInsights {
  totalProducts: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  unavailableCount: number;
  needsRestocking: {
    id: string;
    name: string;
    stockQuantity: number;
    threshold: number;
    status: 'low' | 'out';
  }[];
}

export interface StockMovementInsights {
  receivedUnits: number;
  soldUnits: number;
  returnedToStockUnits: number;
  damagedUnits: number;
}

export interface ProcurementSummaryAnalytics {
  totalPurchaseValue: number;
  receiptsCount: number;
  topSupplierName: string;
  topSupplierAmount: number;
  hasUnknownCosts: boolean;
}

export interface CustomerAnalyticsInsights {
  uniqueCustomersCount: number;
  repeatCustomersCount: number;
  newCustomersCount: number;
  repeatCustomerRate: number; // (repeat / unique) * 100
  avgCustomerSpend: number;
  topCustomerName: string;
  topCustomerSpend: number;
}

export interface ReturnsSummaryAnalytics {
  totalReturnsCount: number;
  totalReturnedItemsCount: number;
  totalRefundAmount: number;
  returnRatePercentage: number; // (returnedUnits / totalSoldUnits) * 100
  topReturnReason: string;
}

export interface FullAnalyticsReport {
  dateRange: AnalyticsDateRange;
  salesSummary: SalesSummaryAnalytics;
  salesTrend: DailySalesTrendPoint[];
  channelBreakdown: ChannelBreakdown;
  orderStatus: OrderStatusInsights;
  topSellingProducts: TopProductAnalytics[];
  topRevenueProducts: TopProductAnalytics[];
  inventoryHealth: InventoryHealthInsights;
  stockMovements: StockMovementInsights;
  procurementSummary: ProcurementSummaryAnalytics;
  customerInsights: CustomerAnalyticsInsights;
  returnsSummary: ReturnsSummaryAnalytics;
}
