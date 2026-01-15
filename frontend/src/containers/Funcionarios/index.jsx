import { useState, useEffect } from "react";
import { Search, Plus, User, Edit2, Trash2, Users } from "lucide-react";
import { toast } from "react-toastify";
import styles from "./styles.module.css";
import FuncionarioModal from "./components/FuncionarioModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";

import funcionariosMock from "../../data/funcionarioMock.js";
import { api } from "../../services/api";

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [search, setSearch] = useState("");
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState(null);

  // Carregar dados
  useEffect(() => {
    async function loadFuncionarios() {
      try {
        const response = await api.get("/funcionarios");
        setFuncionarios(response.data);
      } catch (error) {
        console.error("Erro ao buscar funcionários da API, usando dados mock", error);
        setFuncionarios(funcionariosMock);
      }
    }
    loadFuncionarios();
  }, []);

  // Filtro
  const filteredFuncionarios = funcionarios.filter(f =>
    f.nome.toLowerCase().includes(search.toLowerCase()) ||
    f.cargo.toLowerCase().includes(search.toLowerCase()) ||
    f.setor.toLowerCase().includes(search.toLowerCase())
  );

  // Helpers
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Actions
  const handleOpenDelete = (funcionario) => {
    setSelectedFuncionario(funcionario);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmInativar = () => {
    if (!selectedFuncionario) return;

    // Simulação de alteração local
    setFuncionarios(prev =>
      prev.map(f =>
        f.id === selectedFuncionario.id ? { ...f, status: f.status === "ativo" ? "inativo" : "ativo" } : f
      )
    );
    
    setIsDeleteModalOpen(false);
    toast.success(`Status de ${selectedFuncionario.nome} alterado.`);
  };

  const handleEdit = (funcionario) => {
    setSelectedFuncionario(funcionario);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedFuncionario(null);
    setIsModalOpen(true);
  };

  const handleSave = async (data) => {
    try {
      if (selectedFuncionario) {
        // EDITAR (PUT)
        const response = await api.put(`/funcionarios/${selectedFuncionario.id}`, data);
        setFuncionarios(prev =>
          prev.map(f => f.id === selectedFuncionario.id ? response.data : f)
        );
        toast.success("Funcionário atualizado!");
      } else {
        // CRIAR (POST)
        const response = await api.post("/funcionarios", data);
        setFuncionarios(prev => [...prev, response.data]);
        toast.success("Funcionário criado com sucesso!");
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar funcionário", error);
      // Fallback para não travar a UI se a API falhar
      if (selectedFuncionario) {
          setFuncionarios(prev => prev.map(f => f.id === selectedFuncionario.id ? { ...f, ...data } : f));
      } else {
          setFuncionarios(prev => [...prev, { id: Date.now(), ...data }]);
      }
      setIsModalOpen(false);
      toast.warn("Salvo localmente (Erro na API)");
    }
  };

  return (
    <div className={styles.container}>
      
      {/* Header Controls */}
      <div className={styles.headerControls}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por nome, cargo ou setor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className={styles.addButton} onClick={handleNew}>
          <Plus size={20} />
          Novo Funcionário
        </button>
      </div>

      {/* Rich Table */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Funcionário</th>
              <th>Cargo</th>
              <th>Setor</th>
              <th>EPIs</th>
              <th>Última Entrega</th>
              <th style={{textAlign: 'right'}}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredFuncionarios.length > 0 ? (
              filteredFuncionarios.map((f) => (
                <tr key={f.id}>
                  <td>
                    <div className={styles.userProfile}>
                      <div className={styles.avatar}>{getInitials(f.nome)}</div>
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>{f.nome}</span>
                        <div className={f.status === 'Ativo' ? styles.statusActive : styles.statusInactive}>
                            {f.status === 'Ativo' && <div className={styles.dot}></div>}
                            {f.status}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td><span className={styles.badge}>{f.cargo}</span></td>
                  <td><span className={styles.badge}>{f.setor}</span></td>
                  <td>{f.epis}</td>
                  <td>{f.ultimaEntrega || "-"}</td>

                  <td>
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} onClick={() => handleEdit(f)} title="Editar">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className={`${styles.actionBtn} ${styles.deleteBtn}`} 
                        onClick={() => handleOpenDelete(f)} 
                        title={f.status === "Ativo" ? "Inativar" : "Ativar"}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">
                  <div className={styles.emptyState}>
                    <Users size={48} strokeWidth={1} />
                    <p>Nenhum funcionário encontrado.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modais */}
      <FuncionarioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        employee={selectedFuncionario}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmInativar}
        itemName={selectedFuncionario?.nome}
      />
      
    </div>
  );
}
