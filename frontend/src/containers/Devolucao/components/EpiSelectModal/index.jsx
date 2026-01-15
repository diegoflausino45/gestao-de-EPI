import { useState, useMemo } from "react";
import { X, Search, Plus, Package, Loader2 } from "lucide-react";
import styles from "./styles.module.css";

export default function EpiSelectModal({ isOpen, onClose, onSelect, epis = [], loading = false }) {
  const [busca, setBusca] = useState("");

  const episFiltrados = useMemo(() => {
    if (!busca) return epis;
    return epis.filter(epi =>
      (epi.nome && epi.nome.toLowerCase().includes(busca.toLowerCase())) ||
      (epi.codigo && epi.codigo.toLowerCase().includes(busca.toLowerCase())) ||
      (epi.tipo && epi.tipo.toLowerCase().includes(busca.toLowerCase()))
    );
  }, [busca, epis]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        
        <div className={styles.header}>
          <h2>
            <Package size={24} className={styles.headerIcon} />
            Selecionar Equipamento
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <input
              type="text"
              placeholder="Buscar por nome, código ou tipo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Equipamento</th>
                  <th>Tipo</th>
                  <th>Estoque</th>
                  <th style={{ textAlign: 'right' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5">
                      <div className={styles.loadingState}>
                        <Loader2 size={24} className={styles.spin} />
                        <p>Carregando equipamentos...</p>
                      </div>
                    </td>
                  </tr>
                ) : episFiltrados.length > 0 ? (
                  episFiltrados.map(epi => (
                    <tr key={epi.id || epi.codigo}>
                      <td><span className={styles.codeBadge}>{epi.codigo || '-'}</span></td>
                      <td>
                        <div className={styles.epiInfo}>
                          <span className={styles.epiName}>{epi.nome}</span>
                        </div>
                      </td>
                      <td><span className={styles.typeBadge}>{epi.tipo || '-'}</span></td>
                      <td>{epi.estoqueAtual ?? '0'}</td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={styles.selectBtn}
                            onClick={() => onSelect(epi)}
                            title="Selecionar este item"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">
                      <div className={styles.emptyState}>
                        <Package size={40} strokeWidth={1} />
                        <p>Nenhum equipamento encontrado.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
