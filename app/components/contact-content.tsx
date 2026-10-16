"use client";

import { useState, type FormEvent } from "react";
import PublicPageShell from "./public-page-shell";
import styles from "./contact-content.module.css";

const socialLinks = [
  { name: "Facebook", image: "facebook-icon.svg", href: "https://www.facebook.com/profile.php?id=61588919011600" },
  { name: "Instagram", image: "instagram-icon.svg", href: "https://www.instagram.com/merabetta.com_?igsh=Ym9oYTF1NnJmaDZo&utm_source=qr" },
  { name: "LinkedIn", image: "linkedin-icon.svg", href: "https://www.linkedin.com/company/vision55-megacare-private-limited/" },
  { name: "Twitter", image: "twitter-icon.svg", href: "https://twitter.com/" },
];

export default function ContactContent() {
  const [prepared, setPrepared] = useState(false);
  function prepareEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const name = String(fields.get("name") || "").trim();
    const email = String(fields.get("email") || "").trim();
    const phone = String(fields.get("phone") || "").trim();
    const message = String(fields.get("message") || "").trim();
    const body = `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\n${message}`;
    window.location.href = `mailto:support@merabetta.com?subject=${encodeURIComponent(`Care enquiry from ${name}`)}&body=${encodeURIComponent(body)}`;
    setPrepared(true);
  }
  return <PublicPageShell showBottomNavigation showBackButton pageTitle="Contact Us" hidePageNavigation contentClassName={styles.content} backNavigationClassName={styles.backNavigation}>
    <section className={styles.banner} aria-labelledby="contact-title"><img src="/app/contact-banner-no-text.png" alt="Two generations connecting at home"/><h1 id="contact-title">Contact Us</h1></section>
    <section className={styles.contact} aria-label="Contact Merabetta">
      <div className={styles.details}>
        <p className={styles.eyebrow}>Contact Us</p>
        <h2>Why Choose Merabetta <br className={styles.headingBreak}/>for Trusted Senior <br className={styles.headingBreak}/>Healthcare Solutions</h2>
        <a className={styles.contactLink} href="mailto:support@merabetta.com"><img src="https://merabetta.com/images/contact-email.svg" alt="" width={22} height={22}/><div><strong>Email</strong><span>support@merabetta.com</span></div></a>
        <a className={styles.contactLink} href="tel:+918999188267"><img src="https://merabetta.com/images/contact-mobile.svg" alt="" width={22} height={22}/><div><strong>Phone</strong><span>+91 89991 88267</span></div></a>
        <nav className={styles.socials} aria-label="Follow Merabetta">{socialLinks.map(link => <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.name}><img src={`https://merabetta.com/images/${link.image}`} alt="" width={22} height={22}/></a>)}</nav>
      </div>
      <form className={styles.form} onSubmit={prepareEnquiry} onChange={() => setPrepared(false)} aria-label="Contact enquiry">
        <div className={styles.formHeading}><h2>How can we help?</h2><p>Share your question and our care team will help you with the next step.</p></div>
        {/* Form extensions can inject fdprocessedid before hydration; tolerate their attributes only on affected controls. */}
        <label className={styles.fieldLabel} htmlFor="contact-name">Full name <span aria-hidden="true">*</span></label><input suppressHydrationWarning id="contact-name" name="name" placeholder="Enter your name" autoComplete="name" required maxLength={80}/>
        <label className={styles.fieldLabel} htmlFor="contact-email">Email address <span aria-hidden="true">*</span></label><input suppressHydrationWarning id="contact-email" name="email" placeholder="you@example.com" type="email" autoComplete="email" required maxLength={160}/>
        <label className={styles.fieldLabel} htmlFor="contact-phone">Phone number <span aria-hidden="true">*</span></label><input suppressHydrationWarning id="contact-phone" name="phone" placeholder="Enter your phone number" type="tel" autoComplete="tel" required minLength={7} maxLength={20}/>
        <label className={styles.fieldLabel} htmlFor="contact-message">Your message <span className={styles.optional}>(optional)</span></label><textarea id="contact-message" name="message" placeholder="Tell us how we can help" maxLength={2000} rows={4}/>
        <button suppressHydrationWarning type="submit" aria-describedby="enquiry-method">Submit <img src="https://merabetta.com/images/arrow-3.svg" alt="" width={24} height={24}/></button><small id="enquiry-method" className={styles.methodNote}>Opens your email app to review and send. Fields marked * are required.</small>
        {prepared && <p className={styles.feedback} role="status">Your enquiry is ready in your email app. If it didn’t open, email us at support@merabetta.com or call us.</p>}
      </form>
    </section>
    <section className={styles.location} aria-label="Merabetta location"><iframe title="Merabetta location in Pune" src="https://www.google.com/maps?q=Ashoka%20Agam,%20Katraj%20Ambegaon%20Road,%20Pune,%20Maharashtra&z=15&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade"/></section>
  </PublicPageShell>;
}
