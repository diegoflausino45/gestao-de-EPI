import React from 'react';
import { CheckCircle } from "lucide-react";
import styles from "../styles.module.css";

const EntregaFooter = React.memo(({ totalItems, onConfirm, disabled }) => {
  return (
    <div className={styles.footerActions}>
       <div className={styles.totalInfo}>
          <span>Total de Itens:</span>
          <strong>{totalItems}</strong>
       </div>
       <button 
         className={styles.confirmBtn} 
         onClick={onConfirm}
         disabled={disabled}
       >
         <CheckCircle size={20} /> Confirmar Entrega
       </button>
    </div>
  );
});

export default EntregaFooter;
