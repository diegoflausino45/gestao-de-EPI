import React from 'react';
import styles from "../styles.module.css";

// Memoized Component
const LastDeliveriesTable = React.memo(({ deliveries }) => {
  return (
    <div className={`${styles.bentoItem} ${styles.areaTable}`}>
      <div className={styles.cardHeader}>
        <h3>Últimas Entregas</h3>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.tableEntregas}>
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Item</th>
              <th>Qtd</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.slice(0, 4).map((item) => (
              <tr key={item.id}>
                <td className={styles.empName}>{item.employee}</td>
                <td><span className={styles.badge}>{item.epi}</span></td>
                <td>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default LastDeliveriesTable;