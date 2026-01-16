import React from 'react';
import { Search } from "lucide-react";
import styles from "../styles.module.css";

const EpiHeader = React.memo(({ search, onSearchChange }) => {
  return (
    <div className={styles.headerControls}>
      <div className={styles.searchWrapper}>
        <Search className={styles.searchIcon} size={20} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Buscar por nome, tipo ou código ERP..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
});

export default EpiHeader;
