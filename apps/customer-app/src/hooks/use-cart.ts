import { useCallback, useMemo } from 'react';
import { useCartStore } from '@/store/cart.store';
import type { Product } from '@/types/product.types';

export function useCart() {
  const { items, addItem, removeItem, updateQuantity, clearCart, getTotal, getItemCount } =
    useCartStore();

  const total = useMemo(() => getTotal(), [items, getTotal]);
  const itemCount = useMemo(() => getItemCount(), [items, getItemCount]);

  const deliveryFee = useMemo(() => (total >= 299 ? 0 : 30), [total]);
  const taxes = useMemo(() => Math.round(total * 0.05), [total]);
  const grandTotal = useMemo(
    () => total + deliveryFee + taxes,
    [total, deliveryFee, taxes],
  );

  const getQuantity = useCallback(
    (productId: string): number => {
      const item = items.find((i) => i.product.id === productId);
      return item?.quantity ?? 0;
    },
    [items],
  );

  const isInCart = useCallback(
    (productId: string): boolean => {
      return items.some((i) => i.product.id === productId);
    },
    [items],
  );

  const handleAddItem = useCallback(
    (product: Product) => {
      addItem(product);
    },
    [addItem],
  );

  const handleUpdateQuantity = useCallback(
    (productId: string, quantity: number) => {
      updateQuantity(productId, quantity);
    },
    [updateQuantity],
  );

  return {
    items,
    total,
    itemCount,
    deliveryFee,
    taxes,
    grandTotal,
    addItem: handleAddItem,
    removeItem,
    updateQuantity: handleUpdateQuantity,
    clearCart,
    getQuantity,
    isInCart,
  };
}
