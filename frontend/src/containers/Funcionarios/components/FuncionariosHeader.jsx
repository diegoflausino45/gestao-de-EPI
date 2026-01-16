import React from 'react';
import { Search, Plus } from "lucide-react";
import styles from "../styles.module.css";

const FuncionariosHeader = React.memo(({ search, onSearchChange, onNew }) => {
  return (
    <div className={styles.headerControls}>
      <div className={styles.searchWrapper}>
        <Search className={styles.searchIcon} size={20} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Buscar por nome, cargo ou setor..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <button className={styles.addButton} onClick={onNew}>
        <Plus size={20} />
        Novo Funcionário
      </button>
    </div>
  );
});

export default FuncionariosHeader;
