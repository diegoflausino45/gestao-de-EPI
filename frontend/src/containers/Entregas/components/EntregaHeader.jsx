import React from 'react';
import { Clock } from "lucide-react";
import styles from "../styles.module.css";

const EntregaHeader = React.memo(() => {
  return (
    <header className={styles.header}>
      <h1>Terminal de Entrega</h1>
      <span className={styles.dateBadge}>
        <Clock size={14} /> {new Date().toLocaleDateString('pt-BR')}
      </span>
    </header>
  );
});

export default EntregaHeader;
