"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/lib/cart";
import { loadCart, saveCart, clearCart } from "@/lib/cart";

type CartCtx = {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;

  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  inc: (id_menu: number) => void;
  dec: (id_menu: number) => void;
  remove: (id_menu: number) => void;
  reset: () => void;

  totalQty: number;
  totalPrice: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setItems(loadCart());
  }, []);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const totalQty = useMemo(() => items.reduce((s, it) => s + it.qty, 0), [items]);
  const totalPrice = useMemo(
    () => items.reduce((s, it) => s + Number(it.harga || 0) * it.qty, 0),
    [items]
  );

  function open() {
    setIsOpen(true);
  }
  function close() {
    setIsOpen(false);
  }

  function addItem(item: Omit<CartItem, "qty">, qty = 1) {
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.id_menu === item.id_menu);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty };
        return copy;
      }
      return [...prev, { ...item, qty }];
    });
    setIsOpen(true); // ✅ auto open drawer
  }

  function inc(id_menu: number) {
    setItems((prev) => prev.map((x) => (x.id_menu === id_menu ? { ...x, qty: x.qty + 1 } : x)));
  }

  function dec(id_menu: number) {
    setItems((prev) =>
      prev
        .map((x) => (x.id_menu === id_menu ? { ...x, qty: Math.max(1, x.qty - 1) } : x))
        .filter((x) => x.qty > 0)
    );
  }

  function remove(id_menu: number) {
    setItems((prev) => prev.filter((x) => x.id_menu !== id_menu));
  }

  function reset() {
    setItems([]);
    clearCart();
  }

  const value: CartCtx = {
    items,
    isOpen,
    open,
    close,
    addItem,
    inc,
    dec,
    remove,
    reset,
    totalQty,
    totalPrice,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart harus dipakai di dalam CartProvider");
  return ctx;
}
