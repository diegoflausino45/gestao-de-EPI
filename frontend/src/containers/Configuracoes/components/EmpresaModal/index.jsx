import { useState, useEffect } from "react";
import { X, Building2, FileText, Mail, Phone, MapPin, User, Check, Save } from "lucide-react";
import { toast } from "react-toastify";
import styles from "./styles.module.css";

// Mock importado diretamente aqui por enquanto, mas preparado para receber via props
import { empresaConfigMock } from "../../../../data/empresaConfigMock";

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

export default function EmpresaModal({ isOpen, onClose }) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);

  // Carrega dados quando o modal abre
  useEffect(() => {
    if (isOpen) {
      // Simulação de fetch da API
      setForm(empresaConfigMock);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulação de Delay de API
    setTimeout(() => {
      setLoading(false);
      toast.success("Dados da empresa atualizados com sucesso!");
      onClose();
    }, 1000);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        
        {/* Header */}
        <div className={styles.header}>
          <h2>
            <Building2 size={24} className="text-blue-600" color="#2563eb" />
            Configurações da Empresa
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body (Form) */}
        <div className={styles.body}>
          <form id="empresaForm" onSubmit={handleSubmit} className={styles.formGrid}>
            
            <div className={`${styles.group} ${styles.fullWidth}`}>
              <label><Building2 size={16}/> Nome Fantasia</label>
              <input name="nome" value={form.nome} onChange={handleChange} required />
            </div>

            <div className={`${styles.group} ${styles.fullWidth}`}>
              <label><FileText size={16}/> Razão Social</label>
              <input name="razaoSocial" value={form.razaoSocial} onChange={handleChange} />
            </div>

            <div className={styles.group}>
              <label><FileText size={16}/> CNPJ</label>
              <input name="cnpj" value={form.cnpj} onChange={handleChange} placeholder="00.000.000/0000-00" required />
            </div>

            <div className={styles.group}>
              <label><User size={16}/> Responsável</label>
              <input name="responsavel" value={form.responsavel} onChange={handleChange} />
            </div>

            <div className={styles.group}>
              <label><Mail size={16}/> E-mail</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} />
            </div>

            <div className={styles.group}>
              <label><Phone size={16}/> Telefone</label>
              <input name="telefone" value={form.telefone} onChange={handleChange} />
            </div>

            <div className={`${styles.group} ${styles.fullWidth}`}>
              <label><MapPin size={16}/> Endereço</label>
              <input name="endereco" value={form.endereco} onChange={handleChange} />
            </div>

            <div className={styles.group}>
              <label>Cidade</label>
              <input name="cidade" value={form.cidade} onChange={handleChange} />
            </div>

            <div className={styles.group}>
              <label>Estado (UF)</label>
              <input name="estado" value={form.estado} onChange={handleChange} maxLength={2} style={{textTransform: 'uppercase'}}/>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" form="empresaForm" className={styles.saveBtn} disabled={loading}>
            {loading ? "Salvando..." : (
              <>
                <Save size={18} /> Salvar Alterações
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
