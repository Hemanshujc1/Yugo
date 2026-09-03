/**
 * Format numbers as Indian Rupee currency strings (e.g. ₹2,495, ₹0, -₹124, ₹12,50,000)
 */
export function formatCurrencyINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  const formattedAbs = absVal.toLocaleString('en-IN');
  return isNegative ? `-₹${formattedAbs}` : `₹${formattedAbs}`;
}

