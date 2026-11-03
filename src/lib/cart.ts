import { useSyncExternalStore } from "react";

// Lightweight browser-only cart (no backend). Stores product ids + quantities.
export type CartLine = { id: string; qty: number };
const KEY = "nakashi-cart";
const listeners = new Set<() => void>();
let cache: CartLine[] | null = null;
const EMPTY: CartLine[] = [];

function read(): CartLine[] {
  if (typeof window === "undefined") return EMPTY;
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    cache = [];
  }
  return cache!;
}
function write(lines: CartLine[]) {
  cache = lines;
  localStorage.setItem(KEY, JSON.stringify(lines));
  listeners.forEach((l) => l());
}

export const cart = {
  add(id: string, qty: number = 1) {
    const validQty = Math.max(1, qty || 1);
    const lines = read();
    const ex = lines.find((l) => l.id === id);
    write(
      ex
        ? lines.map((l) => (l.id === id ? { ...l, qty: l.qty + validQty } : l))
        : [...lines, { id, qty: validQty }],
    );
  },
  setQty(id: string, qty: number) {
    if (qty <= 0) {
      cart.remove(id);
      return;
    }
    const lines = read();
    write(lines.map((l) => (l.id === id ? { ...l, qty } : l)));
  },
  remove(id: string) {
    write(read().filter((l) => l.id !== id));
  },
  clear() {
    write([]);
  },
};

export function useCart() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => EMPTY,
  );
}

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty, 0);
