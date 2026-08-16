import { Product } from '../types/product';

// Utility helper for price calculation
export function calculateFinalPrice(price: number, discountPercentage?: number): number {
  if (price < 0) return 0;
  if (!discountPercentage || discountPercentage <= 0) return price;
  if (discountPercentage >= 100) return 0;
  return price - (price * discountPercentage / 100);
}

// Relative time formatting helper (No exact clock timestamps shown!)
export function formatRelativeUpdateTime(timestampString: string | null): string {
  if (!timestampString) return 'Stock update not recorded yet';
  const diffMs = Date.now() - new Date(timestampString).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return 'Updated just now';
  if (diffMins < 60) return `Updated ${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Updated ${diffHours} hr${diffHours === 1 ? '' : 's'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Updated yesterday';
  return `Updated ${diffDays} days ago`;
}

export function isStockStale(timestampString: string | null): boolean {
  if (!timestampString) return true;
  const diffHours = (Date.now() - new Date(timestampString).getTime()) / (1000 * 60 * 60);
  return diffHours >= 24;
}

// Initial mock products conforming to the Product model requirements
let mockProducts: Product[] = [
  {
    id: 'SKU-0543',
    name: 'Premium Coffee Beans',
    category: 'Beverages',
    images: [],
    price: 16.99,
    discountPercentage: 10,
    finalPrice: 15.29,
    stockQuantity: 28,
    lowStockThreshold: 10,
    isAvailable: true,
    availability: true,
    description: 'High-quality arabica coffee beans roasted to perfection.',
    sku: 'SKU-0543',
    barcode: '8901234567890',
    purchaseDate: '2026-08-01',
    expiryDate: '2027-08-01',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'SKU-0217',
    name: 'Organic Yogurt',
    category: 'Dairy',
    images: [],
    price: 4.49,
    discountPercentage: 0,
    finalPrice: 4.49,
    stockQuantity: 9,
    lowStockThreshold: 10,
    isAvailable: true,
    availability: true,
    description: 'Creamy organic Greek yogurt with no added sugar.',
    sku: 'SKU-0217',
    barcode: '8901234567891',
    purchaseDate: '2026-08-10',
    expiryDate: '2026-09-10',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'SKU-0302',
    name: 'Gluten-Free Bread',
    category: 'Bakery',
    images: [],
    price: 5.99,
    discountPercentage: 20,
    finalPrice: 4.79,
    stockQuantity: 0,
    lowStockThreshold: 5,
    isAvailable: false,
    availability: false,
    description: 'Soft and delicious gluten-free sliced bread.',
    sku: 'SKU-0302',
    barcode: '8901234567892',
    purchaseDate: '2026-08-12',
    expiryDate: '2026-08-20',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'SKU-0188',
    name: 'Sparkling Water',
    category: 'Beverages',
    images: [],
    price: 2.49,
    discountPercentage: 0,
    finalPrice: 2.49,
    stockQuantity: 74,
    lowStockThreshold: 15,
    isAvailable: true,
    availability: true,
    description: 'Refreshing sparkling mineral water.',
    sku: 'SKU-0188',
    barcode: '8901234567893',
    purchaseDate: '2026-08-05',
    expiryDate: '2028-08-05',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let lastStockUpdateTimestamp: string | null = null;

export const productService = {
  getProducts: async (): Promise<Product[]> => {
    return [...mockProducts];
  },

  getProductById: async (id: string): Promise<Product | undefined> => {
    return mockProducts.find((p) => p.id === id);
  },

  getLastStockUpdateTimestamp: async (): Promise<string | null> => {
    return lastStockUpdateTimestamp;
  },

  createProduct: async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    if (productData.price < 0) throw new Error('Price cannot be negative');
    if (productData.stockQuantity < 0) throw new Error('Stock quantity cannot be negative');
    if (productData.discountPercentage !== undefined && (productData.discountPercentage < 0 || productData.discountPercentage > 100)) {
      throw new Error('Discount percentage must be between 0 and 100');
    }

    const finalPrice = calculateFinalPrice(productData.price, productData.discountPercentage);

    const newProduct: Product = {
      ...productData,
      finalPrice,
      id: productData.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockProducts.push(newProduct);
    return newProduct;
  },

  updateProduct: async (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Product> => {
    const index = mockProducts.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Product with ID ${id} not found`);
    }

    const current = mockProducts[index];
    const newPrice = updates.price !== undefined ? updates.price : current.price;
    const newDiscount = updates.discountPercentage !== undefined ? updates.discountPercentage : current.discountPercentage;

    if (newPrice < 0) throw new Error('Price cannot be negative');
    if (updates.stockQuantity !== undefined && updates.stockQuantity < 0) throw new Error('Stock quantity cannot be negative');
    if (newDiscount !== undefined && (newDiscount < 0 || newDiscount > 100)) {
      throw new Error('Discount percentage must be between 0 and 100');
    }

    const finalPrice = calculateFinalPrice(newPrice, newDiscount);

    const updatedProduct: Product = {
      ...current,
      ...updates,
      finalPrice,
      updatedAt: new Date().toISOString(),
    };
    mockProducts[index] = updatedProduct;
    return updatedProduct;
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    const initialLength = mockProducts.length;
    mockProducts = mockProducts.filter((p) => p.id !== id);
    return mockProducts.length < initialLength;
  },

  updateStock: async (id: string, quantity: number): Promise<Product> => {
    if (quantity < 0) throw new Error('Stock quantity cannot be negative');
    lastStockUpdateTimestamp = new Date().toISOString();
    return productService.updateProduct(id, { stockQuantity: quantity });
  },

  recordOfflineStockUpdate: async (items: { productId: string; quantitySold: number }[]): Promise<Product[]> => {
    const updatedProducts: Product[] = [];
    for (const item of items) {
      const product = mockProducts.find((p) => p.id === item.productId);
      if (product) {
        const newStock = Math.max(0, product.stockQuantity - item.quantitySold);
        const updated = await productService.updateProduct(product.id, { stockQuantity: newStock });
        updatedProducts.push(updated);
      }
    }
    lastStockUpdateTimestamp = new Date().toISOString();
    return updatedProducts;
  },

  updateAvailability: async (id: string, isAvailable: boolean): Promise<Product> => {
    return productService.updateProduct(id, { isAvailable, availability: isAvailable });
  },
};

// UI Compatibility layer mapping
export interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: string;
  originalPrice?: string;
  discountPercentage?: number;
  quantity: number;
  isAvailable: boolean;
  status: 'In stock' | 'Low stock' | 'Out of stock' | 'Unavailable';
}

export function mapProductToItem(p: Product): ProductItem {
  let status: 'In stock' | 'Low stock' | 'Out of stock' | 'Unavailable' = 'In stock';
  if (!p.isAvailable) {
    status = 'Unavailable';
  } else if (p.stockQuantity === 0) {
    status = 'Out of stock';
  } else if (p.stockQuantity <= (p.lowStockThreshold ?? 10)) {
    status = 'Low stock';
  }

  const hasDiscount = p.discountPercentage !== undefined && p.discountPercentage > 0;
  const displayPrice = p.finalPrice !== undefined ? p.finalPrice : calculateFinalPrice(p.price, p.discountPercentage);

  return {
    id: p.id,
    name: p.name,
    category: p.category,
    price: `$${displayPrice.toFixed(2)}`,
    originalPrice: hasDiscount ? `$${p.price.toFixed(2)}` : undefined,
    discountPercentage: hasDiscount ? p.discountPercentage : undefined,
    quantity: p.stockQuantity,
    isAvailable: p.isAvailable,
    status,
  };
}
