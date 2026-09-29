"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import CareIcon from "./care-icon";
import { useCare } from "./care-store";
import SiteFooter from "./site-footer";
<<<<<<< HEAD
import HomeHeader from "./care-home-header";
=======
>>>>>>> 2f0d4a40f8a1f9194817256bdd9ddfa3415c3a15

const navigation = [
  { href: "/", name: "Home", icon: "home" },
  { href: "/products", name: "Products", icon: "grid" },
  { href: "/cart", name: "Cart", icon: "cart" },
  { href: "/labtest", name: "Lab Tests", icon: "lab" },
  { href: "/profile", name: "Profile", icon: "profile" },
];
export default function CareShell({ children, focused = false }: { children: ReactNode; focused?: boolean }) {
  const path = usePathname();
  const { state, notice } = useCare();
  const count = Object.values(state.cart).reduce((a, b) => a + b, 0);
  function links(mobile = false) {
    return navigation.map(item => <Link key={item.href} href={item.href} className={path === item.href || (item.href !== "/" && path.startsWith(item.href + "/")) ? "active" : ""} aria-current={path === item.href ? "page" : undefined}><span><CareIcon name={item.icon}/>{item.icon === "cart" && count > 0 && <b className="ca-count">{count}</b>}</span>{mobile && item.icon === "grid" ? "Categories" : mobile && item.icon === "lab" ? "Labs" : item.name}</Link>);
  }
  return <div className={`ca-app ${focused ? "ca-focused" : ""}`}>
    <a className="ca-skip" href="#main-content">Skip to content</a>
<<<<<<< HEAD
    <HomeHeader navigation={links()}/>
=======
    <div className="ca-topnote">A little care. A healthier tomorrow. <span>Free delivery on orders above ₹499</span></div>
    <header className="ca-header"><Link href="/" aria-label="Merabetta home" className="ca-logo"><img src="/logo.png" alt="Merabetta"/></Link><div className="ca-delivery"><CareIcon name="pin"/><span><small>Care, delivered to your door</small><strong>Welcome to Merabetta</strong></span></div><nav aria-label="Main navigation">{links()}</nav><Link className="ca-mobile-profile" href="/profile" aria-label="Open profile"><CareIcon name="profile"/></Link></header>
>>>>>>> 2f0d4a40f8a1f9194817256bdd9ddfa3415c3a15
    <main id="main-content" className="ca-main">{children}</main>
    <SiteFooter/>
    <nav className="ca-bottom-nav" aria-label="Mobile navigation">{links(true)}</nav>
    {notice && <div className="ca-toast" role="status"><CareIcon name="check"/>{notice}</div>}
  </div>;
}

export function PageHeading({ eyebrow, title, text }: { eyebrow?: string; title: string; text?: string }) {
  return <div className="ca-page-heading">{eyebrow && <span className="ca-eyebrow">{eyebrow}</span>}<h1>{title}</h1>{text && <p>{text}</p>}</div>;
}
export function EmptyState({ title, text, href = "/products", action = "Start shopping" }: { title: string; text: string; href?: string; action?: string }) {
  return <div className="ca-empty"><CareIcon name="bag" size={42}/><h2>{title}</h2><p>{text}</p><Link className="ca-button" href={href}>{action}<CareIcon name="arrow"/></Link></div>;
}
