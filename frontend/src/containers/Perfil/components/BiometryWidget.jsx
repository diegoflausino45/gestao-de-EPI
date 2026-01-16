import React from 'react';
import { Fingerprint } from "lucide-react";
import styles from "../styles.module.css";

const BiometryWidget = React.memo(() => {
  return (
    <div className={styles.biometryWidget}>
      <span className={styles.widgetLabel}>Leitor Biométrico</span>
      <span className={styles.readerName}>Futronic FS80H</span>
      <div className={`${styles.statusWrapper} ${styles.statusConnected}`}>
        <Fingerprint size={24} />
        <span className={styles.statusText}>Conectado</span>
      </div>
    </div>
  );
});

export default BiometryWidget;
