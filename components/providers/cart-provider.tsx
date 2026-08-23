"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartOption = { kind: string; key: string; label: string; delta: number };

export type CartItem = {
  key: string; // slug + options signature
  product_id: string;
  slug: string;
  name: string;
  image: string;
  tone: string;
  unitPrice: number;
  options: CartOption[];
  qty: number;
};

type CartCtxValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  ready: boolean;
  add: (item: Omit<CartItem, "key" | "qty">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const CartCtx = createContext<CartCtxValue>({
  items: [],
  count: 0,
  subtotal: 0,
  ready: false,
  add: () => {},
  setQty: () => {},
  remove: () => {},
  clear: () => {},
});

const STORAGE_KEY = "qg-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* corrupted cart → start fresh */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const add = useCallback(
    (item: Omit<CartItem, "key" | "qty">, qty = 1) => {
      const key =
        item.slug +
        "::" +
        item.options.map((o) => `${o.kind}=${o.key}`).join("|");
      setItems((prev) => {
        const found = prev.find((i) => i.key === key);
        if (found) {
          return prev.map((i) =>
            i.key === key ? { ...i, qty: Math.min(20, i.qty + qty) } : i
          );
        }
        return [...prev, { ...item, key, qty }];
      });
    },
    []
  );

  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.key !== key)
        : prev.map((i) => (i.key === key ? { ...i, qty: Math.min(20, qty) } : i))
    );
  }, []);

  const remove = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const { count, subtotal } = useMemo(
    () => ({
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((n, i) => n + i.qty * i.unitPrice, 0),
    }),
    [items]
  );

  const value = useMemo(
    () => ({ items, count, subtotal, ready, add, setQty, remove, clear }),
    [items, count, subtotal, ready, add, setQty, remove, clear]
  );

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export const useCart = () => useContext(CartCtx);
