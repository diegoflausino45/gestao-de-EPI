import styles from "./styles.module.css";
import { useState, useEffect } from "react";
import { listarEpis } from "../../services/epiApi";

import SearchBar from "../../components/Pages/EpiPage/SearchBar";
import EpiTable from "../../components/Pages/EpiPage/EpiTable";
import EpiModal from "../../components/Pages/EpiPage/EpiModal";

export default function EPIs() {
  const [search, setSearch] = useState("");
  const [epi, setEpi] = useState([]);
  const [epiFiltrados, setEpiFiltrados] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedEpi, setSelectedEpi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carrega EPIs do banco e seus saldos do ERP
  useEffect(() => {
    carregarEpis();
  }, []);

  // Filtra EPIs conforme o usuário digita
  useEffect(() => {
    const filtrados = epi.filter(
      (e) =>
        (e.nome && e.nome.toLowerCase().includes(search.toLowerCase())) ||
        (e.tipo && e.tipo.toLowerCase().includes(search.toLowerCase())) ||
        (e.codigo && e.codigo.toLowerCase().includes(search.toLowerCase())) ||
        (e.descricao && e.descricao.toLowerCase().includes(search.toLowerCase()))
    );
    setEpiFiltrados(filtrados);
  }, [search, epi]);

  async function carregarEpis() {
    try {
      setLoading(true);
      setError(null);

      // Carrega EPIs com saldos já combinados do backend
      // Backend retorna: { codigo, nome, tipo, estoqueAtual, status, ... }
      const epis = await listarEpis();
      
      // Dados já vêm do backend com saldos + status calculados
      setEpi(epis);
    } catch (err) {
      console.error("Erro ao carregar EPIs:", err);
      setError(
        err.message || "Erro ao carregar EPIs. Verifique a conexão com o backend."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleAdd() {
    setSelectedEpi(null);
    setOpenModal(true);
  }

  function handleEdit(epi) {
    setSelectedEpi(epi);
    setOpenModal(true);
  }

  function handleSave(data) {
    if (selectedEpi) {
      // editar
      setEpi((prev) =>
        prev.map((f) => (f.id === selectedEpi.id ? { ...data, id: f.id } : f))
      );
    } else {
      // adicionar
      setEpi((prev) => [...prev, { ...data, id: Date.now(), status: "OK" }]);
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingMessage}>Carregando EPIs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          {error}
          <button onClick={carregarEpis} className={styles.retryBtn}>
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>EPIs</h1>
        <button className={styles.addBtn} onClick={handleAdd}>
          + Adicionar EPI
        </button>
      </header>

      <SearchBar value={search} onChange={setSearch} />

      <EpiTable dados={epiFiltrados} onEdit={handleEdit} />

      <EpiModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onSave={handleSave}
        epi={selectedEpi}
      />
    </div>
  );
}
