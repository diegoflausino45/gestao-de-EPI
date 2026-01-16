import React from 'react';
import { Filter, Search } from "lucide-react";
import styles from "../relatorio.module.css";

const RelatorioFilters = React.memo(({ filters, onChange }) => {
  return (
    <div className={styles.tableWrapper}>
      <div className={styles.header}>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <Filter size={16} color="#666"/>
          <h3>Filtros Avançados</h3>
        </div>
      </div>

      <div className={styles.filterGrid}>
        
        <div className={styles.field}>
          <label>Período</label>
          <div className={styles.periodoInputs}>
            <div className={styles.inputIcon}>
              <input 
                  type="date" 
                  name="startDate"
                  value={filters.startDate} 
                  onChange={onChange} 
              />
            </div>
            <span style={{alignSelf: 'center', color: '#999'}}>até</span>
            <div className={styles.inputIcon}>
               <input 
                  type="date" 
                  name="endDate"
                  value={filters.endDate} 
                  onChange={onChange} 
              />
            </div>
          </div>
        </div>

        <div className={styles.field}>
          <label>Funcionário</label>
          <div className={styles.inputIconWrapper}>
              <Search size={16} className={styles.icon} />
              <input 
                  placeholder="Buscar por nome..." 
                  name="funcionario"
                  value={filters.funcionario}
                  onChange={onChange}
                  className={styles.inputWithIcon}
              />
          </div>
        </div>

        <div className={styles.field}>
          <label>Setor</label>
          <select name="setor" value={filters.setor} onChange={onChange}>
            <option value="">Todos os Setores</option>
            <option value="Produção">Produção</option>
            <option value="Administrativo">Administrativo</option>
            <option value="Logística">Logística</option>
            <option value="Manutenção">Manutenção</option>
            <option value="Segurança do Trabalho">Segurança do Trabalho</option>
          </select>
        </div>
      </div>
    </div>
  );
});

export default RelatorioFilters;
