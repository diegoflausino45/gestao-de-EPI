
import styles from "./styles.module.css";
import SearchBar from "../../components/FuncionariosPage/SearchBar";
import FuncionariosTable from "../../components/FuncionariosPage/FuncionariosTable";
import Pagination from "../../components/FuncionariosPage/Pagination";


export default function Funcionarios() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Funcionários</h1>
        <button className={styles.addBtn}>
          + Adicionar Funcionário
        </button>
      </header>

      <SearchBar />
      <FuncionariosTable />
      <Pagination />
    </div>
  );
}
