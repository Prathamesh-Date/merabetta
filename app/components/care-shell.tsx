"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import CareIcon from "./care-icon";
import { useCare } from "./care-store";
import SiteFooter from "./site-footer";
import HomeHeader from "./care-home-header";
import MobileBottomNavigation from "./mobile-bottom-navigation";

export default function CareShell({ children, focused = false, search, mobileHeading, mainClassName = "", hideHeader = false }: { children: ReactNode; focused?: boolean; search?: ReactNode; mobileHeading?: ReactNode; mainClassName?: string; hideHeader?: boolean }) {
  const path = usePathname();
  const { notice } = useCare();
  function desktopLinks() {
    const item = (href: string, name: string) => <Link key={href} href={href} className={path === href || (href !== "/" && path.startsWith(href + "/")) ? "active" : ""} aria-current={path === href ? "page" : undefined}>{name}</Link>;
    return [item("/", "Home"), item("/products", "Products"), item("/labtest", "Lab Tests")];
  }
  return <div className={`ca-app ${focused ? "ca-focused" : ""}`}>
    <a className="ca-skip" href="#main-content">Skip to content</a>
    {!hideHeader && <HomeHeader navigation={desktopLinks()} showSearch={path === "/"} compact home={path === "/"} search={search} mobileHeading={mobileHeading}/>}
    <main id="main-content" className={`ca-main ${mainClassName}`}>{children}</main>
    <SiteFooter/>
    <MobileBottomNavigation/>
    {notice && <div className="ca-toast" role="status"><CareIcon name="check"/>{notice}</div>}
  </div>;
}

export function PageHeading({ eyebrow, title, text }: { eyebrow?: string; title: string; text?: string }) {
  return <div className="ca-page-heading">{eyebrow && <span className="ca-eyebrow">{eyebrow}</span>}<h1>{title}</h1>{text && <p>{text}</p>}</div>;
}
export function EmptyState({ title, text, href = "/products", action = "Start shopping" }: { title: string; text: string; href?: string; action?: string }) {
  return <div className="ca-empty"><CareIcon name="bag" size={42}/><h2>{title}</h2><p>{text}</p><Link className="ca-button" href={href}>{action}<CareIcon name="arrow"/></Link></div>;
}
