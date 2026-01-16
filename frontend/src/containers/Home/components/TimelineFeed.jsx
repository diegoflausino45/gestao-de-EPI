import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Clock } from "lucide-react";
import styles from "../styles.module.css";

// Memoized Component
const TimelineFeed = React.memo(({ activities }) => {
  return (
    <div className={`${styles.bentoItem} ${styles.areaTimeline}`}>
      <div className={styles.timelineTitle}>Atividades Recentes</div>
      <div className={styles.timelineListContainer}>
        <div className={styles.timelineList}>
          {activities.map((activity, index) => (
            <div key={index} className={styles.timelineItem}>
              <div className={styles.timelineLine}></div>
              <div className={`${styles.timelineDot} ${styles[activity.type]}`}>
                 {activity.type === 'success' && <CheckCircle size={14} />}
                 {activity.type === 'warning' && <AlertTriangle size={14} />}
                 {activity.type === 'danger' && <XCircle size={14} />}
                 {activity.type === 'info' && <Clock size={14} />}
              </div>
              <div className={styles.timelineContent}>
                <span className={styles.timelineTime}>{activity.time}</span>
                <p className={styles.timelineText}>
                  {activity.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default TimelineFeed;