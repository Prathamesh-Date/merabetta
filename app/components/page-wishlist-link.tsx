import Link from "next/link";
import CareIcon from "./care-icon";
import styles from "./page-wishlist-link.module.css";

export default function PageWishlistLink() {
  return <Link href="/profile?tab=wishlist" className={styles.link} aria-label="View wishlist"><CareIcon name="heart" size={19}/>Wishlist</Link>;
}
