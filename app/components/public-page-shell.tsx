import Link from "next/link";
import type { ReactNode } from "react";
import HomeHeader from "./care-home-header";
import SiteFooter from "./site-footer";
import CareIcon from "./care-icon";
import navigationStyles from "./product-category-navigation.module.css";
import MobileBottomNavigation from "./mobile-bottom-navigation";
import styles from "./public-pages.module.css";

export default function PublicPageShell({ children, search, contentClassName = "", backNavigationClassName = "", hidePageNavigation = false, showBackButton = false, pageTitle, showBottomNavigation = false }: { children: ReactNode; search?: ReactNode; contentClassName?: string; backNavigationClassName?: string; hidePageNavigation?: boolean; showBackButton?: boolean; pageTitle?: string; showBottomNavigation?: boolean }) {
  return <div className={`${styles.page} ${showBottomNavigation ? styles.withBottomNavigation : ""}`} data-local-content>
    <a className="ca-skip" href="#public-content">Skip to content</a>
    <HomeHeader navigation={null} compact showSearch={false} search={search}/>
    {!hidePageNavigation && <nav className={styles.mobileNav} aria-label="Page navigation"><Link href="/" aria-label="Merabetta home">Home</Link><Link href="/about">About Us</Link><Link href="/community">Community</Link><Link href="/blog">Blog</Link></nav>}
    <main id="public-content" className={`${styles.content} ${contentClassName}`}>
      {showBackButton && <div className={`${styles.backNavigation} ${backNavigationClassName}`}><Link href="/" className={navigationStyles.back} aria-label="Back to home"><CareIcon name="back" size={23}/></Link>{pageTitle && <span className={styles.backTitle}>{pageTitle}</span>}</div>}
      {children}
    </main>
    <SiteFooter/>
    {showBottomNavigation && <MobileBottomNavigation/>}
  </div>;
}
