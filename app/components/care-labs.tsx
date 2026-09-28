"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { asset, labs, labListings, money, tests, referenceLabIds, type LabListing } from "../data/catalog";
import CareShell from "./care-shell";
import CareIcon from "./care-icon";
import { Quantity } from "./care-catalog";
import { useCare } from "./care-store";

import type { LabPanel } from "../data/lab-flow";
const titles: Record<LabPanel, string> = {
  included: "Included Tests", preparation: "Pre-test Instructions", report: "Report Format",
  trust: "Why Trust Us?", guidance: "Pre-test Expert Guidance", related: "Frequently Booked Together",
  preview: "Report Preview", support: "Customer Support",
};
export function labUrl(lab?: string, test?: string, panel?: string) {
  const params = new URLSearchParams();
  if (lab) params.set("lab", lab);
  if (test) params.set("test", test);
  if (panel) params.set("panel", panel);
  return `/labtest${params.size ? `?${params}` : ""}`;
}

export function LabTestCard({ listing }: { listing: LabListing }) {
  const test = tests.find(t => t.id === listing.test)!;
  const lab = labs.find(l => l.id === listing.lab)!;
  const { add, wish, state, ready } = useCare();
  const saved = state.wishlist.includes(listing.id);
  return <article className="cl-test-card">
    <div className="cl-test-art"><Link href={labUrl(lab.id, test.id)} aria-label={`View ${test.name} from ${lab.name}`}><img src={asset(test.image)} alt={test.name}/></Link><button className={`ca-wish ${saved ? "saved" : ""}`} disabled={!ready} aria-label={`${saved ? "Unsave" : "Save"} ${test.name} from ${lab.name}`} aria-pressed={saved} onClick={() => wish(listing.id)}><CareIcon name="heart"/></button></div>
    <Link href={labUrl(lab.id, test.id)}><h3>{test.name}</h3></Link>
    <p>{lab.name} · {test.parameters} {test.parameters === 1 ? "parameter" : "parameters"}</p>
    <span className="cl-rating">★ {test.id === "test-1" ? "4.9" : "4.8"} <small>Sample rating</small></span>
    <div className="cl-card-purchase"><div><strong>{money(listing.price)}</strong> {listing.mrp > listing.price && <><del>{money(listing.mrp)}</del><span className="cl-discount">{Math.round((1 - listing.price / listing.mrp) * 100)}% OFF</span></>}</div><button className="cl-plus" disabled={!ready} aria-label={`Add ${test.name} from ${lab.name} to cart`} onClick={() => add(listing.id)}>+</button></div>
  </article>;
}

function ScreenTitle({ title, back, listing }: { title: string; back?: string; listing?: LabListing }) {
  const { state, wish, ready } = useCare();
  const saved = listing ? state.wishlist.includes(listing.id) : false;
  return <header className="cl-screen-title">{back && <Link href={back} aria-label="Back"><CareIcon name="back" size={25}/></Link>}<h1>{title}</h1>{listing ? <button aria-label={saved ? "Unsave test" : "Save test"} aria-pressed={saved} disabled={!ready} onClick={() => wish(listing.id)} className={saved ? "cl-saved" : ""}><CareIcon name="heart" size={26}/></button> : <Link href="/profile?tab=wishlist" aria-label="View wishlist"><CareIcon name="heart" size={26}/></Link>}</header>;
}

function Search({ value, change, placeholder }: { value: string; change: (value: string) => void; placeholder: string }) {
  return <label className="cl-search"><CareIcon name="search"/><input aria-label={placeholder} placeholder={placeholder} value={value} onChange={e => change(e.target.value)}/>{value && <button onClick={() => change("")} aria-label="Clear search"><CareIcon name="close" size={18}/></button>}</label>;
}

export default function LabsScreen({ labId = "", testId = "", panel }: { labId?: string; testId?: string; panel?: LabPanel }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [count, setCount] = useState(1);
  const { add, ready, state, wish } = useCare();
  const router = useRouter();
  useEffect(() => {
    // Continue to support links from the preserved project's lab flow.
    if (!window.location.hash) return;
    const legacy = new URLSearchParams(window.location.hash.slice(1));
    const provider = legacy.get("lab");
    if (!provider) return;
    const name = legacy.get("test");
    const test = tests.find(t => t.name === name || t.id === name || (name === "Comprehensive Health Check" && t.id === "test-1"));
    const aliases: Record<string, string> = { "included-tests": "included", "report-format": "report", "report-preview": "preview" };
    const panel = legacy.get("panel");
    router.replace(labUrl(provider === "orange-health" ? "orange" : provider, test?.id, panel ? aliases[panel] ?? panel : undefined));
  }, [router]);
  const lab = labs.find(l => l.id === labId);
  const listing = labListings.find(l => l.lab === labId && l.test === testId);
  const test = listing ? tests.find(t => t.id === listing.test)! : undefined;
  const chosenTest = tests.find(t => t.id === testId);
  const available = labListings.filter(l => l.lab === labId);
  const visible = available.filter(l => {
    const t = tests.find(t => t.id === l.test)!;
    return (category === "All" || t.category === category) && `${t.name} ${t.subtitle}`.toLowerCase().includes(query.trim().toLowerCase());
  });
  const visibleLabs = referenceLabIds.map(id => labs.find(l => l.id === id)!).filter(l => `${l.name} Pune`.toLowerCase().includes(query.trim().toLowerCase()) && (!chosenTest || labListings.some(item => item.lab === l.id && item.test === testId)));
  const back = panel ? labUrl(labId, testId, panel === "preview" ? "report" : undefined) : listing ? labUrl(labId) : lab ? "/labtest" : undefined;
  const title = panel ? titles[panel] : listing ? "Test Details" : lab ? lab.name : "Labs";

  return <CareShell focused><div className={`cl-flow ${panel ? "cl-panel-page" : ""}`}>
    <ScreenTitle title={title} back={back} listing={listing}/>
    {!lab ? <>
      <section className="cl-banner"><CareIcon name="lab" size={42}/><div><h2>Your health. Your choice.</h2><p>{chosenTest ? `Choose a lab for ${chosenTest.name}.` : "Choose a lab to explore its tests, packages and prices."}</p></div></section>
      <Search value={query} change={setQuery} placeholder="Search labs by name or city..."/>
      <div className="cl-section-title"><h2>Choose your lab</h2><span>{visibleLabs.length} labs</span></div>
      <div className="cl-lab-grid">{visibleLabs.map(provider => {
        const offerings = labListings.filter(l => l.lab === provider.id);
        return <Link className="cl-lab-card" key={provider.id} href={labUrl(provider.id, chosenTest?.id)}>
          <div className="cl-lab-card-top"><span className="cl-lab-image" style={{ background: provider.background }}><img src={asset("lab")} alt=""/></span><div><h3>{provider.name}</h3><p>Pune · ★ 4.8</p><small>Home sample collection and digital reports</small></div><CareIcon name="chevron"/></div>
          <div className="cl-lab-card-meta"><span className="cl-discount">{offerings.length} tests & packages</span><strong style={{ color: provider.color }}>From {money(Math.min(...offerings.map(l => l.price)))}</strong></div><small>Home collection available</small>
        </Link>;
      })}</div>{!visibleLabs.length && <div className="ca-empty"><h2>No labs found</h2><p>Try a different lab name or city.</p><button className="ca-button" onClick={() => setQuery("")}>Clear search</button></div>}
    </> : panel ? <LabInformation panel={panel} labId={labId} listing={listing}/> : !listing ? <>
      <section className="cl-provider-banner" style={{ background: lab.background }}><div><h2>{lab.name}</h2><p>Home sample collection and digital reports</p></div><Link href="/labtest">Change lab</Link></section>
      <Search value={query} change={setQuery} placeholder="Search tests and health packages..."/>
      <div className="cl-filters" aria-label="Filter lab tests">{["All", ...Array.from(new Set(available.map(l => tests.find(t => t.id === l.test)!.category)))].map(c => <button key={c} aria-pressed={category === c} className={category === c ? "active" : ""} onClick={() => setCategory(c)}>{c}</button>)}</div>
      <section className="cl-banner cl-choice"><CareIcon name="lab" size={42}/><div><h2>Know your health.<br/>Care for your future.</h2><p>Convenient sample collection at home</p></div><Link className="cl-secondary" href={labUrl(labId, undefined, "trust")}>Why choose Merabetta? <CareIcon name="arrow"/></Link></section>
      <div className="cl-section-title"><h2>Popular health packages</h2><span>{visible.length} available</span></div>
      <div className="cl-test-grid">{visible.map(l => <LabTestCard key={l.id} listing={l}/>)}</div>{!visible.length && <div className="ca-empty"><h2>No matching tests</h2><p>Try another search or category.</p><button className="ca-button" onClick={() => { setQuery(""); setCategory("All"); }}>Clear filters</button></div>}
    </> : test && <>
      <section className="cl-provider-banner cl-detail-provider" style={{ background: lab.background }}><div><h2>{lab.name}</h2><p>Home sample collection and digital reports</p></div><Link href="/labtest">Change lab</Link></section>
      <div className="cl-detail-top"><div className="cl-detail-art"><img src={asset(test.image)} alt={test.name}/><button className={`ca-wish ${state.wishlist.includes(listing.id) ? "saved" : ""}`} disabled={!ready} aria-label="Save this test" aria-pressed={state.wishlist.includes(listing.id)} onClick={() => wish(listing.id)}><CareIcon name="heart" size={26}/></button></div>
        <div className="cl-detail-copy"><h2>{test.name}</h2><p>{lab.name} · {test.parameters} {test.parameters === 1 ? "parameter" : "parameters"}</p><span className="cl-rating">★ {test.id === "test-1" ? "4.9" : "4.8"} · Sample rating</span><div className="cl-detail-price"><strong>{money(listing.price)}</strong>{listing.mrp > listing.price && <><del>{money(listing.mrp)}</del><span className="cl-discount">{Math.round((1 - listing.price / listing.mrp) * 100)}% OFF</span></>}</div><small>Inclusive of all taxes · Demo prices</small>
          <div className="cl-facts">{[["list", "Includes", `${test.parameters} parameters`], ["report", "Report time", `Within ${listing.hours} hours`], ["drop", "Sample type", "Blood sample"], ["home", "Collection", "At your home"], ["clock", "Preparation", listing.preparation]].map(([icon, label, value]) => <div key={label}><CareIcon name={icon}/><span>{label}</span><strong>{value}</strong></div>)}</div>
        </div>
      </div>
      <div className="cl-detail-bottom"><nav className="cl-detail-links" aria-label="Test information">{(["included", "preparation", "report", "trust", "guidance", "related"] as LabPanel[]).map(p => <Link key={p} href={labUrl(labId, testId, p)}>{titles[p]}<CareIcon name="chevron"/></Link>)}</nav>
        <section className="cl-purchase" aria-label="Add test or book appointment"><div className="cl-offer"><CareIcon name="ticket"/>{listing.mrp > listing.price ? `You save ${money(listing.mrp - listing.price)} on this test` : "Home sample collection with your chosen lab"}</div><div className="cl-quantity-row"><span>Quantity</span><Quantity value={count} onChange={setCount} name={test.name}/></div><button className="ca-button cl-action" disabled={!ready} onClick={() => add(listing.id, count)}>Add test to cart <CareIcon name="arrow"/></button><Link className="cl-secondary" href="/cart">View cart <CareIcon name="arrow"/></Link><button className="cl-book" disabled={!ready} onClick={() => { const extra = count - (state.cart[listing.id] ?? 0); if (extra > 0) add(listing.id, extra); router.push("/cart?appointment=1"); }}>Book appointment <CareIcon name="arrow"/></button><p className="cl-demo-note">Demo booking · Choose your collection date and time at checkout.</p></section>
      </div>
    </>}
    {!listing && !panel && <p className="cl-demo-note">Lab profiles, ratings, prices and availability are sample data.</p>}
  </div></CareShell>;
}

function LabInformation({ panel, labId, listing }: { panel: LabPanel; labId: string; listing?: LabListing }) {
  const test = listing ? tests.find(t => t.id === listing.test)! : undefined;
  const [trustTab, setTrustTab] = useState("NABL");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ from: string; text: string }[]>([]);
  const { announce } = useCare();
  const href = (next: string) => labUrl(labId, test?.id, next);
  async function share(title: string, text: string) {
    try {
      if (navigator.share) await navigator.share({ title, text });
      else if (navigator.clipboard) { await navigator.clipboard.writeText(text); announce("Copied to clipboard"); }
      else announce("Sharing is unavailable in this browser. Select and copy the text on this page.");
    } catch (error) { if (!(error instanceof DOMException && error.name === "AbortError")) announce("Could not share. Please copy the text from this page."); }
  }
  const reportText = "MERABETTA · SAMPLE REPORT\nExample patient · Demo only. No diagnostic or clinical use.\nHaemoglobin: 14.2 g/dL (13–17)\nWBC count: 7,200 /µL (4,000–11,000)\nPlatelets: 250,000 /µL (150k–450k)\nIllustrative values only. Reference ranges vary by laboratory and patient.";
  const preparation = "Sample preparation guide: Stay hydrated with plain water. Follow the fasting instructions from your lab. Tell your clinician about medications. Wear comfortable clothing. Your laboratory must provide test-specific preparation guidance.";
  const trustCopy: Record<string, [string, string]> = {
    NABL: ["Quality you can count on", "Sample partner accreditation details. Actual lab credentials must be verified before launch."],
    Quality: ["Care in every detail", "Thoughtful sample handling and clear reports throughout your health journey."],
    Experience: ["People behind your care", "Our demo care team helps you understand the booking and reporting process."],
    Support: ["Here when you need us", "Get help with bookings, reports and orders through our support screen."],
  };
  return <div className="cl-information">
    {panel === "included" && test && <><h2>{test.parameters} test parameters</h2><p>Sample test groups for {test.name}</p><div className="cl-accordion">{test.included.map(name => <details key={name}><summary><span>{name}<small>Tap to view sample details</small></span><CareIcon name="chevron"/></summary><p>This group is included in the selected package. The complete parameter list and clinical interpretation will be provided by the performing laboratory.</p></details>)}</div></>}
    {panel === "preparation" && <><h2>Important instructions</h2><div className="cl-instruction-list">{[["drop", "Stay hydrated with plain water"], ["clock", "Follow the fasting instructions from your lab"], ["medical", "Tell your clinician about medications"], ["shirt", "Wear comfortable clothing"]].map(([icon, text]) => <div key={text}><CareIcon name={icon}/><span>{text}</span></div>)}</div><p>These are sample instructions. Your chosen laboratory must provide test-specific preparation guidance.</p><button className="cl-secondary" onClick={() => share("Preparation guide", preparation)}>Share preparation guide <CareIcon name="arrow"/></button><div className="cl-offer"><CareIcon name="shield"/>Your lab will confirm preparation details before collection.</div></>}
    {(panel === "report" || panel === "preview") && <><div className="cl-report-intro"><span><CareIcon name="report" size={30}/></span><div><h2>Digital health report</h2><p>A clear view of your wellbeing</p></div></div>{panel === "report" ? <><h2>What’s included?</h2><Checklist items={["Test summary & results", "Reference ranges", "Clinician notes, where applicable", "Shareable report"]}/><Link className="cl-secondary" href={href("preview")}>View sample report <CareIcon name="arrow"/></Link></> : <div className="cl-report-preview"><h2>MERABETTA · SAMPLE REPORT</h2><p>Example patient · Demo only<br/>No diagnostic or clinical use</p><table><thead><tr><th>Parameter</th><th>Result</th><th>Reference</th></tr></thead><tbody><tr><td>Haemoglobin</td><td>14.2 g/dL</td><td>13–17</td></tr><tr><td>WBC count</td><td>7,200 /µL</td><td>4,000–11,000</td></tr><tr><td>Platelets</td><td>250,000 /µL</td><td>150k–450k</td></tr></tbody></table><p className="cl-demo-note">Illustrative values only. Reference ranges vary by laboratory and patient.</p><button className="cl-secondary" onClick={() => share("Sample report", reportText)}>Share sample report <CareIcon name="arrow"/></button></div>}</>}
    {panel === "trust" && <><div className="cl-filters" role="tablist" aria-label="Why trust us">{Object.keys(trustCopy).map(tab => <button key={tab} role="tab" id={`trust-${tab}`} aria-controls="trust-content" aria-selected={trustTab === tab} className={trustTab === tab ? "active" : ""} onClick={() => setTrustTab(tab)}>{tab}</button>)}</div><section className="cl-trust-panel" role="tabpanel" id="trust-content" aria-labelledby={`trust-${trustTab}`}><span className="cl-medal"><CareIcon name="award" size={52}/></span><h2>{trustCopy[trustTab][0]}</h2><p>{trustCopy[trustTab][1]}</p><div className="cl-trust-grid">{[["check-circle", "Accurate results"], ["shield", "Certified labs"], ["people", "Expert team"], ["lock", "Secure process"]].map(([icon, text]) => <div key={text}><CareIcon name={icon} size={29}/><span>{text}</span></div>)}</div><Link className="cl-secondary" href={href("support")}>Talk to support <CareIcon name="arrow"/></Link></section></>}
    {panel === "guidance" && <><section className="cl-guidance"><CareIcon name="profile" size={65}/><h2>Have questions?<br/>We’re here for you.</h2><p>Get help preparing for your lab appointment and navigating your report.</p><Link className="ca-button cl-action" href={href("support")}>Chat with our care team <CareIcon name="arrow"/></Link></section><h2>Expert support includes</h2><Checklist items={["Test preparation queries", "Understanding the report process", "Booking and collection assistance"]}/><p className="cl-demo-note">Demo support does not offer medical advice.</p></>}
    {panel === "related" && <><p>Complete your wellness routine with these popular tests.</p><div className="cl-test-grid">{labListings.filter(l => l.lab === labId && l.id !== listing?.id).map(l => <LabTestCard key={l.id} listing={l}/>)}</div><div className="cl-shopping-banner"><div><h2>Good health<br/>comes home</h2><p>Everyday care essentials.</p><Link className="ca-button" href="/products">Shop now <CareIcon name="arrow"/></Link></div><img src={asset("care")} alt="A caregiver supporting an older adult"/></div></>}
    {panel === "support" && <><section className="cl-support"><div className="cl-report-intro"><span><CareIcon name="support" size={30}/></span><div><h2>Merabetta care team</h2><p>Demo assistant · Here to help</p></div></div><p>Hello! How can we help with your order or lab booking?</p></section><div className="cl-messages" aria-live="polite">{messages.map((m, i) => <p className={m.from === "You" ? "cl-message-user" : ""} key={i}><strong>{m.from}</strong>{m.text}</p>)}</div><form className="cl-chat-form" onSubmit={e => { e.preventDefault(); if (!message.trim()) return; const reply = /report/i.test(message) ? "Open Report Format from your selected test to view the sample report. Actual reports must be provided by your chosen lab." : /prepar|fast|water|medic/i.test(message) ? "Open Pre-test Instructions for the sample guide. Confirm preparation and medication questions with your lab or clinician." : "To book, choose a lab and test, then use Book appointment. Review your cart and choose a collection date and time. This demo saves bookings on your device; it does not contact a laboratory."; setMessages(current => [...current, { from: "You", text: message.trim() }, { from: "Demo care team", text: reply }]); setMessage(""); }}><input aria-label="Message to demo care team" value={message} onChange={e => setMessage(e.target.value)} maxLength={500} placeholder="Write your message..." required/><button aria-label="Send message" disabled={!message.trim()}><CareIcon name="send" size={27}/></button></form></>}
  </div>;
}

function Checklist({ items }: { items: string[] }) {
  return <ul className="cl-checklist">{items.map(item => <li key={item}><span><CareIcon name="check" size={15}/></span>{item}</li>)}</ul>;
}
