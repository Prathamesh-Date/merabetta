import Link from "next/link";
import PublicPageShell from "./public-page-shell";
import styles from "./public-pages.module.css";

const team = [
  ["Mr. Meghashyam Kalele", "Founder & Managing Director", "megha-shyam-kalele.jpeg"],
  ["Dr. Vandana Sharma", "Co-Founder · Chief Advisory Officer", "Vandana-Sharma.jpeg"],
  ["Mr. Sanjeev Mandal", "Co-Founder · Chief Operating Officer", "sanjeev.jpeg"],
  ["Mr. Harshal Musale", "Co-Founder · Chief Technology Officer", "Harshal-Musale.jpeg"],
  ["Mrs. Deepali Kalele", "Co-Founder · Director", "Depali-Kalele.jpeg"],
];

export default function AboutContent() {
  return <PublicPageShell>
    <img className={styles.banner} src="https://merabetta.com/images/about-us.png" alt="About Us"/>
    <section className={`${styles.section} ${styles.split}`}>
      <div><h1 className={styles.heading}>Thoughtful care for everyday independence</h1><p className={styles.text}>Merabetta brings practical products and support together for seniors and their families.</p><div className={styles.panels}><article className={styles.panel}><h2>Vision</h2><p>A future in which older people can access compassionate care and helpful technology without losing their independence.</p></article><article className={styles.panel}><h2>Mission</h2><p>Make care easier to find by connecting everyday essentials, services, and human support.</p></article></div></div>
      <img src="https://merabetta.com/images/about-frame.png" alt="People supported by Merabetta" loading="lazy"/>
    </section>
    <section className={`${styles.section} ${styles.split}`}><img src="https://merabetta.com/images/story-1.png" alt="Support across generations" loading="lazy"/><div><h2 className={styles.heading}>Our Story</h2><p className={styles.text}>Growing older can make everyday systems harder to navigate. Merabetta was created to help families find support in one place, with dignity at the heart of the experience.</p><p className={styles.text}>Its purpose reaches both seniors and relatives caring from a distance: simpler access to essentials, reassurance, and opportunities to stay connected.</p></div></section>
    <section className={`${styles.section} ${styles.split}`}><div><h2 className={styles.heading}>Support that respects your independence</h2><p className={styles.text}>The platform connects healthcare products, daily living support, and community participation so that older people can remain active in their own lives.</p><Link className={styles.button} href="/products">Explore products →</Link></div><img src="https://merabetta.com/images/story-2.png" alt="Compassionate senior care" loading="lazy"/></section>
    <section className={`${styles.section} ${styles.center}`}><p className={styles.eyebrow}>Our Team</p><h2 className={styles.heading}>The people behind Merabetta</h2><div className={styles.team}>{team.map(([name,role,image])=><article className={styles.person} key={name}><img src={`https://merabetta.com/images/${image}`} alt={name} loading="lazy"/><h3>{name}</h3><p>{role}</p></article>)}</div></section>
    <section className={styles.callout}><h2 className={styles.heading}>Care starts with a conversation</h2><p className={styles.text}>Talk to the team about products, support, or community activities.</p><Link className={styles.button} href="#support">Let’s connect →</Link></section>
  </PublicPageShell>;
}
