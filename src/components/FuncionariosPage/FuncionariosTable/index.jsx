import { funcionariosMock } from "../../../data/funcionarioMock";
 import styles from "./styles.module.css";

 function FuncionariosTable() {
  return (
    <div className={styles.tableWrapper}>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Cargo</th>
            <th>Setor</th>
            <th>EPIs Recebidos</th>
            <th>Última Entrega</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {funcionariosMock.map(f => (
            <tr key={f.id}>
              <td>{f.nome}</td>
              <td>{f.cargo}</td>
              <td>{f.setor}</td>
              <td>{f.epis.join(", ")}</td>
              <td>{f.ultimaEntrega}</td>
              <td>
                <button className={styles.editBtn}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FuncionariosTable;