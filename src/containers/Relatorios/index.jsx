import { FiArrowDown } from "react-icons/fi";

import styles from "./styles.module.css";
import EntregasTable from "../../components/EntregasPage/EntregasTable";
import RelatorioTable from "../../components/RelatoriosPage/RelatoriosTable";

import { entregasMock } from "../../data/entregasMock";


export default function Relatorios() {

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Relatórios</h1>
        <button className={styles.addBtn}>
          <FiArrowDown/> Exportar...
        </button>
      </header>

      

      <RelatorioTable/>

      <br/>
      <EntregasTable
        dados={entregasMock}
      />
    </div>
  );
}
