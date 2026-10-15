"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import CareIcon from "./care-icon";
import { useCare } from "./care-store";
import DesktopNavbar from "./desktop-navbar";
import { SignInForm } from "./customer-auth";

export default function HomeHeader({ navigation, showSearch = true, compact = false, home = false, search, mobileHeading }: { navigation: ReactNode; showSearch?: boolean; compact?: boolean; home?: boolean; search?: ReactNode; mobileHeading?: ReactNode }) {
  const { state, ready } = useCare();
  const dialog = useRef<HTMLDialogElement>(null);
  const accountAction = ready && state.profile ? <Link className="ch-login" href="/profile">Account</Link> : <button className="ch-login" disabled={!ready} onClick={() => dialog.current?.showModal()}>Login</button>;
  return <>
    {compact ? <DesktopNavbar search={search} mobileHeading={mobileHeading} onSignIn={() => dialog.current?.showModal()}/> : <header className="ch-header">
      <div className="ch-top"><Link href="/" className="ch-logo" aria-label="Merabetta home"><img src="/logo.png" alt="Merabetta"/></Link><div className="ch-welcome"><strong>Welcome to Merabetta</strong><span>Wellness starts here <b>✦</b></span></div><Link className="ch-bell" href="/notifications" aria-label="Notifications"><CareIcon name="bell" size={27}/></Link>{accountAction}</div>
      {showSearch && <form className="ch-search" action="/products" role="search"><button type="submit" aria-label="Search products"><CareIcon name="search" size={25}/></button><input name="q" aria-label="Search products, brands, health solutions" placeholder="Search products, brands, health solutions..." autoComplete="off"/></form>}
      <nav className="ch-navigation" aria-label="Main navigation">{navigation}</nav>
    </header>}
<dialog ref={dialog} className="ch-auth" aria-label="Sign in"><button className="ch-close" aria-label="Close login" onClick={() => dialog.current?.close()}><CareIcon name="close"/></button><img className="ch-auth-logo" src="/logo.png" alt="Merabetta"/><SignInForm onDone={() => dialog.current?.close()} redirectTo="/profile"/></dialog>
  </>;
}
