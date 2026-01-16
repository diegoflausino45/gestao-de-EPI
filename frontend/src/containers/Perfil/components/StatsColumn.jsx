import React from 'react';
import styles from "../styles.module.css";

const StatsColumn = React.memo(() => {
  return (
    <aside className={styles.statsColumn}>
          
      <div className={styles.statCard}>
        <div className={styles.statLabel}>Entregas Realizadas</div>
        <div className={styles.statValue}>1.240</div>
        <div style={{fontSize: '0.8rem', color: '#16a34a'}}>+12 esta semana</div>
      </div>

      <div className={styles.statCard} style={{flex: 1}}>
        <h4 style={{margin: '0 0 16px 0', fontSize: '0.95rem'}}>Últimas Ações</h4>
        <div className={styles.miniTimeline}>
          <div className={styles.miniEvent}>
            <div className={styles.miniDot}></div>
            <div className={styles.miniContent}>
              <p>Alterou senha</p>
              <span>Hoje, 09:30</span>
            </div>
          </div>
          <div className={styles.miniEvent}>
            <div className={styles.miniDot} style={{backgroundColor: '#eab308'}}></div>
            <div className={styles.miniContent}>
              <p>Ajuste de Estoque</p>
              <span>Ontem, 16:45</span>
            </div>
          </div>
          <div className={styles.miniEvent}>
            <div className={styles.miniDot} style={{backgroundColor: '#22c55e'}}></div>
            <div className={styles.miniContent}>
              <p>Entrega (João S.)</p>
              <span>Ontem, 14:20</span>
            </div>
          </div>
        </div>
      </div>

    </aside>
  );
});

export default StatsColumn;
