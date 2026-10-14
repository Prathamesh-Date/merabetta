"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { customerApi, ApiError, apiConfigured, errorMessage, type Account, type Test } from "../lib/customer-api";
import { labListings, products } from "../data/catalog";

export type Person = { id: string; name: string; relation: string; phone: string; address: string; city: string; pin: string };
export type Order = { id: string; date: string; items: { name: string; quantity: number; price: number; kind?: "product" | "lab" }[]; total: number; person: Person; slot: string; status: "Confirmed" | "Delivered" | "Cancelled" };
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
  account: Account | null; sessionError: string; sessionLoading: boolean;
  setAccount: (account: Account) => void; restoreSession: () => Promise<void>; clearPrivate: () => void;
  catalog: Test[]; setCatalog: (tests: Test[]) => void;
} | null>(null);

export function CareProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SavedState>(empty);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [account, saveAccount] = useState<Account | null>(null);
  const [sessionError, setSessionError] = useState("");
  const [sessionLoading, setSessionLoading] = useState(apiConfigured);
  const [catalog, setCatalog] = useState<Test[]>([]);
  const accountId = useRef("");
  const clearPrivate = useCallback(() => {
    try { if (accountId.current) sessionStorage.removeItem(`merabetta-pending-checkout-${accountId.current}`); } catch { /* optional browser storage */ }
    accountId.current = ""; saveAccount(null); setCatalog([]); setState(empty);
  }, []);
  const setAccount = useCallback((value: Account) => {
    const changedAccount = accountId.current && accountId.current !== value.user.id;
    if (changedAccount) { try { sessionStorage.removeItem(`merabetta-pending-checkout-${accountId.current}`); } catch { /* optional browser storage */ } setCatalog([]); }
    accountId.current = value.user.id;
    saveAccount(value); setSessionError("");
    setState(current => ({ ...(changedAccount ? empty : current), profile: { name: value.user.name || `${value.user.firstName ?? ""} ${value.user.lastName ?? ""}`.trim(), email: value.user.email ?? "" }, people: [], orders: [] }));
  }, []);
  const expireSession = useCallback(() => {
    if (accountId.current) { clearPrivate(); return; }
    // An anonymous visitor has no private session to clear. Keep their basket.
    saveAccount(null);
    setState(current => ({ ...current, profile: null, people: [], orders: [] }));
  }, [clearPrivate]);
  const restoreSession = useCallback(async () => {
    if (!apiConfigured) { setSessionLoading(false); return; }
    setSessionLoading(true); setSessionError("");
    try { setAccount(await customerApi.me()); }
    catch (error) { if (error instanceof ApiError && error.status === 401) expireSession(); else setSessionError(errorMessage(error)); }
    finally { setSessionLoading(false); }
  }, [setAccount, expireSession]);
  useEffect(() => { void restoreSession(); window.addEventListener("merabetta-session-expired", expireSession); return () => window.removeEventListener("merabetta-session-expired", expireSession); }, [restoreSession, expireSession]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const data = JSON.parse(raw);
        // Only restore supported cart IDs and quantities from browser storage.
        const cart = Object.fromEntries(Object.entries(data.cart ?? {}).filter(([id, count]) => (validIds.has(id) || /^redcliffe:[^\s]{1,85}$/.test(id)) && Number.isInteger(count) && Number(count) > 0 && Number(count) <= 99));
        setState({ ...empty, cart: cart as Record<string, number>, wishlist: Array.isArray(data.wishlist) ? data.wishlist.filter((id: string) => typeof id === "string" && (validIds.has(id) || /^redcliffe:[^\s]{1,85}$/.test(id))) : [], coupon: data.coupon === true });
      }
    } catch { setNotice("Saved details could not be loaded on this device."); }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(key, JSON.stringify({ cart: state.cart, wishlist: state.wishlist, coupon: state.coupon })); }
    catch { setNotice("Changes could not be saved on this device. Keep this tab open to continue."); }
  }, [state, ready]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);
  function quantity(id: string, count: number) {
    if (count > 0 && !validIds.has(id) && !catalog.some(test => test.id === id)) return;
    setState(current => {
      const cart = { ...current.cart };
      if (count <= 0) delete cart[id]; else cart[id] = catalog.some(test => test.id === id) ? 1 : Math.min(99, count);
      return { ...current, cart };
    });
  }
  return <Context.Provider value={{ state, ready, notice, update: setState, quantity, announce: setNotice, account, sessionError, sessionLoading, setAccount, restoreSession, clearPrivate, catalog, setCatalog,
    add(id, count = 1) { if (!validIds.has(id) && !catalog.some(test => test.id === id)) return; setState(current => ({ ...current, cart: { ...current.cart, [id]: catalog.some(test => test.id === id) ? 1 : Math.min(99, (current.cart[id] ?? 0) + count) } })); setNotice("Added to your cart"); },
    wish(id) { setState(current => ({ ...current, wishlist: current.wishlist.includes(id) ? current.wishlist.filter(value => value !== id) : [...current.wishlist, id] })); },
  }}>{children}</Context.Provider>;
}
export function useCare() {
  const context = useContext(Context);
  if (!context) throw new Error("CareProvider is required");
  return context;
}
