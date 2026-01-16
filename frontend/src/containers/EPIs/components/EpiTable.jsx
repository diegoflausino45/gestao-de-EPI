import React from 'react';
import { ShieldCheck, Edit2, Package } from "lucide-react";
import styles from "../styles.module.css";

const EpiTable = React.memo(({ epis, onEdit }) => {
  
  const getStatusClass = (status) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("crítico") || s.includes("baixo")) return styles.statusCritical;
    if (s.includes("alerta")) return styles.statusWarning;
    return styles.statusOK;
  };

  const getDotClass = (status) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("crítico") || s.includes("baixo")) return styles.dotCritical;
    if (s.includes("alerta")) return styles.dotWarning;
    return styles.dotOK;
  };

  return (
    <div className={styles.tableCard}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Equipamento</th>
            <th>Categoria</th>
            <th>Validade CA</th>
            <th>Estoque (Saldo)</th>
            <th>Status</th>
            <th style={{textAlign: 'right'}}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {epis.length > 0 ? (
            epis.map((e) => (
              <tr key={e.codigo || e.id}>
                <td>
                  <div className={styles.epiProfile}>
                    <div className={styles.iconBox}>
                      <ShieldCheck size={20} />
                    </div>
                    <div className={styles.epiInfo}>
                      <span className={styles.epiName}>{e.nome}</span>
                      <span className={styles.epiCode}>CÓD: {e.codigo}</span>
                    </div>
                  </div>
                </td>
                
                <td><span className={styles.badge}>{e.tipo || "Geral"}</span></td>
                
                <td style={{color: '#64748b', fontSize: '0.85rem'}}>
                  {e.validadeCA ? new Date(e.validadeCA).toLocaleDateString("pt-BR") : "-"}
                </td>

                <td>
                  <div className={styles.stockInfo}>
                    <span className={styles.stockMain}>{e.estoqueAtual ?? 0} un</span>
                    <span className={styles.stockMin}>Mín: {e.estoqueMinimo ?? 0}</span>
                  </div>
                </td>

                <td>
                  <div className={getStatusClass(e.status)}>
                    <div className={`${styles.dot} ${getDotClass(e.status)}`}></div>
                    {e.status || "OK"}
                  </div>
                </td>

                <td>
                  <div className={styles.actions}>
                    <button className={styles.actionBtn} onClick={() => onEdit(e)} title="Configurar Alerta">
                      <Edit2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">
                <div className={styles.emptyState}>
                  <Package size={48} strokeWidth={1} />
                  <p>Nenhum equipamento encontrado.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});

export default EpiTable;
