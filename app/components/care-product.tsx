"use client";

import Link from "next/link";
import { useState } from "react";
import { asset, categories, money, products } from "../data/catalog";
import CareShell from "./care-shell";
import CareIcon from "./care-icon";
import { ProductCard, Quantity } from "./care-catalog";
import { useCare } from "./care-store";

const details: Record<string, { description: string; features: string[] }> = {
  p1: { description: "Crocin Advance Tablet from the Merabetta sample medicine collection. Review the product label and consult a pharmacist or clinician about suitability and use.", features: ["Paracetamol 500mg", "Check the pack for full product information", "Follow the directions provided by your clinician or pharmacist"] },
  p2: { description: "Daily Multivitamin in an easy-to-store pack for your everyday wellness collection.", features: ["60 tablets per pack", "Review the label for ingredients and directions", "Keep in a cool, dry place"] },
  p3: { description: "A digital blood pressure monitor with a clear display for a straightforward home monitoring routine.", features: ["Digital reading display", "For home monitoring", "Follow the supplied instructions for use"] },
  p4: { description: "Gentle Face Cleanser in a practical 150 ml pack for your personal care routine.", features: ["150 ml pack", "Hydrating personal care", "Review the label for ingredients and directions"] },
  p7: { description: "An everyday hygiene kit that brings personal care essentials together in one place.", features: ["Everyday hygiene collection", "Convenient care essentials", "Review pack contents before purchase"] },
  p8: { description: "Adult Pull-Up Diapers in a large size, supplied in a pack of ten for everyday personal care.", features: ["Large size", "Pack of 10", "Pull-up style"] },
  p9: { description: "A height-adjustable walking stick for everyday support, with a simple design that is easy to keep close at hand.", features: ["Adjustable height", "Single walking stick", "Check fit and product instructions before use"] },
  p10: { description: "A padded senior care recliner in beige, designed to offer a comfortable place to sit and relax at home.", features: ["Padded recliner", "Beige finish", "Confirm dimensions and delivery details before purchase"] },
};

export default function ProductScreen({ id }: { id: string }) {
  const product = products.find(p => p.id === id)!;
  const category = categories.find(c => c.id === product.category)!;
  const content = details[id];
  const { add, ready, wish, state } = useCare();
  const [count, setCount] = useState(1);
  const [tab, setTab] = useState("description");
  const saved = state.wishlist.includes(id);
  return <CareShell>
    <Link className="ca-back" href="/products"><CareIcon name="back" size={18}/> Back to products</Link>
    <nav className="cp-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href={`/products?category=${category.id}`}>{category.name}</Link><span>/</span><span aria-current="page">{product.name}</span></nav>
    <section className="cp-detail">
      <div className="cp-art"><img src={asset(product.image)} alt={product.name}/><button className={`ca-wish ${saved ? "saved" : ""}`} disabled={!ready} aria-label={saved ? "Remove product from wishlist" : "Save product to wishlist"} aria-pressed={saved} onClick={() => wish(id)}><CareIcon name="heart"/></button></div>
      <div className="cp-copy"><Link className="ca-eyebrow" href={`/products?category=${category.id}`}>{category.name}</Link><h1>{product.name}</h1><span className="cl-rating">★ {product.rating} · Sample rating</span><div className="cp-price"><strong>{money(product.price)}</strong><del>{money(product.mrp)}</del><span className="cl-discount">{Math.round((1 - product.price / product.mrp) * 100)}% OFF</span></div><p className="cp-delivery"><CareIcon name="truck"/>Delivery options shown at checkout</p><p>{content.description}</p><div className="cp-purchase"><Quantity value={count} onChange={setCount} name={product.name}/><button className="ca-button" disabled={!ready} onClick={() => add(id, count)}>Add to cart <CareIcon name="bag"/></button></div><Link className="cp-category" href={`/products?category=${category.id}`}>Category: {category.name}</Link><div className="cp-checkout-note"><CareIcon name="shield"/><div><strong>Checkout details</strong><small>Review delivery and payment options at checkout.</small></div></div></div>
    </section>
    <section className="cp-information"><div className="cp-tabs" role="tablist" aria-label="Product information">{["description", "reviews"].map(name => <button key={name} id={`product-tab-${name}`} aria-controls="product-information" role="tab" aria-selected={tab === name} className={tab === name ? "active" : ""} onClick={() => setTab(name)}>{name === "description" ? "Description" : "Reviews (0)"}</button>)}</div><div role="tabpanel" id="product-information" aria-labelledby={`product-tab-${tab}`} className="cp-tab-content">{tab === "description" ? <><h2>About this product</h2><p>{content.description}</p><p>{product.subtitle}. Selected to make everyday healthcare shopping straightforward for you and your family.</p><ul>{content.features.map(feature => <li key={feature}>{feature}</li>)}</ul><small>Sample product information. Confirm specifications and availability before purchase.</small></> : <div className="cp-no-reviews"><span>☆</span><h2>No reviews yet</h2><p>Customer reviews will appear here when they are available.</p></div>}</div></section>
    <section className="ca-section"><div className="ca-section-title"><div><span className="ca-eyebrow">You may also like</span><h2>Related products</h2></div><Link href="/products">View all <CareIcon name="arrow" size={18}/></Link></div><div className="ca-product-grid">{products.filter(p => p.id !== id).slice(0, 4).map(p => <ProductCard key={p.id} product={p}/>)}</div></section>
  </CareShell>;
}
