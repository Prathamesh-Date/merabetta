"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import PageWishlistLink from "./page-wishlist-link";
import { asset, categories, labListings, money, products, tests, type Product } from "../data/catalog";
import CareIcon from "./care-icon";
import CareShell from "./care-shell";
import { useCare } from "./care-store";
import ReferenceHomeHero from "./reference-home-hero";
import CatalogPromo from "./catalog-promo";
import CareYourWay from "./care-your-way";
import supportStyles from "./home-care-support.module.css";
import navigationStyles from "./product-category-navigation.module.css";
import HomeLabSpotlight from "./home-lab-spotlight";
import HomeDiscover from "./home-discover";

export function ProductCard({ product, showBuyNow = false }: { product: Product; showBuyNow?: boolean }) {
  const { state, add, wish, ready } = useCare();
  const saved = state.wishlist.includes(product.id);
  return <article className="ca-product"><div className="ca-product-art"><Link href={`/products/${product.id}`}><img src={asset(product.image)} alt={product.name} loading="lazy"/></Link><span className="ca-discount">{Math.round((1 - product.price / product.mrp) * 100)}% OFF</span><button className={`ca-wish ${saved ? "saved" : ""}`} aria-label={`${saved ? "Remove" : "Save"} ${product.name} ${saved ? "from" : "to"} wishlist`} aria-pressed={saved} onClick={() => wish(product.id)} disabled={!ready}><CareIcon name="heart" size={19}/></button></div><div className="ca-product-copy"><span className="ca-rating">★ {product.rating} <small>· Sample rating</small></span><Link href={`/products/${product.id}`}><h3>{product.name}</h3></Link><p>{product.subtitle}</p><div className="ca-product-bottom"><div><strong>{money(product.price)}</strong> <del>{money(product.mrp)}</del></div><div className="ca-product-actions">{showBuyNow ? <><button className="ca-buy-now" onClick={() => add(product.id)} disabled={!ready} aria-label={`Add ${product.name} to cart`}>Add to cart</button><button className="ca-wishlist-remove" onClick={() => wish(product.id)} disabled={!ready} aria-label={`Remove ${product.name} from wishlist`}>Remove</button></> : <button className="ca-add" onClick={() => add(product.id)} disabled={!ready} aria-label={`Add ${product.name} to cart`}>Add <span>+</span></button>}</div></div></div></article>;
}
function SectionTitle({ title, href, label = "View all", action }: { title: string; href?: string; label?: string; action?: ReactNode }) {
  return <div className={`ca-section-title${action ? " ca-section-with-actions" : ""}`}><h2>{title}</h2>{action}{href && <Link href={href}>{label} <CareIcon name="arrow" size={17}/></Link>}</div>;
}
function CategoryGrid() {
  return <div className="ca-categories ca-category-tiles">{categories.map(category => <Link key={category.id} href={`/products?category=${category.id}&from=home`}><span><CareIcon name={category.icon} size={37}/></span><strong>{category.name}</strong></Link>)}<Link href="/products"><span><CareIcon name="grid" size={37}/></span><strong>More</strong></Link></div>;
}
export function HomeScreen() {
  return <CareShell>
    <ReferenceHomeHero/>
    <CareYourWay/>
    <section className="ca-section"><SectionTitle title="Shop by category" href="/products"/><CategoryGrid/></section>
    <section className="ca-section ca-home-favorites"><SectionTitle title="Everyday favorite" href="/products"/><div className="ca-product-grid">{products.slice(0, 5).map(product => <ProductCard key={product.id} product={product}/>)}</div></section>
    <HomeLabSpotlight/>
    <HomeDiscover/>
    <section className={`ca-wellness ${supportStyles.section}`} aria-labelledby="home-care-support-title"><div><span className="ca-eyebrow">Care beyond age</span><h2 id="home-care-support-title">A little help.<br/>A lot of care.</h2><p>Thoughtful support for seniors.<br/>Here for you and your family.</p><div className={supportStyles.actions}><Link href="/contact" className="ca-button">Enquire Now <CareIcon name="arrow"/></Link><Link href="/profile?tab=support" className={supportStyles.supportLink}><CareIcon name="support" size={18}/>Customer Support</Link></div></div><img src="/app/senior-care-support-western.webp" alt="A care professional helping an older Western couple explore care options together" loading="lazy" width={2172} height={724}/></section>
  </CareShell>;
}

export function ProductsScreen({ initialCategory = "", initialQuery = "", initialFromHome = false }: { initialCategory?: string; initialQuery?: string; initialFromHome?: boolean }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState("featured");
  const [showCatalog, setShowCatalog] = useState(Boolean(initialCategory || initialQuery));
  const [categoryFromHome, setCategoryFromHome] = useState(Boolean(initialCategory && initialFromHome));
  const visible = products.filter(p => (!category || p.category === category) && `${p.name} ${p.subtitle}`.toLowerCase().includes(query.toLowerCase().trim())).sort((a, b) => sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : 0);
  const browsingCategories = !showCatalog && !query.trim() && !category;
  function backToCategories() {
    setQuery("");
    setCategory("");
    setSort("featured");
    setShowCatalog(false);
    setCategoryFromHome(false);
  }
  const heading = <header className="ca-catalog-heading"><div className={navigationStyles.heading}>
    {browsingCategories || categoryFromHome ? <Link href="/" className={navigationStyles.back} aria-label="Back to home"><CareIcon name="back" size={23}/></Link> : <button suppressHydrationWarning type="button" className={navigationStyles.back} onClick={backToCategories} aria-label="Back to categories"><CareIcon name="back" size={23}/></button>}
    <h1>Categories</h1>
  </div><Link href="/profile?tab=wishlist" aria-label="View wishlist"><CareIcon name="heart" size={27}/></Link></header>;
  // Form extensions may add fdprocessedid before hydration; only tolerate it on native controls.
  return <CareShell mainClassName="ca-products-page" mobileHeading={heading} search={<label className="ca-search ca-nav-search ca-catalog-search"><CareIcon name="search"/><input suppressHydrationWarning value={query} onChange={e => { setQuery(e.target.value); setShowCatalog(Boolean(e.target.value.trim())); }} placeholder="Search products" aria-label="Search products"/>{query && <button suppressHydrationWarning onClick={() => { setQuery(""); setShowCatalog(false); }} aria-label="Clear search"><CareIcon name="close" size={17}/></button>}</label>}><div className="ca-desktop-page-heading">{heading}</div>{browsingCategories ? <><div className="ca-catalog-category-grid">{categories.map(c => <button suppressHydrationWarning key={c.id} onClick={() => { setCategoryFromHome(false); setCategory(c.id); setShowCatalog(true); }}><span><CareIcon name={c.icon} size={37}/></span><strong>{c.name}</strong></button>)}<button suppressHydrationWarning onClick={() => setShowCatalog(true)}><span><CareIcon name="grid" size={37}/></span><strong>More</strong></button></div><CatalogPromo onBrowse={nextCategory => { setCategoryFromHome(false); setCategory(nextCategory); setShowCatalog(true); }}/><section className="ca-catalog-products"><SectionTitle title="Popular products" href="/products" action={<PageWishlistLink/>}/><div className="ca-product-grid">{visible.map(p => <ProductCard key={p.id} product={p}/>)}</div></section></> : <><div className="ca-catalog-controls">
  <h2 className="ca-catalog-selection">{categories.find(item => item.id === category)?.name ?? "All products"}</h2>
  <div className="ca-chips" aria-label="Product categories">
    <button suppressHydrationWarning className={!category ? "active" : ""} aria-pressed={!category} onClick={() => { setQuery(""); setCategory(""); setShowCatalog(false); }}>All categories</button>
    {categories.map(c => <button suppressHydrationWarning key={c.id} className={category === c.id ? "active" : ""} aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>{c.name}</button>)}
  </div>
  <label className="ca-catalog-filter">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2" fill="white"/><circle cx="15" cy="17" r="2" fill="white"/></svg>
    <span>Filter</span>
    <select suppressHydrationWarning aria-label="Filter products by sort order" value={sort} onChange={e => setSort(e.target.value)}>
      <option value="featured">Featured products</option>
      <option value="low">Price: low to high</option>
      <option value="high">Price: high to low</option>
    </select>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
  </label>
  <PageWishlistLink/>
</div><p className="ca-result-count">{visible.length} products · Sample catalog</p>{visible.length ? <div className="ca-product-grid">{visible.map(p => <ProductCard key={p.id} product={p}/>)}</div> : <div className="ca-empty"><h2>No products found</h2><p>Try another search or category.</p><button suppressHydrationWarning className="ca-button" onClick={() => { setQuery(""); setCategory(""); setShowCatalog(false); }}>Clear filters</button></div>}</>}</CareShell>;
}

export function Quantity({ value, onChange, name, allowZero = false }: { value: number; onChange: (n: number) => void; name: string; allowZero?: boolean }) {
  return <div className="ca-quantity"><button suppressHydrationWarning aria-label={`Decrease ${name} quantity`} disabled={value <= (allowZero ? 0 : 1)} onClick={() => onChange(value - 1)}>−</button><span aria-label={`${name} quantity`}>{value}</span><button suppressHydrationWarning aria-label={`Increase ${name} quantity`} disabled={value >= 99} onClick={() => onChange(value + 1)}>+</button></div>;
}

