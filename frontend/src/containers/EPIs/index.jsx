import { useState, useEffect, useMemo, useCallback } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import styles from "./styles.module.css";

// Components
import EpiHeader from "./components/EpiHeader";
import EpiTable from "./components/EpiTable";
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

  // Filtragem (Memoized)
  const filteredEpis = useMemo(() => {
    return epis.filter(e =>
      (e.nome && e.nome.toLowerCase().includes(search.toLowerCase())) ||
      (e.tipo && e.tipo.toLowerCase().includes(search.toLowerCase())) ||
      (e.codigo && e.codigo.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, epis]);

  // Paginação (Memoized)
  const episPaginados = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEpis.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, filteredEpis]);

  // Handlers (Callbacks)
  const handleSearchChange = useCallback((value) => {
    setSearch(value);
    setCurrentPage(1);
  }, []);

  const handleEdit = useCallback((epi) => {
    setSelectedEpi(epi);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleSave = useCallback((updatedEpi) => {
    setEpis(prev => prev.map(e => e.codigo === updatedEpi.codigo ? updatedEpi : e));
    toast.success("Estoque sincronizado com sucesso!");
    setIsModalOpen(false); // Close modal automatically on success
  }, []);

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
      
      <EpiHeader 
        search={search} 
        onSearchChange={handleSearchChange} 
      />

      <EpiTable 
        epis={episPaginados} 
        onEdit={handleEdit} 
      />

      <Pagination 
        totalItems={filteredEpis.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        maxPagesVisible={5}
      />

      <EpiModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        epi={selectedEpi}
      />

    </div>
  );
}
