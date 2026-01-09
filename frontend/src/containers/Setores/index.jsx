import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import table from "./table.module.css";
import modalcss from "./modalcss.module.css";

import SearchBar from "../../components/SearchBar";
import Modal from "../../components/Modal";

const API_URL = "http://localhost:3333";

const initialState = {
  nome: "",
  descricao: ""
};

function SetorModal({ isOpen, onClose, onSave, setor }) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (setor) {
      setForm(setor);
    } else {
      setForm(initialState);
    }
  }, [setor, isOpen]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = setor ? `${API_URL}/setores/${setor.id}` : `${API_URL}/setores`;
      const method = setor ? "PUT" : "POST";
      
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
    <Modal isOpen={isOpen} onClose={onClose} title={setor ? "Editar Setor" : "Novo Setor"}>
      <form className={modalcss.form} onSubmit={handleSubmit}>
        <div className={modalcss.group}>
          <label>Nome</label>
          <input
            name="nome"
            value={form.nome}
            onChange={handleChange}
            required
            placeholder="Ex: Produção"
            disabled={loading}
          />
        </div>

        <div className={modalcss.group}>
          <label>Descrição</label>
          <textarea
            name="descricao"
            value={form.descricao || ""}
            onChange={handleChange}
            rows="3"
            placeholder="Descreva o setor..."
            disabled={loading}
          />
        </div>

        <div className={modalcss.actions}>
          <button type="button" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className={modalcss.primary} disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function SetoresTable({ dados, onEdit, onDelete, loading }) {
  return (
    <div className={table.tableWrapper}>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {dados.map(setor => (
            <tr key={setor.id}>
              <td>{setor.nome}</td>
              <td>{setor.descricao || "---"}</td>
              <td className={table.actions}>
                <button className={table.editBtn} onClick={() => onEdit(setor)} disabled={loading}>
                  Editar
                </button>

                <button
                  className={table.deleteBtn}
                  onClick={() => {
                    if (window.confirm("Tem certeza que deseja excluir?")) {
                      onDelete(setor.id);
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

function Setores() {
  const [setores, setSetores] = useState([]);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedSetor, setSelectedSetor] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/setores`);
      setSetores(await response.json());
    } catch (err) {
      alert("Erro ao carregar: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const setoresFiltrados = setores.filter(s =>
    s.nome.toLowerCase().includes(search.toLowerCase())
  );

  function handleAdd() {
    setSelectedSetor(null);
    setOpenModal(true);
  }

  function handleEdit(setor) {
    setSelectedSetor(setor);
    setOpenModal(true);
  }

  async function handleDelete(id) {
    try {
      await fetch(`${API_URL}/setores/${id}`, { method: "DELETE" });
      loadData();
    } catch (err) {
      alert("Erro: " + err.message);
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Setores</h1>
        <button className={styles.addBtn} onClick={handleAdd} disabled={loading}>
          + Adicionar Setor
        </button>
      </header>

      <SearchBar value={search} onChange={setSearch} placeholder="Buscar setor..." />

      {loading ? (
        <div className={styles.loading}>Carregando...</div>
      ) : (
        <SetoresTable
          dados={setoresFiltrados}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      )}

      <SetorModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onSave={loadData}
        setor={selectedSetor}
      />
    </div>
  );
}

export default Setores;
