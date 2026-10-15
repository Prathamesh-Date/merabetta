"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import CareIcon from "./care-icon";
import { useCare } from "./care-store";
import styles from "./desktop-navbar.module.css";

const options = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Labs", href: "/labtest" },
  { label: "Services & Community", href: "/community" },
  { label: "Blogs", href: "/blog" },
];

export default function DesktopNavbar({ onSignIn, search }: { onSignIn: () => void; search?: ReactNode }) {
  const path = usePathname();
  const { state, ready } = useCare();
  const count = Object.values(state.cart).reduce((total, quantity) => total + quantity, 0);
  const accountPage = path === "/cart" || path === "/profile";
  const mobileSearch = search ?? (path === "/contact" ? <form className={styles.contactSearch} action="/products" role="search"><button type="submit" aria-label="Search products"><CareIcon name="search" size={21}/></button><input type="search" name="q" aria-label="Search products, brands, health solutions" placeholder="Search products, brands, health solutions..."/></form> : null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navbar = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!navbar.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const menuRange = window.matchMedia("(min-width: 751px) and (max-width: 1023px)");
    const closeOutsideMenuRange = () => { if (!menuRange.matches) setOpen(false); };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    menuRange.addEventListener("change", closeOutsideMenuRange);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
      menuRange.removeEventListener("change", closeOutsideMenuRange);
    };
  }, [open]);

  function links() {
    return options.map(option => {
      const active = option.href === "/" ? path === "/" : option.href.startsWith("/") && path.startsWith(option.href);
      const className = `${styles.link} ${active ? styles.active : ""}`;
      const content = <>{option.label}<span className={styles.underline} aria-hidden="true"/></>;
      return <li key={option.label}>{option.href.startsWith("/")
        ? <Link href={option.href} className={className} aria-current={active ? "page" : undefined} onClick={() => setOpen(false)}>{content}</Link>
        : <a href={option.href} className={className} onClick={() => setOpen(false)}>{content}</a>}
      </li>;
    });
  }

  const signIn = state.profile ? <Link href="/profile" className={`${styles.contact} ${styles.accountContact}`} aria-label="Account" title="Account"><span className={styles.accountLabel}>Account</span><span className={styles.arrow}><CareIcon name="profile" size={20}/></span></Link> : <button type="button" className={styles.contact} disabled={!ready} onClick={onSignIn}>
    Sign in
    <span className={styles.arrow}><CareIcon name="sign-in" size={20}/></span>
    <span className={styles.shine} aria-hidden="true"/>
  </button>;

  return <nav ref={navbar} data-desktop-navbar className={`${styles.navbar} ${accountPage ? styles.accountPage : ""} ${path !== "/" ? styles.mobilePage : ""} ${path !== "/" && !mobileSearch ? styles.mobileHidden : ""} ${scrolled ? styles.scrolled : ""} ${search ? styles.withSearch : ""}`} aria-label="Main navigation">
    <div className={styles.brand}><Link href="/" aria-label="Merabetta home"><img src="/merabetta-reference.svg" alt="Merabetta Logo" width={110} height={64}/></Link></div>
    {path === "/" && <div className={styles.mobileWelcome}><strong>Welcome to Merabetta</strong><span>Wellness starts here <b>✦</b></span></div>}
    {mobileSearch && <div className={`${styles.search} ${!search ? styles.mobileSearchFallback : ""}`}>{mobileSearch}</div>}
    <ul className={styles.links}>{links()}</ul>
    <div className={styles.actions}>
      <div className={styles.desktopActions}>
        <Link href="/cart" className={`${styles.iconLink} ${path === "/cart" ? styles.active : ""}`} aria-label={`Cart${ready && count > 0 ? `, ${count} items` : ""}`} aria-current={path === "/cart" ? "page" : undefined}><CareIcon name="cart" size={24}/>{ready && count > 0 && <span className={styles.count}>{count}</span>}</Link>
        {state.profile
          ? <Link href="/profile?tab=orders" className={styles.iconLink} aria-label="My Orders" title="My Orders"><CareIcon name="bag" size={24}/></Link>
          : <Link href="/profile" className={`${styles.iconLink} ${path === "/profile" ? styles.active : ""}`} aria-label="Profile" aria-current={path === "/profile" ? "page" : undefined}><CareIcon name="profile" size={24}/></Link>}
      </div>
      <div className={styles.contactWrap}>{signIn}</div>
      <button type="button" className={styles.menuButton} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="desktop-nav-menu" onClick={() => setOpen(value => !value)}><span/><span/><span/></button>
    </div>
    {open && <div id="desktop-nav-menu" className={styles.menu}><ul>{links()}</ul></div>}
  </nav>;
}
