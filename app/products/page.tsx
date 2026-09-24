"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Product = {
  name: string;
  detail: string;
  price: number;
  was: number;
  rating: string;
  category: string;
  icon: string;
  tone: string;
  tag?: string;
  description: string;
  features: string[];
};

const categories = [
  { name: "Medicines", icon: "✚", tone: "mint", count: "Everyday essentials" },
  { name: "Health devices", icon: "♧", tone: "blue", count: "Monitor with ease" },
  { name: "Personal care", icon: "◒", tone: "peach", count: "Care for yourself" },
  { name: "Baby care", icon: "♡", tone: "lavender", count: "Gentle daily care" },
  { name: "Wellness", icon: "❧", tone: "mint", count: "Feel your best" },
  { name: "Daily living", icon: "⌂", tone: "blue", count: "Comfort at home" },
];

const products: Product[] = [
  { name: "Digital blood pressure monitor", detail: "Large display · Easy one-button use", price: 1299, was: 1599, rating: "4.8 (124)", category: "Health devices", icon: "◉", tone: "blue", tag: "Bestseller", description: "A simple home monitor with a clear display and easy one-button operation.", features: ["Large, easy-to-read display", "One-button operation", "Comfortable adjustable cuff"] },
  { name: "Daily wellness multivitamin", detail: "60 tablets · Everyday nutrition", price: 549, was: 699, rating: "4.7 (86)", category: "Wellness", icon: "✦", tone: "mint", description: "A convenient daily supplement in an easy-to-store pack.", features: ["60 tablets per pack", "Simple daily routine", "Keep in a cool, dry place"] },
  { name: "Gentle moisturizing lotion", detail: "200 ml · Sensitive skin care", price: 329, was: 399, rating: "4.9 (52)", category: "Personal care", icon: "◍", tone: "lavender", tag: "Gentle care", description: "Everyday moisture in a practical bottle for your personal care routine.", features: ["200 ml bottle", "Easy-to-use pump top", "For everyday personal care"] },
  { name: "Comfort walking support", detail: "Lightweight · Adjustable fit", price: 899, was: 1099, rating: "4.6 (43)", category: "Daily living", icon: "⌁", tone: "peach", description: "A lightweight adjustable support designed for added comfort during daily activities.", features: ["Lightweight design", "Adjustable fit", "Wipe clean after use"] },
];

function Icon({ name }: { name: string }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  if (name === "search") return <svg {...common}><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.3 4.3"/></svg>;
  if (name === "bag") return <svg {...common}><path d="M5 8h14l1 12H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>;
  if (name === "pin") return <svg {...common}><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/></svg>;
  if (name === "arrow") return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
  if (name === "phone") return <svg {...common}><path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M10 18h4"/></svg>;
  if (name === "shield") return <svg {...common}><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></svg>;
  if (name === "truck") return <svg {...common}><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="19" r="1.5"/><circle cx="18" cy="19" r="1.5"/></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
}

function ProductArtwork({ icon, tone, name }: Pick<Product, "icon" | "tone" | "name">) {
  return (
    <div className={`product-art ${tone}`} role="img" aria-label={`${name} illustration`}>
      <div className="art-glow" />
      <div className="product-pack"><span className="pack-mark">{icon}</span><span className="pack-brand">merabetta</span><span className="pack-line"/><span className="pack-caption">daily care</span></div>
      <span className="art-leaf leaf-one">✳</span><span className="art-leaf leaf-two">✦</span>
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All products");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [detailTab, setDetailTab] = useState<"description" | "reviews">("description");
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null);
  const [authNotice, setAuthNotice] = useState("");
  const [accountName, setAccountName] = useState("");
  const [ordersOpen, setOrdersOpen] = useState(false);

  useEffect(() => {
    const accountIntent = new URLSearchParams(window.location.search).get("account");
    if (accountIntent === "login" || accountIntent === "signup") {
      setAuthMode(accountIntent);
      window.history.replaceState(null, "", "/products");
    }
  }, []);

  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesQuery = `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (activeCategory === "All products" || product.category === activeCategory);
  }), [query, activeCategory]);
  const cartCount = Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  const cartTotal = products.reduce((total, product) => total + product.price * (cart[product.name] ?? 0), 0);

  function addToCart(name: string) {
    setCart((current) => ({ ...current, [name]: (current[name] ?? 0) + 1 }));
  }

  function showProduct(product: Product) {
    setActiveProduct(product);
    setDetailQuantity(1);
    setDetailTab("description");
  }

  function submitAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (authMode === "signup" && form.get("password") !== form.get("confirmPassword")) {
      setAuthNotice("Those passwords don’t match yet. Please check and try again.");
      return;
    }
    const username = String(form.get("username") ?? form.get("mobile") ?? "");
    const name = String(form.get("fullName") ?? "");
    setAccountName(name || username);
    setAuthNotice(authMode === "signup" ? "Your delivery details are saved for this preview." : "You’re signed in for this preview.");
  }

  function openAuth(mode: "login" | "signup") {
    setAuthNotice("");
    setAuthMode(mode);
  }

  return (
    <main>
      <div className={`top-note ${activeProduct ? "product-top-note" : ""}`}><span>Thoughtful care for every day</span><span className="top-note-right"><Icon name="phone"/> Need help? <a href="#support">Talk to us</a></span></div>
      <header className={`site-header ${activeProduct ? "product-header" : ""}`}>
        <a className="brand" href="/" aria-label="Merabetta home"><span className="brand-mark">✚</span><span>merabetta<span className="brand-dot">.</span><small>CARE MADE SIMPLE</small></span></a>
        <div className="location"><Icon name="pin"/><span><strong>Deliver to</strong><b>Bengaluru</b></span><span className="chevron">⌄</span></div>
        <label className="search-box"><Icon name="search"/><input aria-label="Search products" placeholder="Search medicines, health products..." value={query} onChange={(event) => setQuery(event.target.value)}/><kbd>⌘ K</kbd></label>
        <nav className={`main-nav ${menuOpen ? "open" : ""}`} aria-label="Main navigation">
          <a href="/" onClick={() => setMenuOpen(false)}>Home</a><a className="nav-current" href="#products" onClick={() => setMenuOpen(false)}>Products</a><a href="/labtest" onClick={() => setMenuOpen(false)}>Lab Tests</a>
        </nav>
        <button className="icon-button mobile-menu" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span>{menuOpen ? "×" : "☰"}</span></button>
        <button className="account-button" onClick={() => openAuth("login")}>{accountName ? `Hi, ${accountName.split(" ")[0]}` : "Log in"}</button>
        {!accountName && <button className="account-signup" onClick={() => openAuth("signup")}>Sign up</button>}
        <button className="cart-button" onClick={() => setCartOpen(true)} aria-label={`Open cart, ${cartCount} items`}><Icon name="bag"/><span>Cart</span><b>{cartCount}</b></button>
      </header>

      <div id="top" className="content-wrap">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot"/> A little care goes a long way</div><h1 id="hero-title">Good health,<br/><em>made simple.</em></h1><p>Everyday healthcare essentials, thoughtfully chosen for you and the people you love.</p><div className="hero-actions"><a className="button button-primary" href="#products">Shop healthcare <Icon name="arrow"/></a><a className="text-link" href="#categories">Explore categories <Icon name="arrow"/></a></div><div className="hero-reassurance"><span className="avatar-stack"><i>☺</i><i>♡</i><i>✚</i></span><span><strong>Here when you need us</strong><small>Friendly help, every step of the way</small></span></div></div>
          <div className="hero-visual" aria-label="A selection of healthcare essentials">
            <div className="visual-sun"/><div className="hero-leaf leaf-left">✳</div><div className="hero-leaf leaf-right">✿</div><div className="hero-circle"><span>CARE<br/>FOR YOU</span></div>
            <div className="hero-product hero-bottle"><span>merabetta</span><b>daily<br/>wellness</b><i>✦</i></div><div className="hero-product hero-box"><span>merabetta</span><b>health<br/>essentials</b><i>✚</i></div><div className="hero-product hero-tube"><span>gentle care</span><i>◒</i></div>
            <div className="floating-note"><span>✦</span><div><strong>Chosen with care</strong><small>Quality you can trust</small></div></div>
          </div>
          <div className="hero-side-label">YOUR WELLNESS, OUR PRIORITY&nbsp; · &nbsp;01</div>
        </section>

        <section className="trust-strip" aria-label="Shopping benefits"><div><span className="trust-icon"><Icon name="shield"/></span><span><strong>Trusted essentials</strong><small>Quality, every time</small></span></div><div><span className="trust-icon"><Icon name="truck"/></span><span><strong>Care at your door</strong><small>Easy home delivery</small></span></div><div><span className="trust-icon"><Icon name="phone"/></span><span><strong>Real people, here to help</strong><small>Friendly support</small></span></div><div><span className="trust-icon"><Icon name="clock"/></span><span><strong>Simple & secure</strong><small>Shop with confidence</small></span></div></section>

        <section className="section categories-section" id="categories">
          <div className="section-heading"><div><div className="section-kicker">Find what you need</div><h2>Shop by category</h2><p>Everyday care, all in one easy place.</p></div><a className="view-link" href="#products">View all categories <Icon name="arrow"/></a></div>
          <div className="category-grid">{categories.map((category) => <button className="category-card" key={category.name} onClick={() => { setActiveCategory(category.name); document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }); }}><span className={`category-icon ${category.tone}`}>{category.icon}</span><span className="category-copy"><strong>{category.name}</strong><small>{category.count}</small></span><span className="category-arrow">↗</span></button>)}</div>
        </section>

        <section className="season-banner"><div className="season-copy"><div className="section-kicker">A fresh start, every day</div><h2>Make room for<br/>feeling your best.</h2><p>Little things that make everyday care feel a little easier.</p><a className="button button-dark" href="#products">Explore wellness <Icon name="arrow"/></a></div><div className="season-art"><span className="sun-stamp">A GOOD<br/>DAY STARTS<br/>WITH CARE</span><div className="season-jar jar-one"><i>✦</i><span>daily<br/>wellness</span></div><div className="season-jar jar-two"><i>◒</i><span>gentle<br/>care</span></div><div className="season-flower">✿</div></div><span className="banner-leaf">✳</span></section>

        <section className="section products-section" id="products">
          <div className="section-heading product-heading"><div><div className="section-kicker">A few favourites</div><h2>Good things for your health</h2><p>Trusted essentials for you and your family.</p></div><a className="view-link" href="#products">View all products <Icon name="arrow"/></a></div>
          <div className="product-toolbar"><div className="filter-tabs" aria-label="Filter products by category"><button className={activeCategory === "All products" ? "selected" : ""} onClick={() => setActiveCategory("All products")}>All products</button>{["Health devices", "Wellness", "Personal care"].map((category) => <button key={category} className={activeCategory === category ? "selected" : ""} onClick={() => setActiveCategory(category)}>{category}</button>)}</div><span className="result-count">Showing {visibleProducts.length} thoughtful picks</span></div>
          {visibleProducts.length ? <div className="product-grid">{visibleProducts.map((product) => <article className="product-card" key={product.name}><div className="product-image-wrap">{product.tag && <span className="product-tag">{product.tag}</span>}<button className="favorite" aria-label={`Save ${product.name}`} onClick={(event) => event.currentTarget.classList.toggle("favorited")}>♡</button><button className="product-art-button" aria-label={`View details for ${product.name}`} onClick={() => showProduct(product)}><ProductArtwork icon={product.icon} tone={product.tone} name={product.name}/></button></div><div className="product-info"><div className="product-category">{product.category}</div><h3><button className="product-name-button" onClick={() => showProduct(product)}>{product.name}</button></h3><p>{product.detail}</p><div className="rating"><span>★</span> {product.rating}</div><div className="product-buy"><div><strong>₹{product.price.toLocaleString("en-IN")}</strong><del>₹{product.was.toLocaleString("en-IN")}</del></div><button className="details-button" onClick={() => showProduct(product)}>Details</button><button className={`add-button ${cart[product.name] ? "added" : ""}`} onClick={() => addToCart(product.name)} aria-label={`Add ${product.name} to cart`}>{cart[product.name] ? `Added · ${cart[product.name]} +` : "+ Add to cart"}</button></div></div></article>)}</div> : <div className="empty-results"><span>⌕</span><h3>Nothing found just yet</h3><p>Try another search or choose a different category.</p><button className="button button-primary" onClick={() => { setQuery(""); setActiveCategory("All products"); }}>Show all products</button></div>}
        </section>

        <footer className="footer" id="support"><div className="footer-brand"><a className="brand" href="/"><span className="brand-mark">✚</span><span>merabetta<span className="brand-dot">.</span><small>CARE MADE SIMPLE</small></span></a><p>Thoughtful healthcare essentials<br/>for everyday wellbeing.</p><a className="footer-phone" href="tel:+18001234567">Need help? 1800 123 4567</a></div><div className="footer-column"><h3>Shop &amp; e-commerce</h3><a href="#products">All products</a><a href="#categories">Shop by category</a><button onClick={() => setCartOpen(true)}>Shopping cart ({cartCount})</button><button onClick={() => setOrdersOpen(true)}>Order history</button></div><div className="footer-column"><h3>Healthcare &amp; support</h3><a href="#categories">Health devices</a><a href="#categories">Personal care</a><a href="#categories">Wellness essentials</a><a href="tel:+18001234567">Contact care team</a></div><div className="footer-bottom"><span>© 2026 Merabetta. Made with care.</span><button onClick={() => openAuth("signup")}>Create an account</button><span>Secure shopping · Friendly support</span></div></footer>
      </div>

      <nav className="bottom-nav" aria-label="Store sections"><a className="active" href="#top"><span>⌂</span>Home</a><a href="#categories"><span>▦</span>Categories</a><button onClick={() => setCartOpen(true)}><span>♧{cartCount > 0 && <i>{cartCount}</i>}</span>Cart</button><button onClick={() => setOrdersOpen(true)}><span>▤</span>Orders</button><button onClick={() => accountName ? setOrdersOpen(true) : openAuth("login")}><span>♙</span>Profile</button></nav>

      {cartOpen && <div className="drawer-backdrop" role="presentation" onClick={() => setCartOpen(false)}><aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" onClick={(event) => event.stopPropagation()}><div className="drawer-heading"><div><div className="section-kicker">Your care, collected</div><h2 id="cart-title">Your cart <span>({cartCount})</span></h2></div><button className="icon-button close-drawer" aria-label="Close cart" onClick={() => setCartOpen(false)}>×</button></div>{cartCount === 0 ? <div className="cart-empty"><span>♡</span><h3>Your cart is taking a little rest</h3><p>Add a few essentials and they’ll be waiting here.</p><button className="button button-primary" onClick={() => setCartOpen(false)}>Browse products</button></div> : <><div className="cart-items">{products.filter((product) => cart[product.name]).map((product) => <div className="cart-line" key={product.name}><ProductArtwork icon={product.icon} tone={product.tone} name={product.name}/><div className="cart-line-copy"><strong>{product.name}</strong><small>₹{product.price.toLocaleString("en-IN")}</small><div className="quantity"><button aria-label={`Remove one ${product.name}`} onClick={() => setCart((current) => ({ ...current, [product.name]: current[product.name] <= 1 ? 0 : current[product.name] - 1 }))}>−</button><span>{cart[product.name]}</span><button aria-label={`Add one ${product.name}`} onClick={() => addToCart(product.name)}>+</button></div></div><button className="remove-item" aria-label={`Remove ${product.name}`} onClick={() => setCart((current) => ({ ...current, [product.name]: 0 }))}>×</button></div>)}</div><div className="cart-summary"><div><span>Subtotal</span><strong>₹{cartTotal.toLocaleString("en-IN")}</strong></div><small>Delivery details are confirmed at checkout.</small><button className="button button-primary checkout-button" onClick={() => setCartOpen(false)}>Continue to checkout <Icon name="arrow"/></button></div></>}</aside></div>}

      {activeProduct && <div className="dialog-backdrop product-page-backdrop" role="presentation" onClick={() => setActiveProduct(null)}><section className="product-dialog" role="dialog" aria-modal="true" aria-labelledby="detail-title" onClick={(event) => event.stopPropagation()}>
        <button className="product-back" onClick={() => setActiveProduct(null)}>← Back to products</button>
        <button className="dialog-close" aria-label="Close product details" onClick={() => setActiveProduct(null)}>×</button>
        <div className="product-breadcrumb"><a href="/">Home</a><span>/</span><a href="#products" onClick={() => { setActiveCategory(activeProduct.category); setActiveProduct(null); }}>{activeProduct.category}</a><span>/</span><span>{activeProduct.name}</span></div>
        <div className="product-detail-top">
          <div className="detail-art"><ProductArtwork icon={activeProduct.icon} tone={activeProduct.tone} name={activeProduct.name}/></div>
          <div className="detail-copy"><div className="product-category">{activeProduct.category}</div><h2 id="detail-title">{activeProduct.name}</h2><div className="rating"><span>★</span> {activeProduct.rating}</div><div className="detail-price"><strong>₹{activeProduct.price.toLocaleString("en-IN")}</strong><del>₹{activeProduct.was.toLocaleString("en-IN")}</del></div><span className="delivery-note"><Icon name="truck"/> Delivery options shown at checkout</span><p>{activeProduct.description}</p><div className="detail-purchase-row"><div className="detail-quantity" aria-label="Product quantity"><button aria-label="Decrease quantity" onClick={() => setDetailQuantity((quantity) => Math.max(1, quantity - 1))}>−</button><span>{detailQuantity}</span><button aria-label="Increase quantity" onClick={() => setDetailQuantity((quantity) => quantity + 1)}>+</button></div><button className="button button-primary detail-add" onClick={() => { for (let index = 0; index < detailQuantity; index += 1) addToCart(activeProduct.name); setActiveProduct(null); setCartOpen(true); }}>Add to cart <Icon name="bag"/></button></div><a className="detail-category-link" href="#products" onClick={() => { setActiveCategory(activeProduct.category); setActiveProduct(null); }}>Category: {activeProduct.category}</a><div className="checkout-note"><Icon name="shield"/><span><strong>Checkout details</strong><small>Review delivery and payment options at checkout.</small></span></div></div>
        </div>
        <div className="detail-tabs" role="tablist" aria-label="Product information"><button role="tab" aria-selected={detailTab === "description"} className={detailTab === "description" ? "selected" : ""} onClick={() => setDetailTab("description")}>Description</button><button role="tab" aria-selected={detailTab === "reviews"} className={detailTab === "reviews" ? "selected" : ""} onClick={() => setDetailTab("reviews")}>Reviews (0)</button></div>
        <div className="detail-tab-content" role="tabpanel">{detailTab === "description" ? <><h3>About this product</h3><p>{activeProduct.description}</p><p>{activeProduct.detail}. Selected to make everyday healthcare shopping straightforward for you and your family.</p><ul>{activeProduct.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></> : <div className="no-reviews"><span>☆</span><h3>No reviews yet</h3><p>Customer reviews will appear here when they are available.</p></div>}</div>
        <section className="related-products" aria-labelledby="related-title"><div className="related-heading"><div><div className="section-kicker">You may also like</div><h2 id="related-title">Related products</h2></div><span>More everyday essentials</span></div><div className="related-grid">{products.filter((product) => product.name !== activeProduct.name).slice(0, 3).map((product) => <article className="related-card" key={product.name}><button className="related-art-button" aria-label={`View ${product.name}`} onClick={() => showProduct(product)}><ProductArtwork icon={product.icon} tone={product.tone} name={product.name}/></button><div className="product-category">{product.category}</div><button className="related-name" onClick={() => showProduct(product)}>{product.name}</button><div className="related-card-bottom"><strong>₹{product.price.toLocaleString("en-IN")}</strong><button className="add-button" onClick={() => addToCart(product.name)}>+ Add</button></div></article>)}</div></section>
      </section></div>}

      {authMode && <div className="dialog-backdrop" role="presentation" onClick={() => setAuthMode(null)}><section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title" onClick={(event) => event.stopPropagation()}><button className="dialog-close" aria-label="Close account form" onClick={() => setAuthMode(null)}>×</button><div className="auth-intro"><span className="brand-mark">✚</span><div className="section-kicker">Your Merabetta account</div><h2 id="auth-title">{authMode === "signup" ? "Create your account" : "Welcome back"}</h2><p>{authMode === "signup" ? "Add your details so your healthcare essentials can reach you." : "Log in to continue to your account."}</p></div><div className="auth-switch"><button className={authMode === "login" ? "selected" : ""} onClick={() => { setAuthMode("login"); setAuthNotice(""); }}>Log in</button><button className={authMode === "signup" ? "selected" : ""} onClick={() => { setAuthMode("signup"); setAuthNotice(""); }}>Sign up</button></div><form className="auth-form" onSubmit={submitAccount}>{authMode === "signup" ? <><label>Full name<input name="fullName" autoComplete="name" placeholder="Your full name" required/></label><div className="form-row"><label>Mobile number<input name="mobile" type="tel" autoComplete="tel" placeholder="10-digit mobile number" pattern="[0-9+() -]{8,18}" required/></label><label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required/></label></div><label>Password<input name="password" type="password" autoComplete="new-password" minLength={8} placeholder="At least 8 characters" required/></label><label>Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" minLength={8} placeholder="Enter password again" required/></label><div className="form-section-label">Delivery address</div><label>Street address<input name="address" autoComplete="street-address" placeholder="House number and street" required/></label><label>Area / landmark<input name="landmark" placeholder="Area or nearby landmark" required/></label><div className="form-row form-row-three"><label>City<input name="city" autoComplete="address-level2" placeholder="City" required/></label><label>State<input name="state" autoComplete="address-level1" placeholder="State" required/></label><label>PIN code<input name="postalCode" autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{6}" placeholder="6 digits" required/></label></div></> : <><label>Username or mobile number<input name="username" autoComplete="username" placeholder="Enter your username or mobile" required/></label><label>Password<input name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required/></label><label className="remember-option"><input type="checkbox" name="remember"/> Remember me on this device</label></>}<button className="button button-primary auth-submit" type="submit">{authMode === "signup" ? "Save details & sign up" : "Log in"} <Icon name="arrow"/></button>{authNotice && <p className="auth-notice" role="status">{authNotice}</p>}<p className="auth-demo-note">Account access is a front-end preview; connect an authentication service to enable secure sign-in.</p></form></section></div>}

      {ordersOpen && <div className="dialog-backdrop" role="presentation" onClick={() => setOrdersOpen(false)}><section className="orders-dialog" role="dialog" aria-modal="true" aria-labelledby="orders-title" onClick={(event) => event.stopPropagation()}><button className="dialog-close" aria-label="Close orders" onClick={() => setOrdersOpen(false)}>×</button><div className="section-kicker">Your account</div><h2 id="orders-title">Your orders</h2><div className="orders-empty"><span>▤</span><h3>No orders yet</h3><p>When you place an order, you’ll find its details here.</p><button className="button button-primary" onClick={() => setOrdersOpen(false)}>Browse products</button></div></section></div>}
    </main>
  );
}
