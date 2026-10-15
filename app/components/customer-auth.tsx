"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { customerApi, ApiError, errorMessage, type Challenge, type Profile, type Gender } from "../lib/customer-api";
import { useCare } from "./care-store";
import styles from "./customer-auth.module.css";

export function OtpLogin({ onDone, redirectTo = "/profile" }: { onDone?: () => void; redirectTo?: string | null }) {
  const { setAccount } = useCare();
  const router = useRouter();
  const [phone, setPhone] = useState(""); const [code, setCode] = useState("");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [resendAt, setResendAt] = useState(0); const [expiresAt, setExpiresAt] = useState(0); const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState(false); const lock = useRef(false); const [error, setError] = useState("");
  const [verifyAfter, setVerifyAfter] = useState(0);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  async function send() {
    if (lock.current || Date.now() < resendAt) return;
    lock.current = true; setBusy(true); setError("");
    try {
      const result = await customerApi.requestOtp(phone);
      const requestedAt = Date.now();
      setResendAt(requestedAt + result.resendAfter * 1000);
      if (result.delivery === "development" && process.env.NODE_ENV !== "development") {
        setChallenge(null); setCode("");
        setError("SMS delivery is not enabled. Please contact support to activate SMS sign-in.");
        return;
      }
      // A local entry deadline does not change the backend challenge expiry.
      setChallenge(result); setCode(""); setVerifyAfter(0); setNow(requestedAt);
      setExpiresAt(requestedAt + Math.min(60, result.expiresIn) * 1000);
    }
    catch (e) { setError(errorMessage(e)); if (e instanceof ApiError && e.retryAfter) setResendAt(Date.now() + e.retryAfter * 1000); }
    finally { lock.current = false; setBusy(false); }
  }
  async function verify() {
    if (lock.current || !challenge || Date.now() < verifyAfter) return;
    if (Date.now() >= expiresAt) { setError("The OTP entry window has ended. Request a new OTP."); return; }
    lock.current = true; setBusy(true); setError("");
    try { const account = await customerApi.verifyOtp(challenge.challengeId, code); setAccount(account); onDone?.(); if (redirectTo) router.push(redirectTo); }
    catch (e) { setError(errorMessage(e)); if (e instanceof ApiError && e.retryAfter) setVerifyAfter(Date.now() + e.retryAfter * 1000); }
    finally { lock.current = false; setBusy(false); }
  }
  const developmentOtp = process.env.NODE_ENV === "development" && challenge?.delivery === "development" && /^\d{6}$/.test(challenge.devCode ?? "") && now < expiresAt ? challenge.devCode : null;
  return <div className={styles.login}><header className={styles.intro}><h2>{challenge ? "Verify your mobile" : "Sign in to Merabetta"}</h2><p>{challenge ? `Enter the 6-digit OTP sent to +91 ${phone}.` : "Enter your mobile number. We’ll send you a 6-digit OTP to sign in."}</p></header><form className={styles.form} onSubmit={e => { e.preventDefault(); void (challenge ? verify() : send()); }}>
    <label className={`ca-field ${styles.phoneField}`}>Mobile number<span className={styles.phoneControl}><span className={styles.prefix} aria-hidden="true">+91</span><input className={styles.phoneInput} aria-label="Mobile number" placeholder="10-digit mobile number" required type="tel" autoComplete="tel-national" inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} value={phone} disabled={!!challenge} onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}/></span><span className={styles.hint}>Use your 10-digit Indian mobile number.</span></label>
    {challenge && <>{developmentOtp && <p role="status">Development OTP: <strong>{developmentOtp}</strong><br/>SMS is not sent in this test mode.</p>}<label className="ca-field">OTP<input required autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e => setCode(e.target.value)}/></label><p>OTP entry expires in {Math.max(0, Math.ceil((expiresAt - now) / 1000))} seconds.</p></>}
    <ErrorText message={error}/><button className="ca-button" disabled={busy || (!challenge && now < resendAt) || (!!challenge && (now >= expiresAt || now < verifyAfter))}>{busy ? "Please wait…" : challenge ? now < verifyAfter ? `Retry verification in ${Math.ceil((verifyAfter - now) / 1000)}s` : "Verify OTP" : "Send OTP"}</button>
  </form>{challenge && <><button className="ca-text-button" disabled={busy || now < resendAt} onClick={() => void send()}>{now < resendAt ? `Resend in ${Math.ceil((resendAt - now) / 1000)}s` : "Resend OTP"}</button><button className="ca-text-button" disabled={busy} onClick={() => { setChallenge(null); setCode(""); setError(""); }}>Change mobile number</button></>}</div>;
}
export function ErrorText({ message }: { message: string }) { return message ? <p role="alert" className="ch-auth-error">{message}</p> : null; }
export function SignInForm({ onDone, redirectTo = null }: { onDone?: () => void; redirectTo?: string | null }) {
  return <div className={styles.signIn}><OtpLogin onDone={onDone} redirectTo={redirectTo}/></div>;
}
export function SessionGate({ children }: { children: ReactNode }) {
  const { account, sessionError, sessionLoading, restoreSession } = useCare();
  if (sessionLoading) return <p role="status">Restoring your account…</p>;
  if (sessionError) return <section className="ca-panel"><ErrorText message={sessionError}/><button className="ca-button" onClick={() => void restoreSession()}>Retry connection</button></section>;
  if (!account) return <section className="ca-panel"><SignInForm/></section>;
  if (!account.user.profileCompleted) return <ProfileForm/>;
  return children;
}
export function ProfileForm() {
  const { account, setAccount } = useCare(); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const [value, setValue] = useState<Profile>(() => ({ firstName: account?.user.firstName ?? "", lastName: account?.user.lastName ?? "", email: account?.user.email ?? "", phone: account?.user.phone ?? "", dateOfBirth: account?.user.dateOfBirth?.slice(0, 10) ?? "", gender: account?.user.gender ?? "Female" }));
  const textFields = ["firstName", "lastName", "phone", "email", "dateOfBirth"] as const;
  const labels = { firstName: "First name", lastName: "Last name", phone: "Mobile number", email: "Email", dateOfBirth: "Date of birth" };
  return <form className="ca-panel" onSubmit={async e => { e.preventDefault(); if (busy) return; setBusy(true); setError(""); try { setAccount(await customerApi.profile(value)); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); } }}><h2>{account?.user.profileCompleted ? "Your profile" : "Complete your profile"}</h2><div className="ca-form-grid">{textFields.map(field => <label key={field}>{labels[field]}<input required type={field === "dateOfBirth" ? "date" : field === "email" ? "email" : field === "phone" ? "tel" : "text"} maxLength={field === "phone" ? 10 : 100} pattern={field === "phone" ? "[6-9][0-9]{9}" : undefined} readOnly={account?.identities?.some(identity => (field === "phone" && identity.method === "phone") || (field === "email" && identity.method === "email"))} value={value[field]} onChange={e => setValue({ ...value, [field]: e.target.value })}/></label>)}<label>Gender<select value={value.gender} onChange={e => setValue({ ...value, gender: e.target.value as Gender })}>{["Female", "Male", "Other", "Prefer not to say"].map(g => <option key={g}>{g}</option>)}</select></label></div><ErrorText message={error}/><button className="ca-button" disabled={busy}>{busy ? "Saving…" : "Save profile"}</button></form>;
}
