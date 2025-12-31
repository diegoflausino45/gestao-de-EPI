import styles from "./styles.module.css";

import SearchBar from "../../components/EntregasPage/SearchBar";
import EntregasTable from "../../components/EntregasPage/EntregasTable";

import { entregasMock } from "../../data/entregasMock";


export default function Entregas() {

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Entregas</h1>
        <button className={styles.addBtn}>
          + Nova Entrega
        </button>
      </header>

      <SearchBar />

      <EntregasTable
        dados={entregasMock}
      />
    </div>
  );
}
