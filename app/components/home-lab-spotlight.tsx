import Link from "next/link";
import { referenceLabIds } from "../data/catalog";
import CareIcon from "./care-icon";
import styles from "./home-lab-spotlight.module.css";

export default function HomeLabSpotlight() {
  return <section className={styles.section} aria-labelledby="home-labs-title">
    <div className="ca-section-title">
      <h2 id="home-labs-title">A healthier you starts here</h2>
    </div>
    <div className={styles.panel}>
      <div className={styles.content}>
        <span className={styles.labIcon}><CareIcon name="lab" size={42}/></span>
        <div className={styles.copy}>
          <h3>Choose the right lab for you</h3>
          <p>Compare tests and prices from {referenceLabIds.length} labs.<br/>Find the care that fits you and your family.</p>
        </div>
      </div>
      <div className={styles.action}>
        <Link href="/labtest" className={styles.button}>Choose a lab <span><CareIcon name="arrow" size={18}/></span></Link>
      </div>
    </div>
  </section>;
}
