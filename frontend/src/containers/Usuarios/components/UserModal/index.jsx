import { useState, useEffect, useRef } from "react";
import { X, User, Mail, Lock, Shield, Save, ChevronDown, HardHat } from "lucide-react";
import { toast } from "react-toastify";
import styles from "./styles.module.css";

// Opções de Perfil (Roles)
const ROLES = [
  { value: "user", label: "Usuário Comum", icon: User },
  { value: "tecnico", label: "Técnico de Segurança", icon: HardHat },
  { value: "admin", label: "Administrador", icon: Shield }
];

// Estado inicial vazio para criação
const initialState = {
  nome: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "user",
  ativo: true
};

export default function UserModal({ isOpen, onClose, userToEdit = null, onSave }) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  
  // Controle do Dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Se receber um usuário para editar, preenche o form
  useEffect(() => {
    if (userToEdit) {
      setForm({
        ...userToEdit,
        password: "", // Não preenche senha na edição por segurança
        confirmPassword: ""
      });
    } else {
      setForm(initialState);
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRoleSelect = (roleValue) => {
    setForm(prev => ({ ...prev, role: roleValue }));
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validações básicas
    if(!userToEdit && !form.password) {
        return toast.warning("A senha é obrigatória para novos usuários.");
    }

    if(form.password && form.password !== form.confirmPassword) {
        return toast.error("As senhas não coincidem.");
    }

    setLoading(true);

    // Simulação de delay (aqui entraria a chamada da API)
    setTimeout(() => {
        setLoading(false);
        onSave(form); // Passa os dados para o pai atualizar a lista
        onClose();
        toast.success(userToEdit ? "Usuário atualizado!" : "Usuário criado com sucesso!");
    }, 800);
  };

  // Encontra o objeto do role atual para exibir no botão
  const currentRole = ROLES.find(r => r.value === form.role) || ROLES[0];
  const IconCurrent = currentRole.icon;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        
        <div className={styles.header}>
          <h2>
            <User size={24} color="#2563eb" />
            {userToEdit ? "Editar Usuário" : "Novo Usuário"}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          <form id="userForm" onSubmit={handleSubmit} className={styles.formGrid}>
            
            <div className={`${styles.group} ${styles.fullWidth}`}>
              <label>Nome Completo</label>
              <input 
                name="nome" 
                value={form.nome} 
                onChange={handleChange} 
                placeholder="Ex: João da Silva"
                required 
              />
            </div>

            <div className={`${styles.group} ${styles.fullWidth}`}>
              <label><Mail size={14}/> E-mail</label>
              <input 
                type="email"
                name="email" 
                value={form.email} 
                onChange={handleChange} 
                placeholder="joao@empresa.com"
                required 
              />
            </div>

            <div className={styles.group}>
              <label><Lock size={14}/> Senha</label>
              <input 
                type="password"
                name="password" 
                value={form.password} 
                onChange={handleChange} 
                placeholder={userToEdit ? "(Deixe em branco p/ manter)" : "******"}
              />
            </div>

            <div className={styles.group}>
              <label><Lock size={14}/> Confirmar Senha</label>
              <input 
                type="password"
                name="confirmPassword" 
                value={form.confirmPassword} 
                onChange={handleChange} 
                placeholder="Repita a senha"
              />
            </div>

            {/* Custom Dropdown para Roles */}
            <div className={styles.group} ref={dropdownRef}>
              <label><Shield size={14}/> Perfil de Acesso</label>
              <div className={styles.dropdownContainer}>
                <button 
                  type="button" 
                  className={`${styles.dropdownButton} ${isDropdownOpen ? styles.active : ''}`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <IconCurrent size={16} color="#64748b" />
                    <span>{currentRole.label}</span>
                  </div>
                  <ChevronDown size={16} />
                </button>

                {isDropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    {ROLES.map((role) => {
                      const Icon = role.icon;
                      return (
                        <button
                          key={role.value}
                          type="button"
                          className={`${styles.dropdownItem} ${form.role === role.value ? styles.selected : ''}`}
                          onClick={() => handleRoleSelect(role.value)}
                        >
                          <div className={styles.iconWrapper}>
                            <Icon size={14} />
                          </div>
                          {role.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className={`${styles.group} ${styles.fullWidth}`}>
               <div className={styles.switchRow} onClick={() => setForm(prev => ({ ...prev, ativo: !prev.ativo }))}>
                  <div className={styles.switchLabel}>
                    <span>Acesso ao Sistema</span>
                    <small>{form.ativo ? "O usuário poderá realizar login e operar o sistema." : "O acesso deste usuário está bloqueado."}</small>
                  </div>
                  <div className={styles.switch}>
                    <input 
                      type="checkbox" 
                      name="ativo" 
                      checked={form.ativo} 
                      readOnly // Input controlado apenas pelo click na ROW
                      style={{pointerEvents: 'none'}} // Evita duplo disparo
                    />
                    <span className={styles.slider}></span>
                  </div>
               </div>
            </div>

          </form>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" form="userForm" className={styles.saveBtn} disabled={loading}>
            {loading ? "Salvando..." : (
              <>
                <Save size={18} /> Salvar
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
