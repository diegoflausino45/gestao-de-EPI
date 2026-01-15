import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Package, Edit2, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import styles from "./styles.module.css";
import EpiModal from "./components/EpiModal";
import Pagination from "../../components/Pagination";

import { listarEpis } from "../../services/epiApi";

export default function EPIs() {
  const [epis, setEpis] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEpi, setSelectedEpi] = useState(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    carregarEpis();
  }, []);

  async function carregarEpis() {
    try {
      setLoading(true);
      setError(null);
      const data = await listarEpis();
      setEpis(data);
    } catch (err) {
      console.error("Erro ao carregar EPIs:", err);
      setError("Não foi possível carregar os equipamentos. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  }

  // Filtragem
  const filteredEpis = useMemo(() => {
    return epis.filter(e =>
      (e.nome && e.nome.toLowerCase().includes(search.toLowerCase())) ||
      (e.tipo && e.tipo.toLowerCase().includes(search.toLowerCase())) ||
      (e.codigo && e.codigo.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, epis]);

  // Paginação
  const episPaginados = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEpis.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, filteredEpis]);

  const handleEdit = (epi) => {
    setSelectedEpi(epi);
    setIsModalOpen(true);
  };

  const handleSave = (updatedEpi) => {
    setEpis(prev => prev.map(e => e.codigo === updatedEpi.codigo ? updatedEpi : e));
    toast.success("Estoque sincronizado com sucesso!");
  };

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

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <Loader2 size={40} className={styles.spin} />
          <p>Sincronizando estoque com ERP...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <AlertCircle size={40} color="#ef4444" />
          <p>{error}</p>
          <button onClick={carregarEpis} className={styles.retryBtn}>Tentar Novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      
      {/* Header Controls */}
      <div className={styles.headerControls}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por nome, tipo ou código ERP..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Rich Table */}
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
            {episPaginados.length > 0 ? (
              episPaginados.map((e) => (
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
                      <button className={styles.actionBtn} onClick={() => handleEdit(e)} title="Configurar Alerta">
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
                    <p>Nenhum equipamento encontrado para "{search}"</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination 
        totalItems={filteredEpis.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        maxPagesVisible={5}
      />

      <EpiModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        epi={selectedEpi}
      />

    </div>
  );
}