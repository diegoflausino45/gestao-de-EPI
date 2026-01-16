import { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Save, 
  Briefcase,
  Calendar,
  Hash,
  CheckCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { toast } from "react-toastify";
import styles from "./styles.module.css";

function Perfil() {
  const { user, updateUser } = useAuth();
  
  // Estados de Formulário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  
  // Estados de Senha
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [loading, setLoading] = useState(false);

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

  // Lógica simples de força da senha
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "", class: "" };
    if (pass.length < 6) return { score: 1, label: "Fraca", class: styles.weak, textClass: styles.textWeak };
    if (pass.length < 8 || !/\d/.test(pass)) return { score: 2, label: "Média", class: styles.medium, textClass: styles.textMedium };
    return { score: 3, label: "Forte", class: styles.strong, textClass: styles.textStrong };
  };

  const strength = getPasswordStrength(novaSenha);

  const handleUpdateProfile = async () => {
    if (!nome || !email) return toast.warning("Nome e e-mail obrigatórios.");
    
    setLoading(true);
    try {
      const response = await api.put('/auth/users/profile', { nome, email });
      updateUser(response.data);
      toast.success("Dados atualizados.");
    } catch (err) {
      toast.error("Erro ao atualizar.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!senhaAtual || !novaSenha) return toast.warning("Preencha as senhas.");
    
    setLoading(true);
    try {
      await api.patch('/auth/users/password', { senhaAtual, novaSenha });
      setSenhaAtual("");
      setNovaSenha("");
      toast.success("Senha alterada!");
    } catch (err) {
      toast.error("Erro ao alterar senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      
      {/* 1. HEADER DE IDENTIDADE (HERO) */}
      <header className={styles.identityHeader}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarLarge}>
            {getInitials(user?.nome)}
          </div>
        </div>
        
        <div className={styles.infoSection}>
          <h1 className={styles.userName}>{user?.nome || "Usuário"}</h1>
          <div className={styles.metaInfo}>
            <span><Briefcase size={14} style={{marginRight:6, position: 'relative', top: 2}}/> {user?.cargo || "Colaborador"}</span>
            <span className={styles.separator}></span>
            <span>{user?.setor || "Geral"}</span>
            <span className={styles.separator}></span>
            <span><Calendar size={14} style={{marginRight:6, position: 'relative', top: 2}}/> Admissão: 12/05/2023</span>
          </div>
        </div>

        <div className={styles.statusBadge}>
          <CheckCircle size={12} style={{marginRight: 6}} /> Ativo
        </div>
      </header>

      {/* 2. GRID DE CONTEÚDO (1/3 + 2/3) */}
      <div className={styles.contentGrid}>
        
        {/* COLUNA ESQUERDA: SEGURANÇA */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <Shield size={20} className={styles.cardIcon} /> 
            Acesso e Segurança
          </div>
          
          <div className={styles.formStack}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>E-mail de Acesso</label>
              <input type="email" value={email} readOnly className={`${styles.input} ${styles.readOnlyField}`} />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Senha Atual</label>
              <input 
                type="password" 
                className={styles.input} 
                placeholder="••••••••"
                value={senhaAtual}
                onChange={e => setSenhaAtual(e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Nova Senha</label>
              <input 
                type="password" 
                className={styles.input} 
                placeholder="Mínimo 6 caracteres"
                value={novaSenha}
                onChange={e => setNovaSenha(e.target.value)}
              />
              {/* Barra de Força */}
              {novaSenha && (
                <div>
                  <div className={styles.passwordStrength}>
                    <div className={`${styles.strengthFill} ${strength.class}`}></div>
                  </div>
                  <span className={`${styles.strengthText} ${strength.textClass}`}>{strength.label}</span>
                </div>
              )}
            </div>

            <div className={styles.actions}>
              <button 
                className={styles.btnPrimary} 
                onClick={handleChangePassword}
                disabled={loading || !novaSenha}
              >
                <Lock size={16} /> Atualizar Senha
              </button>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: DADOS CADASTRAIS */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <User size={20} className={styles.cardIcon} /> 
            Dados Cadastrais
          </div>

          <div className={styles.formStack}>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Nome Completo</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label className={styles.label}>CPF</label>
                <input type="text" className={styles.input} placeholder="000.000.000-00" />
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Matrícula (ID)</label>
                <div style={{position: 'relative'}}>
                  <Hash size={14} style={{position: 'absolute', left: 12, top: 12, color: '#94a3b8'}} />
                  <input type="text" className={`${styles.input} ${styles.readOnlyField}`} value="00123" readOnly style={{paddingLeft: 32}} />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Telefone / Ramal</label>
                <input type="text" className={styles.input} placeholder="(00) 00000-0000" />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Endereço Residencial</label>
              <input type="text" className={styles.input} placeholder="Rua, Número, Bairro..." />
            </div>

            <div className={styles.actions}>
              <button 
                className={styles.btnPrimary} 
                onClick={handleUpdateProfile}
                disabled={loading}
              >
                <Save size={16} /> Salvar Alterações
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Perfil;