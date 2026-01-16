import React from 'react';
import { CheckCircle } from "lucide-react";
import styles from "../styles.module.css";

const DevolucaoFooter = React.memo(({ onCancel, onConfirm }) => {
  return (
    <div className={styles.actionsFooter}>
      <button className={styles.btnCancel} onClick={onCancel}>
        Cancelar
      </button>
      <button className={styles.btnConfirm} onClick={onConfirm}>
        <CheckCircle size={20} />
        Confirmar Devolução
      </button>
    </div>
  );
});

export default DevolucaoFooter;
