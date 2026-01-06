import styles from "./styles.module.css";
import { useState } from "react";

import EmpresaConfigModal from "../../components/Pages/ConfiguracoesPage/ConfigEmpresaModal";
import TiposEpiModal from "../../components/Pages/ConfiguracoesPage/TipoEpiModal";

import { empresaConfigMock } from "../../data/empresaConfigMock";
import { tiposEpiMock } from "../../data/tiposEpiMock";

import {
  FiSettings,
  FiBell,
  FiBox,
  FiRefreshCw,
  FiUsers,
  FiBriefcase,
  FiEdit,
  FiUser
} from "react-icons/fi";

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

        <div className={styles.containerItens}>
          <Item
            icon={FiBell}
            title="Preferências de Notificação"
            description="Gerenciar notificações e alertas"
          />
          <button className={styles.editButton}>
            <FiEdit />
            Definir
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
          <button className={styles.editButton}>
            <FiEdit />
            Realizar
          </button>
        </div>
      </Section>

      <Section title="Gestão de Funcionários">
        <div className={styles.containerItens}>
          <Item
            icon={FiUsers}
            title="Setores"
            description="Gerenciar setores da empresa"
          />
          <button className={styles.editButton}>
            <FiEdit />
            Editar
          </button>
        </div>

        <div className={styles.containerItens}>
          <Item
            icon={FiBriefcase}
            title="Cargos"
            description="Definir cargos dos funcionários"
          />
          <button className={styles.editButton}>
            <FiEdit />
            Editar
          </button>
        </div>
      </Section>

      <Section title="Administração do Sistema">
        <div className={styles.containerItens}>
          <Item
            icon={FiUsers}
            title="Usuários do Sistema"
            description="Gerenciar acessos ao sistema"
          />
          <button className={styles.editButton}>
            <FiUser />
            Perfis de Usuário
          </button>
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
