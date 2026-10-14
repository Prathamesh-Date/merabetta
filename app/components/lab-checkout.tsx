"use client";
import { useEffect, useState, type FormEvent } from "react";
import { customerApi, errorMessage, type Address, type Gender, type Member, type Slot } from "../lib/customer-api";
import { money } from "../data/catalog";
import { useCare } from "./care-store";
import CheckoutDelivery from "./checkout-delivery";
import CareIcon from "./care-icon";
import { ErrorText } from "./customer-auth";
import cardStyles from "./customer-cart.module.css";
import styles from "./lab-checkout.module.css";

type Item = { id: string; name: string; subtitle: string; image: string; price: number; quantity: number; available: boolean };
const emptyMember: Omit<Member, "id"> = { name: "", relationship: "Self", dateOfBirth: "", gender: "Female", phone: "" };
const stepTitles = ["Your selected tests", "Who is this booking for?", "Where and when?", "Review your booking"];
const stepDescriptions = ["Check your tests before choosing a family member.", "Select or add the family member taking these tests.", "Choose a collection address and a convenient time.", "Check your details before confirming your booking."];
const indiaDate = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
function dateLabel(value: string, options: Intl.DateTimeFormatOptions) { return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", ...options }).format(new Date(`${value}T12:00:00+05:30`)); }

export default function LabCheckout({ items, testsValid, memberId, onMemberChange, address, onAddressChange, notes, onNotesChange, dates, date, onDateChange, slots, slotId, onSlotChange, slotMessage, slotsLoading, disabled, editingAddress, onAddressEditingChange, onReviewChange, onBook, onBackToCart }: {
  items: Item[]; testsValid: boolean; memberId: string; onMemberChange: (id: string) => void;
  address: Address; onAddressChange: (address: Address) => void; notes: string; onNotesChange: (notes: string) => void;
  dates: string[]; date: string; onDateChange: (date: string) => void; slots: Slot[]; slotId: string; onSlotChange: (id: string) => void;
  slotMessage: string; slotsLoading: boolean; disabled: boolean; editingAddress: boolean; onAddressEditingChange: (editing: boolean) => void;
  onReviewChange: (ready: boolean) => void; onBook: () => void; onBackToCart: () => void;
}) {
  const { account, setAccount } = useCare();
  const [step, setStep] = useState(1); const [error, setError] = useState("");
  const [memberEditing, setMemberEditing] = useState(false); const [draftId, setDraftId] = useState(""); const [draft, setDraft] = useState(emptyMember); const [saving, setSaving] = useState(false);
  const patient = account?.members.find(member => member.id === memberId);
  const slot = slots.find(item => item.id === slotId && item.available);
  const visitValid = Boolean(address.id && address.location && date && dates.includes(date) && slot && !slotsLoading && !editingAddress);
  const reviewReady = Boolean(step === 4 && testsValid && patient && visitValid && !memberEditing && !saving);
  useEffect(() => { onReviewChange(reviewReady); return () => onReviewChange(false); }, [reviewReady, onReviewChange]);
  useEffect(() => { if (step === 4 && !visitValid) setStep(3); }, [step, visitValid]);
  function go(next: number) { setError(""); setStep(next); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function next() {
    if (step === 1 && !testsValid) { setError("Choose available current tests before continuing."); return; }
    if (step === 2 && (!patient || memberEditing || saving)) { setError(memberEditing ? "Save the family member before continuing." : "Select a saved family member."); return; }
    if (step === 3 && !visitValid) { setError(editingAddress ? "Save your collection address before continuing." : !address.location ? "Select a collection location for your address." : !date ? "Choose a collection date." : "Select an available collection slot."); return; }
    go(step + 1);
  }
  function editMember(member?: Member) { setDraft(member ? { name: member.name, relationship: member.relationship, dateOfBirth: member.dateOfBirth.slice(0, 10), gender: member.gender, phone: member.phone ?? "" } : { ...emptyMember }); setDraftId(member?.id ?? ""); setMemberEditing(true); setError(""); }
  async function saveMember(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (saving || disabled) return;
    setSaving(true); setError("");
    try {
      const result = await customerApi.member(draft, draftId || undefined);
      const saved = draftId ? result.members.find(member => member.id === draftId) : result.members.find(member => !account?.members.some(old => old.id === member.id));
      if (!saved) throw new Error("The saved family member was not returned. Please retry.");
      setAccount(result); onMemberChange(saved.id); setMemberEditing(false);
    } catch (e) { setError(errorMessage(e)); }
    finally { setSaving(false); }
  }
  return <div className={`${styles.wizard} ${cardStyles.checkoutForm}`}>
    <ol className={styles.steps} aria-label="Lab checkout progress">{["Tests", "Member", "Visit", "Review"].map((label, index) => <li key={label} className={index + 1 <= step ? styles.active : ""} aria-current={index + 1 === step ? "step" : undefined}><span>{index + 1 < step ? <CareIcon name="check" size={21}/> : index + 1}</span><strong>{label}</strong></li>)}</ol>
    <div className={styles.stepHeading}><span>STEP {step} OF 4</span><h2>{stepTitles[step - 1]}</h2><p>{stepDescriptions[step - 1]}</p></div>
    {step === 1 && <section className={cardStyles.checkoutCard}>
      <div className={styles.tests}>{items.map(item => <article className={styles.test} key={item.id}><img src={item.image} alt=""/><div><h3>{item.name}</h3><p>{item.subtitle} · Qty 1</p><strong>{money(item.price)}</strong>{!item.available && <p>Currently unavailable</p>}</div></article>)}</div>
      <button type="button" className={cardStyles.softButton} disabled={disabled} onClick={onBackToCart}>Edit tests in cart<CareIcon name="arrow" size={20}/></button>
      <div className={styles.testTotal}><strong>Test total</strong><strong>{money(items.reduce((sum, item) => sum + item.price, 0))}</strong></div>
    </section>}
    {step === 2 && <section className={cardStyles.checkoutCard}><h2>Test booking for</h2><p className={styles.description}>Who is this lab test booking for?</p>
      {!account?.members.length && <p className={styles.description}>No family members saved yet.</p>}
      <div className={styles.members} role="radiogroup" aria-label="Test booking for">{account?.members.map(member => <label className={`${styles.member} ${member.id === memberId ? styles.selected : ""}`} key={member.id}><input type="radio" name="lab-patient" checked={member.id === memberId} disabled={disabled || saving} onChange={() => { onMemberChange(member.id); setMemberEditing(false); setError(""); }}/><div><h3>{member.name}</h3><p>{[member.relationship === "Self" ? "Myself" : member.relationship, member.gender, member.phone].filter(Boolean).join(" · ")}</p></div></label>)}</div>
      <div className={styles.cardActions}><button type="button" className={cardStyles.softButton} disabled={disabled || saving} onClick={() => editMember()}>Add family member<CareIcon name="arrow" size={20}/></button>{patient && <button type="button" className={cardStyles.softButton} disabled={disabled || saving} onClick={() => editMember(patient)}>Edit selected member<CareIcon name="arrow" size={20}/></button>}</div>
      {memberEditing && <form className={styles.memberForm} onSubmit={saveMember}><fieldset disabled={disabled || saving}>
        <label>Full name<input required minLength={2} maxLength={200} autoComplete="name" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })}/></label>
        <div className={styles.choiceField}><span>Relationship</span><div role="group" aria-label="Relationship">{["Self", "Mother", "Father", "Spouse", "Grandparent", "Other"].map(value => <button key={value} type="button" aria-pressed={draft.relationship === value} onClick={() => setDraft({ ...draft, relationship: value })}>{value === "Self" ? "Myself" : value}</button>)}</div></div>
        <label>Birthdate<input required type="date" max={indiaDate()} value={draft.dateOfBirth} onChange={e => setDraft({ ...draft, dateOfBirth: e.target.value })}/></label>
        <div className={styles.choiceField}><span>Gender</span><div role="group" aria-label="Gender">{["Female", "Male", "Other", "Prefer not to say"].map(value => <button key={value} type="button" aria-pressed={draft.gender === value} onClick={() => setDraft({ ...draft, gender: value as Gender })}>{value}</button>)}</div></div>
        <label>Mobile number (optional)<input type="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} value={draft.phone ?? ""} onChange={e => setDraft({ ...draft, phone: e.target.value })}/></label>
      </fieldset><div className={styles.formActions}><button type="submit" className={`ca-button ${styles.primary}`} disabled={disabled || saving}>{saving ? "Saving…" : "Save family member"}<CareIcon name="arrow" size={20}/></button><button type="button" className={cardStyles.softButton} disabled={saving} onClick={() => setMemberEditing(false)}>Cancel<CareIcon name="arrow" size={20}/></button></div></form>}
      <p className={styles.memberNote}>All lab tests in this order are for the selected person. Book separately for another person.</p>
    </section>}
    {step === 3 && <div className={styles.visit}>
      <CheckoutDelivery address={address} onChange={onAddressChange} notes={notes} onNotesChange={onNotesChange} disabled={disabled} hasLab onEditingChange={onAddressEditingChange}/>
      <section className={cardStyles.checkoutCard}><h2>Choose collection date</h2><p className={styles.description}>Available collection dates · Indian Standard Time</p>
        {!dates.length && <p className={styles.description}>No collection dates are available. Please try again later.</p>}
        <div className={styles.dates} role="group" aria-label="Collection date">{dates.map(value => <button type="button" key={value} className={value === date ? styles.selectedDate : ""} aria-label={dateLabel(value, { day: "numeric", month: "long", year: "numeric" })} aria-pressed={value === date} disabled={disabled} onClick={() => { onDateChange(value); setError(""); }}><span>{dateLabel(value, { weekday: "short" })}</span><strong>{dateLabel(value, { day: "numeric" })}</strong><span>{dateLabel(value, { month: "short" })}</span>{value === indiaDate() && <small>Today</small>}</button>)}</div>
        {slotsLoading && <p role="status" className={styles.description}>Loading collection slots…</p>}
        {!slotsLoading && date && !address.location && <p className={styles.description}>Select a collection location to load slots.</p>}
        {slotMessage && <p className={styles.slotMessage} role="status">{slotMessage}</p>}
        {!slotsLoading && date && address.location && !slots.length && !slotMessage && <p className={styles.slotMessage}>No slots available for this date and location.</p>}
        <div className={styles.slots} role="group" aria-label="Collection time">{slots.map(value => <button key={value.id} type="button" aria-pressed={value.id === slotId} disabled={disabled || slotsLoading || !value.available} onClick={() => { onSlotChange(value.id); setError(""); }}>{value.label}{!value.available ? " · Unavailable" : ""}</button>)}</div>
      </section>
    </div>}
    {step === 4 && <form id="checkout" className={styles.review} onSubmit={e => { e.preventDefault(); if (reviewReady && !disabled) onBook(); }}>
      <section className={cardStyles.checkoutCard}><h2>Selected tests</h2><div className={styles.tests}>{items.map(item => <div key={item.id} className={styles.reviewTest}><span>{item.name} · Qty 1</span><strong>{money(item.price)}</strong></div>)}</div></section>
      <section className={cardStyles.checkoutCard}><h2>Booking details</h2><dl><div><dt>Family member</dt><dd>{patient?.name}</dd></div><div><dt>Collection address</dt><dd>{[address.line1, address.line2, address.city, address.state, address.postalCode].filter(Boolean).join(", ")}</dd></div><div><dt>Collection date</dt><dd>{date && dateLabel(date, { day: "numeric", month: "long", year: "numeric" })}</dd></div><div><dt>Collection time</dt><dd>{slot?.label}</dd></div>{notes && <div><dt>Delivery notes</dt><dd>{notes}</dd></div>}</dl><p className={styles.memberNote}>Payment is handled by Redcliffe. Your laboratory will confirm the booking status.</p></section>
    </form>}
    <ErrorText message={error}/>
    <div className={styles.navigation}>{step < 4 ? <button key={`step-${step}`} type="button" className={`ca-button ${styles.primary}`} disabled={disabled || saving} onClick={next}>{["Continue to family member", "Continue to address & slot", "Review booking"][step - 1]}<CareIcon name="arrow" size={21}/></button> : <button key="confirm" type="button" onClick={() => { if (reviewReady && !disabled) onBook(); }} className={`ca-button ${styles.primary}`} disabled={disabled || !reviewReady}>Confirm booking<CareIcon name="arrow" size={21}/></button>}<button type="button" className={cardStyles.softButton} disabled={disabled || saving} onClick={() => step === 1 ? onBackToCart() : go(step - 1)}><CareIcon name="back" size={21}/>Back</button></div>
  </div>;
}
