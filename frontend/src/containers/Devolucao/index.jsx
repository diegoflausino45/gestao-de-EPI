import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Modal from "../../components/Modal"

import styles from "./styles.module.css";
import devolucao from "./devolucao.module.css";
import modalcss from "../EPIs/modal.module.css";

const API_URL = "http://localhost:3333";

const initialState = {
  funcionarioId: "",
  epiId: "",
  quantidade: 1,
  motivo: "DESGASTE",
  condicao: "BOM",
  dataDevolucao: new Date().toISOString().slice(0, 10),
  observacoes: ""
};

function DevolucaoModal({ isOpen, onClose, onSave, devolucaoItem, funcionarios, epis }) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (devolucaoItem) setForm({ ...devolucaoItem });
    else setForm(initialState);
  }, [devolucaoItem, isOpen]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "quantidade" ? parseInt(value || 0) : value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = devolucaoItem ? `${API_URL}/devolucoes/${devolucaoItem.id}` : `${API_URL}/devolucoes`;
      const method = devolucaoItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Erro ao salvar devolução");
      await onSave();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Modal isOpen={isOpen} onClose={onClose} title={devolucaoItem ? "Editar Devolução" : "Nova Devolução"}>
        <form className={modalcss.form} onSubmit={handleSubmit}>
          <div className={modalcss.group}>
            <label>Funcionário</label>
            <select name="funcionarioId" value={form.funcionarioId || ""} onChange={handleChange} required disabled={loading}>
              <option value="">Selecione um funcionário</option>
              {funcionarios.map(f => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
          </div>

          <div className={modalcss.group}>
            <label>EPI</label>
            <select name="epiId" value={form.epiId || ""} onChange={handleChange} required disabled={loading}>
              <option value="">Selecione um EPI</option>
              {epis.map(e => (
                <option key={e.id} value={e.id}>{e.nome} (Est. {e.estoqueAtual})</option>
              ))}
            </select>
          </div>

          <div className={modalcss.group}>
            <label>Quantidade</label>
            <input type="number" name="quantidade" min="1" value={form.quantidade} onChange={handleChange} required disabled={loading} />
          </div>

          <div className={modalcss.group}>
            <label>Motivo</label>
            <select name="motivo" value={form.motivo} onChange={handleChange} disabled={loading}>
              <option value="DESGASTE">Desgaste</option>
              <option value="DEFEITO">Defeito</option>
              <option value="PERDA">Perda</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>

          <div className={modalcss.group}>
            <label>Condição</label>
            <select name="condicao" value={form.condicao} onChange={handleChange} disabled={loading}>
              <option value="BOM">Bom</option>
              <option value="REGULAR">Regular</option>
              <option value="RUIM">Ruim</option>
              <option value="DANIFICADO">Danificado</option>
            </select>
          </div>

          <div className={modalcss.group}>
            <label>Data da Devolução</label>
            <input type="date" name="dataDevolucao" value={form.dataDevolucao} onChange={handleChange} required disabled={loading} />
          </div>

          <div className={modalcss.group}>
            <label>Observações</label>
            <textarea name="observacoes" value={form.observacoes || ""} onChange={handleChange} rows="3" disabled={loading} />
          </div>

          <div className={modalcss.actions}>
            <button type="button" onClick={onClose} disabled={loading}>Cancelar</button>
            <button type="submit" className={modalcss.primary} disabled={loading}>{loading ? "Salvando..." : "Confirmar Devolução"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function DevolucoesTable({ dados, onEdit, onDelete, loading }) {
  if (!dados || dados.length === 0) {
    return <div className={devolucao.empty}>Nenhuma devolução encontrada.</div>;
  }

  return (
    <div className={devolucao.tableWrapper}>
      <table>
        <thead>
          <tr>
            <th>Funcionário</th>
            <th>EPI</th>
            <th>Quantidade</th>
            <th>Motivo</th>
            <th>Condição</th>
            <th>Data</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {dados.map(d => (
            <tr key={d.id}>
              <td>{d.funcionario?.nome || "N/A"}</td>
              <td>{d.epi?.nome || "N/A"}</td>
              <td>{d.quantidade}</td>
              <td>{d.motivo}</td>
              <td>{d.condicao}</td>
              <td>{new Date(d.dataDevolucao).toLocaleDateString()}</td>
              <td className={devolucao.actions}>
                <button className={devolucao.edit} onClick={() => onEdit(d)} disabled={loading}>Editar</button>
                <button className={devolucao.delete} onClick={() => { if (window.confirm("Deseja excluir?")) onDelete(d.id); }} disabled={loading}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Devolucao() {
  const [devolucoes, setDevolucoes] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [epis, setEpis] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [devolRes, funcRes, epiRes] = await Promise.all([
        fetch(`${API_URL}/devolucoes`),
        fetch(`${API_URL}/funcionarios`),
        fetch(`${API_URL}/epis`)
      ]);
      setDevolucoes(await devolRes.json());
      setFuncionarios(await funcRes.json());
      setEpis(await epiRes.json());
    } catch (err) {
      alert("Erro ao carregar: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleAdd() { setSelected(null); setOpenModal(true); }
  function handleEdit(item) { setSelected(item); setOpenModal(true); }

  async function handleDelete(id) {
    try {
      await fetch(`${API_URL}/devolucoes/${id}`, { method: "DELETE" });
      loadData();
    } catch (err) {
      alert("Erro: " + err.message);
    }
  }

  const filtered = devolucoes.filter(d =>
    (d.funcionario?.nome || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.epi?.nome || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Devoluções</h1>
        <button className={styles.addBtn} onClick={handleAdd} disabled={loading}>+ Nova Devolução</button>
      </header>

      <div style={{ marginBottom: 12 }}>
        <input placeholder="Buscar devolução..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? <div className={styles.loading}>Carregando...</div> : (
        <DevolucoesTable dados={filtered} onEdit={handleEdit} onDelete={handleDelete} loading={loading} />
      )}

      <DevolucaoModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onSave={loadData}
        devolucaoItem={selected}
        funcionarios={funcionarios}
        epis={epis}
      />
    </div>
  );
}

export default Devolucao;
