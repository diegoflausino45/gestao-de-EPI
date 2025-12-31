import { entregasMock } from "../../../data/entregasMock";
import styles from "./styles.module.css";

function EntregasTable() {

  return (
    <div className={styles.tableWrapper}>
      <table>
        <thead>
          <tr>
            <th>Funcionário</th>
            <th>EPI</th>
            <th>Quantidade</th>
            <th>Data</th>
            <th>Responsável</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {entregasMock.map(f => (
            <tr key={f.id} >
              <td>{f.funcionario.nome}</td>
              <td>{f.epi.nome}</td>
              <td>{f.quantidade}</td>
              <td>{f.dataEntrega}</td>
              <td>{f.responsavel}</td>
              <td className={styles.actions}>
                <button className={styles.viewBtn}>
                  Visualizar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EntregasTable;
