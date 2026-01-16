import React from 'react';
import { Package, Trash2, Plus } from "lucide-react";
import styles from "../styles.module.css";

const EntregaCart = React.memo(({ 
  cesta, 
  onRemoveItem, 
  onUpdateField, 
  onUpdateQuantity, 
  onOpenSelectModal 
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <Package size={18} />
        <h3>Itens da Entrega</h3>
        <div className={styles.itemCount}>
          {cesta.length} {cesta.length === 1 ? 'item' : 'itens'}
        </div>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>EPI</th>
                <th style={{width: '120px'}}>CA</th>
                <th style={{width: '150px'}}>Validade</th>
                <th style={{textAlign: 'center'}}>Qtd.</th>
                <th style={{width: '40px'}}></th>
              </tr>
            </thead>
            <tbody>
              {cesta.length > 0 ? (
                cesta.map((item) => (
                  <tr key={item.codigo}>
                    <td>
                      <div className={styles.itemMeta}>
                        <span className={styles.itemName}>{item.nome}</span>
                        <span className={styles.itemCode}>Cód: {item.codigo}</span>
                      </div>
                    </td>
                    <td>
                      <input 
                        type="text"
                        className={styles.inlineInput}
                        value={item.caEntrega}
                        onChange={(e) => onUpdateField(item.codigo, 'caEntrega', e.target.value)}
                        placeholder="Nº CA"
                      />
                    </td>
                    <td>
                      <input 
                        type="date"
                        className={styles.inlineInput}
                        value={item.validadeEntrega ? item.validadeEntrega.split('T')[0] : ''}
                        onChange={(e) => onUpdateField(item.codigo, 'validadeEntrega', e.target.value)}
                      />
                    </td>
                    <td>
                      <div className={styles.qtyControl}>
                        <button onClick={() => onUpdateQuantity(item.codigo, -1)}>-</button>
                        <span>{item.quantidade}</span>
                        <button onClick={() => onUpdateQuantity(item.codigo, 1)}>+</button>
                      </div>
                    </td>
                    <td>
                      <button className={styles.removeBtn} onClick={() => onRemoveItem(item.codigo)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">
                    <div className={styles.emptyState}>
                      <Package size={40} strokeWidth={1} />
                      <p>Nenhum item adicionado à entrega.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <button className={styles.addItemBtn} onClick={onOpenSelectModal}>
          <Plus size={18} /> Adicionar EPI
        </button>
      </div>
    </div>
  );
});

export default EntregaCart;
