import Link from "next/link";
import CareIcon from "./care-icon";
import styles from "./care-your-way.module.css";

const services = [
  { title: "Essentials", description: "Everyday care, delivered", icon: "medical", href: "/products", tone: "lavender" },
  { title: "Lab tests", description: "A little clarity for your health", icon: "lab", href: "/labtest", tone: "rose" },
  { title: "My Orders", description: "Your care, all in one place", icon: "bag", href: "/profile?tab=orders&from=home", tone: "peach" },
  { title: "Senior living", description: "Feel at home, feel cared for", icon: "home", tone: "sage" },
  { title: "Senior travel", description: "More journeys, more joy", icon: "travel", tone: "blue" },
];

export default function CareYourWay() {
  return (
    <section className={`ca-section ${styles.section}`} aria-labelledby="care-your-way-title">
      <div className="ca-section-title"><h2 id="care-your-way-title">Care, your way</h2></div>
      <div className={styles.grid}>
        {services.map(service => {
          const content = <>
            <span className={styles.icon}>
              {service.icon === "travel" ? <svg width="43" height="43" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="17" rx="3"/><path d="M5 7h14M12 7v7M5 14h14M7 20v2M17 20v2"/><circle cx="8" cy="17" r=".8"/><circle cx="16" cy="17" r=".8"/></svg> : <CareIcon name={service.icon} size={43}/>}
            </span>
            <div className={styles.copy}><h3>{service.title}</h3><p>{service.description}</p></div>
            <span className={styles.footer}>{service.href ? <>Explore <CareIcon name="arrow" size={17}/></> : <span className={styles.badge}>Coming soon</span>}</span>
          </>;
          const className = `${styles.card} ${styles[service.tone]} ${!service.href ? styles.upcoming : ""}`;
          return service.href ? <Link key={service.title} className={className} href={service.href}>{content}</Link> : <article key={service.title} className={className}>{content}</article>;
        })}
      </div>
    </section>
  );
}
