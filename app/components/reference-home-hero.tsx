"use client";

import Link from "next/link";
import useBannerCarousel from "./use-banner-carousel";
import styles from "./reference-home-hero.module.css";
import CareIcon from "./care-icon";

const slides = [
  { tag: "YOUR EVERYDAY WELLNESS COMPANION", title: "A little care.", accent: "A healthier you.", text: "Medicines, everyday care and trusted lab tests. A little closer to you.", action: "Explore care essentials", href: "/products", image: "care-hero", src: "/hero/care-hero.webp", alt: "A healthcare professional supporting a senior with home care" },
  { tag: "EVERYDAY WELLNESS", title: "Good health", accent: "comes home.", text: "Add a little care to your day. Explore the Merabetta collection for your everyday wellness.", action: "Shop essentials", href: "/products", image: "wellness-circle", src: "/hero/wellness-circle.png", alt: "Merabetta everyday wellness collection" },
  { tag: "KNOW YOUR HEALTH", title: "Small checks.", accent: "Better care.", text: "Explore tests and compare labs. Keep family care close to home.", action: "Explore labs", href: "/labtest", image: "lab-circle", src: "/hero/lab-circle.png", alt: "A laboratory technician organizing sample tubes" },
];

export default function ReferenceHomeHero() {
  const { slide, setSlide, playing, setPlaying, setHovered, setFocused, rotating } = useBannerCarousel(slides.length);
  const current = slides[slide];
  return <section className={styles.hero} data-reference-hero aria-label="Healthcare at home" aria-roledescription="carousel" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}>
    <div className={styles.row}>
      <div className={styles.visual}><div className={styles.circle} data-image={current.image}>
        <img key={current.image} src={current.src} alt={current.alt} fetchPriority={slide === 0 ? "high" : "auto"}/>
        <span className={styles.ring} aria-hidden="true"/>
      </div></div>
      <div className={styles.copy} aria-live={rotating ? "off" : "polite"} aria-atomic="true">
        <span className={styles.eyebrow}>{current.tag}</span>
        <h1>{current.title}<br/><em>{current.accent}</em></h1>
        <p>{current.text}</p>
        <Link className={styles.explore} href={current.href}>{current.action}<span><img src="/merabetta-contact-arrow.svg" width={24} height={24} alt=""/></span></Link>
        <div className={styles.assurance}><span><CareIcon name="shield" size={17}/>Thoughtfully selected</span><span><CareIcon name="heart" size={17}/>Made for the whole family</span></div>
      </div>
    </div>
    <div className={styles.controls}>
      <button suppressHydrationWarning aria-label="Previous care banner" onClick={() => setSlide(current => (current + slides.length - 1) % slides.length)}><CareIcon name="back" size={20}/></button>
      <div className={styles.dots}>{slides.map((item, index) => <button suppressHydrationWarning key={item.image} aria-label={`Show banner ${index + 1}: ${item.title} ${item.accent}`} aria-current={slide === index ? "true" : undefined} onClick={() => setSlide(index)}><span className={slide === index ? styles.selected : ""}/></button>)}</div>
      <button suppressHydrationWarning aria-label="Next care banner" onClick={() => setSlide(current => (current + 1) % slides.length)}><CareIcon name="arrow" size={20}/></button>
      <button suppressHydrationWarning aria-label={playing ? "Pause automatic care banners" : "Start automatic care banners"} onClick={() => setPlaying(value => !value)}><CareIcon name={playing ? "pause" : "play"} size={18}/></button>
    </div>
  </section>;
}
