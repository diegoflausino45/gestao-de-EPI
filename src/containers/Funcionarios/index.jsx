import { useState } from "react";
import styles from "./styles.module.css";

import SearchBar from "../../components/FuncionariosPage/SearchBar";
import FuncionariosTable from "../../components/FuncionariosPage/FuncionariosTable";
import Pagination from "../../components/FuncionariosPage/Pagination";

import { funcionariosMock } from "../../data/funcionarioMock";

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState(funcionariosMock);

  function inativarFuncionario(id) {
    setFuncionarios(prev =>
      prev.map(f =>
        f.id === id ? { ...f, status: "inativo" } : f
      )
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Funcionários</h1>
        <button className={styles.addBtn}>
          + Adicionar Funcionário
        </button>
      </header>

      <SearchBar />

      <FuncionariosTable
        dados={funcionarios}
        onInativar={inativarFuncionario}
      />

      <Pagination />
    </div>
  );
}
