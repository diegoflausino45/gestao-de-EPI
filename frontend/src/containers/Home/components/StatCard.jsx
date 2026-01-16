import styles from "../styles.module.css";

export default function StatCard({ title, value, icon, status = "info", gridArea }) {
  return (
    <div className={`${styles.bentoItem} ${gridArea} ${styles[`kpi${status.charAt(0).toUpperCase() + status.slice(1)}`]}`}>
      <div className={styles.kpiContent}>
        <div className={styles.kpiHeader}>
          <div className={styles.kpiIconWrapper}>
            {icon}
          </div>
        </div>
        <div>
          <div className={styles.kpiValue}>{value}</div>
          <div className={styles.kpiLabel}>{title}</div>
        </div>
      </div>
    </div>
  );
}
