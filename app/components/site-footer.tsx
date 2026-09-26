const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61588919011600" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/vision55-megacare-private-limited/" },
  { label: "Instagram", href: "https://www.instagram.com/merabetta.com_?igsh=Ym9oYTF1NnJmaDZo&utm_source=qr" },
  { label: "Twitter", href: "https://twitter.com/" },
];

export default function SiteFooter() {
  return (
    <footer className="reference-footer" id="support">
      <img
        className="reference-footer-shape"
        src="https://merabetta.com/images/Group-1.png"
        alt=""
        aria-hidden="true"
      />
      <div className="reference-footer-grid">
        <section className="reference-footer-brand" aria-label="About Merabetta">
          <a className="reference-footer-logo" href="/" aria-label="Merabetta home">
            <img src="/logo.png" alt="Merabetta" />
          </a>
          <p>
            Merabetta is dedicated to supporting senior health with trusted medical essentials,
            reliable service, and compassionate care—delivered safely and conveniently to your
            doorstep.
          </p>
          <div className="reference-footer-badges" aria-label="Get the app">
            <img src="https://merabetta.com/images/app-2.png" alt="App Store" />
            <img src="https://merabetta.com/images/app-1.png" alt="Google Play" />
          </div>
        </section>

        <nav className="reference-footer-column" aria-label="Quick Links">
          <h2>Quick Links</h2>
          <a href="/">Home</a>
          <a href="/about">About Us</a>
          <a href="/products">Products</a>
          <a href="/#about">Community</a>
          <a href="/#contact">Contact</a>
        </nav>

        <nav className="reference-footer-column" aria-label="Follow Us">
          <h2>Follow Us</h2>
          {socialLinks.map(({ label, href }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer">
              {label}
            </a>
          ))}
        </nav>

        <section className="reference-footer-contact">
          <h2>Ready to get started?</h2>
          <p>Connect with us today and take the first step toward better care.</p>
          <a href="mailto:support@merabetta.com">
            <span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg></span>
            support@merabetta.com
          </a>
          <a href="tel:+918999188267">
            <span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7.2 3.5H5a2 2 0 0 0-2 2c.2 8.6 7.1 15.4 15.7 15.6a2 2 0 0 0 2-2v-2.2l-4.3-1.5-1.5 2.1a15 15 0 0 1-6.9-6.9l2.1-1.5-1.5-4.3Z"/></svg></span>
            +91 89991 88267
          </a>
        </section>
      </div>

      <div className="reference-footer-bottom">
        <p>Copyright © 2026. Vision55 Megacare Private Limited . All rights reserved.</p>
        <div>
          <a href="https://merabetta.com/terms">Terms and Condition</a>
          <a href="https://merabetta.com/privacy-policy">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}
