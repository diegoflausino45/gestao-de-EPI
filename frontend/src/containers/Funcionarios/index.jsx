import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import styles from "./styles.module.css";

// Components
import FuncionariosHeader from "./components/FuncionariosHeader";
import FuncionariosTable from "./components/FuncionariosTable";
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
        console.error("Erro API, usando mock", error);
        setFuncionarios(funcionariosMock);
      }
    }
    loadFuncionarios();
  }, []);

  // Filtro Otimizado (Memoized)
  const filteredFuncionarios = useMemo(() => {
    return funcionarios.filter(f =>
      f.nome.toLowerCase().includes(search.toLowerCase()) ||
      f.cargo.toLowerCase().includes(search.toLowerCase()) ||
      f.setor.toLowerCase().includes(search.toLowerCase())
    );
  }, [funcionarios, search]);

  // Actions (Memoized callbacks para não quebrar o React.memo dos filhos)
  const handleOpenDelete = useCallback((funcionario) => {
    setSelectedFuncionario(funcionario);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmInativar = useCallback(() => {
    if (!selectedFuncionario) return;

    setFuncionarios(prev =>
      prev.map(f =>
        f.id === selectedFuncionario.id ? { ...f, status: f.status === "ativo" ? "inativo" : "ativo" } : f
      )
    );
    
    setIsDeleteModalOpen(false);
    toast.success(`Status de ${selectedFuncionario.nome} alterado.`);
  }, [selectedFuncionario]);

  const handleEdit = useCallback((funcionario) => {
    setSelectedFuncionario(funcionario);
    setIsModalOpen(true);
  }, []);

  const handleNew = useCallback(() => {
    setSelectedFuncionario(null);
    setIsModalOpen(true);
  }, []);

  // Hook Memoizado para o Modal
  const handleSave = useCallback(async (data) => {
    try {
      if (selectedFuncionario) {
        // EDITAR
        const response = await api.put(`/funcionarios/${selectedFuncionario.id}`, data);
        setFuncionarios(prev =>
          prev.map(f => f.id === selectedFuncionario.id ? response.data : f)
        );
        toast.success("Funcionário atualizado!");
      } else {
        // CRIAR
        const response = await api.post("/funcionarios", data);
        setFuncionarios(prev => [...prev, response.data]);
        toast.success("Funcionário criado!");
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar", error);
      // Fallback
      if (selectedFuncionario) {
          setFuncionarios(prev => prev.map(f => f.id === selectedFuncionario.id ? { ...f, ...data } : f));
      } else {
          setFuncionarios(prev => [...prev, { id: Date.now(), ...data }]);
      }
      setIsModalOpen(false);
      toast.warn("Salvo localmente (Erro na API)");
    }
  }, [selectedFuncionario]);

  return (
    <div className={styles.container}>
      
      <FuncionariosHeader 
        search={search} 
        onSearchChange={setSearch} 
        onNew={handleNew} 
      />

      <FuncionariosTable 
        funcionarios={filteredFuncionarios} 
        onEdit={handleEdit} 
        onDelete={handleOpenDelete} 
      />

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
