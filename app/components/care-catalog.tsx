"use client";

import Link from "next/link";
import { useState } from "react";
import { asset, categories, demoDescription, labListings, money, products, tests, type Product } from "../data/catalog";
import CareIcon from "./care-icon";
import CareShell, { PageHeading } from "./care-shell";
import { useCare } from "./care-store";

export function ProductCard({ product }: { product: Product }) {
  const { state, add, wish, ready } = useCare();
  const saved = state.wishlist.includes(product.id);
  return <article className="ca-product"><div className="ca-product-art"><Link href={`/products/${product.id}`}><img src={asset(product.image)} alt={product.name} loading="lazy"/></Link><span className="ca-discount">{Math.round((1 - product.price / product.mrp) * 100)}% OFF</span><button className={`ca-wish ${saved ? "saved" : ""}`} aria-label={`${saved ? "Remove" : "Save"} ${product.name} ${saved ? "from" : "to"} wishlist`} aria-pressed={saved} onClick={() => wish(product.id)} disabled={!ready}><CareIcon name="heart" size={19}/></button></div><div className="ca-product-copy"><span className="ca-rating">★ {product.rating} <small>· Sample rating</small></span><Link href={`/products/${product.id}`}><h3>{product.name}</h3></Link><p>{product.subtitle}</p><div className="ca-product-bottom"><div><strong>{money(product.price)}</strong> <del>{money(product.mrp)}</del></div><button className="ca-add" onClick={() => add(product.id)} disabled={!ready} aria-label={`Add ${product.name} to cart`}>Add <span>+</span></button></div></div></article>;
}
function SectionTitle({ title, href, label = "View all" }: { title: string; href?: string; label?: string }) {
  return <div className="ca-section-title"><h2>{title}</h2>{href && <Link href={href}>{label} <CareIcon name="arrow" size={17}/></Link>}</div>;
}
function CategoryGrid() {
  return <div className="ca-categories ca-category-tiles">{categories.map(category => <Link key={category.id} href={`/products?category=${category.id}`}><span><CareIcon name={category.icon} size={40}/></span><strong>{category.name}</strong></Link>)}<Link href="/products"><span><CareIcon name="grid" size={40}/></span><strong>More</strong></Link></div>;
}
export function HomeScreen() {
  return <CareShell>
    <section className="ca-hero"><div className="ca-hero-copy"><span className="ca-eyebrow">Made with care, for your care.</span><h1>Good health<br/><em>comes home.</em></h1><p>Medicines, everyday care and trusted lab tests.<br/>Everything you need, a little closer.</p><Link href="/products" className="ca-button">Shop now <CareIcon name="arrow" size={18}/></Link><span className="ca-hero-foot"><CareIcon name="heart" size={17}/> A little care. A healthier tomorrow.</span></div><div className="ca-hero-image"><img src={asset("care")} alt="A caregiver supporting an older adult" fetchPriority="high"/><div className="ca-hero-badge"><CareIcon name="shield" size={26}/><span>Care in every detail<small>For you and the ones you love</small></span></div></div></section>
    <div className="ca-trust">{[["shield", "Thoughtful essentials"], ["truck", "Care at your doorstep"], ["support", "Here to help"]].map(([icon, label]) => <span key={icon}><CareIcon name={icon}/>{label}</span>)}</div>
    <section className="ca-section"><SectionTitle title="Shop by category" href="/products"/><CategoryGrid/></section>
    <section className="ca-section"><SectionTitle title="Popular products" href="/products"/><div className="ca-product-grid">{products.slice(0, 4).map(product => <ProductCard key={product.id} product={product}/>)}</div></section>
    <section className="ca-wellness"><div><span className="ca-eyebrow">A healthier you starts here</span><h2>A little care for<br/>your everyday.</h2><p>Your healthier everyday starts here.<br/>Use <strong>MERA20</strong> for a little extra savings.</p><Link href="/products" className="ca-button">Explore essentials <CareIcon name="arrow"/></Link></div><img src={asset("wellness-banner")} alt="Daily wellness and personal care essentials" loading="lazy"/></section>
<<<<<<< HEAD
    <section className="ca-section ca-lab-spotlight"><SectionTitle title="A healthier you starts here" href="/labtest" label="Explore labs"/><Link href="/labtest" className="ca-lab-spotlight-card"><span className="ca-lab-spotlight-icon"><CareIcon name="lab" size={48}/></span><span><strong>Choose the right lab for you</strong><small>6 labs · Compare tests and prices</small></span><b>Choose a lab <CareIcon name="arrow" size={22}/></b></Link><div className="ca-lab-benefits">{[["shield", "Trusted care"], ["medical", "Quality products"], ["heart", "Made for you"]].map(([icon, label]) => <span key={icon}><CareIcon name={icon} size={31}/>{label}</span>)}</div></section>
=======
    <section className="ca-section"><SectionTitle title="Popular health packages" href="/labtest"/><div className="ca-test-grid">{tests.slice(0, 3).map(test => <Link className="ca-test-preview" href={`/labtest?test=${test.id}`} key={test.id}><img src={asset(test.image)} alt="" loading="lazy"/><div><span className="ca-eyebrow">Home sample collection</span><h3>{test.name}</h3><p>{test.subtitle}</p><strong>From {money(Math.min(...labListings.filter(l => l.test === test.id).map(l => l.price)))}</strong></div><CareIcon name="arrow"/></Link>)}</div></section>
>>>>>>> 2f0d4a40f8a1f9194817256bdd9ddfa3415c3a15
    <aside className="ca-demo"><CareIcon name="shield"/><p><strong>Explore the Merabetta demo</strong><br/>{demoDescription}</p></aside>
  </CareShell>;
}

export function ProductsScreen({ initialCategory = "", initialQuery = "" }: { initialCategory?: string; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState("featured");
  const visible = products.filter(p => (!category || p.category === category) && `${p.name} ${p.subtitle}`.toLowerCase().includes(query.toLowerCase().trim())).sort((a, b) => sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : 0);
  return <CareShell><PageHeading eyebrow="Your everyday essentials" title="A little care, all in one place." text="Explore medicines, wellness and essentials for the people you love."/><div className="ca-toolbar"><label className="ca-search"><CareIcon name="search"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products, brands, health solutions..." aria-label="Search products"/>{query && <button onClick={() => setQuery("")} aria-label="Clear search"><CareIcon name="close" size={17}/></button>}</label><select aria-label="Sort products" value={sort} onChange={e => setSort(e.target.value)}><option value="featured">Featured products</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div><div className="ca-chips" aria-label="Product categories"><button className={!category ? "active" : ""} onClick={() => setCategory("")}>All products</button>{categories.map(c => <button key={c.id} className={category === c.id ? "active" : ""} onClick={() => setCategory(c.id)}>{c.name}</button>)}</div><p className="ca-result-count">{visible.length} products · Sample catalog</p>{visible.length ? <div className="ca-product-grid">{visible.map(p => <ProductCard key={p.id} product={p}/>)}</div> : <div className="ca-empty"><h2>No products found</h2><p>Try another search or category.</p><button className="ca-button" onClick={() => { setQuery(""); setCategory(""); }}>Clear filters</button></div>}</CareShell>;
}

export function Quantity({ value, onChange, name, allowZero = false }: { value: number; onChange: (n: number) => void; name: string; allowZero?: boolean }) {
  return <div className="ca-quantity"><button aria-label={`Decrease ${name} quantity`} disabled={value <= (allowZero ? 0 : 1)} onClick={() => onChange(value - 1)}>−</button><span aria-label={`${name} quantity`}>{value}</span><button aria-label={`Increase ${name} quantity`} disabled={value >= 99} onClick={() => onChange(value + 1)}>+</button></div>;
}
<<<<<<< HEAD

=======
>>>>>>> 2f0d4a40f8a1f9194817256bdd9ddfa3415c3a15
