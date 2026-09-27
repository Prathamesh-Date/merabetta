import SiteFooter from "../components/site-footer";

const careReasons = [
  {
    number: "01",
    title: "Senior-focused products",
    description: "Carefully selected essentials designed specifically for senior needs.",
  },
  {
    number: "02",
    title: "Trusted quality",
    description: "Reliable products sourced from verified and certified suppliers.",
  },
  {
    number: "03",
    title: "Verified suppliers",
    description: "Partnering only with trusted, certified, and approved medical vendors.",
  },
  {
    number: "04",
    title: "Safe and timely delivery",
    description: "Secure packaging with prompt, reliable doorstep delivery.",
  },
];

export default function AboutPage() {
  return (
    <main className="about-route">
      <header className="landing-header">
        <a className="landing-brand" href="/" aria-label="Merabetta home">
          <img src="/logo.png" alt="Merabetta" />
        </a>
        <nav className="landing-links" aria-label="Main navigation">
          <a href="/">Home</a>
          <a href="/products">Products</a>
          <a href="/labtest">Lab Tests</a>
          <a className="current" href="/about">About Us</a>
          <a href="#contact">Contact</a>
        </nav>
        <details className="landing-mobile-menu">
          <summary aria-label="Open navigation">☰ <span>Menu</span></summary>
          <nav aria-label="Mobile navigation">
            <a href="/">Home</a>
            <a href="/products">Products</a>
            <a href="/labtest">Lab Tests</a>
            <a href="/about">About Us</a>
            <a href="#contact">Contact</a>
          </nav>
        </details>
        <div className="landing-auth-links">
          <a className="landing-login" href="/products?account=login">Log in</a>
        </div>
      </header>

      <div className="about-route-wrap">
        <section className="about-route-hero">
          <div className="about-route-hero-copy">
            <span className="landing-kicker">About Us</span>
            <h1>Committed to supporting senior health with trust, care, and reliable solutions.</h1>
            <p>
              Mera Betta is a senior-focused healthcare eCommerce platform dedicated to making
              essential medical products accessible, reliable, and easy to order. We prioritize
              trust, comfort, and care, ensuring seniors receive the support they need with dignity
              and convenience.
            </p>
            <a className="landing-button primary" href="/products">
              Explore products <span>→</span>
            </a>
          </div>
          <div className="about-route-hero-photo">
            <img
              src="https://merabetta.com/images/about.png"
              alt="Senior care and health support"
            />
          </div>
        </section>

        <section className="about-route-reasons" aria-labelledby="about-reasons-title">
          <div className="about-route-section-heading">
            <span className="landing-kicker">Why Choose Us</span>
            <h2 id="about-reasons-title">Healthcare made with seniors in mind.</h2>
            <p>
              We deliver trusted medical essentials with care, reliability, and convenience—designed
              to support senior health and independent living.
            </p>
          </div>
          <div className="about-route-reason-grid">
            {careReasons.map((reason) => (
              <article className="about-route-reason-card" key={reason.title}>
                <span>{reason.number}</span>
                <h3>{reason.title}</h3>
                <p>{reason.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-route-story">
          <div className="about-route-story-photo">
            <img
              src="https://merabetta.com/images/story-1.png"
              alt="An older adult sharing a moment with family"
              loading="lazy"
            />
          </div>
          <div className="about-route-story-copy">
            <span className="landing-kicker">Care with dignity</span>
            <h2>Support for healthier, more independent living.</h2>
            <p>
              We make essential medical products easier to find, understand, and order, so seniors
              and their families can make informed choices with greater comfort and confidence.
            </p>
            <div className="about-route-stat">
              <strong>54K</strong>
              <span>Active Users in India</span>
            </div>
          </div>
        </section>

        <section className="about-route-contact" id="contact">
          <div>
            <span className="landing-kicker">Get in Touch</span>
            <h2>Get in touch for personalized care support.</h2>
            <p>Connect with us today and take the first step toward better care.</p>
          </div>
          <a className="landing-button primary" href="mailto:support@merabetta.com">
            Contact the care team <span>→</span>
          </a>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
