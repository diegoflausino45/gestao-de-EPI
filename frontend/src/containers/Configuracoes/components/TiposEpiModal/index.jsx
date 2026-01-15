import { useState } from "react";
import { X, Package, Plus, Calendar, Hash, Edit2, Trash2, Tag } from "lucide-react";
import { toast } from "react-toastify";
import styles from "./styles.module.css";
import { tiposEpiMock } from "../../../../data/tiposEpiMock";

export default function TiposEpiModal({ isOpen, onClose }) {
  const [tipos, setTipos] = useState(tiposEpiMock);

  if (!isOpen) return null;

  const handleEdit = (id) => {
    toast.info("Funcionalidade de edição em desenvolvimento.");
  };

  const handleDelete = (id) => {
    if (window.confirm("Deseja realmente remover este tipo de EPI?")) {
      setTipos(prev => prev.filter(t => t.id !== id));
      toast.success("Tipo de EPI removido.");
    }
  };

  const handleNew = () => {
    toast.info("Funcionalidade de cadastro em desenvolvimento.");
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
             <Package size={24} color="#2563eb" />
             <div>
                <h2>Gerenciar Tipos de EPIs</h2>
                <span style={{fontSize: '0.85rem', color: '#64748b', fontWeight: 400}}>Defina categorias e validades padrão</span>
             </div>
          </div>
          
          <div style={{display: 'flex', alignItems: 'center'}}>
            <button className={styles.addBtn} onClick={handleNew}>
                <Plus size={18} /> Novo Tipo
            </button>
            <button className={styles.closeBtn} onClick={onClose}>
                <X size={20} />
            </button>
          </div>
        </div>

        {/* Body (List) */}
        <div className={styles.body}>
          <div className={styles.listContainer}>
            {tipos.map(epi => (
              <div key={epi.id} className={styles.listItem}>
                
                <div className={styles.itemInfo}>
                  <div className={styles.itemHeader}>
                    <strong>{epi.nome}</strong>
                    <span className={styles.tag}>{epi.categoria}</span>
                  </div>
                  
                  <div className={styles.itemMeta}>
                    <div className={styles.metaBlock}>
                        <Hash size={14} /> <span>CA: {epi.ca}</span>
                    </div>
                    <div className={styles.metaBlock}>
                        <Calendar size={14} /> <span>Validade: {epi.validadeMeses} meses</span>
                    </div>
                  </div>
                </div>

                <div className={styles.actions}>
                  <button 
                    className={styles.actionBtn} 
                    title="Editar"
                    onClick={() => handleEdit(epi.id)}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    className={`${styles.actionBtn} ${styles.deleteBtn}`} 
                    title="Remover"
                    onClick={() => handleDelete(epi.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

              </div>
            ))}

            {tipos.length === 0 && (
                <div style={{padding: '40px', textAlign: 'center', color: '#94a3b8'}}>
                    Nenhum tipo de EPI cadastrado.
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
