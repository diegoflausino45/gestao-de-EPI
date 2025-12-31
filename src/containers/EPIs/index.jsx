import styles from "./styles.module.css";

import SearchBar from "../../components/EpiPage/SearchBar";
import EpiTable from "../../components/EpiPage/EpiTable";

import { epiMock } from "../../data/epiMock";


export default function EPIs() {

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>EPIs</h1>
        <button className={styles.addBtn}>
          + Adicionar EPI
        </button>
      </header>

      <SearchBar />

      <EpiTable
        dados={epiMock}
      />
    </div>
  );
}
