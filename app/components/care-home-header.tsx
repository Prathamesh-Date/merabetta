"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import CareIcon from "./care-icon";
import { useCare } from "./care-store";

export default function HomeHeader({ navigation }: { navigation: ReactNode }) {
  const { state, ready, update, announce } = useCare();
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [error, setError] = useState("");
  function chooseMode(next: "login" | "signup") { setMode(next); setStep("email"); setCode(""); setError(""); }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready) return;
    if (mode === "login" && step === "email") { setStep("code"); setError(""); return; }
    if (mode === "login" && code !== "123456") { setError("Use 123456 to try this demo login."); return; }
    if (mode === "signup" && !name.trim()) { setError("Please enter your name."); return; }
    const savedName = mode === "signup" ? name.trim() : state.profile?.email === email.trim() ? state.profile.name : email.trim().split("@")[0];
    update(current => ({ ...current, profile: { name: savedName, email: email.trim() } }));
    dialog.current?.close();
    announce(mode === "signup" ? "Your demo account is ready" : "Logged in to your demo profile");
    router.push("/profile");
  }
  return <>
    <header className="ch-header">
      <div className="ch-top"><Link href="/" className="ch-logo" aria-label="Merabetta home"><img src="/logo.png" alt="Merabetta"/></Link><div className="ch-welcome"><strong>Welcome to Merabetta</strong><span>Wellness starts here <b>✦</b></span></div><button className="ch-bell" aria-label="Notifications" onClick={() => announce("You’re all caught up. No new notifications.")}><CareIcon name="bell" size={27}/></button>{ready && state.profile ? <Link className="ch-login" href="/profile">Account</Link> : <button className="ch-login" disabled={!ready} onClick={() => { chooseMode("login"); dialog.current?.showModal(); }}>Login</button>}</div>
      <form className="ch-search" action="/products" role="search"><button type="submit" aria-label="Search products"><CareIcon name="search" size={25}/></button><input name="q" aria-label="Search products, brands, health solutions" placeholder="Search products, brands, health solutions..." autoComplete="off"/></form>
      <nav className="ch-navigation" aria-label="Main navigation">{navigation}</nav>
    </header>
    <dialog ref={dialog} className="ch-auth" aria-labelledby="auth-title" aria-describedby="auth-demo-note" onClose={() => { setError(""); setCode(""); }}>
      <button className="ch-close" aria-label="Close login" onClick={() => dialog.current?.close()}><CareIcon name="close"/></button>
      <img className="ch-auth-logo" src="/logo.png" alt="Merabetta"/>
      <h2 id="auth-title">{mode === "signup" ? "Create your account" : step === "code" ? "Try your demo login" : "Welcome back"}</h2>
      <p>A little space for your everyday care.</p>
      <div className="ch-auth-tabs" role="tablist" aria-label="Account access"><button id="auth-login" role="tab" aria-controls="auth-form" aria-selected={mode === "login"} className={mode === "login" ? "active" : ""} onClick={() => chooseMode("login")}>Log in</button><button id="auth-signup" role="tab" aria-controls="auth-form" aria-selected={mode === "signup"} className={mode === "signup" ? "active" : ""} onClick={() => chooseMode("signup")}>Sign up</button></div>
      <div role="tabpanel" id="auth-form" aria-labelledby={mode === "login" ? "auth-login" : "auth-signup"}><form onSubmit={submit}>
        {mode === "signup" && <label>Full name<input autoComplete="name" value={name} onChange={e => setName(e.target.value)} maxLength={80} required placeholder="Your full name"/></label>}
        {mode === "signup" || step === "email" ? <label>Email address<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={160} required placeholder="you@example.com"/></label> : <><p>Continue as <strong>{email}</strong></p><label>Demo verification code<input value={code} onChange={e => setCode(e.target.value)} inputMode="numeric" autoComplete="off" pattern="[0-9]{6}" maxLength={6} placeholder="123456" required/></label><button type="button" className="ch-change-email" onClick={() => { setStep("email"); setError(""); }}>Change email</button></>}
        {error && <p role="alert" className="ch-auth-error">{error}</p>}
        <button type="submit" className="ca-button" disabled={!ready}>{mode === "signup" ? "Create demo account" : step === "email" ? "Continue with email" : "Log in"}<CareIcon name="arrow" size={18}/></button>
      </form></div>
      <p id="auth-demo-note" className="ch-auth-note">Demo only. Your profile is saved in this browser. Use code <strong>123456</strong> to log in; no email is sent.</p>
    </dialog>
  </>;
}
