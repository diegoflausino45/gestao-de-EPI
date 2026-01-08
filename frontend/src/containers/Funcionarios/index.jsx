import { useState } from "react";
import styles from "./styles.module.css";

import SearchBar from "../../components/SearchBar";
import FuncionariosTable from "../../components/Pages/FuncionariosPage/FuncionariosTable";
import FuncionarioModal from "../../components/Pages/FuncionariosPage/FuncionarioModal";

import { funcionariosMock } from "../../data/funcionarioMock";

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState(funcionariosMock);
  const [openModal, setOpenModal] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState(null);
  const [search, setSearch] = useState("");

  const funcionariosFiltrados = funcionarios.filter(f =>
      f.nome.toLowerCase().includes(search.toLowerCase()) ||
      f.cargo.toLowerCase().includes(search.toLowerCase()) ||
      f.setor.toLowerCase().includes(search.toLowerCase())
  );

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

  // Aqui é onde os dados (incluindo a Biometria) chegam do Modal
  function handleSave(data) {
    // data contém: { nome, cpf, ..., biometriaTemplate: "..." }

    if (selectedFuncionario) {
      // Editar
      // Futuro: await api.put(`/funcionarios/${data.id}`, data);
      setFuncionarios(prev =>
          prev.map(f =>
              f.id === selectedFuncionario.id
                  ? { ...data, id: f.id }
                  : f
          )
      );
    } else {
      // Adicionar
      // Futuro: await api.post('/funcionarios', data);
      setFuncionarios(prev => [
        ...prev,
        { ...data, id: Date.now(), status: "ativo" }
      ]);
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