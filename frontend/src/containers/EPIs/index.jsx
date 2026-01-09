import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import table from "./table.module.css";
import modalcss from "./modal.module.css";

import SearchBar from "../../components/SearchBar";
import Modal from "../../components/Modal";

const API_URL = "http://localhost:3333";

const initialState = {
  nome: "",
  tipoEPIId: "",
  ca: "",
  validadeCA: "",
  estoqueAtual: 0,
  estoqueMinimo: 5,
  status: "OK"
};

function EpiModal({ isOpen, onClose, onSave, epi, tipos }) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (epi) {
      setForm(epi);
    } else {
      setForm(initialState);
    }
  }, [epi]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ 
      ...form, 
      [name]: name === "tipoEPIId" || name === "estoqueAtual" || name === "estoqueMinimo" 
        ? parseInt(value) || ""
        : value 
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = epi ? `${API_URL}/epis/${epi.id}` : `${API_URL}/epis`;
      const method = epi ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!response.ok) throw new Error("Erro ao salvar");
      
      await onSave();
      onClose();
    } catch (err) {
      alert("Erro: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={epi ? "Editar EPI" : "Novo EPI"}>
      <form className={modalcss.form} onSubmit={handleSubmit}>
        <div className={modalcss.group}>
          <label>Nome</label>
          <input
            name="nome"
            value={form.nome}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className={modalcss.group}>
          <label>Tipo</label>
          <select
            name="tipoEPIId"
            value={form.tipoEPIId || ""}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Selecione um tipo</option>
            {tipos && tipos.map(tipo => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nome}
              </option>
            ))}
          </select>
        </div>

        <div className={modalcss.group}>
          <label>CA</label>
          <input
            name="ca"
            value={form.ca || ""}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className={modalcss.group}>
          <label>Validade CA</label>
          <input
            type="date"
            name="validadeCA"
            value={form.validadeCA ? form.validadeCA.split('T')[0] : ""}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className={modalcss.group}>
          <label>Estoque Atual</label>
          <input
            type="number"
            name="estoqueAtual"
            value={form.estoqueAtual}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className={modalcss.group}>
          <label>Estoque Mínimo</label>
          <input
            type="number"
            name="estoqueMinimo"
            value={form.estoqueMinimo}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className={modalcss.group}>
          <label>Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="OK">OK</option>
            <option value="BAIXO">Estoque Baixo</option>
            <option value="CRITICO">Crítico</option>
          </select>
        </div>

        <div className={modalcss.actions}>
          <button type="button" onClick={onClose} disabled={loading}>Cancelar</button>
          <button type="submit" className={modalcss.primary} disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EpiTable({ dados, onEdit, onDelete, loading }) {
  return (
    <div className={table.tableWrapper}>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Validade</th>
            <th>Estoque</th>
            <th>Mínimo</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {dados.map(f => (
            <tr key={f.id}>
              <td>{f.nome}</td>
              <td>{f.tipoEPI?.nome || "N/A"}</td>
              <td>{f.validadeCA ? new Date(f.validadeCA).toLocaleDateString() : "N/A"}</td>
              <td>{f.estoqueAtual}</td>
              <td>{f.estoqueMinimo}</td>
              <td>{f.status}</td>
              <td className={table.actions}>
                <button className={table.editBtn} onClick={() => onEdit(f)} disabled={loading}>
                  Editar
                </button>
                <button
                  className={table.deleteBtn}
                  onClick={() => {
                    if (window.confirm("Excluir?")) {
                      onDelete(f.id);
                    }
                  }}
                  disabled={loading}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EPIs() {
  const [epis, setEpis] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedEpi, setSelectedEpi] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [epiRes, tiposRes] = await Promise.all([
        fetch(`${API_URL}/epis`),
        fetch(`${API_URL}/tipos-epi`)
      ]);

      setEpis(await epiRes.json());
      setTipos(await tiposRes.json());
    } catch (err) {
      alert("Erro ao carregar: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const epiFiltrados = epis.filter(e =>
    e.nome.toLowerCase().includes(search.toLowerCase())
  );

  function handleAdd() {
    setSelectedEpi(null);
    setOpenModal(true);
  }

  function handleEdit(epi) {
    setSelectedEpi(epi);
    setOpenModal(true);
  }

  async function handleDelete(id) {
    try {
      await fetch(`${API_URL}/epis/${id}`, { method: "DELETE" });
      loadData();
    } catch (err) {
      alert("Erro: " + err.message);
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>EPIs</h1>
        <button className={styles.addBtn} onClick={handleAdd} disabled={loading}>
          + Adicionar EPI
        </button>
      </header>

      <SearchBar value={search} onChange={setSearch} placeholder="Buscar EPI..." />

      {loading ? (
        <div className={styles.loading}>Carregando...</div>
      ) : (
        <EpiTable dados={epiFiltrados} onEdit={handleEdit} onDelete={handleDelete} loading={loading} />
      )}

      <EpiModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onSave={loadData}
        epi={selectedEpi}
        tipos={tipos}
      />
    </div>
  );
}

export default EPIs;
