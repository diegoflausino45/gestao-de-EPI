import { useState } from "react";
import { funcionariosMock } from "../../../data/funcionarioMock";
import styles from "./styles.module.css";

function FuncionariosTable() {
  const [funcionarios, setFuncionarios] = useState(funcionariosMock);

  function toggleStatus(id) {
    setFuncionarios(prev =>
      prev.map(f =>
        f.id === id ? { ...f, ativo: !f.ativo } : f
      )
    );
  }

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
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {funcionarios.map(f => (
            <tr
              key={f.id}
              className={!f.ativo ? styles.inativo : ""}
            >
              <td>{f.nome}</td>
              <td>{f.cargo}</td>
              <td>{f.setor}</td>
              <td>{f.epis.join(", ")}</td>
              <td>{f.ultimaEntrega}</td>
              <td className={styles.actions}>
                <button className={styles.editBtn}>
                  Editar
                </button>

                <button
                  onClick={() => toggleStatus(f.id)}
                  className={
                    f.ativo ? styles.inactivateBtn : styles.activateBtn
                  }
                >
                  {f.ativo ? "Inativar" : "Ativar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FuncionariosTable;
