import styles from "./styles.module.css";
import modalcss from "./modalcss.module.css";
import TipoEpiModal from "./TipoEpiModal.module.css";

import {FiSettings, FiBox, FiRefreshCw,FiUsers,FiEdit,FiUser,  FiEye, FiPlus} from "react-icons/fi";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Modal from "../../components/Modal";

import { empresaConfigMock } from "../../data/empresaConfigMock";
import { tiposEpiMock } from "../../data/tiposEpiMock";


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


 function TiposEpiModal({
  isOpen,
  onClose,
  tiposEpi = []
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gerenciar Tipos de EPIs"
    >
      <div className={TipoEpiModal.headerActions}>
        <h4>Tipos de EPIs</h4>
        
        <button className={TipoEpiModal.primary}>
          <FiPlus />
          Novo Tipo
        </button>
      </div>

      <div className={TipoEpiModal.list}>
        {tiposEpi.map((epi) => (
          <div key={epi.id} className={TipoEpiModal.card}>
            <div className={TipoEpiModal.cardInfo}>
              <strong>{epi.nome}</strong>
              <span>{epi.categoria}</span>
              <small>CA: {epi.ca}</small>
              <small>Validade: {epi.validadeMeses} meses</small>
            </div>

            <div className={TipoEpiModal.actions}>
              <button title="Visualizar">
                <FiEye />
              </button>
              <button title="Editar">
                <FiEdit />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={TipoEpiModal.footer}>
        <button onClick={onClose} className={TipoEpiModal.secondary}>Fechar</button>
      </div>
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
