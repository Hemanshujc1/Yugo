import { create } from 'zustand';
import type { CartItem } from '@/types/cart.types';
import type { Product } from '@/types/product.types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  addItem: (product: Product) => {
    const { items } = get();
    const existing = items.find((item) => item.product.id === product.id);
    if (existing) {
      set({
        items: items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      });
    } else {
      set({ items: [...items, { product, quantity: 1 }] });
    }
  },
  removeItem: (productId: string) => {
    set({ items: get().items.filter((item) => item.product.id !== productId) });
  },
  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      set({ items: get().items.filter((item) => item.product.id !== productId) });
    } else {
      set({
        items: get().items.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item,
        ),
      });
    }
  },
  clearCart: () => set({ items: [] }),
  getTotal: (): number => {
    return get().items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
  },
  getItemCount: (): number => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
