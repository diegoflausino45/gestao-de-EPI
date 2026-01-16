import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Building2, 
  Package, 
  Users, 
  ShieldCheck, 
  ArrowRight 
} from "lucide-react";
import styles from "./styles.module.css";

import EmpresaModal from "./components/EmpresaModal";
import TiposEpiModal from "./components/TiposEpiModal";

export default function Configuracoes() {
  const [openEmpresa, setOpenEmpresa] = useState(false);
  const [openTiposEpi, setOpenTiposEpi] = useState(false);

  return (
    <div className={styles.container}>
      
      {/* O Breadcrumb já cuida do título da página na rota, 
          mas podemos colocar um subtítulo explicativo aqui se desejado */}
      
      <div className={styles.grid}>
        
        {/* Card 1: Empresa */}
        <div className={styles.card}>
          <div className={styles.cardContent}>
            <div className={`${styles.cardIconWrapper} ${styles.iconBlue}`}>
              <Building2 size={24} />
            </div>
            <h3>Dados da Empresa</h3>
            <p>Gerencie as informações cadastrais, CNPJ, endereço e contatos da organização.</p>
          </div>
          <div className={styles.cardFooter}>
            <button 
              className={styles.actionButton}
              onClick={() => setOpenEmpresa(true)}
            >
              Gerenciar <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Card 2: Tipos de EPI */}
        <div className={styles.card}>
          <div className={styles.cardContent}>
            <div className={`${styles.cardIconWrapper} ${styles.iconOrange}`}>
              <Package size={24} />
            </div>
            <h3>Catálogo de EPIs</h3>
            <p>Defina categorias, validade padrão (CA) e regras para os equipamentos.</p>
          </div>
          <div className={styles.cardFooter}>
            <button 
              className={styles.actionButton}
              onClick={() => setOpenTiposEpi(true)}
            >
              Configurar <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Card 4: Funcionários e Setores */}
        <div className={styles.card}>
          <div className={styles.cardContent}>
            <div className={`${styles.cardIconWrapper} ${styles.iconGreen}`}>
              <Users size={24} />
            </div>
            <h3>Estrutura Organizacional</h3>
            <p>Gerencie setores, departamentos e hierarquia dos colaboradores.</p>
          </div>
          <div className={styles.cardFooter}>
            <Link to="/configuracoes/setores" className={styles.actionButton}>
              Acessar <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Card 4: Controle de Acesso */}
        <div className={styles.card}>
          <div className={styles.cardContent}>
            <div className={`${styles.cardIconWrapper} ${styles.iconPurple}`}>
              <ShieldCheck size={24} />
            </div>
            <h3>Usuários do Sistema</h3>
            <p>Controle quem tem acesso ao sistema, perfis e permissões de administrador.</p>
          </div>
          <div className={styles.cardFooter}>
            <Link to="/configuracoes/usuarios" className={styles.actionButton}>
              Gerenciar <ArrowRight size={16} />
            </Link>
          </div>
        </div>

      </div>

      {/* Modais */}
      <EmpresaModal 
        isOpen={openEmpresa} 
        onClose={() => setOpenEmpresa(false)} 
      />

      <TiposEpiModal 
        isOpen={openTiposEpi} 
        onClose={() => setOpenTiposEpi(false)} 
      />

    </div>
  );
}