import styles from "./styles.module.css";

function RelatorioTable() {

  return (
    <div className={styles.tableWrapper}>
      <table>
        <tbody>
          <tr>
            <th>Filtros</th>
          </tr>
        </tbody>
        <tbody>
          <tr className={styles.row}>
        <td className={styles.field}>
          <label>Período</label>
          <td className={styles.periodo}>
            <input type="date" />
            <input type="date" />
          </td>
        </td>
      </tr>

      <tr className={styles.row}>
        <td className={styles.field}>
          <label>Funcionário</label>
          <select>
            <option value="">- Selecione -</option>
            <option>João Silva</option>
            <option>Maria Souza</option>
          </select>
        </td>

        <td className={styles.field}>
          <label>Setor</label>
          <select>
            <option value="">- Selecione -</option>
            <option>Produção</option>
            <option>Administrativo</option>
            <option>Logística</option>
          </select>
        </td>
      </tr>

        </tbody>
      </table>
      <button className={styles.button}>Gerar Relatório</button>
    </div>
  );
}

export default RelatorioTable;
