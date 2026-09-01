export function getStockUnitLabel(category?: string, variant?: string, unit?: string): string {
  const cat = (category || '').toLowerCase();
  const varStr = (variant || '').toLowerCase();
  const unitStr = (unit || '').toLowerCase();

  if (varStr.includes('bottle') || cat.includes('beverage') || cat.includes('drink')) {
    if (varStr.includes('can')) return 'cans';
    return 'bottles';
  }

  if (cat.includes('personal care') || cat.includes('cleaning') || cat.includes('household')) {
    if (varStr.includes('soap') || varStr.includes('bar')) return 'bars';
    if (varStr.includes('tube') || varStr.includes('paste')) return 'tubes';
    if (varStr.includes('bottle') || varStr.includes('liquid') || varStr.includes('cleaner')) return 'bottles';
    if (varStr.includes('pack') || varStr.includes('refill')) return 'packs';
    return 'pcs';
  }

  if (cat.includes('dairy')) {
    if (varStr.includes('milk') || varStr.includes('curd') || varStr.includes('yogurt')) return 'packs';
    if (varStr.includes('butter') || varStr.includes('cheese') || varStr.includes('paneer')) return 'blocks';
    return 'packs';
  }

  if (cat.includes('staples') || cat.includes('snacks') || cat.includes('bakery') || cat.includes('spices') || cat.includes('packaged food')) {
    if (varStr.includes('bread') || varStr.includes('biscuit') || varStr.includes('atta') || varStr.includes('rice') || varStr.includes('salt') || varStr.includes('dal') || varStr.includes('noodle')) {
      return 'packets';
    }
    return 'packs';
  }

  if (cat.includes('stationery') || cat.includes('baby care')) {
    if (varStr.includes('diaper') || varStr.includes('pen') || varStr.includes('book')) return 'pieces';
    return 'pcs';
  }

  if (unitStr === 'kg' || unitStr === 'g') return 'packets';
  if (unitStr === 'l' || unitStr === 'ml') return 'bottles';

  return 'units';
}
