import { entregasMock } from "../../../data/entregasMock";
import styles from "./styles.module.css";

function RelatorioTable() {

  return (
    <div className={styles.tableWrapper}>
      <table>
          <tr>
            <th>Filtros</th>
          </tr>

        <tbody>
          <div className={styles.row}>
        <div className={styles.field}>
          <label>Período</label>
          <div className={styles.periodo}>
            <input type="date" />
            <input type="date" />
          </div>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label>Funcionário</label>
          <select>
            <option value="">- Selecione -</option>
            <option>João Silva</option>
            <option>Maria Souza</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>Setor</label>
          <select>
            <option value="">- Selecione -</option>
            <option>Produção</option>
            <option>Administrativo</option>
            <option>Logística</option>
          </select>
        </div>
      </div>

      <button className={styles.button}>Gerar Relatório</button>
        </tbody>
      </table>
    </div>
  );
}

export default RelatorioTable;
