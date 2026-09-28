"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import SiteFooter from "../components/site-footer";

type LabTest = {
  name: string;
  category: string;
  type: "Test" | "Profile" | "Package";
  summary: string;
  price: number;
  sample: string;
  report: string;
  icon: string;
  tone: string;
  details: string;
};

type DiagnosticLab = {
  id: string;
  name: string;
  city: string;
  rating: string;
  summary: string;
  fromPrice: number;
  tone: string;
  testNames: string[];
};

type DetailPanel = "included-tests" | "preparation" | "report-format" | "trust" | "guidance" | "related" | "report-preview" | "cart";

const tests: LabTest[] = [
  { name: "Complete Blood Count (CBC)", category: "Blood Tests", type: "Test", summary: "A broad look at key blood cell counts", price: 399, sample: "Blood sample", report: "Within 24 hours", icon: "◉", tone: "mint", details: "Includes red blood cell, white blood cell, haemoglobin, and platelet counts." },
  { name: "HbA1c Test", category: "Diabetes Care", type: "Test", summary: "Review average blood sugar over time", price: 599, sample: "Blood sample", report: "Within 24 hours", icon: "◌", tone: "blue", details: "A commonly requested test that measures average blood sugar over approximately three months. Ask your clinician what testing is right for you." },
  { name: "Thyroid Profile", category: "Hormone Tests", type: "Profile", summary: "Includes T3, T4, and TSH", price: 699, sample: "Blood sample", report: "Within 24 hours", icon: "✳", tone: "lilac", details: "A panel covering T3, T4, and TSH. Follow any preparation instructions given by your clinician or the collection team." },
  { name: "Lipid Profile", category: "Heart Health", type: "Profile", summary: "A cholesterol and triglyceride panel", price: 499, sample: "Blood sample", report: "Within 24 hours", icon: "◍", tone: "peach", details: "Includes common cholesterol and triglyceride measurements. Fasting requirements can vary; confirm preparation when booking." },
  { name: "Vitamin D Test", category: "Immunity Check", type: "Test", summary: "Measures 25-hydroxy vitamin D", price: 999, sample: "Blood sample", report: "Within 48 hours", icon: "☼", tone: "gold", details: "Measures 25-hydroxy vitamin D in a blood sample. Discuss your results and any next steps with a qualified healthcare professional." },
  { name: "Comprehensive Health Check", category: "Wellness Packages", type: "Package", summary: "A collection of common wellness markers", price: 1499, sample: "Blood and urine", report: "Within 48 hours", icon: "✦", tone: "mint", details: "A multi-test package for people looking for a broader snapshot. The included markers are listed with the booking details." },
  { name: "Fasting Blood Sugar", category: "Diabetes Care", type: "Test", summary: "A fasting blood glucose measurement", price: 99, sample: "Blood sample", report: "Within 12 hours", icon: "◌", tone: "blue", details: "A blood glucose test that may require fasting. Confirm preparation instructions with the collection team before your appointment." },
  { name: "Liver Function Profile", category: "Liver Screening", type: "Profile", summary: "A panel of commonly requested liver markers", price: 599, sample: "Blood sample", report: "Within 24 hours", icon: "❧", tone: "mint", details: "A profile of common liver markers. Your clinician can help explain whether this panel is suitable for you." },
  { name: "Kidney Function Profile", category: "Kidney Health", type: "Profile", summary: "Common markers used to assess kidney function", price: 699, sample: "Blood sample", report: "Within 24 hours", icon: "◈", tone: "blue", details: "A profile of common kidney markers. Discuss the right testing plan with your healthcare professional." },
  { name: "Vitamin B12 & D Package", category: "Immunity Check", type: "Package", summary: "Two commonly requested vitamin tests", price: 1199, sample: "Blood sample", report: "Within 48 hours", icon: "☼", tone: "gold", details: "A package containing Vitamin B12 and Vitamin D tests. The collection team can confirm any preparation requirements." },
  { name: "Allergy Screening Panel", category: "Allergies", type: "Profile", summary: "A panel for selected common allergens", price: 1299, sample: "Blood sample", report: "Within 72 hours", icon: "✿", tone: "lilac", details: "The allergens included depend on the selected panel. Review its contents with the care team before requesting a collection." },
  { name: "Beta hCG Test", category: "Pregnancy Tests", type: "Test", summary: "A blood test for beta hCG", price: 499, sample: "Blood sample", report: "Within 24 hours", icon: "♡", tone: "peach", details: "A beta hCG blood test. For personal medical questions and interpretation, contact a qualified healthcare professional." },
  { name: "PSA Test", category: "Cancer Screening", type: "Test", summary: "A prostate-specific antigen blood test", price: 699, sample: "Blood sample", report: "Within 24 hours", icon: "◈", tone: "blue", details: "PSA testing is not suitable for everyone. Discuss the potential benefits and limitations with your healthcare professional before booking." },
  { name: "Fever Screening Panel", category: "Fever, Cold & Flu", type: "Package", summary: "A clinician-guided panel for common concerns", price: 899, sample: "Blood sample", report: "Within 48 hours", icon: "◉", tone: "peach", details: "The tests in this package should be selected based on your symptoms and clinical advice. Contact the care team to confirm what is included." },
];

const labs: DiagnosticLab[] = [
  { id: "redcliffe", name: "Redcliffe Labs", city: "Pune", rating: "4.8", summary: "Home sample collection and digital reports", fromPrice: 499, tone: "peach", testNames: ["Complete Blood Count (CBC)", "HbA1c Test", "Thyroid Profile", "Comprehensive Health Check"] },
  { id: "orange-health", name: "Orange Health Labs", city: "Pune", rating: "4.8", summary: "Home sample collection and digital reports", fromPrice: 564, tone: "gold", testNames: ["Complete Blood Count (CBC)", "Lipid Profile", "Vitamin D Test"] },
  { id: "healthfirst", name: "HealthFirst Labs", city: "Pune", rating: "4.8", summary: "Home sample collection and digital reports", fromPrice: 824, tone: "lilac", testNames: ["Comprehensive Health Check", "Thyroid Profile", "Vitamin D Test"] },
  { id: "tata-1mg", name: "Tata 1mg Labs", city: "Pune", rating: "4.7", summary: "Reliable testing with convenient home collection", fromPrice: 399, tone: "mint", testNames: ["Complete Blood Count (CBC)", "HbA1c Test", "Fasting Blood Sugar", "Thyroid Profile", "Lipid Profile"] },
  { id: "thyrocare", name: "Thyrocare Labs", city: "Pune", rating: "4.7", summary: "Health packages and routine diagnostic tests", fromPrice: 499, tone: "blue", testNames: ["Thyroid Profile", "Vitamin B12 & D Package", "Comprehensive Health Check", "Lipid Profile"] },
  { id: "apollo", name: "Apollo Diagnostics", city: "Pune", rating: "4.8", summary: "A broad range of tests and health packages", fromPrice: 699, tone: "peach", testNames: ["Complete Blood Count (CBC)", "Liver Function Profile", "Kidney Function Profile", "PSA Test", "Allergy Screening Panel"] },
];

const testFilters = ["All", "Full Body", "Thyroid", "Vitamins"];

export default function LabTestPage() {
  const [query, setQuery] = useState("");
  const [labQuery, setLabQuery] = useState("");
  const [testFilter, setTestFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("featured");
  const [selectedLab, setSelectedLab] = useState<DiagnosticLab | null>(null);
  const [activeTest, setActiveTest] = useState<LabTest | null>(null);
  const [activePanel, setActivePanel] = useState<DetailPanel | null>(null);
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [labCart, setLabCart] = useState<Record<string, number>>({});

  useEffect(() => {
    function syncFromLocation() {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const lab = labs.find((item) => item.id === params.get("lab")) ?? null;
      const testName = params.get("test");
      const bookingName = params.get("booking");
      const panelName = params.get("panel") as DetailPanel | null;
      const test = tests.find((item) => item.name === testName) ?? null;
      const validPanels: DetailPanel[] = ["included-tests", "preparation", "report-format", "trust", "guidance", "related", "report-preview", "cart"];
      setSelectedLab(lab);
      setActiveTest(test);
      setActivePanel(panelName && validPanels.includes(panelName) ? panelName : null);
      setSelectedTest(bookingName ? tests.find((item) => item.name === bookingName) ?? null : null);
      setRequestSent(false);
    }

    syncFromLocation();
    window.addEventListener("popstate", syncFromLocation);
    return () => window.removeEventListener("popstate", syncFromLocation);
  }, []);

  const visibleLabs = useMemo(() => labs.filter((lab) => `${lab.name} ${lab.city} ${lab.summary}`.toLowerCase().includes(labQuery.toLowerCase())), [labQuery]);
  const visibleTests = useMemo(() => {
    const availableTests = selectedLab ? selectedLab.testNames.map((name) => tests.find((test) => test.name === name)).filter((test): test is LabTest => Boolean(test)) : [];
    return availableTests.filter((test) => {
      const matchesQuery = `${test.name} ${test.category} ${test.summary}`.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = testFilter === "All" || (testFilter === "Full Body" && (test.type === "Package" || test.category === "Wellness Packages")) || (testFilter === "Thyroid" && test.name.toLowerCase().includes("thyroid")) || (testFilter === "Vitamins" && test.category === "Immunity Check");
      return matchesQuery && matchesFilter;
    }).sort((first, second) => sortOrder === "price-low" ? first.price - second.price : sortOrder === "price-high" ? second.price - first.price : 0);
  }, [selectedLab, query, testFilter, sortOrder]);

  function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRequestSent(true);
  }

  function pushLabState(params: URLSearchParams) {
    window.history.pushState(null, "", `${window.location.pathname}${window.location.search}#${params.toString()}`);
  }

  function openLab(lab: DiagnosticLab) {
    const params = new URLSearchParams({ lab: lab.id });
    pushLabState(params);
    setSelectedLab(lab);
    setActiveTest(null);
    setActivePanel(null);
    setSelectedTest(null);
    setQuery("");
    setTestFilter("All");
  }

  function openTest(test: LabTest) {
    if (!selectedLab) return;
    const params = new URLSearchParams({ lab: selectedLab.id, test: test.name });
    pushLabState(params);
    setActiveTest(test);
    setActivePanel(null);
  }

  function openDetailPanel(panel: DetailPanel) {
    const params = new URLSearchParams();
    if (selectedLab) params.set("lab", selectedLab.id);
    if (activeTest) params.set("test", activeTest.name);
    params.set("panel", panel);
    pushLabState(params);
    setActivePanel(panel);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function addTestToCart(test: LabTest, count = quantity) {
    setLabCart((current) => ({ ...current, [test.name]: (current[test.name] ?? 0) + count }));
    setQuantity(1);
  }

  function openBooking(test: LabTest) {
    if (!selectedLab) return;
    const params = new URLSearchParams({ lab: selectedLab.id, test: test.name, booking: test.name });
    pushLabState(params);
    setActiveTest(test);
    setActivePanel(null);
    setSelectedTest(test);
    setRequestSent(false);
  }

  function goBackInLabFlow() {
    if (window.location.hash) window.history.back();
    else {
      setActiveTest(null);
      setSelectedLab(null);
    }
  }

  function changeLab() {
    window.history.pushState(null, "", `${window.location.pathname}${window.location.search}`);
    setSelectedLab(null);
    setActiveTest(null);
    setActivePanel(null);
    setSelectedTest(null);
    setLabQuery("");
  }

  function closeBooking() {
    if (new URLSearchParams(window.location.hash.slice(1)).has("booking")) {
      window.history.back();
    } else {
      setSelectedTest(null);
      setRequestSent(false);
    }
  }

  const cartItems = tests.filter((test) => (labCart[test.name] ?? 0) > 0);
  const cartCount = Object.values(labCart).reduce((total, count) => total + count, 0);
  const cartTotal = cartItems.reduce((total, test) => total + test.price * labCart[test.name], 0);
  const detailPanelTitles: Record<DetailPanel, string> = {
    "included-tests": "Included Tests",
    preparation: "Pre-test Instructions",
    "report-format": "Report Format",
    trust: "Why Trust Us?",
    guidance: "Pre-test Expert Guidance",
    related: "Frequently Booked Together",
    "report-preview": "Report Preview",
    cart: "Your cart",
  };
  const includedGroups = activeTest?.type === "Package"
    ? ["Complete Blood Count (CBC)", "ESR", "Liver function", "HbA1c", "Iron studies", "Kidney function", "Lipid profile"]
    : activeTest?.type === "Profile"
      ? activeTest.name.toLowerCase().includes("thyroid") ? ["T3", "T4", "TSH"] : [activeTest.name, "Related markers", "Calculated values"]
      : [activeTest?.name ?? "Selected test"];
  const parameterCount = activeTest?.type === "Package" ? "97" : activeTest?.type === "Profile" ? "3" : "1";

  return (
    <main className="labshop-page">
     
      <header className="site-header labshop-header">
        <a className="brand brand-logo" href="/" aria-label="Merabetta home"><img src="/logo.png" alt="Merabetta" /></a>
        <nav className="main-nav labshop-nav" aria-label="Main navigation"><a href="/">Home</a><a href="/products">Products</a><a className="nav-current" href="/labtest">Lab Tests</a><a href="/about">About Us</a><a href="/about#contact">Contact</a></nav>
        <details className="landing-mobile-menu labshop-mobile-menu">
          <summary aria-label="Open navigation">☰ <span>Menu</span></summary>
          <nav aria-label="Mobile navigation">
            <a href="/">Home</a><a href="/products">Products</a><a href="/labtest">Lab Tests</a><a href="/about">About Us</a><a href="/about#contact">Contact</a>
          </nav>
        </details>
        <div className="labshop-account"><a className="account-button" href="/products?account=login">Log in</a></div>
      </header>

      <div className="labshop-wrap lab-flow-wrap">
        {activePanel === "cart" ? <section className="lab-flow-screen lab-flow-subpage lab-flow-cart-page">
          <div className="lab-flow-topline"><button className="lab-flow-back" onClick={goBackInLabFlow}>← <span>Back</span></button><h1>Your cart</h1><button className="lab-flow-heart" aria-label="Cart items">{cartCount}</button></div>
          {cartItems.length ? <><div className="lab-flow-cart-items">{cartItems.map((test) => <article key={test.name} className="lab-flow-cart-item"><div className={`lab-flow-cart-thumb ${test.tone}`}><span>{test.icon}</span></div><div><strong>{test.name}</strong><small>{selectedLab?.name ?? "Lab test"} · {test.sample}</small><b>₹{test.price.toLocaleString("en-IN")} × {labCart[test.name]}</b></div><div className="lab-flow-quantity"><button aria-label={`Remove one ${test.name}`} onClick={() => setLabCart((current) => ({ ...current, [test.name]: Math.max(0, (current[test.name] ?? 0) - 1) }))}>−</button><span>{labCart[test.name]}</span><button aria-label={`Add one ${test.name}`} onClick={() => setLabCart((current) => ({ ...current, [test.name]: (current[test.name] ?? 0) + 1 }))}>＋</button></div></article>)}</div><div className="lab-flow-cart-total"><span>Subtotal</span><strong>₹{cartTotal.toLocaleString("en-IN")}</strong></div><p className="lab-flow-cart-note">Collection availability and final details are confirmed by the selected lab.</p><button className="lab-flow-book button button-primary" onClick={() => { if (activeTest) openBooking(activeTest); else if (selectedLab && cartItems[0]) openBooking(cartItems[0]); else goBackInLabFlow(); }}>Continue to booking <span>→</span></button></> : <div className="lab-flow-cart-empty"><span>♡</span><h2>Your cart is empty</h2><p>Choose a lab test and add it here when you are ready.</p><button className="button button-primary" onClick={goBackInLabFlow}>Browse lab tests</button></div>}
        </section> : !selectedLab ? <section className="lab-flow-screen lab-flow-chooser">
          <div className="lab-flow-topline lab-flow-chooser-topline"><h1>Labs</h1><button className="lab-flow-heart" aria-label="Saved labs">♡</button></div>
          <div className="lab-flow-intro"><span className="lab-flow-flask" aria-hidden="true">⚗</span><div><h1>Your health. Your choice.</h1><p>Choose a lab to explore its tests, packages and prices.</p></div></div>
          <label className="lab-flow-search"><span aria-hidden="true">⌕</span><input aria-label="Search labs by name or city" placeholder="Search labs by name or city..." value={labQuery} onChange={(event) => setLabQuery(event.target.value)}/></label>
          <div className="lab-flow-section-title"><h2>Choose your lab</h2><span>{visibleLabs.length} labs</span></div>
          <div className="lab-flow-labs">{visibleLabs.map((lab) => <button className="lab-flow-provider" key={lab.id} onClick={() => openLab(lab)}>
            <span className={`lab-flow-provider-art ${lab.tone}`}><img src="https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=360&q=80" alt=""/></span><span className="lab-flow-provider-info"><strong>{lab.name}</strong><span>{lab.city} · ★ {lab.rating}</span><small>{lab.summary}</small></span><span className={`lab-flow-chevron ${lab.tone}`} aria-hidden="true">›</span><span className="lab-flow-test-count">{lab.testNames.length} tests &amp; packages</span><strong className={`lab-flow-from ${lab.tone}`}>From ₹{lab.fromPrice}</strong><small className="lab-flow-collection">Home collection available</small>
          </button>)}</div>
          {!visibleLabs.length && <div className="labshop-empty"><h3>No labs match that search</h3><p>Try searching by another name or city.</p></div>}
        </section> : !activeTest ? <section className="lab-flow-screen lab-flow-catalog">
          <div className="lab-flow-topline"><button className="lab-flow-back" onClick={goBackInLabFlow}>← <span>Labs</span></button><h1>{selectedLab.name}</h1><button className="lab-flow-heart" aria-label="Save lab">♡</button></div>
          <div className="lab-flow-selected-lab"><div><strong>{selectedLab.name}</strong><span>{selectedLab.summary}</span></div><button onClick={changeLab}>Change lab</button></div>
          <label className="lab-flow-search"><span aria-hidden="true">⌕</span><input aria-label="Search tests and health packages" placeholder="Search tests and health packages..." value={query} onChange={(event) => setQuery(event.target.value)}/></label>
          <div className="lab-flow-filter-row" aria-label="Filter tests">{testFilters.map((filter) => <button key={filter} className={testFilter === filter ? "selected" : ""} onClick={() => setTestFilter(filter)}>{filter}</button>)}</div>
          <div className="lab-flow-promo"><span className="lab-flow-promo-icon" aria-hidden="true">⚗</span><div><h2>Know your health.<br/>Care for your future.</h2><p>Convenient sample collection at home</p><a href="/about">Why choose Merabetta? <span>→</span></a></div></div>
          <div className="lab-flow-section-title"><h2>Popular health packages</h2><span>{visibleTests.length} available</span></div>
          <div className="lab-flow-tests">{visibleTests.map((test) => <article className="lab-flow-test-card" key={test.name}>
            <button className={`lab-flow-test-art ${test.tone}`} aria-label={`View ${test.name}`} onClick={() => openTest(test)}><img src="https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=620&q=82" alt=""/><i>♡</i></button><span className="labtest-category">{test.category}</span><button className="lab-flow-test-name" onClick={() => openTest(test)}>{test.name}</button><p>{selectedLab.name} · {test.type === "Package" ? "97 parameters" : test.type === "Profile" ? "3 parameters" : "1 parameter"}</p><div className="lab-flow-test-foot"><div><strong>₹{test.price.toLocaleString("en-IN")}</strong><small>{test.type === "Package" ? "Popular package" : `Report ${test.report.toLowerCase()}`}</small></div><button aria-label={`See details for ${test.name}`} onClick={() => openTest(test)}>＋</button></div>
          </article>)}</div>
          {!visibleTests.length && <div className="labshop-empty"><h3>No tests match those filters</h3><p>Try another search or category.</p></div>}
        </section> : activePanel ? <section className="lab-flow-screen lab-flow-subpage">
          <div className="lab-flow-topline"><button className="lab-flow-back" onClick={goBackInLabFlow}>← <span>Back</span></button><h1>{detailPanelTitles[activePanel]}</h1><button className="lab-flow-heart" aria-label="Save test">♡</button></div>
          {activePanel === "included-tests" && <>
            <h2 className="lab-flow-panel-heading">{parameterCount} test parameters</h2><p className="lab-flow-panel-lead">Sample test groups for {activeTest.name}</p>
            <div className="lab-flow-included-list">{includedGroups.map((group) => <details key={group} open><summary>{group}<small>Tap to view sample details</small></summary><p>This group is included in the selected package. The complete parameter list and clinical interpretation will be provided by the performing laboratory.</p></details>)}</div>
          </>}
          {activePanel === "preparation" && <>
            <h2 className="lab-flow-panel-heading">Important instructions</h2><div className="lab-flow-instruction-card"><p><span>♧</span>Stay hydrated with plain water</p><p><span>◷</span>Follow the fasting instructions from your lab</p><p><span>✳</span>Tell your clinician about medications</p><p><span>♧</span>Wear comfortable clothing</p></div><p className="lab-flow-panel-lead">These are sample instructions. Your chosen laboratory must provide test-specific preparation guidance.</p><button className="lab-flow-secondary-cta" onClick={() => window.location.href = "mailto:support@merabetta.com?subject=Lab%20preparation%20guide"}>Share preparation guide <span>→</span></button><div className="lab-flow-notice">♢ &nbsp; Your lab will confirm preparation details before collection.</div>
          </>}
          {activePanel === "report-format" && <>
            <div className="lab-flow-report-banner"><span>▤</span><div><strong>Digital health report</strong><small>A clear view of your wellbeing</small></div></div><h2 className="lab-flow-panel-heading">What&apos;s included?</h2><ul className="lab-flow-check-list"><li>Test summary &amp; results</li><li>Reference ranges</li><li>Clinician notes, where applicable</li><li>Shareable report</li></ul><button className="lab-flow-secondary-cta" onClick={() => openDetailPanel("report-preview")}>View sample report <span>→</span></button>
          </>}
          {activePanel === "report-preview" && <>
            <div className="lab-flow-report-banner"><span>▤</span><div><strong>Digital health report</strong><small>A clear view of your wellbeing</small></div></div><div className="lab-flow-sample-report"><h2>MERABETTA · SAMPLE REPORT</h2><p>Example patient · Demo only<br/>No diagnostic or clinical use</p><div className="lab-flow-report-table"><div><b>Parameter</b><b>Result</b><b>Reference</b></div><div><span>Haemoglobin</span><span>14.2 g/dL</span><span>13–17</span></div><div><span>WBC count</span><span>7,200 /µL</span><span>4,000–11,000</span></div><div><span>Platelets</span><span>250,000 /µL</span><span>150k–450k</span></div></div><p className="lab-flow-report-disclaimer">Illustrative values only. Reference ranges vary by laboratory and patient.</p><button className="lab-flow-secondary-cta">Share sample report <span>→</span></button></div>
          </>}
          {activePanel === "trust" && <>
            <div className="lab-flow-pills"><button className="selected">NABL</button><button>Quality</button><button>Experience</button><button>Support</button></div><div className="lab-flow-trust-card"><div className="lab-flow-award">♧</div><h2>Quality you can count on</h2><p>Sample partner accreditation details. Actual lab credentials must be verified before launch.</p><div className="lab-flow-trust-grid"><span>✓<small>Accurate results</small></span><span>♢<small>Certified labs</small></span><span>♙<small>Expert team</small></span><span>▢<small>Secure process</small></span></div><a href="mailto:support@merabetta.com" className="lab-flow-secondary-cta">Talk to support <span>→</span></a></div>
          </>}
          {activePanel === "guidance" && <>
            <div className="lab-flow-guidance-card"><span>♙</span><h2>Have questions?<br/>We&apos;re here for you.</h2><p>Get help preparing for your lab appointment and navigating your report.</p><a href="mailto:support@merabetta.com" className="lab-flow-primary-cta">Chat with our care team <span>→</span></a></div><h2 className="lab-flow-panel-heading">Expert support includes</h2><ul className="lab-flow-check-list"><li>Test preparation queries</li><li>Understanding the report process</li><li>Booking and collection assistance</li></ul><p className="lab-flow-small-note">Demo support does not offer medical advice.</p>
          </>}
          {activePanel === "related" && <><h2 className="lab-flow-panel-heading">You may also like</h2><p className="lab-flow-panel-lead">Frequently booked with {activeTest.name}</p><div className="lab-flow-related-list">{selectedLab.testNames.map((name) => tests.find((test) => test.name === name)).filter((test): test is LabTest => Boolean(test) && test?.name !== activeTest.name).slice(0, 3).map((test) => <article className="lab-flow-related-item" key={test.name}><div className={`lab-flow-cart-thumb ${test.tone}`}><span>{test.icon}</span></div><div><strong>{test.name}</strong><small>{selectedLab.name} · {test.type}</small><b>₹{test.price.toLocaleString("en-IN")}</b></div><button onClick={() => addTestToCart(test, 1)}>＋</button></article>)}</div></>}
        </section> : <section className="lab-flow-screen lab-flow-detail">
          <div className="lab-flow-topline"><button className="lab-flow-back" onClick={goBackInLabFlow}>← <span>Tests</span></button><h1>Test details</h1><button className="lab-flow-heart" aria-label="Save test">♡</button></div>
          <div className="lab-flow-selected-lab"><div><strong>{selectedLab.name}</strong><span>{selectedLab.summary}</span></div><button onClick={changeLab}>Change lab</button></div>
          <div className={`lab-flow-detail-art ${activeTest.tone}`}><img src="https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1000&q=85" alt="Lab sample tubes and testing equipment"/></div>
          <div className="lab-flow-detail-copy"><span className="labtest-category">{activeTest.category}</span><h2>{activeTest.name}</h2><p>{selectedLab.name} · {activeTest.type === "Package" ? "97 parameters" : activeTest.type === "Profile" ? "3 parameters" : "1 parameter"}</p><div className="lab-flow-rating">★ 4.8 <span>(120 verified reviews)</span></div><div className="lab-flow-detail-price"><strong>₹{activeTest.price.toLocaleString("en-IN")}</strong><span>Inclusive of all taxes</span></div></div>
          <div className="lab-flow-facts"><div><span>☷</span><small>Includes</small><strong>{parameterCount} parameters</strong></div><div><span>▤</span><small>Report time</small><strong>{activeTest.type === "Package" ? "Within 18 hours" : activeTest.report}</strong></div><div><span>◉</span><small>Sample type</small><strong>{activeTest.sample}</strong></div><div><span>⌂</span><small>Collection</small><strong>At your home</strong></div><div className="lab-flow-preparation-fact"><span>◷</span><small>Preparation</small><strong>8–12 hours; confirm with lab</strong></div></div>
          <div className="lab-flow-detail-links">{([["included-tests", "Included Tests"], ["preparation", "Pre-test Instructions"], ["report-format", "Report Format"], ["trust", "Why Trust Us?"], ["guidance", "Pre-test Expert Guidance"], ["related", "Frequently Booked Together"]] as [DetailPanel, string][]).map(([panel, label]) => <button key={panel} onClick={() => openDetailPanel(panel)}>{label}<span>›</span></button>)}</div>
          <div className="lab-flow-savings"><span>◆</span>Preview offer: You save ₹1,520 on this test</div>
          <div className="lab-flow-quantity-row"><span>Quantity</span><div className="lab-flow-quantity"><button aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button><span>{quantity}</span><button aria-label="Increase quantity" onClick={() => setQuantity((value) => value + 1)}>＋</button></div></div>
          <button className="button button-primary lab-flow-book" onClick={() => addTestToCart(activeTest)}>Add test to cart <span>→</span></button>
          <button className="lab-flow-view-cart" onClick={() => openDetailPanel("cart")}>View cart <span>→</span>{cartCount > 0 && <i>{cartCount}</i>}</button>
        </section>}
        <p className="labshop-disclaimer">This page is a booking-request preview. A healthcare professional can advise which tests are appropriate for you. Test availability and preparation requirements should be confirmed with the care team.</p>
        <SiteFooter />
      </div>

      {!selectedTest && <nav className="bottom-nav lab-flow-bottom-nav" aria-label="Store sections"><a href="/"><span>⌂</span>Home</a><a href="/products"><span>▦</span>Categories</a><a className="lab-flow-cart" href="#cart" onClick={(event) => { event.preventDefault(); openDetailPanel("cart"); }} aria-label="Cart"><span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 1.9-1.4L22 8H6"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>{cartCount > 0 && <i>{cartCount}</i>}</span>Cart</a><a className="active" href="/labtest"><span>⚗</span>Labs</a><a href="/products?account=login"><span>♙</span>Profile</a></nav>}

      {selectedTest && <div className="dialog-backdrop" role="presentation" onClick={closeBooking}><section className="lab-booking-dialog" role="dialog" aria-modal="true" aria-labelledby="lab-booking-title" onClick={(event) => event.stopPropagation()}><button className="dialog-close" aria-label="Close booking form" onClick={closeBooking}>×</button>{requestSent ? <div className="lab-request-success"><span>✓</span><span className="section-kicker">Request preview</span><h2 id="lab-booking-title">Thanks, we have your request.</h2><p>Your request for <strong>{selectedTest.name}</strong> with <strong>{selectedLab?.name}</strong> is saved in this preview. The care team would confirm availability and collection details with you.</p><button className="button button-primary" onClick={closeBooking}>Done</button></div> : <><span className="section-kicker">{selectedLab?.name} · {selectedTest.category}</span><h2 id="lab-booking-title">Book {selectedTest.name}</h2><p className="lab-modal-description">{selectedTest.details}</p><div className="lab-modal-facts"><span><small>Sample</small><strong>{selectedTest.sample}</strong></span><span><small>Estimated report</small><strong>{selectedTest.report}</strong></span><span><small>Price</small><strong>₹{selectedTest.price.toLocaleString("en-IN")}</strong></span></div><form className="lab-booking-form" onSubmit={submitRequest}><h3>Request home collection</h3><div className="lab-form-row"><label>Full name<input name="name" autoComplete="name" placeholder="Your full name" required/></label><label>Mobile number<input name="phone" autoComplete="tel" type="tel" pattern="[0-9+() -]{8,18}" placeholder="Your mobile number" required/></label></div><label>Address<input name="address" autoComplete="street-address" placeholder="House number, street, area" required/></label><div className="lab-form-row"><label>PIN code<input name="postalCode" autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{6}" placeholder="6-digit PIN code" required/></label><label>Preferred date<input name="date" type="date" min={new Date().toISOString().slice(0, 10)} required/></label></div><label>Preferred time<select name="time" defaultValue="morning"><option value="morning">Morning (7 AM – 11 AM)</option><option value="afternoon">Afternoon (11 AM – 3 PM)</option><option value="evening">Evening (3 PM – 7 PM)</option></select></label><button className="button button-primary labtest-book" type="submit">Continue request <span>→</span></button><small className="lab-preview-note">Preview only: this form does not submit a real booking.</small></form></>}</section></div>}
    </main>
  );
}
