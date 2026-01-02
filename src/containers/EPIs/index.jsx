import styles from "./styles.module.css";
import { useState } from "react";

import SearchBar from "../../components/EpiPage/SearchBar";
import EpiTable from "../../components/EpiPage/EpiTable";

import { epiMock } from "../../data/epiMock";


export default function EPIs() {
  const [search, setSearch] = useState("");
  const epiFiltrados = epiMock.filter(e =>
    e.nome.toLowerCase().includes(search.toLowerCase()) ||
    e.categoria.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>EPIs</h1>
        <button className={styles.addBtn}>
          + Adicionar EPI
        </button>
      </header>

      <SearchBar value={search} onChange={setSearch} />

      <EpiTable
        dados={epiFiltrados}
      />
    </div>
  );
}
