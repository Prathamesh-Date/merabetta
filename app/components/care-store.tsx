"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { labListings, products } from "../data/catalog";

export type Person = { id: string; name: string; relation: string; phone: string; address: string; city: string; pin: string };
export type Order = { id: string; date: string; items: { name: string; quantity: number; price: number }[]; total: number; person: Person; slot: string; status: "Confirmed" | "Cancelled" };
type SavedState = { cart: Record<string, number>; wishlist: string[]; people: Person[]; orders: Order[]; profile: { name: string; email: string } | null; coupon: boolean };
const empty: SavedState = { cart: {}, wishlist: [], people: [], orders: [], profile: null, coupon: false };
const key = "merabetta-web-v2";
const validIds = new Set([...products, ...labListings].map(item => item.id));
const Context = createContext<{
  state: SavedState; ready: boolean; notice: string;
  update: (action: (current: SavedState) => SavedState) => void;
  add: (id: string, quantity?: number) => void;
  quantity: (id: string, quantity: number) => void;
  wish: (id: string) => void;
  announce: (message: string) => void;
} | null>(null);

export function CareProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SavedState>(empty);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const data = JSON.parse(raw);
        // Only restore supported cart IDs and quantities from browser storage.
        const cart = Object.fromEntries(Object.entries(data.cart ?? {}).filter(([id, count]) => validIds.has(id) && Number.isInteger(count) && Number(count) > 0 && Number(count) <= 99));
        setState({ ...empty, cart: cart as Record<string, number>, wishlist: Array.isArray(data.wishlist) ? data.wishlist.filter((id: string) => validIds.has(id)) : [], people: Array.isArray(data.people) ? data.people.filter((p: Person) => p && typeof p.id === "string" && typeof p.name === "string") : [], orders: Array.isArray(data.orders) ? data.orders.filter((o: Order) => o && typeof o.id === "string" && Array.isArray(o.items) && o.person && Number.isFinite(o.total)) : [], profile: data.profile && typeof data.profile.email === "string" && typeof data.profile.name === "string" ? data.profile : null, coupon: data.coupon === true });
      }
    } catch { setNotice("Saved details could not be loaded on this device."); }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(key, JSON.stringify(state)); }
    catch { setNotice("Changes could not be saved on this device. Keep this tab open to continue."); }
  }, [state, ready]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);
  function quantity(id: string, count: number) {
    if (!validIds.has(id)) return;
    setState(current => {
      const cart = { ...current.cart };
      if (count <= 0) delete cart[id]; else cart[id] = Math.min(99, count);
      return { ...current, cart };
    });
  }
  return <Context.Provider value={{ state, ready, notice, update: setState, quantity, announce: setNotice,
    add(id, count = 1) { if (!validIds.has(id)) return; setState(current => ({ ...current, cart: { ...current.cart, [id]: Math.min(99, (current.cart[id] ?? 0) + count) } })); setNotice("Added to your cart"); },
    wish(id) { setState(current => ({ ...current, wishlist: current.wishlist.includes(id) ? current.wishlist.filter(value => value !== id) : [...current.wishlist, id] })); },
  }}>{children}</Context.Provider>;
}
export function useCare() {
  const context = useContext(Context);
  if (!context) throw new Error("CareProvider is required");
  return context;
}
