"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import CareIcon from "./care-icon";
import { useCare } from "./care-store";

export default function HomeHeader({ navigation, quickActions, showSearch = true, showCompactSearch = false, compactSearchAction = "/products", compact = false }: { navigation: ReactNode; quickActions?: ReactNode; showSearch?: boolean; showCompactSearch?: boolean; compactSearchAction?: string; compact?: boolean }) {
  const { state, ready, update, announce } = useCare();
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  function chooseMode(next: "login" | "signup") { setMode(next); setPassword(""); setConfirmPassword(""); setError(""); }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready) return;
    if (mode === "signup" && !name.trim()) { setError("Please enter your name."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (mode === "signup" && password !== confirmPassword) { setError("Passwords do not match."); return; }
    const savedName = mode === "signup" ? name.trim() : state.profile?.email === email.trim() ? state.profile.name : email.trim().split("@")[0];
    update(current => ({ ...current, profile: { name: savedName, email: email.trim() } }));
    dialog.current?.close();
    announce(mode === "signup" ? "Your demo account is ready" : "Logged in to your demo profile");
    router.push("/profile");
  }
  const accountAction = ready && state.profile ? <Link className="ch-login" href="/profile">Account</Link> : <button className="ch-login" disabled={!ready} onClick={() => { chooseMode("login"); dialog.current?.showModal(); }}>Login</button>;
  return <>
    <header className={`ch-header ${compact ? "ch-compact" : ""}`}>
      {compact ? <div className="ch-compact-bar"><div className="ch-compact-brand"><Link href="/" className="ch-compact-logo" aria-label="Merabetta home"><img src="/logo.png" alt="Merabetta"/></Link><span className="ch-compact-welcome">Welcome to Merabetta</span></div>{showCompactSearch && <form className="ch-compact-search" action={compactSearchAction} role="search"><CareIcon name="search" size={18}/><input name="q" aria-label={compactSearchAction === "/labtest" ? "Search lab tests" : "Search products"} placeholder={compactSearchAction === "/labtest" ? "Search lab tests" : "Search products"}/></form>}<div className="ch-compact-actions"><nav className="ch-navigation" aria-label="Main navigation">{navigation}</nav><div className="ch-utility-actions"><div className="ch-quick-actions">{quickActions}</div><button className="ch-bell" aria-label="Notifications" onClick={() => announce("You’re all caught up. No new notifications.")}><CareIcon name="bell" size={22}/></button></div>{accountAction}</div></div> : <><div className="ch-top"><Link href="/" className="ch-logo" aria-label="Merabetta home"><img src="/logo.png" alt="Merabetta"/></Link><div className="ch-welcome"><strong>Welcome to Merabetta</strong><span>Wellness starts here <b>✦</b></span></div><button className="ch-bell" aria-label="Notifications" onClick={() => announce("You’re all caught up. No new notifications.")}><CareIcon name="bell" size={27}/></button>{accountAction}</div>
      {showSearch && <form className="ch-search" action="/products" role="search"><button type="submit" aria-label="Search products"><CareIcon name="search" size={25}/></button><input name="q" aria-label="Search products, brands, health solutions" placeholder="Search products, brands, health solutions..." autoComplete="off"/></form>}
      <nav className="ch-navigation" aria-label="Main navigation">{navigation}</nav></>}
    </header>
    <dialog ref={dialog} className="ch-auth" aria-labelledby="auth-title" aria-describedby="auth-demo-note" onClose={() => { setError(""); setPassword(""); setConfirmPassword(""); }}>
      <button className="ch-close" aria-label="Close login" onClick={() => dialog.current?.close()}><CareIcon name="close"/></button>
      <img className="ch-auth-logo" src="/logo.png" alt="Merabetta"/>
      <h2 id="auth-title">{mode === "signup" ? "Create your account" : "Welcome back"}</h2>
      <p>A little space for your everyday care.</p>
      <div className="ch-auth-tabs" role="tablist" aria-label="Account access"><button id="auth-login" role="tab" aria-controls="auth-form" aria-selected={mode === "login"} className={mode === "login" ? "active" : ""} onClick={() => chooseMode("login")}>Log in</button><button id="auth-signup" role="tab" aria-controls="auth-form" aria-selected={mode === "signup"} className={mode === "signup" ? "active" : ""} onClick={() => chooseMode("signup")}>Sign up</button></div>
      <div role="tabpanel" id="auth-form" aria-labelledby={mode === "login" ? "auth-login" : "auth-signup"}><form onSubmit={submit}>
        {mode === "signup" && <label>Full name<input autoComplete="name" value={name} onChange={e => setName(e.target.value)} maxLength={80} required placeholder="Your full name"/></label>}
        <label>Email address<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={160} required placeholder="you@example.com"/></label>
        <label>Password<input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} minLength={8} required placeholder="At least 8 characters"/></label>
        {mode === "signup" && <label>Confirm password<input type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength={8} required placeholder="Enter your password again"/></label>}
        {error && <p role="alert" className="ch-auth-error">{error}</p>}
        <button type="submit" className="ca-button" disabled={!ready}>{mode === "signup" ? "Create account" : "Log in"}<CareIcon name="arrow" size={18}/></button>
      </form></div>
      <p id="auth-demo-note" className="ch-auth-note">This demo stores your profile on this device. Passwords are never saved and no email is sent.</p>
    </dialog>
  </>;
}
