import styles from "./styles.module.css";
import dadosPessoais from "./dadosPessoais.module.css";
import { FiUser, FiLock, FiShield } from "react-icons/fi";

function DadosPessoais() {
  return (
    <div className={dadosPessoais.container}>
      {/* Dados Pessoais */}
      <section className={dadosPessoais.card}>
        <h2><FiUser /> Dados Pessoais</h2>

        <div className={dadosPessoais.profileRow}>
          <div className={dadosPessoais.avatar}>
          </div>

          <div className={dadosPessoais.fields}>
            <div className={dadosPessoais.field}>
              <label>Nome</label>
              <input type="text" value="Diego Flausino" readOnly />
            </div>

            <div className={dadosPessoais.field}>
              <label>E-mail</label>
              <input type="email" value="diego@email.com" readOnly />
            </div>
          </div>
        </div>
        <div className={dadosPessoais.buttons}>

          <button className={dadosPessoais.primaryButton}>
            Atualizar Dados
          </button>
        </div>

      </section>

      {/* Atualizar Senha */}
      <section className={dadosPessoais.card}>
        <h2><FiLock /> Atualizar Senha</h2>

        <div className={dadosPessoais.grid}>
          <div className={dadosPessoais.field}>
            <label>Senha Atual</label>
            <input type="password" />
          </div>

          <div className={dadosPessoais.field}>
            <label>Nova Senha</label>
            <input type="password" />
          </div>

          <div className={dadosPessoais.field}>
            <label>Confirmar Nova Senha</label>
            <input type="password" />
          </div>
        </div>
        <div className={dadosPessoais.buttons}>
          <button className={dadosPessoais.primaryButton}>
            Alterar Senha
          </button>
        </div>
      </section>

      {/* Autenticação */}
      <section className={dadosPessoais.card}>
        <h2><FiShield /> Autenticação</h2>

        <div className={dadosPessoais.containerCheckBox}>

          <div className={dadosPessoais.checkbox}>
            <input type="checkbox" id="2fa" />
            <label htmlFor="2fa">
              Habilitar autenticação de duas etapas
            </label>
          </div>

          <div className={dadosPessoais.checkbox}>
            <input type="checkbox" id="mobileAuth" />
            <label htmlFor="mobileAuth">
              Permitir autenticação em aplicativos móveis
            </label>
          </div>
        </div>

      </section>
    </div>
  );
}

function Perfil() {
  return (
    <div className={styles.container}>
      <h1>Perfil</h1>

      <DadosPessoais />

    </div>
  )
}

export default Perfil;