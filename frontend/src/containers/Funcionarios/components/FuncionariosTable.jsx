import React from 'react';
import { Edit2, Trash2, Users } from "lucide-react";
import styles from "../styles.module.css";

const FuncionariosTable = React.memo(({ funcionarios, onEdit, onDelete }) => {
  
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className={styles.tableCard}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Funcionário</th>
            <th>Cargo</th>
            <th>Setor</th>
            <th>EPIs</th>
            <th>Última Entrega</th>
            <th style={{textAlign: 'right'}}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {funcionarios.length > 0 ? (
            funcionarios.map((f) => (
              <tr key={f.id}>
                <td>
                  <div className={styles.userProfile}>
                    <div className={styles.avatar}>{getInitials(f.nome)}</div>
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>{f.nome}</span>
                      <div className={f.status === 'Ativo' ? styles.statusActive : styles.statusInactive}>
                          {f.status === 'Ativo' && <div className={styles.dot}></div>}
                          {f.status}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td><span className={styles.badge}>{f.cargo}</span></td>
                <td><span className={styles.badge}>{f.setor}</span></td>
                <td>{f.epis}</td>
                <td>{f.ultimaEntrega || "-"}</td>

                <td>
                  <div className={styles.actions}>
                    <button className={styles.actionBtn} onClick={() => onEdit(f)} title="Editar">
                      <Edit2 size={16} />
                    </button>
                    <button 
                      className={`${styles.actionBtn} ${styles.deleteBtn}`} 
                      onClick={() => onDelete(f)} 
                      title={f.status === "Ativo" ? "Inativar" : "Ativar"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">
                <div className={styles.emptyState}>
                  <Users size={48} strokeWidth={1} />
                  <p>Nenhum funcionário encontrado.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});

export default FuncionariosTable;
