"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, customerApi, ApiError, errorMessage, type Lab, type Test } from "../lib/customer-api";
import { asset, labs as displayLabs, money } from "../data/catalog";
import type { LabPanel } from "../data/lab-flow";
import CareShell from "./care-shell";
import CareIcon from "./care-icon";
import LabTrust from "./lab-trust";
import { LabGuidance, LabPreparation, LabReport } from "./lab-information-panels";
import trustStyles from "./lab-trust.module.css";
import HistoryBackButton from "./history-back-button";
import { ErrorText } from "./customer-auth";
import { useCare } from "./care-store";
import { publicLabCatalog, resolvePublicTest } from "../data/public-lab-catalog";
import LoadingState from "./loading-state";
import navigationStyles from "./product-category-navigation.module.css";

const titles: Record<LabPanel, string> = { included: "Included Tests", preparation: "Pre-test Instructions", report: "Report Format", trust: "Why Trust Us?", guidance: "Pre-test Expert Guidance", related: "Frequently Booked Together", preview: "Report Preview", support: "Customer Support" };
export function liveLabUrl(test?: string, panel?: LabPanel) {
  const params = new URLSearchParams({ lab: "redcliffe" });
  if (test) params.set("test", test); if (panel) params.set("panel", panel);
  return `/labtest?${params}`;
}
export default function CustomerLabs({ testId = "", labId = "", initialQuery = "", panel }: { testId?: string; labId?: string; initialQuery?: string; panel?: LabPanel }) {
  const { account, catalog, setCatalog, state, wish, ready } = useCare();
  const [labs, setLabs] = useState<Lab[]>([]); const [loading, setLoading] = useState(false); const [error, setError] = useState(""); const [query, setQuery] = useState(initialQuery); const [category, setCategory] = useState("All"); const [retry, setRetry] = useState(0);
  const [groups, setGroups] = useState<{ name: string; parameters: string[] }[]>([]); const [parametersLoading, setParametersLoading] = useState(false);
  const disabledLab = Boolean(labId && labId !== "redcliffe");
  const directory = disabledLab || (!testId && labId !== "redcliffe" && !panel);
  // Guests and signed-in visitors use the same API catalog. No fixture fallback.
  const browseCatalog = catalog;
  const preview = publicLabCatalog.find(test => test.id === testId);
  const selected = browseCatalog.find(test => test.id === testId) || (preview ? resolvePublicTest(preview,catalog) : undefined);
  const brand = displayLabs.find(lab => lab.id === "redcliffe")!;
  const backendLab = labs.find(lab => lab.id === "redcliffe" || /redcliffe/i.test(lab.name));
  const provider = { ...brand, name: backendLab?.name || brand.name };
  useEffect(() => {
    if (["trust", "guidance", "report", "preview"].includes(panel ?? "")) return;
    const controller = new AbortController(); setLoading(true); setError("");
    async function load() {
      const results = await Promise.allSettled([customerApi.catalog(controller.signal), customerApi.labs(controller.signal)]);
      if (controller.signal.aborted) return;
      const errors: string[] = [];
      if (results[0].status === "fulfilled") setCatalog(results[0].value.data);
      else { setCatalog([]); errors.push(results[0].reason instanceof ApiError && results[0].reason.status === 401 ? "Live test catalog is temporarily unavailable. Please try again later." : errorMessage(results[0].reason)); }
      if (results[1].status === "fulfilled") {
        let list = results[1].value.data;
        for (let page = 2; page <= results[1].value.pagination.totalPages; page++) {
          try { const result = await api<{ data: Lab[] }>(`/labs/lablisting?limit=100&page=${page}`, "GET", undefined, controller.signal); list = [...list, ...result.data]; }
          catch (e) { if (!controller.signal.aborted) errors.push(errorMessage(e)); break; }
        }
        if (!controller.signal.aborted) setLabs(list);
      } else { setLabs([]); errors.push(results[1].reason instanceof ApiError && results[1].reason.status === 401 ? "Live lab information is temporarily unavailable." : errorMessage(results[1].reason)); }
      if (!controller.signal.aborted) { setError(errors.join(" · ")); setLoading(false); }
    }
    void load(); return () => controller.abort();
  }, [account?.user.id, retry, setCatalog, panel]);
  useEffect(() => {
    setGroups([]); setParametersLoading(false); if (!selected || panel !== "included") return;
    const controller = new AbortController(); setParametersLoading(true);
    customerApi.parameters(selected.packageCode, controller.signal).then(r => setGroups(r.data)).catch(e => { if (!controller.signal.aborted) setError(errorMessage(e)); }).finally(() => { if (!controller.signal.aborted) setParametersLoading(false); });
    return () => controller.abort();
  }, [selected, panel]);
  const categories = ["All", "Tests", "Packages"];
  const typeMatches = (test: Test, label: "Tests" | "Packages") => test.parameters != null ? label === "Tests" ? test.parameters === 1 : test.parameters > 1 : [test.category, ...(test.categories ?? [])].some(value => label === "Tests" ? /^tests?$/i.test(value?.trim() ?? "") : /^packages?$/i.test(value?.trim() ?? ""));
  const visible = browseCatalog.filter(test => (category === "All" || typeMatches(test, category as "Tests" | "Packages")) && `${test.name} ${test.subtitle ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()));
  const visibleLabs = labs.filter(lab => lab.active && `${lab.name} ${lab.city}`.toLowerCase().includes(query.trim().toLowerCase())).map(lab => {
    const appearance = displayLabs.find(item => item.id === lab.id) || brand;
    return { ...lab, color: appearance.color, background: appearance.background };
  });
  const back = panel ? liveLabUrl(testId || undefined, panel === "preview" ? "report" : undefined) : testId ? liveLabUrl() : directory ? "/" : "/labtest";
  const title = directory ? "Labs" : panel ? titles[panel] : testId ? "Test Details" : provider.name;
  // Form extensions can add fdprocessedid before hydration; tolerate it only on this native input.
  const search = !testId && !panel ? <label className="cl-search ca-nav-search"><CareIcon name="search"/><input suppressHydrationWarning aria-label={directory ? "Search labs by name or city..." : "Search tests and health packages..."} placeholder={directory ? "Search labs by name or city..." : "Search tests and health packages..."} value={query} onChange={e => setQuery(e.target.value)}/>{query && <button onClick={() => setQuery("")} aria-label="Clear search"><CareIcon name="close" size={18}/></button>}</label> : undefined;
  const heading = <header className={`cl-screen-title ${directory ? "cl-quiet-title" : ""} ${["trust", "guidance", "preparation", "report", "preview"].includes(panel ?? "") ? trustStyles.heading : ""}`}><HistoryBackButton fallback={back} className={navigationStyles.back}><CareIcon name="back" size={23}/></HistoryBackButton><h1>{title}</h1>{selected ? <button aria-label={state.wishlist.includes(selected.id) ? "Unsave test" : "Save test"} aria-pressed={state.wishlist.includes(selected.id)} disabled={!ready} onClick={() => wish(selected.id)} className={state.wishlist.includes(selected.id) ? "cl-saved" : ""}><CareIcon name="heart" size={26}/></button> : <Link href="/profile?tab=wishlist" aria-label="View wishlist"><CareIcon name="heart" size={26}/></Link>}</header>;
  const mobileHeading = !testId && !panel ? heading : undefined;
  return <CareShell mobileHeading={mobileHeading} focused mainClassName={directory ? "ca-labs-directory" : panel ? "" : testId ? "ca-lab-details" : "ca-lab-packages"} search={search}><div className={`cl-flow ${panel ? "cl-panel-page" : ""}`}>
    <div className={mobileHeading ? "ca-desktop-page-heading" : undefined}>{heading}</div>
    <ErrorText message={error}/>{error && <button className="ca-text-button" onClick={() => setRetry(retry + 1)}>Retry loading</button>}
    {directory ? <>
      <section className="cl-banner cl-lab-intro"><div className="cl-banner-inner"><span className="cl-banner-icon"><CareIcon name="lab" size={38}/></span><div><h2>Your health. Your choice.</h2><p>Compare trusted labs, health tests, packages and prices in one place.</p></div></div></section>
      <div className="cl-section-title cl-lab-section-title"><div><h2>Choose your lab</h2><p>Select the partner that feels right for your care.</p></div><span>{loading ? "Loading…" : `${visibleLabs.length} ${visibleLabs.length === 1 ? "lab" : "labs"}`}</span></div>
      <div className="cl-lab-grid">{visibleLabs.map(lab => {
        const enabled = lab.id === "redcliffe" || /redcliffe/i.test(lab.name); const available = browseCatalog.filter(test => test.available && (test.labId === lab.id || (enabled && test.labId === "redcliffe")));
        const card = <><div className="cl-lab-card-top"><span className="cl-lab-image" style={{ background: lab.background }}><img src={asset("lab")} alt=""/></span><div><h3>{lab.name}</h3><p>{lab.city}</p><small>{lab.description || "Explore health tests and packages"}</small></div><CareIcon name={enabled ? "chevron" : "lock"}/></div><div className="cl-lab-card-meta"><span className="cl-discount">{enabled ? available.length ? `${available.length} tests & packages` : "Explore tests & packages" : "Coming soon"}</span><strong style={{ color: lab.color }}>{enabled ? available.length ? `From ${money(Math.min(...available.map(test => test.price)))}` : "View packages" : "Unavailable"}</strong></div><small>{enabled ? lab.homeCollection ? "Home collection available" : "Contact lab for collection options" : "Booking is not available yet"}</small></>;
        return enabled ? <Link className="cl-lab-card" key={lab.id} href={liveLabUrl()}>{card}</Link> : <button type="button" className="cl-lab-card" key={lab.id} disabled aria-disabled="true">{card}</button>;
      })}</div>{loading && !visibleLabs.length && <LoadingState>Loading labs…</LoadingState>}{!loading && !error && !visibleLabs.length && <div className="ca-empty"><h2>{query.trim() ? "No labs found" : "No labs available"}</h2><p>{query.trim() ? "Try a different lab name or city." : "Please check back later."}</p>{query.trim() && <button className="ca-button" onClick={() => setQuery("")}>Clear search</button>}</div>}
    </> : <>
      {loading && <LoadingState>Loading labs and tests…</LoadingState>}
      {panel ? <LabInformation panel={panel} testId={testId} test={selected} groups={groups} parametersLoading={parametersLoading} tests={browseCatalog}/> : testId ? selected ? <TestDetails test={selected}/> : !loading && !error && <div className="ca-empty"><h2>Test unavailable</h2><p>Choose a test from the current catalog.</p><Link className="ca-button" href={liveLabUrl()}>Explore tests</Link></div> : <>
        <section className="cl-provider-banner" style={{ background: provider.background }}><div className="cl-banner-inner"><div><h2>Care that comes to you</h2><p>Explore {provider.name} tests and packages with home sample collection and clear digital reports.</p></div><Link className="cl-banner-action" href="/labtest">Change lab <CareIcon name="arrow"/></Link></div></section>
        <div className="cl-filters" aria-label="Filter lab tests">{categories.map(c => <button key={c} aria-pressed={category === c} className={category === c ? "active" : ""} onClick={() => setCategory(c)}>{c}</button>)}</div>
        <section className="cl-banner cl-choice"><div className="cl-banner-inner"><CareIcon name="lab" size={42}/><div><h2>A clearer view of your health.</h2><p>Book from home and receive simple digital reports with support when you need it.</p></div><Link className="cl-secondary" href={liveLabUrl(undefined, "trust")}>Why families choose Merabetta <CareIcon name="arrow"/></Link></div></section>
        <div className="cl-section-title"><h2>Popular health packages</h2><span>{visible.length} available</span></div><div className="cl-test-grid">{visible.map(test => <LiveLabTestCard key={test.id} test={test}/>)}</div>
        {!loading && !visible.length && !error && <div className="ca-empty"><h2>No matching tests</h2><p>Try another search or category.</p><button className="ca-button" onClick={() => { setQuery(""); setCategory("All"); }}>Clear filters</button></div>}
      </>}
    </>}
  </div></CareShell>;
}
export function LiveLabTestCard({ test }: { test: Test }) {
  const { ready, add, state, wish } = useCare(); const saved = state.wishlist.includes(test.id);
  return <article className="cl-test-card"><div className="cl-test-art"><Link href={liveLabUrl(test.id)} aria-label={`View ${test.name} from ${test.labName}`}><img src={testImage(test)} alt={test.name}/></Link><button className={`ca-wish ${saved ? "saved" : ""}`} disabled={!ready} aria-label={`${saved ? "Unsave" : "Save"} ${test.name}`} aria-pressed={saved} onClick={() => wish(test.id)}><CareIcon name="heart"/></button></div><Link href={liveLabUrl(test.id)}><h3>{test.name}</h3></Link><p>{test.labName}{test.parameters ? ` · ${test.parameters} ${test.parameters === 1 ? "parameter" : "parameters"}` : ""}</p>{test.rating && <span className="cl-rating">★ {test.rating}</span>}<div className="cl-card-purchase"><div><strong>{money(test.price)}</strong> {test.mrp > test.price && <><del>{money(test.mrp)}</del><span className="cl-discount">{Math.round((1 - test.price / test.mrp) * 100)}% OFF</span></>}</div><button className="cl-plus" disabled={!ready || !test.available} aria-label={`Add ${test.name} from ${test.labName} to cart`} onClick={() => add(test.id)}>+</button></div></article>;
}
function TestDetails({ test }: { test: Test }) {
  const { ready, add, state, wish } = useCare();
  return <><div className="cl-detail-top"><div className="cl-detail-art"><img src={testImage(test)} alt={test.name}/><button className={`ca-wish ${state.wishlist.includes(test.id) ? "saved" : ""}`} disabled={!ready} aria-label="Save this test" aria-pressed={state.wishlist.includes(test.id)} onClick={() => wish(test.id)}><CareIcon name="heart" size={26}/></button></div><div className="cl-detail-copy"><div className="cl-detail-summary"><h2>{test.name}</h2><p>{test.labName}{test.parameters ? ` · ${test.parameters} parameters` : ""}</p>{test.rating && <span className="cl-rating">★ {test.rating}</span>}<div className="cl-detail-price"><strong>{money(test.price)}</strong>{test.mrp > test.price && <><del>{money(test.mrp)}</del><span className="cl-discount">{Math.round((1 - test.price / test.mrp) * 100)}% OFF</span></>}</div><small>Inclusive of all taxes</small></div><div className="cl-facts">{[["list", "Includes", test.parameters ? `${test.parameters} parameters` : "View included tests"], ["report", "Report time", test.reportTime || "Confirm with lab"], ["drop", "Sample type", test.sampleType || "Confirm with lab"], ["home", "Collection", "At your home"], ["clock", "Preparation", test.fasting || "Confirm with lab"]].map(([icon, label, value]) => <div key={label}><CareIcon name={icon}/><span>{label}</span><strong>{value}</strong></div>)}</div></div></div><div className="cl-detail-bottom"><nav className="cl-detail-links" aria-label="Test information">{(["included", "preparation", "report", "trust", "guidance", "related"] as LabPanel[]).map(p => <Link key={p} href={liveLabUrl(test.id, p)}>{titles[p]}<CareIcon name="chevron"/></Link>)}</nav><section className="cl-purchase" aria-label="Add test to cart"><div className="cl-offer"><CareIcon name="ticket"/>{test.mrp > test.price ? `You save ${money(test.mrp - test.price)} on this test` : "Home sample collection with your chosen lab"}</div><div className="cl-quantity-row"><span>Quantity</span><span className="ca-quantity">1</span></div><button className="ca-button cl-action" disabled={!ready || !test.available} onClick={() => add(test.id)}>Add test to cart <CareIcon name="arrow"/></button><Link className="cl-secondary" href="/cart">View cart <CareIcon name="arrow"/></Link></section></div></>;
}
function LabInformation({ panel, testId, test, groups, parametersLoading, tests }: { panel: LabPanel; testId: string; test?: Test; groups: { name: string; parameters: string[] }[]; parametersLoading: boolean; tests: Test[] }) {
  return <div className={`cl-information ${panel === "included" ? "cl-included-information" : ""} ${panel === "related" ? "cl-related-information" : ""}`}>
    {panel === "included" && <><h2>{test?.parameters ? `${test.parameters} test parameters` : "Included test parameters"}</h2><p>{test?.name}</p>{parametersLoading ? <p role="status">Loading included tests…</p> : <div className="cl-accordion">{groups.map((group, i) => <details key={i}><summary><span>{group.name}<small>Tap to view included parameters</small></span><CareIcon name="chevron"/></summary><ul>{group.parameters.map((parameter, index) => <li key={index}>{parameter}</li>)}</ul></details>)}</div>}</>}
    {panel === "preparation" && <LabPreparation fasting={test?.fasting}/>}
    {(panel === "report" || panel === "preview") && <LabReport preview={panel === "preview"} previewHref={liveLabUrl(test?.id || testId || undefined, "preview")}/>}
    {panel === "trust" && <LabTrust/>}
    {panel === "guidance" && <LabGuidance/>}
    {panel === "related" && <><p>Explore other tests from your laboratory.</p><div className="cl-test-grid">{tests.filter(item => item.id !== test?.id).slice(0, 8).map(item => <LiveLabTestCard key={item.id} test={item}/>)}</div></>}
    {panel === "support" && <section className="cl-support"><div className="cl-report-intro"><span><CareIcon name="support" size={30}/></span><div><h2>Merabetta care team</h2><p>Here to help</p></div></div><Link className="cl-secondary" href="/contact">Contact support <CareIcon name="arrow"/></Link></section>}
  </div>;
}
export function testImage(test: Test) {
  if (test.image && (/^https?:\/\//.test(test.image) || test.image.startsWith("/app/"))) return test.image;
  const origin = process.env.NEXT_PUBLIC_CUSTOMER_IMAGE_ORIGIN;
  if (origin && test.image) { try { return new URL(test.image, origin).href; } catch { /* local artwork */ } }
  return asset("lab");
}
