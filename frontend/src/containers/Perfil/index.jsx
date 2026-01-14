import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import dadosPessoais from "./dadosPessoais.module.css";
import { FiUser, FiLock, FiCheck, FiX } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { toast } from "react-toastify";

function DadosPessoais() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  
  // Senhas
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  useEffect(() => {
    if (user) {
      setNome(user.nome);
      setEmail(user.email);
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!nome || !email) {
      toast.warning("Nome e e-mail são obrigatórios.");
      return;
    }

    setLoadingProfile(true);
    try {
      const response = await api.put('/auth/users/profile', { nome, email });
      updateUser(response.data);
      setIsEditing(false);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      const message = error.response?.data?.message || "Erro ao atualizar dados.";
      toast.error(message);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      toast.warning("Preencha todos os campos de senha.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      toast.error("A nova senha e a confirmação não coincidem.");
      return;
    }

    if (novaSenha.length < 6) {
      toast.info("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    
    setLoadingPassword(true);
    try {
      await api.patch('/auth/users/password', { senhaAtual, novaSenha });
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      toast.success("Senha alterada com sucesso!");
    } catch (error) {
      const message = error.response?.data?.message || "Erro ao alterar senha. Verifique a senha atual.";
      toast.error(message);
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className={dadosPessoais.container}>
      {/* Dados Pessoais */}
      <section className={dadosPessoais.card}>
        <h2><FiUser /> Dados Pessoais</h2>

        <div className={dadosPessoais.profileRow}>
          <div className={dadosPessoais.avatar}>
            {!user?.avatar && <span className={dadosPessoais.initials}>{user?.nome?.charAt(0).toUpperCase()}</span>}
          </div>

          <div className={dadosPessoais.fields}>
            <div className={dadosPessoais.field}>
              <label>Nome</label>
              <input 
                type="text" 
                value={nome} 
                onChange={(e) => setNome(e.target.value)}
                readOnly={!isEditing} 
                placeholder="Seu nome completo"
              />
            </div>

            <div className={dadosPessoais.field}>
              <label>E-mail</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                readOnly={!isEditing} 
                placeholder="seu@email.com"
              />
            </div>
          </div>
        </div>
        <div className={dadosPessoais.buttons}>
          {isEditing ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className={dadosPessoais.cancelButton} 
                onClick={() => {
                  setIsEditing(false);
                  setNome(user.nome);
                  setEmail(user.email);
                }}
                disabled={loadingProfile}
              >
                <FiX /> Cancelar
              </button>
              <button 
                className={dadosPessoais.primaryButton} 
                onClick={handleUpdateProfile}
                disabled={loadingProfile}
              >
                {loadingProfile ? "Salvando..." : <><FiCheck /> Salvar Alterações</>}
              </button>
            </div>
          ) : (
            <button className={dadosPessoais.primaryButton} onClick={() => setIsEditing(true)}>
              Atualizar Dados
            </button>
          )}
        </div>
      </section>

      {/* Atualizar Senha */}
      <section className={dadosPessoais.card}>
        <h2><FiLock /> Atualizar Senha</h2>

        <div className={dadosPessoais.grid}>
          <div className={dadosPessoais.field}>
            <label>Senha Atual</label>
            <input 
              type="password" 
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className={dadosPessoais.field}>
            <label>Nova Senha</label>
            <input 
              type="password" 
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className={dadosPessoais.field}>
            <label>Confirmar Nova Senha</label>
            <input 
              type="password" 
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Repita a nova senha"
            />
          </div>
        </div>
        <div className={dadosPessoais.buttons}>
          <button 
            className={dadosPessoais.primaryButton} 
            onClick={handleChangePassword}
            disabled={loadingPassword}
          >
            {loadingPassword ? "Alterando..." : "Alterar Senha"}
          </button>
        </div>
      </section>
    </div>
  );
}

function Perfil() {
  return (
    <div className={styles.container}>
      <h1>Meu Perfil</h1>
      <DadosPessoais />
    </div>
  )
}

export default Perfil;