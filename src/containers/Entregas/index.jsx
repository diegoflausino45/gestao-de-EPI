import styles from "./styles.module.css";
import { useState } from "react";

import SearchBar from "../../components/EntregasPage/SearchBar";
import EntregasTable from "../../components/EntregasPage/EntregasTable";

import { entregasMock } from "../../data/entregasMock";


export default function Entregas() {
  const [search, setSearch] = useState("");
  const entregasFiltradas = entregasMock.filter(e =>
    e.funcionario.nome.toLowerCase().includes(search.toLowerCase()) ||
    e.epi.nome.toLowerCase().includes(search.toLowerCase()) ||
    e.responsavel.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Entregas</h1>
        <button className={styles.addBtn}>
          + Nova Entrega
        </button>
      </header>

      <SearchBar value={search} onChange={setSearch} />

      <EntregasTable
        dados={entregasFiltradas}
      />
    </div>
  );
}
