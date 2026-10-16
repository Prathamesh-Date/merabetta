"use client";

import useBannerCarousel from "./use-banner-carousel";
import CareIcon from "./care-icon";
import styles from "./catalog-promo.module.css";

const slides = [
  { tag: "CARE AT HOME", title: "Good health comes home.", text: "Thoughtful essentials for you and the people you love.", action: "Explore products", category: "", image: "/hero/care-rectangular.webp", alt: "A caregiver supporting an older adult at home" },
  { tag: "EVERYDAY WELLNESS", title: "A little care, every day.", text: "Discover nutrition and wellness essentials for your daily routine.", action: "Shop wellness", category: "category-5", image: "/hero/wellness-circle.webp", alt: "Everyday wellness products arranged in a comfortable home" },
  { tag: "MOVE WITH CONFIDENCE", title: "Comfort in every step.", text: "Explore mobility aids and accessories for everyday independence.", action: "Shop mobility", category: "category-10", image: "/app/mobility.webp", alt: "Mobility aids and accessories for daily support" },
];

export default function CatalogPromo({ onBrowse }: { onBrowse: (category: string) => void }) {
  const { slide, setSlide, playing, setPlaying, setHovered, setFocused, rotating } = useBannerCarousel(slides.length);
  const current = slides[slide];
  function choose(index: number) { setSlide(index); }

  return <section className={`ca-catalog-promo ${styles.promo}`} aria-label="Discover care essentials" aria-roledescription="carousel" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}>
    <div className={styles.copy}>
      <div aria-live={rotating ? "off" : "polite"} aria-atomic="true">
        <span className={styles.tag}>{current.tag}</span>
        <h2>{current.title}</h2>
        <p>{current.text}</p>
      </div>
      <button suppressHydrationWarning className={styles.action} onClick={() => onBrowse(current.category)}>{current.action}<CareIcon name="arrow" size={18}/></button>
      <div className={styles.controls}>
        <button suppressHydrationWarning aria-label="Previous product banner" onClick={() => choose((slide + slides.length - 1) % slides.length)}><CareIcon name="back" size={18}/></button>
        <div className={styles.dots}>{slides.map((item, index) => <button suppressHydrationWarning key={item.tag} aria-label={`Show product banner ${index + 1}`} aria-current={slide === index ? "true" : undefined} onClick={() => choose(index)}><span className={slide === index ? styles.activeDot : ""}/></button>)}</div>
        <button suppressHydrationWarning aria-label="Next product banner" onClick={() => choose((slide + 1) % slides.length)}><CareIcon name="arrow" size={18}/></button>
        <button suppressHydrationWarning className={styles.play} aria-label={playing ? "Pause automatic banners" : "Start automatic banners"} onClick={() => setPlaying(value => !value)}><CareIcon name={playing ? "pause" : "play"} size={16}/></button>
      </div>
    </div>
    <div className={styles.visual}>{slides.map((item, index) => <img key={item.image} className={slide === index ? styles.activeImage : ""} src={item.image} alt={item.alt} aria-hidden={slide !== index} loading="eager"/>)}</div>
  </section>;
}
