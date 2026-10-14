"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { money, tests } from "../data/catalog";
import type { Order } from "./care-store";
import CareIcon from "./care-icon";
import styles from "./care-orders.module.css";

const statuses = [
  { id: "all", label: "All Orders", icon: "report" },
  { id: "processing", label: "Processing", icon: "clock" },
  { id: "delivered", label: "Delivered", icon: "check" },
  { id: "cancelled", label: "Cancelled", icon: "close" },
] as const;
export type DisplayOrder = Omit<Order, "status"> & { status: string };

function itemKind(item: Order["items"][number]) {
  return item.kind ?? (tests.some(test => item.name.startsWith(`${test.name} · `)) ? "lab" : "product");
}

export default function OrdersPanel({ orders, fromHome, onBack, renderActions, statusContent }: { orders: DisplayOrder[]; fromHome: boolean; onBack: () => void; renderActions?: (order: DisplayOrder) => ReactNode; statusContent?: ReactNode }) {
  const router = useRouter();
  const [kind, setKind] = useState<"product" | "lab">("product");
  const [status, setStatus] = useState("all");
  const matchingOrders = orders.filter(order => order.items.some(item => itemKind(item) === kind));
  const visible = matchingOrders.filter(order => status === "all" || (status === "processing" && !/delivered|completed|cancelled|canceled/i.test(order.status)) || (status === "delivered" && /delivered|completed/i.test(order.status)) || (status === "cancelled" && /cancelled|canceled/i.test(order.status)));
  const isLab = kind === "lab";
  function back() {
    if (!fromHome) { onBack(); return; }
    if (window.history.length > 1) router.back();
    else router.replace("/#care-your-way-title");
  }
  return <section className={`${styles.page} ${styles.ordersPage}`}>
    <header className={`ca-profile-heading ${styles.heading}`}>
      <button type="button" onClick={back} aria-label={fromHome ? "Back to home" : "Back to profile"}><CareIcon name="back" size={27}/></button>
      <h1>My Orders</h1>
      <Link href={`/profile?tab=wishlist${fromHome ? "&from=home" : ""}`} aria-label="View wishlist"><CareIcon name="heart" size={27}/></Link>
    </header>
    {statusContent}
    <div className={styles.tabs} aria-label="Order type">
      <button type="button" aria-pressed={!isLab} className={!isLab ? styles.activeTab : ""} onClick={() => setKind("product")}><CareIcon name="bag" size={24}/>Products</button>
      <button type="button" aria-pressed={isLab} className={isLab ? styles.activeTab : ""} onClick={() => setKind("lab")}><CareIcon name="lab" size={24}/>Labs</button>
    </div>
    <div className={styles.filters}>
      <p>Filter by status</p>
      <div className={styles.chips} aria-label="Order status">
        {statuses.map(filter => <button type="button" key={filter.id} aria-pressed={status === filter.id} onClick={() => setStatus(filter.id)} className={`${styles[filter.id]} ${status === filter.id ? styles.selected : ""}`}><CareIcon name={filter.icon} size={16}/>{filter.label}{status === filter.id && <CareIcon name="check" size={16}/>}</button>)}
      </div>
    </div>
    <div className={styles.results} aria-live="polite">
      {visible.length ? <div className={styles.list}>{visible.map(order => <article key={order.id} className={styles.order}>
        <div className={styles.orderHeading}><span className={styles.orderIcon}><CareIcon name={isLab ? "lab" : "bag"}/></span><div><h2>{order.id}</h2><p>{new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {order.person.name}</p></div><span className={`${styles.status} ${styles[order.status === "Cancelled" ? "cancelled" : order.status === "Delivered" ? "delivered" : "processing"]}`}>{order.status === "Confirmed" ? "Processing" : order.status}</span></div>
        <ul>{order.items.filter(item => itemKind(item) === kind).map((item, index) => <li key={`${item.name}:${index}`}><span>{item.name}<small>Qty {item.quantity}</small></span><strong>{money(item.price * item.quantity)}</strong></li>)}</ul>
        <div className={styles.orderFooter}><span>{order.slot}</span><strong>Order total {money(order.total)}</strong></div>
        {renderActions?.(order)}
      </article>)}</div> : <div className={styles.empty}>
        <span className={styles.emptyIcon}><CareIcon name={isLab ? "lab" : "bag"} size={48}/></span>
        <h2>{matchingOrders.length ? `No ${status} ${isLab ? "lab" : "product"} orders` : isLab ? "No lab bookings yet" : "No product orders yet"}</h2>
        <p>{matchingOrders.length ? "Try another status to find your orders." : isLab ? "Your lab bookings will appear here after checkout." : "Your care essentials will appear here after checkout."}</p>
        {matchingOrders.length ? <button type="button" className={styles.action} onClick={() => setStatus("all")}>View all orders <CareIcon name="arrow" size={20}/></button> : <Link href={isLab ? "/labtest" : "/products"} className={styles.action}>{isLab ? "Explore lab tests" : "Start shopping"}<CareIcon name="arrow" size={20}/></Link>}
      </div>}
    </div>
  </section>;
}
