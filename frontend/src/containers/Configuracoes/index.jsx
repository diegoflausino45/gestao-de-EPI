import styles from "./styles.module.css";
import modalcss from "./modalcss.module.css";
import TipoEpiModal from "./TipoEpiModal.module.css";

import {FiSettings, FiBox, FiRefreshCw,FiUsers,FiEdit,FiUser,  FiEye, FiPlus} from "react-icons/fi";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Modal from "../../components/Modal";

import { empresaConfigMock } from "../../data/empresaConfigMock";
import { tiposEpiMock } from "../../data/tiposEpiMock";


const API_URL = "http://localhost:3333";


const initialState = {
  nome: "",
  razaoSocial: "",
  cnpj: "",
  email: "",
  telefone: "",
  endereco: "",
  cidade: "",
  estado: "",
  responsavel: ""
};

 function EmpresaConfigModal({
  isOpen,
  onClose,
  onSave,
  empresa
}) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (empresa) {
      setForm(empresa);
    } else {
      setForm(initialState);
    }
  }, [empresa]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configurações da Empresa"
    >
      <form className={modalcss.form} onSubmit={handleSubmit}>
        
        <div className={modalcss.group}>
          <label>Nome da Empresa</label>
          <input
            name="nome"
            value={form.nome}
            readOnly 
            required
          />
        </div>

        <div className={modalcss.group}>
          <label>Razão Social</label>
          <input
            name="razaoSocial"
            value={form.razaoSocial}
            readOnly 
          />
        </div>

        <div className={modalcss.group}>
          <label>CNPJ</label>
          <input
            name="cnpj"
            value={form.cnpj}
            readOnly 
            placeholder="00.000.000/0000-00"
            required
          />
        </div>

        <div className={modalcss.group}>
          <label>E-mail</label>
          <input
            name="email"
            type="email"
            value={form.email}
            readOnly 
          />
        </div>

        <div className={modalcss.group}>
          <label>Telefone</label>
          <input
            name="telefone"
            value={form.telefone}
            readOnly 
          />
        </div>

        <div className={modalcss.group}>
          <label>Endereço</label>
          <input
            name="endereco"
            value={form.endereco}
            readOnly 
          />
        </div>

        <div className={modalcss.inline}>
          <div className={modalcss.group}>
            <label>Cidade</label>
            <input
              name="cidade"
              value={form.cidade}
              readOnly 
            />
          </div>

          <div className={modalcss.group}>
            <label>Estado</label>
            <input
              name="estado"
              value={form.estado}
              readOnly 
              />
          </div>
        </div>

        <div className={modalcss.group}>
          <label>Responsável</label>
          <input
            name="responsavel"
            value={form.responsavel}
            readOnly 
          />
        </div>

        <div className={modalcss.actions}>
          <button type="button" onClick={onClose}>
            Fechar
          </button>
        </div>
      </form>
    </Modal>
  );
}


function TiposEpiModal({ isOpen, onClose, tiposEpi = [] }) {
  const [tipos, setTipos] = useState(tiposEpi || []);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState({ nome: "", categoria: "", descricao: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (isOpen) loadTipos();
  }, [isOpen]);

  async function loadTipos() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/tipos-epi`);
      if (!res.ok) throw new Error("Erro ao carregar tipos");
      const data = await res.json();
      setTipos(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setForm({ nome: "", categoria: "", descricao: "" });
    setEditingId(null);
    setOpenForm(true);
  }

  function openEdit(tipo) {
    setForm({ nome: tipo.nome || "", categoria: tipo.categoria || "", descricao: tipo.descricao || "" });
    setEditingId(tipo.id);
    setOpenForm(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const url = editingId ? `${API_URL}/tipos-epi/${editingId}` : `${API_URL}/tipos-epi`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Erro ao salvar tipo");
      await loadTipos();
      setOpenForm(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Tem certeza que deseja excluir este tipo?")) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/tipos-epi/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir");
      await loadTipos();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gerenciar Tipos de EPIs">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h4 style={{ margin: 0 }}>Tipos de EPIs</h4>
        <button className={modalcss.primary} onClick={openNew}>
          <FiPlus />&nbsp;Novo Tipo
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 20, color: "#666" }}>Carregando...</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {tipos.map((t) => (
            <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, border: "1px solid #eee", borderRadius: 6 }}>
              <div>
                <strong>{t.nome}</strong>
                <div style={{ color: "#666", fontSize: 13 }}>{t.categoria || ""}</div>
                <div style={{ color: "#999", fontSize: 12 }}>{t.descricao || ""}</div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button title="Editar" onClick={() => openEdit(t)} className={modalcss.secondary}>
                  <FiEdit />
                </button>
                <button title="Excluir" onClick={() => handleDelete(t.id)} className={modalcss.danger}>
                  Excluir
                </button>
              </div>
            </div>
          ))}
          {tipos.length === 0 && <div style={{ color: "#999" }}>Nenhum tipo cadastrado.</div>}
        </div>
      )}

      <div style={{ marginTop: 16, textAlign: "right" }}>
        <button onClick={onClose} className={modalcss.secondary}>Fechar</button>
      </div>

      <Modal isOpen={openForm} onClose={() => setOpenForm(false)} title={editingId ? "Editar Tipo" : "Novo Tipo"}>
        <form className={modalcss.form} onSubmit={handleSave}>
          <div className={modalcss.group}>
            <label>Nome</label>
            <input name="nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
          </div>

          <div className={modalcss.group}>
            <label>Categoria</label>
            <input name="categoria" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
          </div>

          <div className={modalcss.group}>
            <label>Descrição</label>
            <textarea name="descricao" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} rows="3" />
          </div>

          <div className={modalcss.actions}>
            <button type="button" onClick={() => setOpenForm(false)}>Cancelar</button>
            <button type="submit" className={modalcss.primary}>{loading ? "Salvando..." : "Salvar"}</button>
          </div>
        </form>
      </Modal>
    </Modal>
  );
}

function Section({ title, children }) {
  return (
    <div className={styles.section}>
      <h3>{title}</h3>
      <div className={styles.sectionContent}>{children}</div>
    </div>
  );
}

function Item({ icon: Icon, title, description }) {
  return (
    <div className={styles.item}>
      <div className={styles.itemInfo}>
        <Icon size={22} />
        <div>
          <strong>{title}</strong>
          <span>{description}</span>
        </div>
      </div>
    </div>
  );
}

function Configuracoes() {
  const [openEmpresa, setOpenEmpresa] = useState(false);
  const [openTiposEpi, setOpenTiposEpi] = useState(false);

  const [empresa] = useState(empresaConfigMock);

  return (
    <div className={styles.container}>
      <Section title="Configurações">
        <div className={styles.containerItens}>
          <Item
            icon={FiSettings}
            title="Configurações da Empresa"
            description="Informações da empresa"
          />
          <button
            className={styles.editButton}
            onClick={() => setOpenEmpresa(true)}
          >
            <FiEdit />
            Visualizar
          </button>
        </div>
      </Section>

      <Section title="Gestão de EPIs">
        <div className={styles.containerItens}>
          <Item
            icon={FiBox}
            title="Tipos de EPIs"
            description="Gerenciar categorias de EPIs"
          />
          <button
            className={styles.editButton}
            onClick={() => setOpenTiposEpi(true)}
          >
            <FiEdit />
            Editar
          </button>
        </div>

        <div className={styles.containerItens}>
          <Item
            icon={FiRefreshCw}
            title="Devoluções"
            description="Realizar devolução"
          />
          <Link to="/configuracoes/devolucao" className={styles.editButton}>
            <FiEdit />
            Realizar
          </Link>
        </div>
      </Section>

      <Section title="Gestão de Funcionários">
        <div className={styles.containerItens}>
          <Item
            icon={FiUsers}
            title="Setores"
            description="Gerenciar setores da empresa"
          />
          <Link to="/configuracoes/setores" className={styles.editButton}>
            <FiEdit />
            Editar
          </Link>
        </div>
      </Section>

      <Section title="Administração do Sistema">
        <div className={styles.containerItens}>
          <Item
            icon={FiUsers}
            title="Usuários do Sistema"
            description="Gerenciar acessos ao sistema"
          />
          <Link to="/configuracoes/usuarios" className={styles.editButton}>
            <FiUser />
            Perfis de Usuário
          </Link>
        </div>
      </Section>

      {/* MODAIS */}
      <EmpresaConfigModal
        isOpen={openEmpresa}
        onClose={() => setOpenEmpresa(false)}
        empresa={empresa}
        readOnly
      />

      <TiposEpiModal
        isOpen={openTiposEpi}
        onClose={() => setOpenTiposEpi(false)}
        tiposEpi={tiposEpiMock}
      />
    </div>
  );
}

export default Configuracoes;
