import { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Save, 
  X, 
  Calendar,
  Briefcase
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { toast } from "react-toastify";
import styles from "./styles.module.css";

function Perfil() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("dados"); // 'dados' | 'seguranca'

  // Estados de Edição
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Formulário Dados
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");

  // Formulário Senha
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  useEffect(() => {
    if (user) {
      setNome(user.nome || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const getInitials = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  const handleUpdateProfile = async () => {
    if (!nome || !email) {
      toast.warning("Nome e e-mail são obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.put('/auth/users/profile', { nome, email });
      updateUser(response.data);
      setIsEditing(false);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      const message = error.response?.data?.message || "Erro ao atualizar dados.";
      toast.error(message);
    } finally {
      setLoading(false);
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
    
    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNome(user.nome);
    setEmail(user.email);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Meu Perfil</h1>
      </header>

      <div className={styles.profileGrid}>
        
        {/* COLUNA ESQUERDA: IDENTIDADE */}
        <aside className={styles.identityCard}>
          <div className={styles.avatarWrapper}>
            {getInitials(user?.nome)}
          </div>
          
          <h2 className={styles.userName}>{user?.nome || "Usuário"}</h2>
          <span className={styles.userRole}>{user?.role === 'admin' ? 'Administrador' : 'Colaborador'}</span>

          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}><Briefcase size={14} style={{marginRight: 6}}/> Setor</span>
              <span className={styles.infoValue}>{user?.setor || "Geral"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}><Calendar size={14} style={{marginRight: 6}}/> Cadastro</span>
              <span className={styles.infoValue}>Jan/2024</span>
            </div>
          </div>
        </aside>

        {/* COLUNA DIREITA: CONFIGURAÇÕES */}
        <main className={styles.settingsCard}>
          {/* Tabs de Navegação */}
          <div className={styles.tabsHeader}>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'dados' ? styles.active : ''}`}
              onClick={() => setActiveTab('dados')}
            >
              <User size={18} /> Dados Pessoais
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'seguranca' ? styles.active : ''}`}
              onClick={() => setActiveTab('seguranca')}
            >
              <Shield size={18} /> Segurança
            </button>
          </div>

          <div className={styles.formContent}>
            
            {/* CONTEÚDO DA ABA: DADOS PESSOAIS */}
            {activeTab === 'dados' && (
              <>
                <div className={styles.sectionTitle}>Informações Básicas</div>
                <div className={styles.formGrid}>
                  
                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Nome Completo</label>
                    <div className={styles.inputWrapper}>
                      <User className={styles.inputIcon} size={18} />
                      <input 
                        type="text" 
                        className={styles.input}
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        readOnly={!isEditing}
                        placeholder="Seu nome completo"
                      />
                    </div>
                  </div>

                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Endereço de E-mail</label>
                    <div className={styles.inputWrapper}>
                      <Mail className={styles.inputIcon} size={18} />
                      <input 
                        type="email" 
                        className={styles.input}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        readOnly={!isEditing}
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                </div>

                <div className={styles.actions}>
                  {!isEditing ? (
                    <button className={styles.btnSecondary} onClick={() => setIsEditing(true)}>
                      Editar Informações
                    </button>
                  ) : (
                    <>
                      <button 
                        className={styles.btnSecondary} 
                        onClick={handleCancelEdit}
                        disabled={loading}
                      >
                        <X size={18} /> Cancelar
                      </button>
                      <button 
                        className={styles.btnPrimary} 
                        onClick={handleUpdateProfile}
                        disabled={loading}
                      >
                        <Save size={18} /> {loading ? "Salvando..." : "Salvar Alterações"}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}

            {/* CONTEÚDO DA ABA: SEGURANÇA */}
            {activeTab === 'seguranca' && (
              <>
                <div className={styles.sectionTitle}>Alterar Senha de Acesso</div>
                <div className={styles.formGrid}>
                  
                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Senha Atual</label>
                    <div className={styles.inputWrapper}>
                      <Lock className={styles.inputIcon} size={18} />
                      <input 
                        type="password" 
                        className={styles.input}
                        value={senhaAtual}
                        onChange={(e) => setSenhaAtual(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Nova Senha</label>
                    <div className={styles.inputWrapper}>
                      <Lock className={styles.inputIcon} size={18} />
                      <input 
                        type="password" 
                        className={styles.input}
                        value={novaSenha}
                        onChange={(e) => setNovaSenha(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Confirmar Nova Senha</label>
                    <div className={styles.inputWrapper}>
                      <Shield className={styles.inputIcon} size={18} />
                      <input 
                        type="password" 
                        className={styles.input}
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        placeholder="Repita a nova senha"
                      />
                    </div>
                  </div>

                </div>

                <div className={styles.actions}>
                  <button 
                    className={styles.btnPrimary} 
                    onClick={handleChangePassword}
                    disabled={loading}
                  >
                    {loading ? "Processando..." : "Atualizar Senha"}
                  </button>
                </div>
              </>
            )}

          </div>
        </main>

      </div>
    </div>
  )
}

export default Perfil;
