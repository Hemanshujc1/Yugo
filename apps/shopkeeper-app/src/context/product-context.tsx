import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types/product';
import { productService } from '../services/product-service';

export interface ProductContextType {
  products: Product[];
  loading: boolean;
  lastStockUpdateTimestamp: string | null;
  refreshProducts: () => Promise<void>;
  addProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<boolean>;
  updateStock: (id: string, quantity: number) => Promise<Product>;
  recordOfflineStockUpdate: (items: { productId: string; quantitySold: number }[]) => Promise<Product[]>;
  updateAvailability: (id: string, availability: boolean) => Promise<Product>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export interface ProductProviderProps {
  children: React.ReactNode;
}

export function ProductProvider({ children }: ProductProviderProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastStockUpdateTimestamp, setLastStockUpdateTimestamp] = useState<string | null>(null);

  const refreshProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts();
      const ts = await productService.getLastStockUpdateTimestamp();
      setProducts(data);
      setLastStockUpdateTimestamp(ts);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const initLoad = async () => {
      if (isMounted) {
        await refreshProducts();
      }
    };
    setTimeout(() => {
      initLoad();
    }, 0);
    return () => {
      isMounted = false;
    };
  }, []);

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct = await productService.createProduct(productData);
    await refreshProducts();
    return newProduct;
  };

  const updateProduct = async (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => {
    const updated = await productService.updateProduct(id, updates);
    await refreshProducts();
    return updated;
  };

  const deleteProduct = async (id: string) => {
    const success = await productService.deleteProduct(id);
    if (success) {
      await refreshProducts();
    }
    return success;
  };

  const updateStock = async (id: string, quantity: number) => {
    const updated = await productService.updateStock(id, quantity);
    await refreshProducts();
    return updated;
  };

  const recordOfflineStockUpdate = async (items: { productId: string; quantitySold: number }[]) => {
    const updated = await productService.recordOfflineStockUpdate(items);
    await refreshProducts();
    return updated;
  };

  const updateAvailability = async (id: string, availability: boolean) => {
    const updated = await productService.updateAvailability(id, availability);
    await refreshProducts();
    return updated;
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        lastStockUpdateTimestamp,
        refreshProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        recordOfflineStockUpdate,
        updateAvailability,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
