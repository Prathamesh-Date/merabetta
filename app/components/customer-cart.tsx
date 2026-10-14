"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { customerApi, cleanAddress, ApiError, errorMessage, type Address, type Booking, type Checkout, type Slot } from "../lib/customer-api";
import { products, money, labListings, asset } from "../data/catalog";
import { useCare } from "./care-store";
import CareShell from "./care-shell";
import CareIcon from "./care-icon";
import HistoryBackButton from "./history-back-button";
import { Quantity } from "./care-catalog";
import orderStyles from "./care-orders.module.css";
import cartStyles from "./customer-cart.module.css";
import { ErrorText, SessionGate } from "./customer-auth";
import { blankAddress } from "./customer-address";
import CheckoutDelivery from "./checkout-delivery";
import LabCheckout from "./lab-checkout";
import { safePaymentUrl } from "./customer-orders";
import { testImage } from "./customer-labs";
import { publicLabCatalog, resolvePublicTest } from "../data/public-lab-catalog";

export default function CustomerCart({ appointment = false }: { appointment?: boolean }) {
  const [checkout, setCheckout] = useState(appointment);
  return <CareShell mainClassName={`${orderStyles.main} ${cartStyles.cartMain} ${checkout ? cartStyles.checkoutMain : ""}`}><CheckoutForm appointment={appointment} checkout={checkout} setCheckout={setCheckout}/></CareShell>;
}
function CheckoutForm({ appointment, checkout, setCheckout }: { appointment: boolean; checkout: boolean; setCheckout: (checkout: boolean) => void }) {
  const { state, account, catalog, setCatalog, quantity, update } = useCare();
  const [cartKind, setCartKind] = useState<"products" | "labs" | null>(appointment ? "labs" : null);
  const isLabItem = (id: string) => id.startsWith("redcliffe:") || catalog.some(test => test.id === id) || publicLabCatalog.some(test => test.id === id) || labListings.some(test => test.id === id);
  const selectedKind = cartKind ?? (Object.keys(state.cart).length > 0 && Object.keys(state.cart).every(isLabItem) ? "labs" : "products");
  const cartEntries = Object.entries(state.cart).filter(([id]) => !account || isLabItem(id) === (selectedKind === "labs"));
  const [address, setAddress] = useState<Address>(account?.addresses[0] ?? blankAddress); const [memberId, setMemberId] = useState(account?.members[0]?.id ?? "");
  const [dates, setDates] = useState<string[]>([]); const [date, setDate] = useState(""); const [slots, setSlots] = useState<Slot[]>([]); const [slotId, setSlotId] = useState(""); const [slotMessage, setSlotMessage] = useState(""); const [slotsLoading, setSlotsLoading] = useState(false);
  const [notes, setNotes] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const [uncertain, setUncertain] = useState(false); const [receipt, setReceipt] = useState<{ id: string; message: string; paymentUrl?: string } | null>(null);
  const lock = useRef(false); const attempt = useRef<{ kind: "labs" | "products"; fingerprint: string; body: Booking | Checkout } | null>(null);
  const [reloadPending, setReloadPending] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [labCoupon, setLabCoupon] = useState("");
  const [labCouponAttempted, setLabCouponAttempted] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [labReadyForBooking, setLabReadyForBooking] = useState(false);
  const paymentDialog = useRef<HTMLDialogElement>(null);
  const [reviewed, setReviewed] = useState(false); const [recent, setRecent] = useState<{ id: string; status: string }[]>([]);
  const pendingKey = `merabetta-pending-checkout-${account?.user.id ?? "guest"}`;
  useEffect(() => { if (!account) return; try { setReloadPending(Boolean(sessionStorage.getItem(pendingKey))); } catch { /* in-memory attempt remains available */ } }, [pendingKey, account?.user.id]);
  useEffect(() => { if (account) { setAddress(account.addresses[0] ?? blankAddress); setMemberId(account.members[0]?.id ?? ""); } }, [account?.user.id, account?.user.profileCompleted]);
  const cartIds = Object.keys(state.cart).join("|");
  useEffect(() => { if (!account?.user.profileCompleted || !Object.keys(state.cart).some(id => id.startsWith("redcliffe:") || publicLabCatalog.some(test => test.id === id)) || catalog.length) return; const controller = new AbortController(); customerApi.catalog(controller.signal).then(r => setCatalog(r.data)).catch(e => { if (!controller.signal.aborted) setError(errorMessage(e)); }); return () => controller.abort(); }, [cartIds, catalog.length, setCatalog, account?.user.profileCompleted]);
  useEffect(() => {
    if (!account?.user.profileCompleted || !catalog.length) return;
    update(current => {
      const cart = { ...current.cart }; let changed = false;
      for (const id of Object.keys(cart)) {
        const preview = publicLabCatalog.find(test => test.id === id);
        const live = preview && resolvePublicTest(preview,catalog);
        if (live) { delete cart[id]; cart[live.id] = 1; changed = true; }
      }
      return changed ? { ...current,cart } : current;
    });
  }, [catalog,cartIds,account?.user.profileCompleted,update]);
  const items = cartEntries.flatMap(([id, count]) => { const test = catalog.find(t => t.id === id) || publicLabCatalog.find(t => t.id === id); if (test) return [{ id, name: test.name, subtitle: test.labName, image: testImage(test), price: test.price, mrp: test.mrp, quantity: 1, lab: true, available: test.available }]; const product = products.find(p => p.id === id); if (product) return [{ id, name: product.name, subtitle: product.subtitle, image: asset(product.image), price: product.price, mrp: product.mrp, quantity: count, lab: false, available: true }]; return []; });
  const hasLab = items.some(item => item.lab); const hasProduct = items.some(item => !item.lab); const mixed = hasLab && hasProduct;
  const legacyLab = cartEntries.some(([id]) => labListings.some(listing => listing.id === id));
  const unresolved = cartEntries.some(([id]) => !items.some(item => item.id === id));
  const blockedProduct = hasProduct && process.env.NEXT_PUBLIC_PRODUCT_CHECKOUT_ENABLED !== "true";
  useEffect(() => { if (!hasLab || !account?.user.profileCompleted) return; const controller = new AbortController(); customerApi.dates(controller.signal).then(r => setDates(r.dates)).catch(e => { if (!controller.signal.aborted) setError(errorMessage(e)); }); return () => controller.abort(); }, [hasLab, account?.user.profileCompleted]);
  const lat = address.location?.latitude; const lon = address.location?.longitude;
  const selectionKey = `${date}|${lat}|${lon}`; const selectedSlotKey = useRef("");
  useEffect(() => {
    setSlotId(""); selectedSlotKey.current = ""; setSlots([]); setSlotMessage(""); setSlotsLoading(false);
    if (!date || !address.location || !hasLab) return;
    const controller = new AbortController(); setSlotsLoading(true);
    customerApi.slots(date, address.location, controller.signal).then(r => { if (!controller.signal.aborted) { setSlots(r.serviceable ? r.slots : []); setSlotMessage(r.message); } }).catch(e => { if (!controller.signal.aborted) setSlotMessage(errorMessage(e)); }).finally(() => { if (!controller.signal.aborted) setSlotsLoading(false); });
    return () => controller.abort();
  }, [date, lat, lon, hasLab]);
  function invalidateAddress(next: Address) { setAddress(next); setSlotId(""); selectedSlotKey.current = ""; }
  async function reviewHistory() {
    if (lock.current || !attempt.current) return;
    lock.current = true; setBusy(true); setError("");
    try {
      const history = attempt.current.kind === "labs" ? await customerApi.bookings() : await customerApi.orders();
      const matched = history.data.find(order => order.requestKey === attempt.current?.body.requestKey);
      if (matched) setReceipt({ id: matched.id, message: `Saved order status: ${matched.status}. Check My Orders for the latest state.`, paymentUrl: matched.paymentUrl ? safePaymentUrl(matched.paymentUrl) : undefined });
      else { setRecent(history.data.slice(0, 5).map(order => ({ id: order.id, status: order.status }))); setReviewed(true); }
    } catch (e) { setError(errorMessage(e)); }
    finally { lock.current = false; setBusy(false); }
  }
  async function submit(retrySame = false, continueToPayment = false) {
    if (!account?.user.profileCompleted || lock.current || (uncertain && !(retrySame && reviewed && attempt.current)) || reloadPending || !items.length) return;
    if (mixed || legacyLab || unresolved || blockedProduct) { setError("Review the cart notices before checkout."); return; }
    if (hasLab && (!memberId || !address.location || selectedSlotKey.current !== selectionKey || !slots.some(slot => slot.id === slotId && slot.available))) { setError("Select a patient, collection pin, date and available slot."); return; }
    const base = { items: items.map(item => ({ id: item.id, quantity: item.quantity })), address: cleanAddress(address), notes };
    const fields = hasLab ? { ...base, memberId, collectionDate: date, slotId } : { ...base, coupon: state.coupon };
    const fingerprint = JSON.stringify(fields);
    if (!retrySame && attempt.current?.fingerprint !== fingerprint) attempt.current = { kind: hasLab ? "labs" : "products", fingerprint, body: { ...fields, requestKey: crypto.randomUUID() } };
    if (!attempt.current) return;
    setReviewed(false);
    lock.current = true; setBusy(true); setError("");
    try {
      // Store only the attempt UUID; patient/address payloads stay in memory.
      try { sessionStorage.setItem(pendingKey, attempt.current.body.requestKey); } catch { /* Keep the stable attempt in memory when storage is disabled. */ }
      const result = attempt.current.kind === "labs" ? await customerApi.book(attempt.current.body as Booking) : await customerApi.checkout(attempt.current.body);
      const order = result.data;
      try { sessionStorage.setItem(pendingKey, order.id); } catch { /* Receipt remains visible in this tab. */ }
      if (hasLab && result.status !== 202) { update(current => { const cart = { ...current.cart }; for (const item of items) delete cart[item.id]; return { ...current, cart }; }); sessionStorage.removeItem(pendingKey); }
      if (!hasLab && order.paymentStatus === "Paid") { update(current => { const cart = { ...current.cart }; for (const item of items) delete cart[item.id]; return { ...current, cart, coupon: false }; }); sessionStorage.removeItem(pendingKey); }
      if (continueToPayment && !hasLab && order.paymentStatus !== "Paid" && order.paymentUrl) { const url = safePaymentUrl(order.paymentUrl); if (url) window.location.assign(url); }
      setReceipt({ id: order.id, message: hasLab ? result.status === 202 ? "Booking being confirmed. Check your orders for its latest status." : `Booking status: ${order.status}. Payment to Redcliffe.` : order.paymentStatus === "Paid" ? "Payment verified. Your order is paid." : "Order saved. Complete payment, then check payment status in My Orders.", paymentUrl: order.paymentUrl ? safePaymentUrl(order.paymentUrl) : undefined });
    } catch (e) {
      setError(errorMessage(e));
      if (!(e instanceof ApiError) || e.status >= 500 || (e.status >= 200 && e.status < 300)) setUncertain(true);
      else { sessionStorage.removeItem(pendingKey); setUncertain(false); }
    } finally { lock.current = false; setBusy(false); }
  }
  if (receipt) return <div className="ca-success"><span><CareIcon name={/pending|being confirmed|complete payment/i.test(receipt.message) ? "clock" : "check"} size={40}/></span><p className="ca-eyebrow">Your care order</p><h1>{receipt.message}</h1><p>Reference: {receipt.id}</p>{receipt.paymentUrl && <a className="ca-button" href={receipt.paymentUrl} target="_blank" rel="noopener noreferrer">Continue to payment <CareIcon name="arrow"/></a>}<Link className="ca-button" href="/profile?tab=orders">View my orders <CareIcon name="arrow"/></Link><Link href="/products" className="ca-back">Continue shopping</Link></div>;
  if (!account && !Object.keys(state.cart).length) return <section className={orderStyles.page}><header className={`ca-profile-heading ${orderStyles.heading}`}><HistoryBackButton fallback="/products" ariaLabel="Back to products"><CareIcon name="back" size={27}/></HistoryBackButton><h1>My cart</h1><Link href="/profile?tab=wishlist" aria-label="View wishlist"><CareIcon name="heart" size={27}/></Link></header><div className={`${orderStyles.empty} ${orderStyles.wishlistEmpty} ${orderStyles.cartEmpty}`}><span className={orderStyles.emptyIcon}><CareIcon name="cart" size={38}/></span><h2>Your cart is waiting for a little care</h2><p>Add products or health packages to get started.</p><Link href="/products" className={orderStyles.action}>Explore all products <CareIcon name="arrow" size={20}/></Link></div></section>;
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const productSaving = items.reduce((sum, item) => sum + Math.max(0, item.mrp - item.price) * item.quantity, 0);
  const itemTotal = subtotal + productSaving;
  const discount = state.coupon && !hasLab ? Math.min(200, Math.round(subtotal * .2)) : 0;
  const delivery = hasProduct && subtotal < 499 ? 40 : 0;
  const totalAmount = subtotal - discount + delivery;
  const couponApplied = state.coupon && !hasLab;
  const disabled = busy || uncertain || reloadPending;
  const sections = account && !checkout ? <div className={`${orderStyles.tabs} ${cartStyles.sections}`} aria-label="Cart sections"><button type="button" aria-pressed={selectedKind === "products"} className={selectedKind === "products" ? orderStyles.activeTab : ""} disabled={disabled} onClick={() => { setCartKind("products"); setError(""); }}><CareIcon name="bag" size={24}/>Products</button><button type="button" aria-pressed={selectedKind === "labs"} className={selectedKind === "labs" ? orderStyles.activeTab : ""} disabled={disabled} onClick={() => { setCartKind("labs"); setError(""); }}><CareIcon name="lab" size={24}/>Labs</button></div> : null;
  return <div>{checkout ? <header className={`ca-profile-heading ca-cart-page-heading ${cartStyles.checkoutHeading}`}><button type="button" aria-label="Back to cart" onClick={() => setCheckout(false)}><CareIcon name="back" size={27}/></button><h1>Checkout</h1><Link href="/profile?tab=wishlist" aria-label="View wishlist"><CareIcon name="heart" size={27}/></Link></header> : <><header className="ca-profile-heading ca-cart-page-heading"><HistoryBackButton fallback="/products" ariaLabel="Back"><CareIcon name="back" size={27}/></HistoryBackButton><h1>My cart</h1><Link href="/profile?tab=wishlist" aria-label="View wishlist"><CareIcon name="heart" size={27}/></Link></header></>}{sections}<ErrorText message={error}/>{(uncertain || reloadPending) && <section className="ca-panel"><h2>Check your previous checkout</h2><p>A booking or payment may still be processing. Check My Orders before starting another attempt.</p><Link className="ca-button" href="/profile?tab=orders">Check My Orders</Link></section>}
    {uncertain && <section className="ca-panel"><button className="ca-text-button" disabled={busy} onClick={() => void reviewHistory()}>Review saved orders</button>{reviewed && <><p>Recent orders: {recent.length ? recent.map(order => `${order.id} (${order.status})`).join(", ") : "No saved orders returned."}</p><p>If this attempt is still unresolved, retry the same request. It will reuse the original checkout identifier.</p><button className="ca-button" disabled={busy} onClick={() => void submit(true)}>Retry same request</button></>}</section>}
    {legacyLab && <p role="status">Test prices and availability will be verified after sign-in.</p>}{mixed && <p role="alert">Book lab tests and purchase products separately. Lab payment is handled by Redcliffe.</p>}
    {checkout && account?.user.profileCompleted && legacyLab && catalog.length > 0 && <section className="ca-panel"><h2>Confirm your current lab test</h2><p>A current test could not be matched automatically. Select the correct test and review its live price.</p>{cartEntries.map(([id]) => id).filter(id => publicLabCatalog.some(test => test.id === id)).map(id => <label className="ca-field" key={id}>{publicLabCatalog.find(test => test.id === id)!.name}<select aria-label={`Choose current test for ${publicLabCatalog.find(test => test.id === id)!.name}`} value="" disabled={disabled} onChange={e => { const live = catalog.find(test => test.id === e.target.value); if (!live) return; update(current => { const cart = {...current.cart}; delete cart[id]; cart[live.id]=1; return {...current,cart}; }); }}><option value="">Select current test</option>{catalog.filter(test => test.available).map(test => <option key={test.id} value={test.id}>{test.name} · {money(test.price)}</option>)}</select></label>)}</section>}
    {account && !checkout && !cartEntries.length ? <div className={`${orderStyles.empty} ${orderStyles.cartEmpty} ${cartStyles.emptyState}`}><span className={orderStyles.emptyIcon}><CareIcon name={selectedKind === "labs" ? "lab" : "bag"} size={38}/></span><h2>{selectedKind === "labs" ? "Your labs cart is empty" : "Your products cart is empty"}</h2><p>{selectedKind === "labs" ? "Add a health package to book your next checkup." : "Add products to get started."}</p><Link href={selectedKind === "labs" ? "/labtest" : "/products"} className={orderStyles.action}>{selectedKind === "labs" ? "Explore lab tests" : "Explore all products"}<CareIcon name="arrow" size={20}/></Link></div> : <div className={`ca-cart-layout ${cartStyles.cartLayout}`}><div>{checkout ? <SessionGate>{hasLab ? <LabCheckout items={items} testsValid={!mixed && !legacyLab && !unresolved && items.length > 0 && items.every(item => item.available)} memberId={memberId} onMemberChange={setMemberId} address={address} onAddressChange={invalidateAddress} notes={notes} onNotesChange={setNotes} dates={dates} date={date} onDateChange={value => { setDate(value); setSlotId(""); selectedSlotKey.current = ""; }} slots={slots} slotId={slotId} onSlotChange={value => { setSlotId(value); selectedSlotKey.current = selectionKey; }} slotMessage={slotMessage} slotsLoading={slotsLoading} disabled={disabled} editingAddress={editingAddress} onAddressEditingChange={setEditingAddress} onReviewChange={setLabReadyForBooking} onBook={() => void submit()} onBackToCart={() => setCheckout(false)}/> : <form id="checkout" className={cartStyles.checkoutForm} onSubmit={e => { e.preventDefault(); if (editingAddress) return; if (hasLab) void submit(); else if (!disabled && !blockedProduct && !mixed && !unresolved) paymentDialog.current?.showModal(); }}><fieldset disabled={disabled} className={cartStyles.checkoutFieldset}>
      <div className={cartStyles.secureBanner}><CareIcon name="lock" size={24}/><span>{hasLab ? "Lab checkout - home collection" : "Product checkout - secure payment"}</span></div>
      <section className={`${cartStyles.checkoutCard} ${cartStyles.orderedBy}`}><h2>Ordered by</h2><div className={cartStyles.customerDetails}><p className={cartStyles.customerName}>{account?.user.name || [account?.user.firstName, account?.user.lastName].filter(Boolean).join(" ") || "Your account"}</p>{account?.user.phone && <p className={cartStyles.customerContact}>{account.user.phone.startsWith("+") ? account.user.phone : "+91 " + account.user.phone}</p>}</div></section>
      <CheckoutDelivery address={address} onChange={invalidateAddress} notes={notes} onNotesChange={setNotes} disabled={disabled} hasLab={hasLab} onEditingChange={setEditingAddress}/>

      <section className={cartStyles.checkoutCard}><h2>{hasLab ? "Payment to Redcliffe" : "HDFC secure payment"}</h2><p className={cartStyles.paymentDescription}>{hasLab ? "Your laboratory will confirm the booking. Payment is handled by Redcliffe." : "Your order is saved before opening the secure HDFC payment page."}</p></section></fieldset></form>}</SessionGate> : <div className="ca-cart-items">{cartEntries.map(([id,count]) => { const item = items.find(value => value.id === id); return <article className="ca-cart-item" key={id}><img src={item?.image || asset("lab")} alt={item?.name || "Saved item"}/><div><h2>{item?.name || "Saved test details"}</h2><p>{item?.subtitle || "Sign in to load current test details."}</p>{item && <><strong>{money(item.price)}</strong> {item.mrp > item.price && <del>{money(item.mrp)}</del>}</>}{item?.lab ? <p>Quantity 1</p> : <fieldset disabled={disabled} style={{ border: 0, padding: 0 }}><Quantity value={count} onChange={n => quantity(id,n)} name={item?.name || "Saved item"} allowZero/></fieldset>}</div><button className="ca-remove" disabled={disabled} aria-label={`Remove ${item?.name || "saved item"} from cart`} onClick={() => quantity(id,0)}><CareIcon name="close" size={18}/></button></article>; })}</div>}</div>
      <aside className={`ca-summary ca-panel ${checkout && hasLab ? cartStyles.labCheckoutSummary : ""}`}><h2 className={cartStyles.summaryHeading}>Primary summary</h2>{!checkout && <><form className={`ca-coupon ${couponApplied ? cartStyles.appliedCoupon : ""}`} onSubmit={e => { e.preventDefault(); if (hasLab) { setLabCouponAttempted(true); return; } if (!couponApplied && coupon.trim().toUpperCase() === "MERA20" && !hasLab) update(current => ({ ...current, coupon: true })); }}><div>{couponApplied && <CareIcon name="check-circle" size={19}/>}<input id="coupon-code" aria-label="Coupon code" placeholder="Enter coupon code" value={couponApplied ? "MERA20" : hasLab ? labCoupon : coupon} readOnly={couponApplied} required={hasLab} disabled={disabled} onChange={e => { if (hasLab) { setLabCoupon(e.target.value); setLabCouponAttempted(false); } else setCoupon(e.target.value); }}/>{couponApplied ? <button type="button" disabled={disabled} onClick={() => { update(current => ({ ...current, coupon: false })); setCoupon(""); }}>Remove</button> : <button type="submit" disabled={disabled}>Apply</button>}</div></form><p className={`${cartStyles.couponHint} ${hasLab ? cartStyles.labCouponHint : ""} ${couponApplied ? cartStyles.couponHintHidden : ""}`} aria-hidden={couponApplied || undefined} role={hasLab && labCouponAttempted ? "status" : undefined}>{hasLab ? labCouponAttempted ? "Lab coupons are not available yet. No discount applied." : "Lab coupon discounts are not available yet." : <>Use <strong>MERA20</strong> for 20% off, up to ₹200.</>}</p></>}<dl><div><dt>Item total</dt><dd>{money(itemTotal)}</dd></div><div><dt>Product saving</dt><dd className={cartStyles.reduction}>−{money(productSaving)}</dd></div><div><dt>Coupon discount</dt><dd className={cartStyles.reduction}>−{money(discount)}</dd></div><div><dt>Delivery</dt><dd className={delivery ? cartStyles.reduction : undefined}>{delivery ? money(delivery) : "Free"}</dd></div><div className="ca-total"><dt>Total amount</dt><dd>{money(totalAmount)}</dd></div></dl>{checkout ? <button type="submit" form="checkout" className="ca-button" disabled={disabled || (hasLab && !labReadyForBooking) || editingAddress || !account?.user.profileCompleted || mixed || legacyLab || unresolved || blockedProduct || items.some(item => !item.available)}>{busy ? "Submitting…" : hasLab ? "Book lab collection" : `Continue to payment - Rs. ${totalAmount.toLocaleString("en-IN")}`}<CareIcon name="arrow"/></button> : <button type="button" className={`ca-button ${cartStyles.checkoutButton}`} disabled={disabled} onClick={() => { setCheckout(true); window.scrollTo({top:0,behavior:"smooth"}); }}><span>Proceed to checkout - Rs. {totalAmount.toLocaleString("en-IN")}</span><CareIcon name="arrow"/></button>}</aside></div>}
    <dialog ref={paymentDialog} className={cartStyles.paymentDialog} aria-labelledby="hdfc-payment-title">
      <h2 id="hdfc-payment-title">HDFC secure payment</h2><p>You will be taken to HDFC to complete payment.</p><strong className={cartStyles.paymentAmount}>Amount: Rs. {totalAmount.toLocaleString("en-IN")}</strong><ErrorText message={error}/>
      <button type="button" className={`ca-button ${cartStyles.paymentAction}`} disabled={disabled || editingAddress || blockedProduct} onClick={() => void submit(false, true)}>{busy ? "Please wait…" : "Continue to HDFC"}<CareIcon name="arrow" size={22}/></button>
      <button type="button" className={cartStyles.softButton} disabled={busy} onClick={() => paymentDialog.current?.close()}>Back<CareIcon name="arrow" size={22}/></button>
    </dialog>
  </div>;
}
