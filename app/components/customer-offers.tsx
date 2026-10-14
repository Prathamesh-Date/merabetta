"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CareShell from "./care-shell";
import CareIcon from "./care-icon";
import styles from "./customer-offers.module.css";

export default function CustomerOffers() {
  const router = useRouter();
  return <CareShell mainClassName={styles.main}><section className={styles.page}>
    <header className={`ca-profile-heading ${styles.heading}`}><button type="button" aria-label="Back to profile" onClick={() => { if (window.history.length > 1) router.back(); else router.replace("/profile"); }}><CareIcon name="back" size={27}/></button><h1>Offers &amp; Coupons</h1><Link href="/profile?tab=wishlist" aria-label="View wishlist"><CareIcon name="heart" size={27}/></Link></header>
    <section className={styles.card}><span className={styles.badge}><CareIcon name="heart" size={24}/></span><h2>A little VIP treatment</h2><p>Explore handpicked wellness essentials. Membership benefits are coming soon.</p><Link href="/products" className={styles.explore}>Explore wellness<CareIcon name="arrow" size={22}/></Link></section>
    <Link href="/cart" className={styles.cart}>View cart<CareIcon name="arrow" size={22}/></Link>
  </section></CareShell>;
}
