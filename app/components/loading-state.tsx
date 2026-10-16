import styles from "./loading-state.module.css";

export default function LoadingState({ children }: { children: React.ReactNode }) {
  return <div className={styles.state} role="status"><span className={styles.spinner} aria-hidden="true"/><span>{children}</span></div>;
}
