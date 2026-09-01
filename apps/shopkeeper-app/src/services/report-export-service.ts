import { FullAnalyticsReport } from '../types/analytics';

export const reportExportService = {
  generateCSVContent(report: FullAnalyticsReport): string {
    const lines: string[] = [];

    lines.push(`YUGO SHOPKEEPER APP — BUSINESS ANALYTICS REPORT`);
    lines.push(`Reporting Period: ${report.dateRange.toUpperCase()}`);
    lines.push(`Generated At: ${new Date().toLocaleString()}`);
    lines.push('');

    // 1. Business Overview
    lines.push(`--- BUSINESS OVERVIEW ---`);
    lines.push(`Metric,Value,Previous Period,Change`);
    lines.push(`Gross Sales,₹${report.salesSummary.grossSales.value},₹${report.salesSummary.grossSales.previousValue},${report.salesSummary.grossSales.formattedChange}`);
    lines.push(`Net Earnings,₹${report.salesSummary.netEarnings.value},₹${report.salesSummary.netEarnings.previousValue},${report.salesSummary.netEarnings.formattedChange}`);
    lines.push(`Orders Count,${report.salesSummary.ordersCount.value},${report.salesSummary.ordersCount.previousValue},${report.salesSummary.ordersCount.formattedChange}`);
    lines.push(`Avg Order Value,₹${report.salesSummary.avgOrderValue.value},₹${report.salesSummary.avgOrderValue.previousValue},${report.salesSummary.avgOrderValue.formattedChange}`);
    lines.push(`Refunds Total,₹${report.salesSummary.refundsTotal.value},₹${report.salesSummary.refundsTotal.previousValue},${report.salesSummary.refundsTotal.formattedChange}`);
    lines.push('');

    // 2. Channel Breakdown
    lines.push(`--- SALES CHANNEL BREAKDOWN ---`);
    lines.push(`Channel,Amount,Percentage,Orders Count`);
    lines.push(`Yugo Orders,₹${report.channelBreakdown.yugoAmount},${report.channelBreakdown.yugoPercentage}%,${report.channelBreakdown.yugoCount}`);
    lines.push(`Counter Sales,₹${report.channelBreakdown.counterAmount},${report.channelBreakdown.counterPercentage}%,${report.channelBreakdown.counterCount}`);
    lines.push('');

    // 3. Order Status & Delivery
    lines.push(`--- ORDER STATUS & DELIVERY ---`);
    lines.push(`Delivered Orders,${report.orderStatus.delivered}`);
    lines.push(`Active Orders,${report.orderStatus.active}`);
    lines.push(`Cancelled Orders,${report.orderStatus.cancelled}`);
    lines.push(`Returned Orders,${report.orderStatus.returned}`);
    lines.push(`Delivery Success Rate,${report.orderStatus.deliverySuccessRate}%`);
    lines.push('');

    // 4. Top Selling Products
    lines.push(`--- TOP SELLING PRODUCTS (QTY) ---`);
    lines.push(`Product Name,Units Sold,Refunded Qty,Net Units Sold,Gross Revenue`);
    report.topSellingProducts.forEach((p) => {
      lines.push(`"${p.productName}",${p.quantitySold},${p.refundedQuantity},${p.netQuantitySold},₹${p.grossRevenue}`);
    });
    lines.push('');

    // 5. Top Revenue Products
    lines.push(`--- TOP REVENUE PRODUCTS ---`);
    lines.push(`Product Name,Net Revenue,Net Units Sold,Current Stock,Unit Price`);
    report.topRevenueProducts.forEach((p) => {
      lines.push(`"${p.productName}",₹${p.netRevenue},${p.netQuantitySold},${p.currentStock},₹${p.unitPrice}`);
    });
    lines.push('');

    // 6. Inventory Health
    lines.push(`--- INVENTORY HEALTH ---`);
    lines.push(`Total Products,${report.inventoryHealth.totalProducts}`);
    lines.push(`In Stock,${report.inventoryHealth.inStockCount}`);
    lines.push(`Low Stock,${report.inventoryHealth.lowStockCount}`);
    lines.push(`Out of Stock,${report.inventoryHealth.outOfStockCount}`);
    lines.push(`Unavailable,${report.inventoryHealth.unavailableCount}`);
    lines.push('');

    // 7. Customers & Procurement
    lines.push(`--- CUSTOMER & PROCUREMENT INSIGHTS ---`);
    lines.push(`Unique Customers,${report.customerInsights.uniqueCustomersCount}`);
    lines.push(`Repeat Customers,${report.customerInsights.repeatCustomersCount}`);
    lines.push(`Repeat Rate,${report.customerInsights.repeatCustomerRate}%`);
    lines.push(`Top Customer,${report.customerInsights.topCustomerName} (₹${report.customerInsights.topCustomerSpend})`);
    lines.push(`Purchase Value,₹${report.procurementSummary.totalPurchaseValue}`);
    lines.push(`Stock Receipts,${report.procurementSummary.receiptsCount}`);
    lines.push(`Top Supplier,${report.procurementSummary.topSupplierName}`);
    lines.push('');

    return lines.join('\n');
  },
};
