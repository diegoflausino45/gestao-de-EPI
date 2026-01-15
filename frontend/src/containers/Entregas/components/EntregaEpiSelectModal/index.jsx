import { useState, useMemo } from "react";
import { X, Search, Plus, Package, Loader2, Calendar } from "lucide-react";
import styles from "./styles.module.css";

export default function EntregaEpiSelectModal({ isOpen, onClose, onSelect, epis = [], loading = false }) {
  const [busca, setBusca] = useState("");

  const episFiltrados = useMemo(() => {
    if (!busca) return epis;
    return epis.filter(epi =>
      (epi.nome && epi.nome.toLowerCase().includes(busca.toLowerCase())) ||
      (epi.codigo && epi.codigo.toLowerCase().includes(busca.toLowerCase())) ||
      (epi.tipo && epi.tipo.toLowerCase().includes(busca.toLowerCase())) ||
      (epi.ca && String(epi.ca).includes(busca))
    );
  }, [busca, epis]);

  // Função helper para calcular status de validade
  const getValidadeStatus = (validade) => {
    if (!validade) return { label: 'N/A', class: 'neutral' };
    const hoje = new Date();
    const dataVal = new Date(validade);
    const diffTime = dataVal - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Vencido', class: 'expired' };
    if (diffDays < 30) return { label: 'Vence em breve', class: 'warning' };
    return { label: 'Válido', class: 'valid' };
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        
        <div className={styles.header}>
          <h2>
            <Package size={24} className={styles.headerIcon} />
            Selecionar Equipamento para Entrega
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
              placeholder="Buscar por nome, CA, código ou tipo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className={styles.searchInput}
              autoFocus
            />
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Cód.</th>
                  <th>Equipamento / Descrição</th>
                  <th style={{ textAlign: 'center' }}>Saldo</th>
                  <th style={{ textAlign: 'right' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4">
                      <div className={styles.loadingState}>
                        <Loader2 size={24} className={styles.spin} />
                        <p>Carregando catálogo de EPIs...</p>
                      </div>
                    </td>
                  </tr>
                ) : episFiltrados.length > 0 ? (
                  episFiltrados.map(epi => {
                    return (
                      <tr key={epi.id || epi.codigo}>
                        <td><span className={styles.codeBadge}>{epi.codigo || '-'}</span></td>
                        
                        <td>
                          <div className={styles.epiInfo}>
                            <span className={styles.epiName}>{epi.nome}</span>
                            <span className={styles.epiDesc}>{epi.descricao || epi.tipo || "Sem descrição adicional"}</span>
                          </div>
                        </td>
                        
                        <td style={{ textAlign: 'center' }}>
                          <span className={styles.stockValue}>{epi.estoqueAtual ?? 0}</span>
                        </td>

                        <td>
                          <div className={styles.actions}>
                            <button
                              className={styles.selectBtn}
                              onClick={() => onSelect(epi)}
                              title="Adicionar à entrega"
                              disabled={epi.estoqueAtual <= 0}
                            >
                              <Plus size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4">
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
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
}
