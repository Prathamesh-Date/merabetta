"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import CareShell from "./care-shell";
import CareIcon from "./care-icon";
import { useCare } from "./care-store";
import styles from "./customer-support.module.css";

export default function CustomerSupport({ fromHome = false }: { fromHome?: boolean }) {
  const router = useRouter(); const { account } = useCare();
  const [draft, setDraft] = useState(""); const [messages, setMessages] = useState<{ id: string; text: string }[]>([]);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { setDraft(""); setMessages([]); }, [account?.user.id]);
  function back() { if (window.history.length > 1) router.back(); else router.replace(fromHome ? "/#care-your-way-title" : "/profile"); }
  function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const text = draft.trim(); if (!text) return;
    // The supplied API contract has no support endpoint. Keep this unsent preview in memory.
    setMessages(current => [...current, { id: crypto.randomUUID(), text }]); setDraft(""); input.current?.focus();
  }
  return <CareShell mainClassName={styles.main}><section className={styles.page}>
    <header className={`ca-profile-heading ${styles.heading}`}><button type="button" onClick={back} aria-label="Back to profile"><CareIcon name="back" size={27}/></button><h1>Customer Support</h1><Link href="/profile?tab=wishlist" aria-label="View wishlist"><CareIcon name="heart" size={27}/></Link></header>
    <section className={styles.teamCard} aria-label="Merabetta care team">
      <div className={styles.teamHeading}><span className={styles.avatar}><CareIcon name="support" size={29}/></span><div><h2>Merabetta care team</h2><p>Assistant · Here to help</p></div></div>
      <p className={styles.welcome}>Hello! How can we help with your order or lab booking?</p>
    </section>
    <div className={styles.conversation} role="log" aria-label="Support conversation" aria-live="polite" aria-relevant="additions">
      {messages.map(message => <div className={styles.exchange} key={message.id}><div className={styles.userMessage}>{message.text}</div><div className={styles.assistantMessage}><p>Your message has not been sent. Support messaging is currently unavailable.</p></div></div>)}
    </div>
    <form className={styles.composer} onSubmit={send}><input ref={input} aria-label="Your support message" placeholder="Type your message..." value={draft} maxLength={2000} required onChange={e => setDraft(e.target.value)}/><button type="submit" aria-label="Send message" disabled={!draft.trim()}><CareIcon name="send" size={27}/></button></form>
    <p className={styles.availability} role="status">Support messaging is currently unavailable.</p>
  </section></CareShell>;
}
