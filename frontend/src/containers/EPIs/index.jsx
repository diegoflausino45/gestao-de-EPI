import styles from "./styles.module.css";
import modal from "./modal.module.css";
import table from "./table.module.css";
import { useState, useEffect, useMemo } from "react";
import { listarEpis, atualizarEstoqueMinimo } from "../../services/epiApi";

import SearchBar from "../../components/SearchBar";
import Modal from "../../components/Modal"
import Pagination from "../../components/Pagination";

const initialState = {
  nome: "",
  categoria: "",
  ca: "",
  validadeCA: "",
  estoqueAtual: 0,
  estoqueMinimo: 0,
  status: "OK"
};

 function EpiModal({ isOpen, onClose, onSave, epi }) {
  const [form, setForm] = useState(initialState);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (epi) {
      // Garantir que tenhamos as chaves esperadas
      setForm({ ...initialState, ...epi });
    } else {
      setForm(initialState);
    }
  }, [epi]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      setSaving(true);

      // Normalizar valor numérico
      const novoPP = parseFloat(String(form.estoqueMinimo || "0"));
      if (!isFinite(novoPP) || novoPP < 0) {
        setError("Valor inválido para Estoque Mínimo");
        setSaving(false);
        return;
      }

      // Chama a API para atualizar no NEXTSI e usa o retorno para atualizar status/estoque
      const resp = await atualizarEstoqueMinimo(form.codigo, novoPP);

      // Notifica o pai para atualizar a lista (onSave espera o objeto atualizado)
      if (typeof onSave === "function") {
        const updated = {
          ...form,
          estoqueMinimo: novoPP,
          estoqueAtual: resp.estoqueAtual ?? form.estoqueAtual,
          status: resp.status ?? form.status,
        };
        onSave(updated);
      }

      onClose();
    } catch (err) {
      console.error(err);
      setError(err?.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={epi ? "Editar EPI" : "Novo EPI"}
    >
      <form className={modal.form} onSubmit={handleSubmit}>
        <div className={modal.group}>
          <label>Codigo</label>
          <input
            name="codigo"
            value={form.codigo}
            onChange={handleChange}
            readOnly
          />
        </div>
        <div className={modal.group}>
          <label>Nome</label>
          <input
            name="nome"
            value={form.nome}
            onChange={handleChange}
            readOnly
          />
        </div>

        <div className={modal.group}>
          <label>Tipo</label>
          <input
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            readOnly
          />
        </div>

        <div className={modal.group}>
          <label>Validade</label>
          <input
            name="validadeCA"
            value={form.validadeCA}
            onChange={handleChange}
          />
        </div>

        <div className={modal.group}>
          <label>Estoque Atual</label>
          <input
            name="estoqueAtual"
            value={form.estoqueAtual}
            onChange={handleChange}
            readOnly
          />
        </div>

        <div className={modal.group}>
          <label>Estoque Minímo</label>
          <input
            name="estoqueMinimo"
            value={form.estoqueMinimo}
            onChange={handleChange}
          />
        </div>

        {error && <div className={modal.formError}>{error}</div>}

        <div className={modal.actions}>
          <button type="button" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className={modal.primary} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}



function EpiTable({dados, onEdit}) {

  return (
    <div className={table.tableWrapper}>
      <table>
        <thead>
          <tr className={table.headerRow}>
            <th>Código</th>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Validade CA</th>
            <th>Estoque Atual</th>
            <th>Estoque Mínimo</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {dados && dados.length > 0 ? (
            dados.map(f => (
              <tr key={f.id} >
                <td>{f.codigo || '-'}</td>
                <td>{f.nome || '-'}</td>
                <td>{f.tipo || '-'}</td>
                <td>{f.validadeCA ? new Date(f.validadeCA).toLocaleDateString('pt-BR') : '-'}</td>
                <td className={table.estoque}>{f.estoqueAtual ?? 0}</td>
                <td>{f.estoqueMinimo ?? 0}</td>
                <td>
                  <span className={`${table.status} ${table[f.status?.toLowerCase().replace(/\s/g, '-') || 'ok']}`}>
                    {f.status || 'OK'}
                  </span>
                </td>
                <td className={table.actions}>
                  <button className={table.editBtn} onClick={() => onEdit(f)}>
                    Editar
                  </button>

                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" style={{textAlign: 'center', padding: '20px'}}>
                Nenhum EPI encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function EPIs() {
  const [search, setSearch] = useState("");
  const [epi, setEpi] = useState([]);
  const [epiFiltrados, setEpiFiltrados] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedEpi, setSelectedEpi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
        (e.descricao &&
          e.descricao.toLowerCase().includes(search.toLowerCase()))
    );
    setEpiFiltrados(filtrados);
    setCurrentPage(1);
  }, [search, epi]);

  // Calcula os dados da página atual
  const episPaginados = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return epiFiltrados.slice(startIndex, endIndex);
  }, [currentPage, epiFiltrados, itemsPerPage]);

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
        err.message ||
          "Erro ao carregar EPIs. Verifique a conexão com o backend."
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

      <SearchBar value={search} onChange={setSearch} placeholder={"Buscar EPI..."}/>

      <EpiTable dados={episPaginados} onEdit={handleEdit} />

      <Pagination 
        totalItems={epiFiltrados.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        maxPagesVisible={5}
      />

      <EpiModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onSave={handleSave}
        epi={selectedEpi}
      />
    </div>
  );
}
