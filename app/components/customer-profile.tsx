"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import CareShell from "./care-shell";
import CareIcon from "./care-icon";
import { useCare } from "./care-store";
import { ErrorText, SignInForm, ProfileForm, SessionGate } from "./customer-auth";
import AddressFields, { blankAddress } from "./customer-address";
import CustomerOrders from "./customer-orders";
import OrdersPanel from "./care-orders";
import { customerApi, ApiError, errorMessage, type Address, type Member, type Gender } from "../lib/customer-api";
import { products } from "../data/catalog";
import { ProductCard } from "./care-catalog";
import { LiveLabTestCard } from "./customer-labs";
import orderStyles from "./care-orders.module.css";
import familyStyles from "./family-addresses.module.css";
import { publicLabCatalog } from "../data/public-lab-catalog";
import LoadingState from "./loading-state";

const blankMember: Omit<Member, "id"> = { name: "", relationship: "Other", dateOfBirth: "", gender: "Female", phone: "" };
export default function CustomerProfile({ initialTab = "account", fromHome = false }: { initialTab?: string; fromHome?: boolean }) {
  const { account, setAccount, clearPrivate, state, catalog, setCatalog, ready, announce, sessionError, sessionLoading, restoreSession } = useCare();
  const router = useRouter(); const authDialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const [confirm, setConfirm] = useState(false); const [editProfile, setEditProfile] = useState(false);
  const [address, setAddress] = useState<Address>(blankAddress); const [member, setMember] = useState(blankMember); const [memberId, setMemberId] = useState("");
  const [addressEditing, setAddressEditing] = useState(false); const [memberEditing, setMemberEditing] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false); const [wishlistRetry, setWishlistRetry] = useState(0);
  const go = (tab: string) => router.push(`/profile?tab=${tab}`);
  const back = () => { if (window.history.length > 1) router.back(); else router.replace(fromHome ? "/#care-your-way-title" : "/profile"); };
  const closeAuth = () => { authDialog.current?.close(); if (initialTab === "orders" && !account) router.replace("/"); };
  async function action(run: () => Promise<void>) { if (busy) return; setBusy(true); setError(""); try { await run(); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); } }
  async function logout(all = false) { try { await customerApi.logout(all); } catch (e) { if (!(e instanceof ApiError && e.status === 401)) throw e; } clearPrivate(); announce("Signed out of your profile"); }
  useEffect(() => {
    if (initialTab !== "wishlist" || catalog.length || !state.wishlist.some(id => !products.some(product => product.id === id))) { setWishlistLoading(false); return; }
    const controller = new AbortController(); setWishlistLoading(true); setError("");
    customerApi.catalog(controller.signal).then(r => { if (!controller.signal.aborted) { setWishlistLoading(false); setCatalog(r.data); } }).catch(e => { if (!controller.signal.aborted) { setError(errorMessage(e)); setWishlistLoading(false); } });
    return () => controller.abort();
  }, [initialTab, state.wishlist, catalog.length, setCatalog, wishlistRetry]);
  useEffect(() => { if (initialTab !== "orders" || sessionLoading || account || authDialog.current?.open) return; authDialog.current?.showModal(); }, [initialTab, sessionLoading, account]);
  const signedIn = Boolean(account); const profileName = state.profile?.name || "Your care profile";
  const savedProducts = products.filter(product => state.wishlist.includes(product.id));
  const savedTests = [...new Map([...publicLabCatalog, ...catalog].map(test => [test.id, test])).values()].filter(test => state.wishlist.includes(test.id));
  const mainClassName = initialTab === "wishlist" ? `${orderStyles.main} ${savedProducts.length || savedTests.length ? orderStyles.contentMain : ""}` : initialTab === "orders" ? orderStyles.main : "";
  if (!ready) return <CareShell mainClassName={mainClassName}><div className="ca-profile-page"><p>Loading your profile…</p></div></CareShell>;
  return <CareShell mainClassName={mainClassName}><div className={`ca-profile-page ${initialTab === "people" ? familyStyles.page : ""}`}><ErrorText message={error}/><dialog ref={authDialog} className="ch-auth" aria-label="Sign in" onCancel={event => { if (initialTab !== "orders" || account) return; event.preventDefault(); closeAuth(); }}><button className="ch-close" aria-label="Close login" onClick={closeAuth}><CareIcon name="close"/></button><img className="ch-auth-logo" src="/logo.png" alt="Merabetta"/><SignInForm onDone={() => authDialog.current?.close()}/></dialog>
    {initialTab === "account" ? <>
      <div className="ca-profile-heading"><Link href="/" aria-label="Back to home"><CareIcon name="back" size={27}/></Link><h1 className="ca-profile-title">Profile</h1><Link href="/profile?tab=wishlist" aria-label="View wishlist"><CareIcon name="heart" size={29}/></Link></div>
      <section className="ca-profile-card">{signedIn ? <><span className="ca-avatar">{profileName.charAt(0).toUpperCase()}</span><div><h2>{profileName}</h2><p>{account!.user.email}</p><small>Your everyday wellness companion</small><button className="ca-profile-signin" type="button" onClick={() => setEditProfile(value => !value)}>{editProfile ? "Close details" : "Edit details"}</button></div></> : <><span className="ca-avatar"><CareIcon name="profile" size={35}/></span><div><h2>Welcome to Merabetta</h2><p>Sign in to keep your care details together.</p><button type="button" disabled={sessionLoading} onClick={() => authDialog.current?.showModal()} className="ca-profile-signin">{sessionLoading ? "Restoring account…" : "Sign in"}</button></div></>}</section>
      {sessionError && <><ErrorText message={sessionError}/><button className="ca-text-button" onClick={() => void restoreSession()}>Retry connection</button></>}
      {account && (!account.user.profileCompleted || editProfile) && <ProfileForm/>}
      <div className="ca-profile-shortcuts"><button onClick={() => go("orders")}><CareIcon name="bag" size={29}/><span>My Orders</span></button><button onClick={() => go("wishlist")}><CareIcon name="heart" size={29}/><span>Wishlist</span></button><button onClick={() => go("offers")}><CareIcon name="ticket" size={29}/><span>Offers</span></button></div>
      <section className="ca-profile-menu">{[["people", "Family & Addresses"], ["faq", "FAQs"], ["returns", "Return & Refund Policy"], ["privacy", "Privacy Policy"], ["terms", "Terms & Conditions"], ["support", "Customer Support"]].map(([tab,label]) => <button key={tab} disabled={tab === "people" && !signedIn} onClick={() => go(tab)}>{label}<CareIcon name="chevron"/></button>)}<button disabled={!signedIn} onClick={() => setConfirm(true)}>Delete my account <CareIcon name="chevron"/></button></section>
      <button className="ca-profile-signout" disabled={!signedIn || busy} onClick={() => void action(() => logout())}>Sign out <CareIcon name="arrow"/></button>
      {confirm && <div className="ca-profile-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title"><div><h2 id="delete-title">Delete your account?</h2><p>Your account will be deleted and its sessions revoked. Private details on this device will be cleared.</p><button className="ca-button" disabled={busy} onClick={() => void action(async () => { await customerApi.deleteAccount(); clearPrivate(); setConfirm(false); })}>Delete account &amp; data <CareIcon name="arrow"/></button><button className="ca-profile-cancel" onClick={() => setConfirm(false)}>Keep my account <CareIcon name="arrow"/></button></div></div>}
    </> : initialTab === "orders" ? account ? <SessionGate><CustomerOrders onBack={back} fromHome={fromHome}/></SessionGate> : <OrdersPanel orders={[]} onBack={back} fromHome={fromHome}/> : initialTab === "wishlist" ? <section className={orderStyles.page}>
      <header className={`ca-profile-heading ${orderStyles.heading}`}><button type="button" onClick={back} aria-label="Back"><CareIcon name="back" size={27}/></button><h1>Wishlist</h1><span className={orderStyles.wishlistHeart} aria-hidden="true"><CareIcon name="heart" size={27}/></span></header>
      {wishlistLoading ? <LoadingState>Loading your wishlist…</LoadingState> : savedProducts.length || savedTests.length ? <div className={`${orderStyles.wishlistList} ca-product-grid cl-test-grid`}>{savedProducts.map(product => <ProductCard key={product.id} product={product} showBuyNow/>)}{savedTests.map(test => <LiveLabTestCard key={test.id} test={test}/>)}</div> : state.wishlist.length ? <div className="ca-empty"><h2>{error ? "Wishlist temporarily unavailable" : "Saved items are unavailable"}</h2><p>Your saved items are still on this device. Try loading the current catalog again.</p><button className="ca-button" type="button" onClick={() => { setCatalog([]); setWishlistRetry(value => value + 1); }}>Retry loading wishlist</button></div> : <WishlistEmpty/>}
    </section> : <ProfileSubpage title={initialTab === "people" ? "Family & Addresses" : "FAQs"} back={back}>
      {initialTab === "faq" ? <Faqs/> : <SessionGate><div className={familyStyles.content}>
        <section className={familyStyles.groupCard}><h2>Saved people</h2><p className={familyStyles.description}>Your family members, saved separately from addresses.</p>
          <div className={familyStyles.savedList}>{account?.members.map(saved => <article className={familyStyles.savedRow} key={saved.id}><CareIcon name="profile" size={28}/><div><h3>{saved.name}</h3><p>{[saved.relationship === "Self" ? "Myself" : saved.relationship, memberAge(saved.dateOfBirth), saved.gender, saved.phone].filter(Boolean).join(" · ")}</p></div><button type="button" className={familyStyles.editButton} aria-label={`Edit family member: ${saved.name}`} disabled={busy} onClick={() => { setMember({ name: saved.name, relationship: saved.relationship, dateOfBirth: saved.dateOfBirth.slice(0, 10), gender: saved.gender, phone: saved.phone ?? "" }); setMemberId(saved.id); setMemberEditing(true); }}><CareIcon name="edit" size={22}/></button></article>)}</div>
          {!account?.members.length && <p className={familyStyles.emptyText}>Add a family member for lab bookings.</p>}
          <button type="button" className={familyStyles.addButton} disabled={busy} onClick={() => { setMember(blankMember); setMemberId(""); setMemberEditing(true); }}>Add family member<CareIcon name="arrow" size={21}/></button>
          {memberEditing && <form className={familyStyles.editor} onSubmit={e => { e.preventDefault(); void action(async () => { setAccount(await customerApi.member(member, memberId || undefined)); setMember(blankMember); setMemberId(""); setMemberEditing(false); }); }}><h3>{memberId ? "Edit family member" : "Add family member"}</h3><fieldset disabled={busy} className={familyStyles.fieldset}><div className="ca-form-grid"><label>Name<input required minLength={2} maxLength={200} value={member.name} onChange={e => setMember({ ...member, name: e.target.value })}/></label><label>Relationship<select value={member.relationship} onChange={e => setMember({ ...member, relationship: e.target.value })}>{["Self", "Mother", "Father", "Spouse", "Grandparent", "Other"].map(r => <option key={r}>{r}</option>)}</select></label><label>Date of birth<input required type="date" value={member.dateOfBirth} onChange={e => setMember({ ...member, dateOfBirth: e.target.value })}/></label><label>Gender<select value={member.gender} onChange={e => setMember({ ...member, gender: e.target.value as Gender })}>{["Female", "Male", "Other", "Prefer not to say"].map(g => <option key={g}>{g}</option>)}</select></label><label>Mobile (optional)<input type="tel" pattern="[6-9][0-9]{9}" maxLength={10} value={member.phone ?? ""} onChange={e => setMember({ ...member, phone: e.target.value })}/></label></div></fieldset><div className={familyStyles.actions}><button type="submit" disabled={busy}>Save family member<CareIcon name="check" size={17}/></button><button type="button" disabled={busy} onClick={() => setMemberEditing(false)}>Cancel</button></div>{memberId && <button type="button" className={familyStyles.removeButton} disabled={busy} onClick={() => void action(async () => { setAccount(await customerApi.deleteMember(memberId)); setMember(blankMember); setMemberId(""); setMemberEditing(false); })}><CareIcon name="trash" size={16}/>Remove family member</button>}</form>}
        </section>
        <section className={familyStyles.groupCard}><h2>Saved addresses</h2><p className={familyStyles.description}>Addresses saved to your account. Add an address independently of family members.</p>
          <div className={familyStyles.savedList}>{account?.addresses.map(saved => <article className={familyStyles.savedRow} key={saved.id}><CareIcon name="pin" size={27}/><div><h3>{saved.line1}</h3><p>{[saved.line2, saved.city, saved.state, saved.postalCode].filter(Boolean).join(", ")}</p></div><button type="button" className={familyStyles.editButton} aria-label={`Edit address: ${saved.line1}`} disabled={busy} onClick={() => { setAddress(saved); setAddressEditing(true); }}><CareIcon name="edit" size={22}/></button></article>)}</div>
          {!account?.addresses.length && <p className={familyStyles.emptyText}>Add an address to use for orders.</p>}
          <button type="button" className={familyStyles.addButton} disabled={busy} onClick={() => { setAddress({ ...blankAddress }); setAddressEditing(true); }}>Add address<CareIcon name="arrow" size={21}/></button>
          {addressEditing && <form className={familyStyles.editor} onSubmit={e => { e.preventDefault(); void action(async () => { setAccount(await customerApi.address(address, address.id)); setAddress(blankAddress); setAddressEditing(false); }); }}><h3>{address.id ? "Edit delivery address" : "Add delivery address"}</h3><fieldset disabled={busy} className={familyStyles.fieldset}><AddressFields value={address} onChange={setAddress}/></fieldset><div className={familyStyles.actions}><button type="submit" disabled={busy}>Save address<CareIcon name="check" size={17}/></button><button type="button" disabled={busy} onClick={() => setAddressEditing(false)}>Cancel</button></div>{address.id && <button type="button" className={familyStyles.removeButton} disabled={busy} onClick={() => void action(async () => { setAccount(await customerApi.deleteAddress(address.id!)); setAddress(blankAddress); setAddressEditing(false); })}><CareIcon name="trash" size={16}/>Remove address</button>}</form>}
      </section></div></SessionGate>}
    </ProfileSubpage>}
  </div></CareShell>;
}
function memberAge(dateOfBirth: string) {
  const birth = dateOfBirth?.slice(0, 10).split("-").map(Number);
  if (!birth || birth.length !== 3 || birth.some(value => !Number.isFinite(value) || value <= 0)) return "";
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", year: "numeric", month: "numeric", day: "numeric" }).formatToParts(new Date());
  const part = (type: string) => Number(parts.find(value => value.type === type)?.value);
  const age = part("year") - birth[0] - (part("month") < birth[1] || (part("month") === birth[1] && part("day") < birth[2]) ? 1 : 0);
  return age >= 0 ? `${age} years` : "";
}
function WishlistEmpty() {
  return <div className={`${orderStyles.empty} ${orderStyles.wishlistEmpty}`}><span className={orderStyles.emptyIcon}><CareIcon name="bag" size={38}/></span><h2>Nothing yet here</h2><p>Try a different search and explore our products</p><Link href="/products" className={orderStyles.action}>Explore all products <CareIcon name="arrow" size={20}/></Link></div>;
}
function ProfileSubpage({ title, back, children }: { title: string; back: () => void; children: ReactNode }) { return <><header className="ca-profile-heading"><button onClick={back} aria-label="Back to profile"><CareIcon name="back" size={28}/></button><h1>{title}</h1><Link href="/profile?tab=wishlist" aria-label="View wishlist"><CareIcon name="heart" size={29}/></Link></header><div className="ca-profile-subpage">{children}</div></>; }
function Faqs() {
  const [faqs, setFaqs] = useState<{ id: string; question: string; answer: string }[]>([]); const [error, setError] = useState(""); const [loading, setLoading] = useState(true); const [retry, setRetry] = useState(0);
  useEffect(() => { const controller = new AbortController(); setLoading(true); setError(""); customerApi.faqs(controller.signal).then(r => setFaqs(r.data)).catch(e => { if (!controller.signal.aborted) setError(errorMessage(e)); }).finally(() => { if (!controller.signal.aborted) setLoading(false); }); return () => controller.abort(); }, [retry]);
  return <section className="ca-panel ca-profile-faq"><ErrorText message={error}/>{error && <button className="ca-text-button" onClick={() => setRetry(retry + 1)}>Retry</button>}{loading ? <p>Loading FAQs…</p> : faqs.length ? faqs.map(f => <details key={f.id}><summary>{f.question}</summary><p>{f.answer}</p></details>) : !error && <p>No FAQs available.</p>}</section>;
}
