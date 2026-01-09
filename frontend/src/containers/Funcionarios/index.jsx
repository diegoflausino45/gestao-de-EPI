import { useState, useEffect } from "react";
import styles from "./styles.module.css";

import SearchBar from "../../components/SearchBar";
import FuncionariosTable from "../../components/Pages/FuncionariosPage/FuncionariosTable";
import FuncionarioModal from "../../components/Pages/FuncionariosPage/FuncionarioModal";

import { api } from "../../services/api";


export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState(null);
  const [search, setSearch] = useState("");

  const funcionariosFiltrados = funcionarios.filter(f =>
  f.nome.toLowerCase().includes(search.toLowerCase()) ||
  f.cargo.toLowerCase().includes(search.toLowerCase()) ||
  f.setor.toLowerCase().includes(search.toLowerCase())
);

useEffect(() => {
  async function loadFuncionarios() {
    try {
      const response = await api.get("/funcionarios");
      setFuncionarios(response.data);
    } catch (error) {
      console.error("Erro ao buscar funcionários", error);
    }
  }

  loadFuncionarios();
}, []);


  function inativarFuncionario(id) {
    // Futuro: chamar API DELETE ou PATCH /funcionarios/:id
    setFuncionarios(prev =>
        prev.map(f =>
            f.id === id ? { ...f, status: f.status === "ativo" ? "inativo" : "ativo" } : f
        )
    );
  }

  function handleAdd() {
    setSelectedFuncionario(null);
    setOpenModal(true);
  }

  function handleEdit(funcionario) {
    setSelectedFuncionario(funcionario);
    setOpenModal(true);
  }

async function handleSave(data) {
  try {
    if (selectedFuncionario) {
      // EDITAR (PUT)
      const response = await api.put(
        `/funcionarios/${selectedFuncionario.id}`,
        data
      );

      setFuncionarios(prev =>
        prev.map(f =>
          f.id === selectedFuncionario.id ? response.data : f
        )
      );
    } else {
      // CRIAR (POST)
      const response = await api.post("/funcionarios", data);

      setFuncionarios(prev => [...prev, response.data]);
    }

    setOpenModal(false);
  } catch (error) {
    console.error("Erro ao salvar funcionário", error);
    alert("Erro ao salvar funcionário");
  }
}

  return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Funcionários</h1>
          <button className={styles.addBtn} onClick={handleAdd}>
            + Adicionar Funcionário
          </button>
        </header>

        <SearchBar
            value={search}
            onChange={setSearch}
            placeholder={"Buscar funcionário por nome, cargo ou setor"}
        />

        {/* Não vi o arquivo de paginação, mas assumo que você o tenha ou esteja usando a tabela direta */}
        <FuncionariosTable
            dados={funcionariosFiltrados}
            onEdit={handleEdit}
            onDelete={inativarFuncionario} // Assumindo que sua tabela aceita onDelete ou onStatusChange
        />

        {/* A Paginação estava no seu import original,
         mantenha aqui se estiver usando
      */}

        {openModal && (
            <FuncionarioModal
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
                onSave={handleSave}
                employee={selectedFuncionario} // No seu código original estava 'employee', mantive a prop
            />
        )}
      </div>
  );
}