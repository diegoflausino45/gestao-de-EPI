import React from 'react';
import styles from "../relatorio.module.css";

const RelatorioTabs = React.memo(({ activeTab, onTabChange }) => {
  return (
    <div className={styles.tabs}>
      <button 
          className={`${styles.tab} ${activeTab === 'movimentacoes' ? styles.active : ''}`}
          onClick={() => onTabChange('movimentacoes')}
      >
          Histórico de Movimentações
      </button>
      <button 
          className={`${styles.tab} ${activeTab === 'vencimentos' ? styles.active : ''}`}
          onClick={() => onTabChange('vencimentos')}
      >
          Alertas de Vencimento
      </button>
    </div>
  );
});

export default RelatorioTabs;
