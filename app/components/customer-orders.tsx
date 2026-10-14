"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { customerApi, downloadReport, errorMessage, type Order } from "../lib/customer-api";
import { money } from "../data/catalog";
import { ErrorText } from "./customer-auth";
import { useCare } from "./care-store";
import OrdersPanel, { type DisplayOrder } from "./care-orders";

export default function CustomerOrders({ onBack = () => window.history.back(), fromHome = false }: { onBack?: () => void; fromHome?: boolean }) {
  const { account, update, catalog, setCatalog } = useCare(); const [orders, setOrders] = useState<Order[]>([]); const [error, setError] = useState(""); const [loading, setLoading] = useState(false); const [busy, setBusy] = useState(false);
  const generation = useRef(0); const [warning, setWarning] = useState(""); const [cancelId, setCancelId] = useState(""); const [reason, setReason] = useState("");
  const [amendId, setAmendId] = useState(""); const [testIds, setTestIds] = useState<string[]>([]); const [amendMember, setAmendMember] = useState(""); const amendment = useRef<{ fingerprint: string; requestKey: string } | null>(null);
  useEffect(() => { if (!amendId || catalog.length) return; const controller = new AbortController(); customerApi.catalog(controller.signal).then(r => setCatalog(r.data)).catch(e => { if (!controller.signal.aborted) setError(errorMessage(e)); }); return () => controller.abort(); }, [amendId, catalog.length, setCatalog]);
  const load = useCallback(async () => {
    const run = ++generation.current; setLoading(true); setError(""); setWarning("");
    const results = await Promise.allSettled([customerApi.bookings(), customerApi.orders()]);
    if (generation.current !== run) return;
    const combined: Order[] = []; const errors: string[] = [];
    if (results[0].status === "fulfilled") { combined.push(...results[0].value.data); if (results[0].value.statusRefreshFailed) setWarning("Some lab statuses could not be refreshed. Saved bookings are still shown."); } else errors.push(`Lab bookings: ${errorMessage(results[0].reason)}`);
    if (results[1].status === "fulfilled") combined.push(...results[1].value.data); else errors.push(`Product orders: ${errorMessage(results[1].reason)}`);
    try {
      const pendingKey = `merabetta-pending-checkout-${account!.user.id}`;
      const pendingId = sessionStorage.getItem(pendingKey);
      const resolved = combined.find(order => order.id === pendingId);
      if (resolved?.kind === "labs" && !/pending|uncertain|processing/i.test(resolved.status)) {
        sessionStorage.removeItem(pendingKey);
        update(current => { const cart = { ...current.cart }; for (const item of resolved.items) if (item.id) delete cart[item.id]; return { ...current, cart }; });
      }
    } catch { /* Storage may be unavailable; show saved orders regardless. */ }
    setOrders(combined.sort((a, b) => b.date.localeCompare(a.date))); setError(errors.join(" · ")); setLoading(false);
  }, [account, update]);
  useEffect(() => { setOrders([]); void load(); return () => { generation.current++; }; }, [load, account?.user.id]);
  async function action(run: () => Promise<void>) { if (busy) return; setBusy(true); setError(""); try { await run(); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); } }
  async function checkPayment(order: Order) {
    const refreshed = await customerApi.order(order.id); setOrders(current => current.map(o => o.id === order.id ? refreshed : o));
    if (refreshed.paymentStatus === "Paid") {
      let clearPurchased = false;
      try { const key = `merabetta-pending-checkout-${account!.user.id}`; if (sessionStorage.getItem(key) === refreshed.id) { clearPurchased = true; sessionStorage.removeItem(key); } } catch { /* optional storage */ }
      if (clearPurchased) update(current => { const cart = { ...current.cart }; for (const item of refreshed.items) { if (item.id && cart[item.id]) { const remainder = cart[item.id] - item.quantity; if (remainder > 0) cart[item.id] = remainder; else delete cart[item.id]; } } return { ...current, cart }; });
    }
  }
  const displayOrders: DisplayOrder[] = orders.map(order => ({ id:order.id, date:order.date, status:order.status, total:order.total, items:order.items.map(item => ({name:item.name, price:item.price, quantity:item.quantity, kind:order.kind === "labs" ? "lab" : "product"})), slot:[order.collectionDate,order.slot].filter(Boolean).join(" · "), person:{id:"",name:order.kind === "products" ? account?.user.name || "Customer" : "Care recipient",relation:"",phone:"",address:order.address.line1,city:order.address.city,pin:order.address.postalCode} }));
  return <><OrdersPanel orders={displayOrders} fromHome={fromHome} onBack={onBack} statusContent={<><ErrorText message={error}/>{warning && <p role="status">{warning}</p>}{loading && <p>Loading orders…</p>}</>} renderActions={display => {
    const order = orders.find(value => value.id === display.id)!;
    return <div><p>{order.paymentStatus}</p>
      {order.kind === "products" ? <><button className="ca-text-button" disabled={busy} onClick={() => void action(() => checkPayment(order))}>Check payment status</button>{order.paymentUrl && order.paymentStatus !== "Paid" && <a className="ca-text-button" href={safePaymentUrl(order.paymentUrl)} target="_blank" rel="noopener noreferrer">Continue payment</a>}</> : <>
        <button className="ca-text-button" disabled={busy} onClick={() => { setCancelId(order.id); setReason(""); }}>Request cancellation</button><button className="ca-text-button" disabled={busy} onClick={() => { setAmendId(order.id); setTestIds(order.items.flatMap(item => item.id ? [item.id] : [])); setAmendMember(""); }}>Change tests</button>
        {order.reports?.map((report, i) => (report.reportId || report.id) && <button className="ca-text-button" key={i} disabled={busy} onClick={() => void action(() => downloadReport(order.id, (report.reportId || report.id)!))}>Download {report.filename || report.name || "report"}</button>)}
      </>}
    </div>;
  }}/>
    {cancelId && <form className="ca-panel" onSubmit={e => { e.preventDefault(); void action(async () => { await customerApi.cancel(cancelId, reason); setCancelId(""); await load(); }); }}><h3>Cancellation reason</h3><textarea required minLength={3} maxLength={500} value={reason} onChange={e => setReason(e.target.value)}/><button className="ca-button" disabled={busy}>Submit cancellation</button><button type="button" className="ca-text-button" onClick={() => setCancelId("")}>Close</button></form>}
    {amendId && <form className="ca-panel" onSubmit={e => { e.preventDefault(); void action(async () => { const ids = [...new Set(testIds)]; const fingerprint = JSON.stringify([amendId, ids, amendMember]); if (amendment.current?.fingerprint !== fingerprint) amendment.current = { fingerprint, requestKey: crypto.randomUUID() }; await customerApi.amend(amendId, { requestKey: amendment.current.requestKey, testIds: ids, ...(amendMember ? { memberId: amendMember } : {}) }); setAmendId(""); await load(); }); }}><h3>Change booking tests</h3>{catalog.length ? catalog.filter(test => test.available).map(test => <label className="ca-checkbox" key={test.id}><input type="checkbox" checked={testIds.includes(test.id)} onChange={e => setTestIds(current => e.target.checked ? [...current, test.id] : current.filter(id => id !== test.id))}/>{test.name}</label>) : <p>Loading available tests…</p>}<label className="ca-field">Patient<select value={amendMember} onChange={e => setAmendMember(e.target.value)}><option value="">Keep current patient</option>{account?.members.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label><p>The laboratory will verify whether this booking can be changed.</p><button className="ca-button" disabled={busy || !testIds.length || testIds.length > 50}>Submit change</button><button type="button" className="ca-text-button" onClick={() => setAmendId("")}>Close</button></form>}
  </>;
}
export function safePaymentUrl(value: string) { try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? url.href : undefined; } catch { return undefined; } }
