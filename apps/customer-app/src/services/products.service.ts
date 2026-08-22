import { MOCK_PRODUCTS } from '@/constants/mock-data';
import type { Product } from '@/types/product.types';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getProducts(category?: string): Promise<Product[]> {
  await delay(500);
  if (category) {
    return MOCK_PRODUCTS.filter((p) => p.category === category);
  }
  return MOCK_PRODUCTS;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  await delay(500);
  return MOCK_PRODUCTS.find((p) => p.id === id);
}

export async function searchProducts(query: string): Promise<Product[]> {
  await delay(300);
  const lowerQuery = query.toLowerCase();
  return MOCK_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery),
  );
}

export async function getFeaturedProducts(): Promise<Product[]> {
  await delay(500);
  return MOCK_PRODUCTS.filter((p) => p.discount >= 14);
}
