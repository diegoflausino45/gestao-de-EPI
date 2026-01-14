import { useState } from "react";
import { Search, Plus, Users, LayoutGrid, Trash2, Edit2, Briefcase } from "lucide-react";
import { toast } from "react-toastify";
import styles from "./styles.module.css";
import SetorModal from "./components/SetorModal";

const setoresMock = [
  { id: 1, nome: "Produção", descricao: "Linha de montagem e operação fabril", responsavel: "Carlos Silva", funcionarios: 45 },
  { id: 2, nome: "Manutenção", descricao: "Reparos e manutenção predial/maquinário", responsavel: "João Pereira", funcionarios: 12 },
  { id: 3, nome: "Administrativo", descricao: "RH, Financeiro e Contabilidade", responsavel: "Maria Souza", funcionarios: 8 },
  { id: 4, nome: "Logística", descricao: "Expedição e Recebimento", responsavel: "Fernanda Lima", funcionarios: 20 },
];

export default function Setores() {
  const [busca, setBusca] = useState("");
  const [setores, setSetores] = useState(setoresMock);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSetor, setEditingSetor] = useState(null);

  const filteredSetores = setores.filter((s) =>
    s.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const getInitials = (name) => {
    if(!name) return "?";
    return name.split(" ").map(n=>n[0]).slice(0,2).join("").toUpperCase();
  }

  const handleDelete = (id) => {
    if(window.confirm("Deseja excluir este setor?")) {
        setSetores(prev => prev.filter(s => s.id !== id));
        toast.success("Setor removido.");
    }
  };

  const handleEdit = (setor) => {
      setEditingSetor(setor);
      setIsModalOpen(true);
  }

  const handleNew = () => {
      setEditingSetor(null);
      setIsModalOpen(true);
  }

  const handleSaveSetor = (dados) => {
      if (editingSetor) {
          // Edit
          setSetores(prev => prev.map(s => s.id === editingSetor.id ? { ...s, ...dados } : s));
      } else {
          // New
          const newSetor = {
              id: Date.now(),
              ...dados,
              funcionarios: 0 // Começa com 0
          };
          setSetores(prev => [...prev, newSetor]);
      }
  }

  return (
    <div className={styles.container}>
      
      {/* Controls */}
      <div className={styles.headerControls}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar setor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <button className={styles.addButton} onClick={handleNew}>
          <Plus size={20} />
          Novo Setor
        </button>
      </div>

      {/* Grid de Cards */}
      <div className={styles.grid}>
        {filteredSetores.map((setor) => (
            <div key={setor.id} className={styles.card}>
                
                <div className={styles.cardHeader}>
                    <div className={styles.iconBox}>
                        <Briefcase size={24} />
                    </div>
                    <div className={styles.cardInfo}>
                        <h3>{setor.nome}</h3>
                        <span>{setor.descricao}</span>
                    </div>
                </div>

                <div className={styles.cardBody}>
                    <div className={styles.stats}>
                        <Users size={16} />
                        {setor.funcionarios} Colaboradores vinculados
                    </div>

                    <div className={styles.responsavel}>
                        <div className={styles.respAvatar}>
                            {getInitials(setor.responsavel)}
                        </div>
                        <div>
                            <span className={styles.respLabel}>Responsável</span>
                            <div className={styles.respName}>{setor.responsavel || "Não definido"}</div>
                        </div>
                    </div>
                </div>

                <div className={styles.cardFooter}>
                    <button className={styles.iconBtn} onClick={() => handleEdit(setor)} title="Editar">
                        <Edit2 size={18} />
                    </button>
                    <button className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(setor.id)} title="Excluir">
                        <Trash2 size={18} />
                    </button>
                </div>

            </div>
        ))}

        {filteredSetores.length === 0 && (
            <div className={styles.emptyState}>
                <LayoutGrid size={48} strokeWidth={1} />
                <p>Nenhum setor encontrado.</p>
            </div>
        )}
      </div>

      <SetorModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        setorToEdit={editingSetor}
        onSave={handleSaveSetor}
      />

    </div>
  );
}