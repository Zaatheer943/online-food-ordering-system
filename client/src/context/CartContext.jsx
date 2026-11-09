import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'food_cart';
export const DELIVERY_FEE = 250; // must match server

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (food, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.food_id === food.food_id);
      if (existing) {
        return prev.map((i) => i.food_id === food.food_id ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, { ...food, quantity: qty }];
    });
  };

  const updateQty = (foodId, qty) => {
    setItems((prev) => qty <= 0
      ? prev.filter((i) => i.food_id !== foodId)
      : prev.map((i) => i.food_id === foodId ? { ...i, quantity: qty } : i));
  };

  const removeItem = (foodId) => setItems((prev) => prev.filter((i) => i.food_id !== foodId));
  const clearCart = () => setItems([]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const count = items.reduce((s, i) => s + i.quantity, 0);
    return { subtotal, deliveryFee: items.length ? DELIVERY_FEE : 0, total: subtotal + (items.length ? DELIVERY_FEE : 0), count };
  }, [items]);

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clearCart, totals }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
