import Link from "next/link";
import CareIcon from "./care-icon";
import styles from "./home-discover.module.css";

const sections = [
  {
    id: "home-community",
    label: "Services & Community",
    title: "A little connection. A lot of belonging.",
    description: "Explore thoughtful care services and shared experiences for seniors and their families.",
    action: "Explore services & community",
    href: "/community",
    image: "/app/senior-care-support.png",
    alt: "A care professional sharing a warm conversation with an older couple",
  },
  {
    id: "home-blogs",
    label: "Blogs",
    title: "Small reads. Healthier everyday living.",
    description: "Discover practical wellness ideas, everyday care tips, and stories for every stage of life.",
    action: "Read our blogs",
    href: "/blog",
    image: "/blog/merabetta-blog-hero.png",
    alt: "An older couple reading wellness information together at home",
  },
];

export default function HomeDiscover() {
  return <div className={styles.sections}>{sections.map((section, index) =>
    <section key={section.id} className={`${styles.banner} ${index === 1 ? styles.blog : ""}`} aria-labelledby={section.id}>
      <img src={section.image} alt={section.alt} loading="lazy"/>
      <div className={styles.copy}>
        <span className={styles.eyebrow}>{section.label}</span>
        <h2 id={section.id}>{section.title}</h2>
        <p>{section.description}</p>
        <Link href={section.href} className={styles.button}>{section.action}<CareIcon name="arrow" size={18}/></Link>
      </div>
    </section>
  )}</div>;
}
