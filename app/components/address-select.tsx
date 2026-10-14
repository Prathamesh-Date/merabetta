"use client";
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import CareIcon from "./care-icon";
import styles from "./customer-address.module.css";

export default function AddressSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  const id = useId(); const root = useRef<HTMLDivElement>(null); const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false); const [active, setActive] = useState(0); const [height, setHeight] = useState(240); const [invalid, setInvalid] = useState(false);
  const choices = [...new Set(value ? [value, ...options] : options)];
  function show() { setActive(Math.max(0, choices.indexOf(value))); setOpen(true); }
  function choose(index: number) { if (!choices[index]) return; onChange(choices[index]); setInvalid(false); setOpen(false); trigger.current?.focus(); }
  useLayoutEffect(() => {
    if (!open || !trigger.current) return;
    const button = trigger.current;
    let container = button.parentElement;
    while (container && !/(auto|scroll)/.test(getComputedStyle(container).overflowY)) container = container.parentElement;
    const bottom = () => Math.min(window.innerHeight - 20, container ? container.getBoundingClientRect().bottom - 12 : Infinity);
    if (bottom() - button.getBoundingClientRect().bottom < 160) button.scrollIntoView({ block: "center", behavior: "instant" });
    const resize = () => setHeight(Math.max(0, Math.min(240, bottom() - button.getBoundingClientRect().bottom - 8)));
    resize(); window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    root.current?.querySelector(`#${CSS.escape(`${id}-option-${active}`)}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, id]);
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  function keyboard(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Escape" || e.key === "Tab") { setOpen(false); return; }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
      e.preventDefault();
      if (!open) { show(); return; }
      setActive(index => e.key === "Home" ? 0 : e.key === "End" ? Math.max(0, choices.length - 1) : Math.max(0, Math.min(choices.length - 1, index + (e.key === "ArrowDown" ? 1 : -1))));
    } else if (open && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); choose(active); }
    else if (e.key.length === 1 && e.key !== " " && !e.ctrlKey && !e.metaKey) {
      const index = choices.findIndex(option => option.toLowerCase().startsWith(e.key.toLowerCase()));
      if (index >= 0) { e.preventDefault(); setActive(index); setOpen(true); }
    }
  }
  return <div className={styles.selectField} ref={root}>
    <label id={`${id}-label`} htmlFor={`${id}-trigger`}>{label}</label>
    <button ref={trigger} id={`${id}-trigger`} type="button" className={styles.selectTrigger} role="combobox" aria-labelledby={`${id}-label`} aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-list`} aria-activedescendant={open && choices.length ? `${id}-option-${active}` : undefined} aria-required="true" aria-invalid={invalid || undefined} onClick={() => open ? setOpen(false) : show()} onKeyDown={keyboard}>
      <span>{value || `Select ${label.toLowerCase()}`}</span><CareIcon name="chevron" size={18}/>
    </button>
    <input className={styles.validationInput} aria-hidden="true" tabIndex={-1} required value={value} onChange={() => {}} onInvalid={e => { e.preventDefault(); setInvalid(true); show(); trigger.current?.focus(); }}/>
    {open && <div id={`${id}-list`} role="listbox" aria-labelledby={`${id}-label`} className={styles.selectOptions} style={{ maxHeight: height }}>
      {choices.length ? choices.map((option, index) => <div key={option} id={`${id}-option-${index}`} role="option" aria-selected={option === value} className={`${styles.selectOption} ${index === active ? styles.highlighted : ""}`} onPointerDown={e => e.preventDefault()} onPointerMove={() => setActive(index)} onClick={() => choose(index)}><span>{option}</span>{option === value && <CareIcon name="check" size={17}/>}</div>) : <p className={styles.noOptions}>No options available</p>}
    </div>}
    {invalid && !value && <span className={styles.invalid}>Please select a {label.toLowerCase()}.</span>}
  </div>;
}
