"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ApiError, customerApi, errorMessage, type ContactConfirmation } from "../lib/customer-api";
import PublicPageShell from "./public-page-shell";
import styles from "./contact-content.module.css";

const socialLinks = [
  { name: "Facebook", image: "facebook-icon.svg", href: "https://www.facebook.com/profile.php?id=61588919011600" },
  { name: "Instagram", image: "instagram-icon.svg", href: "https://www.instagram.com/merabetta.com_?igsh=Ym9oYTF1NnJmaDZo&utm_source=qr" },
  { name: "LinkedIn", image: "linkedin-icon.svg", href: "https://www.linkedin.com/company/vision55-megacare-private-limited/" },
];

export default function ContactContent() {
  const [confirmation, setConfirmation] = useState<ContactConfirmation | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [retryAt, setRetryAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const lock = useRef(false);
  const successPanel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!confirmation) return;
    successPanel.current?.focus({ preventScroll: true });
    successPanel.current?.scrollIntoView({ block: "nearest" });
  }, [confirmation]);
  useEffect(() => {
    if (!retryAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [retryAt]);
  async function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || Date.now() < retryAt) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    const name = String(fields.get("name") || "").trim();
    const email = String(fields.get("email") || "").trim();
    const phone = String(fields.get("phone") || "").trim();
    const message = String(fields.get("message") || "").trim();
    setConfirmation(null); setError("");
    if (name.length < 2 || !message) {
      setError("Enter a name with at least 2 characters and a message.");
      return;
    }
    lock.current = true; setBusy(true);
    try {
      const result = await customerApi.contactEnquiry({ name, email, phone, message });
      setConfirmation(result); form.reset();
    } catch (error) {
      setError(errorMessage(error));
      if (error instanceof ApiError && error.status === 429) {
        const currentTime = Date.now();
        setNow(currentTime); setRetryAt(currentTime + Math.max(1, error.retryAfter || 60) * 1000);
      }
    } finally { lock.current = false; setBusy(false); }
  }
  return <PublicPageShell showBottomNavigation showBackButton pageTitle="Contact Us" hidePageNavigation contentClassName={styles.content} backNavigationClassName={styles.backNavigation}>
    <section className={styles.banner} aria-labelledby="contact-title"><img src="/app/contact-banner-no-text.webp" alt="Two generations connecting at home"/><h1 id="contact-title">Contact Us</h1></section>
    <section className={styles.contact} aria-label="Contact Merabetta">
      <div className={styles.details}>
        <p className={styles.eyebrow}>Contact Us</p>
        <h2>Why Choose Merabetta <br className={styles.headingBreak}/>for Trusted Senior <br className={styles.headingBreak}/>Healthcare Solutions</h2>
        <a className={styles.contactLink} href="mailto:support@merabetta.com"><img src="https://merabetta.com/images/contact-email.svg" alt="" width={22} height={22}/><div><strong>Email</strong><span>support@merabetta.com</span></div></a>
        <a className={styles.contactLink} href="tel:+918999188267"><img src="https://merabetta.com/images/contact-mobile.svg" alt="" width={22} height={22}/><div><strong>Phone</strong><span>+91 89991 88267</span></div></a>
        <nav className={styles.socials} aria-label="Follow Merabetta">{socialLinks.map(link => <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.name}><img src={`https://merabetta.com/images/${link.image}`} alt="" width={22} height={22}/></a>)}</nav>
      </div>
      {confirmation ? <div ref={successPanel} className={`${styles.form} ${styles.success}`} role="status" tabIndex={-1} aria-labelledby="contact-success-title">
        <div className={styles.successIcon} aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><path d="m12 25 8 8 17-18" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
        <h2 id="contact-success-title">Thank you!</h2>
        <p className={styles.successMessage}>Your enquiry has been submitted successfully.</p>
        <p className={styles.successFollowup}>Our care team will get back to you soon.</p>
        <div className={styles.enquiryReference}><span>Enquiry ID</span><strong>{confirmation.enquiryId}</strong></div>
        <div className={styles.submitted}><span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="m6 12 4 4 8-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></span>Submitted</div>
        <p className={styles.successNote}>Thank you for contacting Merabetta.</p>
      </div> : <form className={styles.form} onSubmit={submitEnquiry} onChange={() => setError("")} aria-label="Contact enquiry" aria-busy={busy}>
        <div className={styles.formHeading}><h2>How can we help?</h2><p>Share your question and our care team will help you with the next step.</p></div>
        {/* Form extensions can inject fdprocessedid before hydration; tolerate their attributes only on affected controls. */}
        <label className={styles.fieldLabel} htmlFor="contact-name">Full name <span aria-hidden="true">*</span></label><input suppressHydrationWarning id="contact-name" name="name" placeholder="Enter your name" autoComplete="name" required minLength={2} maxLength={80} disabled={busy}/>
        <label className={styles.fieldLabel} htmlFor="contact-email">Email address <span aria-hidden="true">*</span></label><input suppressHydrationWarning id="contact-email" name="email" placeholder="you@example.com" type="email" autoComplete="email" required maxLength={160} disabled={busy}/>
        <label className={styles.fieldLabel} htmlFor="contact-phone">Phone number <span aria-hidden="true">*</span></label><input suppressHydrationWarning id="contact-phone" name="phone" placeholder="10-digit mobile number" type="tel" autoComplete="tel-national" inputMode="numeric" required pattern="[6-9][0-9]{9}" minLength={10} maxLength={10} title="Enter a 10-digit Indian mobile number" disabled={busy}/>
        <label className={styles.fieldLabel} htmlFor="contact-message">Your message <span aria-hidden="true">*</span></label><textarea id="contact-message" name="message" placeholder="Tell us how we can help" required maxLength={2000} rows={4} disabled={busy}/>
        <button suppressHydrationWarning type="submit" aria-describedby="enquiry-method" disabled={busy || now < retryAt}>{busy ? "Submitting…" : now < retryAt ? `Retry in ${Math.ceil((retryAt - now) / 1000)}s` : "Submit"} <img src="https://merabetta.com/images/arrow-3.svg" alt="" width={24} height={24}/></button><small id="enquiry-method" className={styles.methodNote}>Send your enquiry directly to our care team. No sign-in needed. Fields marked * are required.</small>
        {error && <p className={`${styles.feedback} ${styles.error}`} role="alert">{error}</p>}
      </form>}
    </section>
    <section className={styles.location} aria-label="Merabetta location"><iframe title="Merabetta location in Pune" src="https://www.google.com/maps?q=Ashoka%20Agam,%20Katraj%20Ambegaon%20Road,%20Pune,%20Maharashtra&z=15&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade"/></section>
  </PublicPageShell>;
}
