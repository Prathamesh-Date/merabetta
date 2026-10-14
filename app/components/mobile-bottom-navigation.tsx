"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CareIcon from "./care-icon";
import { useCare } from "./care-store";
import styles from "./mobile-bottom-navigation.module.css";

const options = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/products", label: "Categories", icon: "grid" },
  { href: "/cart", label: "Cart", icon: "cart" },
  { href: "/labtest", label: "Labs", icon: "lab" },
  { href: "/profile", label: "Profile", icon: "profile" },
];

export default function MobileBottomNavigation() {
  const path = usePathname();
  const { state } = useCare();
  const count = Object.values(state.cart).reduce((total, quantity) => total + quantity, 0);

  return <nav className={`ca-bottom-nav ${styles.navigation}`} aria-label="Mobile navigation">
    {options.map(option => {
      const active = path === option.href || (option.href !== "/" && path.startsWith(`${option.href}/`));
      return <Link key={option.href} href={option.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>
        <span><CareIcon name={option.icon}/>{option.icon === "cart" && count > 0 && <b className="ca-count">{count}</b>}</span>
        {option.label}
      </Link>;
    })}
  </nav>;
}
