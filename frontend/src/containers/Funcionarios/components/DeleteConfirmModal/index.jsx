import { X, AlertTriangle, Trash2 } from "lucide-react";
import styles from "./styles.module.css";

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemName }) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.warningIcon}>
            <AlertTriangle size={24} color="#ef4444" />
          </div>
          <h2>Confirmar Exclusão</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          <p>Você está prestes a excluir/inativar o registro de:</p>
          <strong>{itemName}</strong>
          <p className={styles.warningText}>
            Esta ação pode impactar o histórico de entregas e relatórios vinculados a este funcionário.
          </p>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className={styles.deleteBtn} onClick={onConfirm}>
            <Trash2 size={18} /> Confirmar Exclusão
          </button>
        </div>
      </div>
    </div>
  );
}
