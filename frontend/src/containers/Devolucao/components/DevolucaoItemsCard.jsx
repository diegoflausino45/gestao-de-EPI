import React from 'react';
import { Package, Trash2, Plus } from "lucide-react";
import styles from "../styles.module.css";

const DevolucaoItemsCard = React.memo(({ 
  itens, 
  onRemoveItem, 
  onChangeEstado, 
  onChangeObs, 
  onAddItem 
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <Package size={18} />
        <h3>Itens para Devolução</h3>
        <span className={styles.itemCountBadge}>
          {itens.length} {itens.length === 1 ? 'item' : 'itens'}
        </span>
      </div>
      
      <div className={styles.cardBody}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Equipamento</th>
              <th>Estado de Conservação</th>
              <th style={{width: '50px'}}></th>
            </tr>
          </thead>
          <tbody>
            {itens.length > 0 ? (
              itens.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className={styles.itemInfo}>
                      <h5>{item.nome}</h5>
                      <span>{item.CA || item.ca || "CA não informado"}</span>
                    </div>
                    {/* Campo de observação condicional para itens danificados/inutilizáveis */}
                    {(item.estado === 'danificado' || item.estado === 'inutilizavel') && (
                      <input 
                        type="text" 
                        placeholder="Descreva o problema..."
                        className={`${styles.itemObsInput} ${item.estado === 'inutilizavel' && !item.observacao ? styles.errorInput : ''}`}
                        value={item.observacao}
                        onChange={(e) => onChangeObs(item.id, e.target.value)}
                      />
                    )}
                  </td>
                  <td>
                    <div className={styles.statePills}>
                      <button 
                        className={`${styles.pill} ${item.estado === 'bom' ? `${styles.pillActive} ${styles.good}` : ''}`}
                        onClick={() => onChangeEstado(item.id, 'bom')}
                      >
                        Bom
                      </button>
                      <button 
                        className={`${styles.pill} ${item.estado === 'danificado' ? `${styles.pillActive} ${styles.damaged}` : ''}`}
                        onClick={() => onChangeEstado(item.id, 'danificado')}
                      >
                        Danificado
                      </button>
                      <button 
                        className={`${styles.pill} ${item.estado === 'inutilizavel' ? `${styles.pillActive} ${styles.broken}` : ''}`}
                        onClick={() => onChangeEstado(item.id, 'inutilizavel')}
                      >
                        Inutilizável
                      </button>
                    </div>
                  </td>
                  <td>
                    <button className={styles.removeBtn} onClick={() => onRemoveItem(item.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">
                  <div className={styles.emptyState}>
                    <Package size={32} className={styles.emptyIcon} />
                    <p>Nenhum item selecionado.</p>
                    <span className={styles.emptySub}>Selecione um funcionário ou adicione itens manualmente.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <button className={styles.addItemBtn} onClick={onAddItem}>
          <Plus size={16} />
          Adicionar Equipamento Manualmente
        </button>
      </div>
    </div>
  );
});

export default DevolucaoItemsCard;
