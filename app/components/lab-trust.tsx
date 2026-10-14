"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import CareIcon from "./care-icon";
import styles from "./lab-trust.module.css";

const tabs = [
  { label: "NABL", title: "Quality you can count on", description: "Confirm your chosen laboratory’s current accreditation and test coverage before booking." },
  { label: "Quality", title: "Care in every detail", description: "Thoughtful sample handling and clear reports throughout your health journey." },
  { label: "Experience", title: "People behind your care", description: "Get help understanding the booking and reporting process." },
  { label: "Support", title: "Here when you need us", description: "Get help with bookings, reports and orders through our support screen." },
];

export default function LabTrust() {
  const [selected, setSelected] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const current = tabs[selected];
  return <div className={styles.trust}>
    <div className={styles.tabs} role="tablist" aria-label="Why trust us">{tabs.map((tab, index) => <button key={tab.label} ref={element => { buttons.current[index] = element; }} type="button" role="tab" id={`trust-${tab.label}`} aria-controls="trust-content" aria-selected={selected === index} tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)} onKeyDown={event => {
      const next = event.key === "ArrowRight" ? (index + 1) % tabs.length : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : null;
      if (next !== null) { event.preventDefault(); setSelected(next); buttons.current[next]?.focus(); }
    }}>{tab.label}</button>)}</div>
    <section className={styles.card} role="tabpanel" id="trust-content" aria-labelledby={`trust-${current.label}`} tabIndex={0}>
      <span className={styles.medal}><CareIcon name="award" size={54}/></span>
      <div className={styles.copy}><h2>{current.title}</h2><p>{current.description}</p></div>
      <div className={styles.features}>{[["check-circle", "Accurate results"], ["shield", "Certified labs"], ["people", "Expert team"], ["lock", "Secure process"]].map(([icon, label]) => <div key={label}><CareIcon name={icon} size={31}/><span>{label}</span></div>)}</div>
      <Link className={styles.support} href="/profile?tab=support">Talk to support<CareIcon name="arrow" size={21}/></Link>
    </section>
  </div>;
}
