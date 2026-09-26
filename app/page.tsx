import SiteFooter from "./components/site-footer";

const carePoints = [
  { icon: "✳", title: "Senior-focused essentials", body: "Thoughtfully selected products for comfort, care, and everyday wellbeing." },
  { icon: "✓", title: "Quality you can trust", body: "A clear, considered way to shop for healthcare essentials." },
  { icon: "⌂", title: "Care at your doorstep", body: "A simpler shopping experience for seniors and the families who support them." },
];

const categories = [
  { name: "Health devices", icon: "◉", tone: "blue" },
  { name: "Medicines & wellness", icon: "✚", tone: "green" },
  { name: "Personal care", icon: "◒", tone: "peach" },
  { name: "Daily living", icon: "⌂", tone: "lilac" },
];

export default function LandingPage() {
  return (
    <main className="landing-page">
     
      <header className="landing-header">
        <a className="landing-brand" href="/" aria-label="Merabetta home"><img src="/logo.png" alt="Merabetta" /></a>
        <nav className="landing-links" aria-label="Main navigation"><a className="current" href="/">Home</a><a href="/products">Products</a><a href="/labtest">Lab Tests</a><a href="/about">About Us</a><a href="#contact">Contact</a></nav>
        <details className="landing-mobile-menu"><summary aria-label="Open navigation">☰ <span>Menu</span></summary><nav aria-label="Mobile navigation"><a href="/">Home</a><a href="/products">Products</a><a href="/labtest">Lab Tests</a><a href="/about">About Us</a><a href="#contact">Contact</a></nav></details>
        <div className="landing-auth-links"><a className="landing-login" href="/products?account=login">Log in</a></div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-copy"><div className="landing-eyebrow"><span/> Care that puts you first</div><h1>Healthcare you can trust,<br/><em>delivered with care.</em></h1><p>A senior-focused health store designed to make everyday essentials easier to find, understand, and order.</p><div className="landing-hero-actions"><a className="landing-button primary" href="/products">Shop products <span>→</span></a><a className="landing-button secondary" href="/labtest">Book a lab test</a></div><div className="landing-hero-note"><span className="landing-note-icon">♡</span><span><strong>Here for you and your family</strong><small>Clear choices. Helpful support. Care at every step.</small></span></div></div>
        <div className="landing-photo-stack" aria-label="Senior care and health support">
          <div className="landing-photo-main"><img src="https://merabetta.com/images/about.png" alt="Senior care and health support from Merabetta" fetchPriority="high"/><span className="landing-photo-caption"><strong>Care that feels personal</strong><small>For seniors and the families beside them</small></span></div>
          <div className="landing-photo-inset"><img src="https://merabetta.com/images/story-2.png" alt="A Merabetta story about compassionate care for elders" loading="lazy"/></div>
          <div className="landing-photo-seal"><span>✚</span><small>CARE<br/>WITH<br/>DIGNITY</small></div>
        </div>
        <span className="landing-hero-index">CARE FOR EVERY DAY&nbsp; · &nbsp;01</span>
      </section>

      <section className="landing-trust" aria-label="Merabetta care principles">{carePoints.map((point) => <article key={point.title}><span className="landing-trust-icon">{point.icon}</span><div><h2>{point.title}</h2><p>{point.body}</p></div></article>)}</section>

      <section className="landing-categories" id="products-preview"><div className="landing-section-head"><div><span className="landing-kicker">A thoughtful place to begin</span><h2>Everyday care, all in one place.</h2><p>Explore healthcare and wellness essentials selected with your comfort in mind.</p></div><a className="landing-arrow-link" href="/products">View all products <span>→</span></a></div><div className="landing-category-grid">{categories.map((category) => <a className="landing-category-card" href="/products" key={category.name}><span className={`landing-category-icon ${category.tone}`}>{category.icon}</span><span><strong>{category.name}</strong><small>Explore essentials</small></span><b>↗</b></a>)}</div></section>

      <section className="landing-about" id="about"><div className="landing-about-visual"><img src="https://merabetta.com/images/story-1.png" alt="An elder and family member sharing a moment of care" loading="lazy"/><div className="about-photo-badge"><span>♡</span><strong>Support for<br/>the people you love</strong></div></div><div className="landing-about-copy"><span className="landing-kicker">Why Merabetta</span><h2>Care that respects your independence.</h2><p>Mera Betta is a senior-focused healthcare platform built around trust, comfort, and clarity. We make it easier to find everyday medical essentials and give families a more supportive way to care.</p><ul><li><span>✓</span> Straightforward product discovery</li><li><span>✓</span> Thoughtful essentials for daily wellbeing</li><li><span>✓</span> Helpful care support when you need it</li></ul><a className="landing-button primary" href="/products">Find your essentials <span>→</span></a></div></section>

      <section className="landing-lab" id="lab-tests"><div className="lab-photo-composition"><img className="lab-photo-main" src="https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1100&q=85" alt="Healthcare professional preparing a laboratory sample" loading="lazy"/><img className="lab-photo-inset" src="https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=500&q=80" alt="A clean clinical care space" loading="lazy"/><span className="lab-photo-badge"><b>01</b><span>Care that comes<br/>to your doorstep</span></span></div><div className="lab-copy"><span className="landing-kicker">More support for your health</span><h2>Lab tests, with a little more clarity.</h2><p>Browse common health tests, understand what each one includes, and request a convenient home sample collection.</p><ul className="lab-benefits"><li><span>✓</span> Clear test details and pricing</li><li><span>✓</span> Choose a preferred collection date</li><li><span>✓</span> Friendly support when you need it</li></ul><a className="landing-button primary" href="/labtest">Explore lab tests <span>→</span></a></div></section>

      <section className="landing-final-cta" id="contact"><div><span className="landing-kicker">A little care goes a long way</span><h2>Let’s make everyday healthcare simpler.</h2><p>Start with trusted essentials, or find a lab test that fits your needs.</p></div><div className="landing-final-actions"><a className="landing-button primary" href="/products">Shop products <span>→</span></a><a className="landing-button secondary" href="/labtest">Book a lab test <span>→</span></a></div></section>

      <SiteFooter />
    </main>
  );
}
