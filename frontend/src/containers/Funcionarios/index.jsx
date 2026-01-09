import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import tables from "./table.module.css";
import modalcss from "./modalcss.module.css";

import SearchBar from "../../components/SearchBar";
import Modal from "../../components/Modal";

const API_URL = "http://localhost:3333";

const initialState = {
  nome: "",
  email: "",
  cargo: "",
  setorId: "",
  status: "ATIVO",
  biometria: ""
};

function FuncionarioModal({ isOpen, onClose, onSave, employee, setores }) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee) {
      setForm(employee);
    } else {
      setForm(initialState);
    }
  }, [employee, isOpen]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ 
      ...form, 
      [name]: name === "setorId" ? parseInt(value) : value 
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = employee ? `${API_URL}/funcionarios/${employee.id}` : `${API_URL}/funcionarios`;
      const method = employee ? "PUT" : "POST";
      
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
      title={employee ? "Editar Funcionário" : "Novo Funcionário"}
    >
      <form className={modalcss.form} onSubmit={handleSubmit}>
        <div className={modalcss.group}>
          <label>Nome Completo</label>
          <input
            name="nome"
            value={form.nome || ""}
            onChange={handleChange}
            required
            placeholder="Ex: João da Silva"
            disabled={loading}
          />
        </div>

        <div className={modalcss.group}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email || ""}
            onChange={handleChange}
            placeholder="Ex: joao@empresa.com"
            disabled={loading}
          />
        </div>

        <div className={modalcss.group}>
          <label>Cargo</label>
          <input
            name="cargo"
            value={form.cargo || ""}
            onChange={handleChange}
            required
            placeholder="Ex: Operador de Máquinas"
            disabled={loading}
          />
        </div>

        <div className={modalcss.group}>
          <label>Setor</label>
          <select
            name="setorId"
            value={form.setorId || ""}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Selecione um setor</option>
            {setores && setores.map(setor => (
              <option key={setor.id} value={setor.id}>
                {setor.nome}
              </option>
            ))}
          </select>
        </div>

        <div className={modalcss.group}>
          <label>Status</label>
          <select
            name="status"
            value={form.status || "ATIVO"}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
          </select>
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

function FuncionariosTable({ dados, onEdit, onDelete, loading }) {
  return (
    <div className={tables.tableWrapper}>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Cargo</th>
            <th>Setor</th>
            <th>Email</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {dados.map(f => (
            <tr key={f.id}>
              <td>{f.nome}</td>
              <td>{f.cargo}</td>
              <td>{f.setor?.nome || "N/A"}</td>
              <td>{f.email || "N/A"}</td>
              <td>{f.status}</td>
              <td className={tables.actions}>
                <button 
                  className={tables.editBtn} 
                  onClick={() => onEdit(f)}
                  disabled={loading}
                >
                  Editar
                </button>

                <button
                  onClick={() => {
                    if (window.confirm("Tem certeza que deseja excluir?")) {
                      onDelete(f.id);
                    }
                  }}
                  className={tables.deleteBtn}
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

function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [setores, setSetores] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [funcRes, setoresRes] = await Promise.all([
        fetch(`${API_URL}/funcionarios`),
        fetch(`${API_URL}/setores`)
      ]);

      setFuncionarios(await funcRes.json());
      setSetores(await setoresRes.json());
    } catch (err) {
      alert("Erro ao carregar: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const funcionariosFiltrados = funcionarios.filter(f =>
    f.nome.toLowerCase().includes(search.toLowerCase()) ||
    f.cargo.toLowerCase().includes(search.toLowerCase()) ||
    (f.setor?.nome || "").toLowerCase().includes(search.toLowerCase())
  );

  function handleAdd() {
    setSelectedFuncionario(null);
    setOpenModal(true);
  }

  function handleEdit(funcionario) {
    setSelectedFuncionario(funcionario);
    setOpenModal(true);
  }

  async function handleDelete(id) {
    try {
      await fetch(`${API_URL}/funcionarios/${id}`, { method: "DELETE" });
      loadData();
    } catch (err) {
      alert("Erro: " + err.message);
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Funcionários</h1>
        <button 
          className={styles.addBtn} 
          onClick={handleAdd}
          disabled={loading}
        >
          + Adicionar Funcionário
        </button>
      </header>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder={"Buscar funcionário por nome, cargo ou setor"}
      />

      {loading ? (
        <div className={styles.loading}>Carregando...</div>
      ) : (
        <FuncionariosTable
          dados={funcionariosFiltrados}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      )}

      {openModal && (
        <FuncionarioModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          onSave={loadData}
          employee={selectedFuncionario}
          setores={setores}
        />
      )}
    </div>
  );
}

export default Funcionarios;
