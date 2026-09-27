"use client";

import { FormEvent, useMemo, useState } from "react";
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

const categories = ["All categories", "Immunity Check", "Allergies", "Cancer Screening", "Liver Screening", "Pregnancy Tests", "Fever, Cold & Flu", "Hormone Tests", "Diabetes Care", "Heart Health", "Kidney Health", "Blood Tests", "Wellness Packages"];

export default function LabTestPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [testType, setTestType] = useState("All types");
  const [sortOrder, setSortOrder] = useState("featured");
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [requestSent, setRequestSent] = useState(false);

  const visibleTests = useMemo(() => tests.filter((test) => {
    const matchesQuery = `${test.name} ${test.category} ${test.summary}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (category === "All categories" || test.category === category) && (testType === "All types" || test.type === testType);
  }).sort((first, second) => sortOrder === "price-low" ? first.price - second.price : sortOrder === "price-high" ? second.price - first.price : 0), [query, category, testType, sortOrder]);

  function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRequestSent(true);
  }

  function closeBooking() {
    setSelectedTest(null);
    setRequestSent(false);
  }

  return (
    <main className="labshop-page">
     
      <header className="site-header labshop-header">
        <a className="brand brand-logo" href="/" aria-label="Merabetta home"><img src="/logo.png" alt="Merabetta" /></a>
        <label className="search-box labshop-search"><span aria-hidden="true">⌕</span><input aria-label="Search lab tests" placeholder="Search lab tests..." value={query} onChange={(event) => setQuery(event.target.value)}/></label>
        <nav className="main-nav labshop-nav" aria-label="Main navigation"><a href="/">Home</a><a href="/products">Products</a><a className="nav-current" href="/labtest">Lab Tests</a><a href="/about">About Us</a><a href="/about#contact">Contact</a></nav>
        <details className="landing-mobile-menu labshop-mobile-menu">
          <summary aria-label="Open navigation">☰ <span>Menu</span></summary>
          <nav aria-label="Mobile navigation">
            <a href="/">Home</a><a href="/products">Products</a><a href="/labtest">Lab Tests</a><a href="/about">About Us</a><a href="/about#contact">Contact</a>
          </nav>
        </details>
        <div className="labshop-account"><a className="account-button" href="/products?account=login">Log in</a></div>
      </header>

      <div className="labshop-wrap">
        <section className="labshop-hero">
          <div className="labshop-hero-copy"><span className="section-kicker">A little care goes a long way</span><h1>Lab tests,<br/><em>made easier.</em></h1><p>Find common health tests, understand what each includes, and request a preferred home collection time.</p><a className="button button-primary" href="#tests">Browse lab tests <span>→</span></a><div className="labshop-assurance"><span>✓</span><div><strong>Clear information at every step</strong><small>Test details · sample type · estimated report time</small></div></div></div>
          <div className="labshop-hero-photo"><img src="https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1100&q=85" alt="Healthcare professional preparing a laboratory sample"/><span className="labshop-photo-caption"><strong>Care, with clarity</strong><small>Explore a test and request a collection</small></span><span className="labshop-photo-tag">HOME SAMPLE<br/>COLLECTION</span></div>
        </section>

        <section className="labshop-benefits" aria-label="Lab test service details"><div><span>⌂</span><p><strong>Home collection request</strong><small>Choose a preferred date and time</small></p></div><div><span>◷</span><p><strong>Report time shown</strong><small>See an estimate with each test</small></p></div><div><span>♡</span><p><strong>Helpful support</strong><small>Reach our care team with questions</small></p></div></section>

        <section className="labshop-tests" id="tests"><div className="labshop-heading"><div><span className="section-kicker">Choose what you need</span><h2>Explore lab tests</h2><p>Browse test details and request a convenient collection.</p></div><span className="labshop-result-count">{visibleTests.length} tests</span></div>
          <div className="labshop-catalog-tools"><div className="labshop-filters" aria-label="Filter tests by category">{categories.map((item) => <button key={item} className={category === item ? "selected" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="labshop-sort-row"><div className="labshop-type-filters" aria-label="Filter by test type">{["All types", "Test", "Profile", "Package"].map((item) => <button key={item} className={testType === item ? "selected" : ""} onClick={() => setTestType(item)}>{item}</button>)}</div><label>Sort by <select aria-label="Sort lab tests" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}><option value="featured">Recommended</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label></div></div>
          {visibleTests.length ? <div className="labtest-grid">{visibleTests.map((test) => <article className="labtest-card" key={test.name}><div className={`labtest-art ${test.tone}`}><span className="labtest-icon">{test.icon}</span><span className="labtest-art-label">MERABETTA<br/>DIAGNOSTICS</span><span className="labtest-art-leaf">✳</span><span className="labtest-type-tag">{test.type}</span></div><div className="labtest-card-body"><span className="labtest-category">{test.category}</span><h3>{test.name}</h3><p>{test.summary}</p><div className="labtest-meta"><span>{test.sample}</span><span>Report: {test.report}</span></div><div className="labtest-price-row"><strong>₹{test.price.toLocaleString("en-IN")}</strong><button className="labtest-detail" onClick={() => { setRequestSent(false); setSelectedTest(test); }}>Details</button></div><button className="button button-primary labtest-book" onClick={() => { setRequestSent(false); setSelectedTest(test); }}>Book appointment <span>→</span></button></div></article>)}</div> : <div className="labshop-empty"><span>⌕</span><h3>No tests match that search</h3><p>Try another name or choose a different category.</p></div>}
        </section>

        <section className="labshop-help"><div><span className="section-kicker">Need a hand?</span><h2>We can help you find the next step.</h2><p>For questions about a test or its preparation, contact the Merabetta care team.</p></div><a className="button button-primary" href="mailto:support@merabetta.com">Talk to our care team <span>→</span></a></section>
        <p className="labshop-disclaimer">This page is a booking-request preview. A healthcare professional can advise which tests are appropriate for you. Test availability and preparation requirements should be confirmed with the care team.</p>
        <SiteFooter />
      </div>

      {selectedTest && <div className="dialog-backdrop" role="presentation" onClick={closeBooking}><section className="lab-booking-dialog" role="dialog" aria-modal="true" aria-labelledby="lab-booking-title" onClick={(event) => event.stopPropagation()}><button className="dialog-close" aria-label="Close test details" onClick={closeBooking}>×</button>{requestSent ? <div className="lab-request-success"><span>✓</span><span className="section-kicker">Request preview</span><h2 id="lab-booking-title">Thanks, we have your request.</h2><p>Your request for <strong>{selectedTest.name}</strong> is saved in this preview. The care team would confirm availability and collection details with you.</p><button className="button button-primary" onClick={closeBooking}>Done</button></div> : <><span className="section-kicker">{selectedTest.category}</span><h2 id="lab-booking-title">{selectedTest.name}</h2><p className="lab-modal-description">{selectedTest.details}</p><div className="lab-modal-facts"><span><small>Sample</small><strong>{selectedTest.sample}</strong></span><span><small>Estimated report</small><strong>{selectedTest.report}</strong></span><span><small>Price</small><strong>₹{selectedTest.price.toLocaleString("en-IN")}</strong></span></div><form className="lab-booking-form" onSubmit={submitRequest}><h3>Request home collection</h3><div className="lab-form-row"><label>Full name<input name="name" autoComplete="name" placeholder="Your full name" required/></label><label>Mobile number<input name="phone" autoComplete="tel" type="tel" pattern="[0-9+() -]{8,18}" placeholder="Your mobile number" required/></label></div><label>Address<input name="address" autoComplete="street-address" placeholder="House number, street, area" required/></label><div className="lab-form-row"><label>PIN code<input name="postalCode" autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{6}" placeholder="6-digit PIN code" required/></label><label>Preferred date<input name="date" type="date" min={new Date().toISOString().slice(0, 10)} required/></label></div><label>Preferred time<select name="time" defaultValue="morning"><option value="morning">Morning (7 AM – 11 AM)</option><option value="afternoon">Afternoon (11 AM – 3 PM)</option><option value="evening">Evening (3 PM – 7 PM)</option></select></label><button className="button button-primary labtest-book" type="submit">Continue request <span>→</span></button><small className="lab-preview-note">Preview only: this form does not submit a real booking.</small></form></>}</section></div>}
    </main>
  );
}
