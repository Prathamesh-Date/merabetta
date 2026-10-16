"use client";

import Link from "next/link";
import { useState } from "react";
import PublicPageShell from "./public-page-shell";
import CareIcon from "./care-icon";
import styles from "./public-pages.module.css";
import FallbackImage from "./fallback-image";

const filters = ["All", "Community Events", "Customer Moments", "Product Demonstrations"];

export default function CommunityContent() {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  return <PublicPageShell showBottomNavigation showBackButton pageTitle="Services & Community" hidePageNavigation search={<form className={`${styles.navSearch} ca-nav-search`} action="/products" role="search"><button type="submit" aria-label="Search products"><CareIcon name="search" size={19}/></button><input name="q" aria-label="Search products, brands, health solutions" placeholder="Search products, brands, health solutions..." value={query} onChange={event => setQuery(event.target.value)}/>{query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")}><CareIcon name="close" size={17}/></button>}</form>}>
    <div className={`${styles.banner} ${styles.communityBanner}`}><img src="/app/community-banner-no-text.webp" alt="An older woman and healthcare professionals connecting at home"/></div>
    <section className={`${styles.section} ${styles.center}`}><h1 className={styles.heading}>Events & Community Programs</h1><p className={styles.text}>Discover opportunities to connect around senior wellbeing, everyday care, and product awareness.</p><div className={styles.empty}>No upcoming event details are currently published. <a href="#support">Contact the team</a> for program information.</div></section>
    <section className={`${styles.section} ${styles.split}`}><FallbackImage src="https://merabetta.com/images/community-event.png" fallback="/app/community-banner-no-text.webp" alt="People connecting through community and care" loading="lazy"/><div><p className={styles.eyebrow}>Community Events</p><h2 className={styles.heading}>Connection, care, and shared experiences</h2><p className={styles.text}>Community activities bring people together, creating space for friendship, conversation, and support.</p><p className={styles.text}>Explore gatherings and demonstrations designed around the needs of seniors and their families.</p></div></section>
    <section className={`${styles.section} ${styles.center}`}><h2 className={styles.heading}>Community Gallery</h2><p className={styles.text}>Browse community activities, customer experiences, and product demonstrations.</p><div className={styles.filters} aria-label="Gallery categories">{filters.map(item=><button key={item} aria-pressed={filter===item} onClick={()=>setFilter(item)}>{item}</button>)}</div><div className={styles.empty} role="status">No {filter === "All" ? "gallery items" : filter.toLowerCase()} are currently published.</div></section>
    <section className={styles.section}><h2 className={`${styles.heading} ${styles.center}`}>Helpful Information</h2><div className={styles.faq}><details><summary>Where can I explore products?</summary><p>Visit our <Link href="/products">Products page</Link> to browse the project’s catalogue.</p></details><details><summary>How can I learn about community programs?</summary><p>Contact the team using the email or telephone number below to ask about events and participation.</p></details><details><summary>How do I get in touch?</summary><p>Email <a href="mailto:support@merabetta.com">support@merabetta.com</a> or call <a href="tel:+918999188267">+91 89991 88267</a>.</p></details></div></section>
    <section className={`${styles.callout} ${styles.communityCallout}`} aria-labelledby="community-connected-title"><div><h2 id="community-connected-title" className={styles.heading}>Let’s stay connected</h2><p className={styles.text}>Have a question about services or community activities? We’re here to help.</p></div><img className={styles.communityCalloutImage} src="/app/community-support-wide.webp" alt="A friendly support team member ready to help" width={2172} height={724} loading="lazy"/></section>
  </PublicPageShell>;
}
