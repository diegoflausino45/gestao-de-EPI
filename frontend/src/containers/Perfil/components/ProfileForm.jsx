import { useState, useEffect } from "react";
import { User, Shield, Lock, Save } from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../../../services/api";
import styles from "../styles.module.css";

export default function ProfileForm({ user, updateUser }) {
  // Form States (Dados)
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  
  // Form States (Senha)
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setNome(user.nome || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Força da Senha
  const getPasswordStrength = (pass) => {
    if (!pass) return { label: "", class: "" };
    if (pass.length < 6) return { label: "Fraca", class: styles.weak, textClass: styles.textWeak };
    if (pass.length < 8 || !/\d/.test(pass)) return { label: "Média", class: styles.medium, textClass: styles.textMedium };
    return { label: "Forte", class: styles.strong, textClass: styles.textStrong };
  };
  const strength = getPasswordStrength(novaSenha);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      // 1. Atualizar Dados
      if (nome !== user.nome || email !== user.email) {
        const response = await api.put('/auth/users/profile', { nome, email });
        updateUser(response.data);
      }

      // 2. Atualizar Senha (se preenchida)
      if (novaSenha) {
        if (novaSenha !== confirmarSenha) throw new Error("Senhas não conferem.");
        if (!senhaAtual) throw new Error("Informe a senha atual.");
        await api.patch('/auth/users/password', { senhaAtual, novaSenha });
        setSenhaAtual("");
        setNovaSenha("");
        setConfirmarSenha("");
      }

      toast.success("Perfil atualizado com sucesso!");
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Erro ao salvar.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.settingsCard}>
      
      {/* Seção 1: Dados Cadastrais */}
      <div className={styles.sectionTitle}>
        <User size={20} color="var(--primary-color)" /> Dados Pessoais
      </div>
      
      <div className={styles.formGrid}>
        <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
          <label className={styles.label}>Nome Completo</label>
          <input 
            type="text" 
            className={styles.input} 
            value={nome}
            onChange={e => setNome(e.target.value)}
          />
        </div>

        <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
          <label className={styles.label}>E-mail de Acesso</label>
          <input 
            type="email" 
            className={styles.input} 
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
      </div>

      {/* Seção 2: Segurança (Alterar Senha) */}
      <div className={styles.sectionTitle} style={{marginTop: 40}}>
        <Shield size={20} color="var(--primary-color)" /> Segurança da Conta
      </div>

      <div className={styles.formStack}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Senha Atual</label>
          <div className={styles.inputWrapper}>
            <Lock size={16} className={styles.inputIcon} />
            <input 
              type="password" 
              className={styles.input} 
              placeholder="••••••••"
              value={senhaAtual}
              onChange={e => setSenhaAtual(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.passwordFieldsGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Nova Senha</label>
            <div className={styles.inputWrapper}>
              <Lock size={16} className={styles.inputIcon} />
              <input 
                type="password" 
                className={styles.input} 
                placeholder="Mínimo 6 caracteres"
                value={novaSenha}
                onChange={e => setNovaSenha(e.target.value)}
              />
            </div>
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

          <div className={styles.inputGroup}>
            <label className={styles.label}>Confirmar Nova Senha</label>
            <div className={styles.inputWrapper}>
              <Shield size={16} className={styles.inputIcon} />
              <input 
                type="password" 
                className={styles.input} 
                placeholder="Repita a nova senha"
                value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.saveBar}>
        <button className={styles.btnPrimary} onClick={handleUpdate} disabled={loading}>
          <Save size={18} /> Salvar Alterações
        </button>
      </div>

    </main>
  );
}
