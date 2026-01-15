import { useState, useEffect } from "react";
import { X, Briefcase, FileText, User, Save } from "lucide-react";
import { toast } from "react-toastify";
import styles from "./styles.module.css";

const initialState = {
  nome: "",
  descricao: "",
  responsavel: ""
};

export default function SetorModal({ isOpen, onClose, setorToEdit = null, onSave }) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (setorToEdit) {
      setForm(setorToEdit);
    } else {
      setForm(initialState);
    }
  }, [setorToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulação API
    setTimeout(() => {
        setLoading(false);
        onSave(form);
        onClose();
        toast.success(setorToEdit ? "Setor atualizado!" : "Setor criado com sucesso!");
    }, 800);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        
        <div className={styles.header}>
          <h2>
            <Briefcase size={24} color="#2563eb" />
            {setorToEdit ? "Editar Setor" : "Novo Setor"}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          <form id="setorForm" onSubmit={handleSubmit} className={styles.formGrid}>
            
            <div className={styles.group}>
              <label>Nome do Setor</label>
              <input 
                name="nome" 
                value={form.nome} 
                onChange={handleChange} 
                placeholder="Ex: Manutenção Elétrica"
                required 
              />
            </div>

            <div className={styles.group}>
              <label><FileText size={14}/> Descrição</label>
              <textarea
                name="descricao" 
                value={form.descricao} 
                onChange={handleChange} 
                placeholder="Descreva as atividades deste setor..."
                rows={3}
              />
            </div>

            <div className={styles.group}>
              <label><User size={14}/> Responsável (Nome)</label>
              <input 
                name="responsavel" 
                value={form.responsavel} 
                onChange={handleChange} 
                placeholder="Quem gerencia este setor?"
              />
            </div>

          </form>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" form="setorForm" className={styles.saveBtn} disabled={loading}>
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
