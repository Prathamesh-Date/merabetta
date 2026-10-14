"use client";
import { useEffect, useRef, useState } from "react";
import { customerApi, errorMessage, type Address } from "../lib/customer-api";
import AddressFields, { blankAddress } from "./customer-address";
import CareIcon from "./care-icon";
import { ErrorText } from "./customer-auth";
import { useCare } from "./care-store";
import styles from "./customer-cart.module.css";

export default function CheckoutDelivery({ address, onChange, notes, onNotesChange, disabled, hasLab, onEditingChange }: { address: Address; onChange: (address: Address) => void; notes: string; onNotesChange: (notes: string) => void; disabled: boolean; hasLab: boolean; onEditingChange: (editing: boolean) => void }) {
  const { account, setAccount } = useCare();
  const [editing, setEditing] = useState(!address.line1 && !account?.addresses.length);
  const [draft, setDraft] = useState<Address>(address.line1 ? address : account?.addresses[0] ?? blankAddress);
  const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const editor = useRef<HTMLDivElement>(null);
  const savedAddresses = account?.addresses ?? [];
  useEffect(() => { onEditingChange(editing || saving); return () => onEditingChange(false); }, [editing, saving, onEditingChange]);
  function edit(next: Address) { setDraft({ ...next }); setEditing(true); setDeleteId(null); setError(""); }
  async function remove(addressId: string) {
    if (saving || disabled) return;
    setSaving(true); setError("");
    try {
      const updated = await customerApi.deleteAddress(addressId);
      const next = updated.addresses.find(item => item.id === address.id) ?? updated.addresses[0] ?? { ...blankAddress };
      setAccount(updated);
      if (address.id === addressId) { onChange(next); setDraft(next); setEditing(!next.id); }
      else if (draft.id === addressId) { setDraft(next); setEditing(false); }
      setDeleteId(null);
    } catch (e) { setError(errorMessage(e)); }
    finally { setSaving(false); }
  }
  async function save() {
    if (saving || disabled) return;
    const inputs = editor.current?.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input, select");
    if (inputs) for (const input of inputs) if (!input.reportValidity()) return;
    if (hasLab && !draft.location) { setError("Choose a collection location before saving the address."); return; }
    setSaving(true); setError("");
    try {
      const updated = await customerApi.address(draft, draft.id);
      const saved = draft.id ? updated.addresses.find(item => item.id === draft.id) : updated.addresses.find(item => !savedAddresses.some(old => old.id === item.id));
      if (!saved) throw new Error("The saved address was not returned. Please retry.");
      setAccount(updated); onChange(saved); setEditing(false);
    } catch (e) { setError(errorMessage(e)); }
    finally { setSaving(false); }
  }
  return <section className={styles.checkoutCard}>
    <h2>{hasLab ? "Collection address" : "Delivery address"}</h2>
    {savedAddresses.length > 0 && <div className={styles.addressChoices} role="radiogroup" aria-label={hasLab ? "Collection address" : "Delivery address"}>
      {savedAddresses.map(saved => <div key={saved.id}>
      <label className={`${styles.addressCard} ${saved.id === address.id ? styles.selectedAddress : ""}`}>
        <input type="radio" name="checkout-address" value={saved.id} checked={saved.id === address.id} disabled={disabled || saving} onChange={() => { onChange(saved); setDraft(saved); setEditing(false); setError(""); }}/>
        <span>{[saved.line1, saved.line2, saved.landmark, saved.city, saved.state, saved.postalCode].filter(Boolean).join(", ")}</span>
      </label>
      {saved.id && <button type="button" className={styles.deleteAddress} disabled={disabled || saving} aria-label={`Delete address: ${saved.line1}`} onClick={() => { setDeleteId(saved.id!); setError(""); }}><CareIcon name="trash" size={16}/>Delete address</button>}
      {deleteId === saved.id && <div className={styles.deleteConfirmation} role="group" aria-label="Confirm address deletion"><p>Delete this saved address?</p><div><button type="button" className={styles.confirmDelete} disabled={disabled || saving} onClick={() => void remove(saved.id!)}>{saving ? "Deleting…" : "Delete"}</button><button type="button" className={styles.cancelDelete} disabled={saving} onClick={() => setDeleteId(null)}>Cancel</button></div></div>}
      </div>)}
    </div>}
    <div className={styles.addressActions}>
      <button type="button" className={styles.softButton} disabled={disabled || saving} onClick={() => edit({ ...blankAddress })}>Add address <CareIcon name="arrow" size={20}/></button>
      {address.id && <button type="button" className={styles.softButton} disabled={disabled || saving} onClick={() => edit(address)}>Change selected address details <CareIcon name="arrow" size={20}/></button>}
    </div>
    <ErrorText message={error}/>
    {editing && <div ref={editor} className={styles.addressEditor}>
      <h3>{draft.id ? "Change address details" : "Add a new address"}</h3>
      <fieldset disabled={disabled || saving} className={styles.checkoutFieldset}><AddressFields value={draft} onChange={setDraft}/></fieldset>
      <div className={styles.editorActions}><button type="button" className="ca-button" disabled={disabled || saving} onClick={() => void save()}>{saving ? "Saving…" : "Save address"}<CareIcon name="check" size={18}/></button>{address.id && <button type="button" className={styles.softButton} disabled={disabled || saving} onClick={() => { setEditing(false); setError(""); }}>Cancel</button>}</div>
    </div>}
    <label className={styles.deliveryNotes}>Delivery notes (optional)<textarea maxLength={1000} value={notes} placeholder="Delivery notes (optional)" onChange={e => onNotesChange(e.target.value)}/></label>
  </section>;
}
