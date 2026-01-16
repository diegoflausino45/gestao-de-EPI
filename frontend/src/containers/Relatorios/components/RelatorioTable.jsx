import React, { useMemo } from 'react';
import { Eye, Inbox } from "lucide-react"; // Inbox icon for empty state
import StatusBadge from "./StatusBadge";
import styles from "../relatorio.module.css";

// Helper para iniciais
const getInitials = (name) => {
  if (!name) return "??";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const RelatorioTable = React.memo(({ data, onViewDetails }) => {
  return (
    <div className={styles.resultsCard}>
      <table className={styles.table}>
          <thead>
              <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Funcionário</th>
                  <th>Setor</th>
                  <th>EPI</th>
                  <th style={{textAlign: 'right'}}>Qtd</th>
                  <th>Status</th>
                  <th style={{width: '60px'}}></th>
              </tr>
          </thead>
          <tbody>
              {data.length > 0 ? (
                  data.map(item => (
                      <tr key={item.id}>
                          <td>{new Date(item.dataEntrega).toLocaleDateString()}</td>
                          <td>
                              <span className={item.tipo === 'DEVOLUCAO' ? styles.tagDevolucao : styles.tagEntrega}>
                                  {item.tipo || 'ENTREGA'}
                              </span>
                          </td>
                          <td>
                            <div className={styles.userProfile}>
                                <div className={styles.avatar}>
                                    {getInitials(item.funcionario)}
                                </div>
                                <div className={styles.userInfo}>
                                    <span className={styles.userName}>{item.funcionario}</span>
                                </div>
                            </div>
                          </td>
                          <td>{item.setor}</td>
                          <td>{item.epi}</td>
                          <td style={{textAlign: 'right'}}>{item.quantidade}</td>
                          <td>
                              <StatusBadge status={item.status} />
                          </td>
                          <td>
                              <button 
                                className={styles.actionBtn}
                                onClick={() => onViewDetails(item)}
                                title="Ver Detalhes"
                              >
                                <Eye size={18} />
                              </button>
                          </td>
                      </tr>
                  ))
              ) : (
                  <tr>
                      <td colSpan="8">
                          <div className={styles.emptyState}>
                             <Inbox size={48} strokeWidth={1.5} style={{opacity: 0.5}} />
                             <span>Nenhum registro encontrado para os filtros selecionados.</span>
                          </div>
                      </td>
                  </tr>
              )}
          </tbody>
      </table>
    </div>
  );
});

export default RelatorioTable;