import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import modalcss from "./modalcss.module.css";
import table from "./table.module.css";

import SearchBar from "../../components/SearchBar";
import Modal from "../../components/Modal";

const API_URL = "http://localhost:3333";

const initialState = {
  funcionarioId: "",
  epiId: "",
  quantidade: 1,
  observacoes: ""
};

function EntregasModal({ isOpen, onClose, onSave, entrega, funcionarios, epis }) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (entrega) {
      setForm(entrega);
    } else {
      setForm(initialState);
    }
  }, [entrega, isOpen]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "funcionarioId" || name === "epiId" || name === "quantidade"
        ? parseInt(value)
        : value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = entrega ? `${API_URL}/entregas/${entrega.id}` : `${API_URL}/entregas`;
      const method = entrega ? "PUT" : "POST";
      
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={entrega ? "Editar Entrega" : "Nova Entrega"}
    >
      <form className={modalcss.form} onSubmit={handleSubmit}>
        <div className={modalcss.group}>
          <label>Funcionário</label>
          <select
            name="funcionarioId"
            value={form.funcionarioId || ""}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Selecione um funcionário</option>
            {funcionarios && funcionarios.map(f => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
        </div>

        <div className={modalcss.group}>
          <label>EPI</label>
          <select
            name="epiId"
            value={form.epiId || ""}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Selecione um EPI</option>
            {epis && epis.map(e => (
              <option key={e.id} value={e.id}>
                {e.nome} (Est. {e.estoqueAtual})
              </option>
            ))}
          </select>
        </div>

        <div className={modalcss.group}>
          <label>Quantidade</label>
          <input
            type="number"
            name="quantidade"
            value={form.quantidade}
            onChange={handleChange}
            min="1"
            required
            disabled={loading}
          />
        </div>

        <div className={modalcss.group}>
          <label>Observações</label>
          <textarea
            name="observacoes"
            value={form.observacoes || ""}
            onChange={handleChange}
            rows="4"
            disabled={loading}
          />
        </div>

        <div className={modalcss.actions}>
          <button type="button" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className={modalcss.primary} disabled={loading}>
            {loading ? "Salvando..." : "Confirmar Entrega"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EntregasTable({ dados, onEdit, onDelete, loading }) {
  if (dados.length === 0) {
    return (
      <div className={table.tableWrapper}>
        <p className={table.emptyMessage}>Nenhuma entrega encontrada.</p>
      </div>
    );
  }

  return (
    <div className={table.tableWrapper}>
      <table>
        <thead>
          <tr>
            <th>Funcionário</th>
            <th>EPI</th>
            <th>Quantidade</th>
            <th>Data</th>
            <th>Observações</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {dados.map((entrega) => (
            <tr key={entrega.id}>
              <td>{entrega.funcionario?.nome || "N/A"}</td>
              <td>{entrega.epi?.nome || "N/A"}</td>
              <td>{entrega.quantidade}</td>
              <td>{new Date(entrega.dataEntrega).toLocaleDateString()}</td>
              <td>{entrega.observacoes || "---"}</td>
              <td className={table.actions}>
                <button
                  className={table.editBtn}
                  onClick={() => onEdit(entrega)}
                  disabled={loading}
                >
                  Editar
                </button>

                <button
                  className={table.deleteBtn}
                  onClick={() => {
                    if (window.confirm("Tem certeza que deseja excluir?")) {
                      onDelete(entrega.id);
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

function Entregas() {
  const [entregas, setEntregas] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [epis, setEpis] = useState([]);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedEntrega, setSelectedEntrega] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [entregasRes, funcRes, epiRes] = await Promise.all([
        fetch(`${API_URL}/entregas`),
        fetch(`${API_URL}/funcionarios`),
        fetch(`${API_URL}/epis`)
      ]);

      setEntregas(await entregasRes.json());
      setFuncionarios(await funcRes.json());
      setEpis(await epiRes.json());
    } catch (err) {
      alert("Erro ao carregar: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const entregasFiltradas = entregas.filter(e =>
    (e.funcionario?.nome || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.epi?.nome || "").toLowerCase().includes(search.toLowerCase())
  );

  function handleAdd() {
    setSelectedEntrega(null);
    setOpenModal(true);
  }

  function handleEdit(entrega) {
    setSelectedEntrega(entrega);
    setOpenModal(true);
  }

  async function handleDelete(id) {
    try {
      await fetch(`${API_URL}/entregas/${id}`, { method: "DELETE" });
      loadData();
    } catch (err) {
      alert("Erro: " + err.message);
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Entregas</h1>
        <button className={styles.addBtn} onClick={handleAdd} disabled={loading}>
          + Nova Entrega
        </button>
      </header>

      <SearchBar value={search} onChange={setSearch} placeholder={"Buscar entrega..."} />

      {loading ? (
        <div className={styles.loading}>Carregando...</div>
      ) : (
        <EntregasTable
          dados={entregasFiltradas}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      )}

      <EntregasModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onSave={loadData}
        entrega={selectedEntrega}
        funcionarios={funcionarios}
        epis={epis}
      />
    </div>
  );
}

export { EntregasTable, EntregasModal };
export default Entregas;
