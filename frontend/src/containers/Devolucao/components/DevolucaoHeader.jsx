import React from 'react';
import styles from "../styles.module.css";

const DevolucaoHeader = React.memo(() => {
  return (
    <header className={styles.header}>
      <h1>Devolução de Equipamentos (EPI)</h1>
    </header>
  );
});

export default DevolucaoHeader;
