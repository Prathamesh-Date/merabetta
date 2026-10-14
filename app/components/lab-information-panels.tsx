"use client";
import Link from "next/link";
import CareIcon from "./care-icon";
import { useCare } from "./care-store";
import styles from "./lab-information-panels.module.css";

const sampleReport = "MERABETTA · SAMPLE REPORT\nExample patient · Demo only\nNo diagnostic or clinical use\n\nParameter | Result | Reference\nHaemoglobin | 14.2 g/dL | 13–17\nWBC count | 7,200 /µL | 4,000–11,000\nPlatelets | 250,000 /µL | 150k–450k\n\nIllustrative values only. Reference ranges vary by laboratory and patient.";
function ShareButton({ title, text, children }: { title: string; text: string; children: string }) {
  const { announce } = useCare();
  async function share() {
    try {
      if (navigator.share) await navigator.share({ title, text });
      else if (navigator.clipboard) { await navigator.clipboard.writeText(text); announce("Copied to clipboard"); }
      else announce("Sharing is unavailable. Select and copy the text on this page.");
    } catch (error) { if (!(error instanceof DOMException && error.name === "AbortError")) announce("Could not share. Please try again."); }
  }
  return <button type="button" className={styles.secondary} onClick={() => void share()}>{children}<CareIcon name="arrow" size={20}/></button>;
}
function Checklist({ items }: { items: string[] }) {
  return <ul className={styles.checklist}>{items.map(item => <li key={item}><span><CareIcon name="check" size={14}/></span>{item}</li>)}</ul>;
}
export function LabGuidance() {
  return <div className={styles.page}>
    <section className={styles.guidance}><span className={styles.person}><CareIcon name="profile" size={60}/></span><h2>Have questions?<br/>We’re here for you.</h2><p>Get help preparing for your lab appointment and navigating your report.</p><Link className={styles.primary} href="/profile?tab=support">Chat with our care team<CareIcon name="arrow" size={20}/></Link></section>
    <h2 className={styles.sectionTitle}>Expert support includes</h2>
    <Checklist items={["Test preparation queries", "Understanding the report process", "Booking and collection assistance"]}/>
    <p className={styles.note}>Support can help with bookings and reports. For medical advice, consult your clinician.</p>
  </div>;
}
export function LabPreparation({ fasting }: { fasting?: string }) {
  const instructions = [["drop", "Stay hydrated with plain water"], ["clock", fasting || "Follow the fasting instructions from your lab"], ["medical", "Tell your clinician about medications"], ["shirt", "Wear comfortable clothing"]];
  const guide = instructions.map(([, text]) => text).join("\n") + "\n\nThese are sample instructions. Your chosen laboratory must provide test-specific preparation guidance.";
  return <div className={styles.page}><h2 className={styles.sectionTitle}>Important instructions</h2>
    <section className={`${styles.card} ${styles.instructions}`} aria-label="Preparation instructions">{instructions.map(([icon, text]) => <div key={icon}><CareIcon name={icon} size={24}/><span>{text}</span></div>)}</section>
    <p className={styles.description}>These are sample instructions. Your chosen laboratory must provide test-specific preparation guidance.</p>
    <ShareButton title="Preparation guide" text={guide}>Share preparation guide</ShareButton>
    <div className={styles.confirmation}><CareIcon name="shield" size={25}/><p>Your lab will confirm preparation details before collection.</p></div>
  </div>;
}
export function LabReport({ preview, previewHref }: { preview: boolean; previewHref: string }) {
  return <div className={styles.page}>
    <section className={`${styles.card} ${styles.reportIntro}`}><span><CareIcon name="report" size={27}/></span><div><h2>Digital health report</h2><p>A clear view of your wellbeing</p></div></section>
    {preview ? <section className={`${styles.card} ${styles.sample}`}><h2>MERABETTA · SAMPLE REPORT</h2><p className={styles.description}>Example patient · Demo only<br/>No diagnostic or clinical use</p>
      <table><caption className={styles.visuallyHidden}>Illustrative sample laboratory results</caption><thead><tr><th scope="col">Parameter</th><th scope="col">Result</th><th scope="col">Reference</th></tr></thead><tbody><tr><th scope="row">Haemoglobin</th><td>14.2 g/dL</td><td>13–17</td></tr><tr><th scope="row">WBC count</th><td>7,200 /µL</td><td>4,000–11,000</td></tr><tr><th scope="row">Platelets</th><td>250,000 /µL</td><td>150k–450k</td></tr></tbody></table>
      <p className={styles.note}>Illustrative values only. Reference ranges vary by laboratory and patient.</p><ShareButton title="Sample report" text={sampleReport}>Share sample report</ShareButton>
    </section> : <section className={styles.card}><h2 className={styles.sectionTitle}>What’s included?</h2><Checklist items={["Test summary & results", "Reference ranges", "Shareable PDF report"]}/><Link className={styles.secondary} href={previewHref}>View sample report<CareIcon name="arrow" size={20}/></Link></section>}
  </div>;
}
