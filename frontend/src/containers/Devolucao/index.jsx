import { useState } from "react";
import { Link } from "react-router-dom";

import styles from "./styles.module.css";
import devolucao from "./devolucao.module.css";


function DadosDevolucao() {
  return (
    <section className={devolucao.card}>
      <h2>Dados da Devolução</h2>

      <div className={devolucao.grid}>
        <div>
          <label>Funcionário</label>
          <select>
            <option>Selecione</option>
          </select>
        </div>

        <div>
          <label>Data da Devolução</label>
          <input type="date" />
        </div>

        <div className={devolucao.full}>
          <label>Motivo da Devolução</label>
          <select>
            <option>Troca</option>
            <option>Vencimento</option>
            <option>Danificado</option>
            <option>Desligamento</option>
          </select>
        </div>

        <div className={devolucao.full}>
          <label>Observações</label>
          <textarea rows="3" />
        </div>
      </div>
    </section>
  );
}

function EpiRow({ onRemove }) {
  return (
    <tr>
      <td>
        <select>
          <option>Selecione o EPI</option>
        </select>
      </td>

      <td>
        <input type="number" min="1" />
      </td>

      <td>
        <select>
          <option>Bom</option>
          <option>Danificado</option>
          <option>Inutilizável</option>
        </select>
      </td>

      <td>
        <button
          type="button"
          className={devolucao.remove}
          onClick={onRemove}
        >
          Remover
        </button>
      </td>
    </tr>
  );
}

function EPIsDevolver() {
  const [epis, setEpis] = useState([
    { id: 1 },
  ]);

  function adicionarEpi() {
    setEpis((prev) => [
      ...prev,
      { id: Date.now() },
    ]);
  }

  function removerEpi(id) {
    setEpis((prev) => prev.filter((epi) => epi.id !== id));
  }

  return (
    <section className={devolucao.card}>
      <h2>EPIs a Devolver</h2>

      <table className={devolucao.table}>
        <thead>
          <tr>
            <th>EPI</th>
            <th>Quantidade</th>
            <th>Estado</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {epis.map((epi) => (
            <EpiRow
              key={epi.id}
              onRemove={() => removerEpi(epi.id)}
            />
          ))}
        </tbody>
      </table>

      <button className={devolucao.add} onClick={adicionarEpi}>
        + Adicionar EPI
      </button>
    </section>
  );
}

function Devolucao() {
  return (
    <div className={styles.container}>
      <h1>Devolução de EPIs</h1>

      <DadosDevolucao />
      <EPIsDevolver />

      <div className={styles.actions}>
        <Link to={'/configuracoes'} className={`${styles.cancel} ${styles.button}`}>Cancelar</Link>
        <Link to={'/configuracoes'} className={`${styles.confirm} ${styles.button}`}>Confirmar Devolução</Link>
      </div>
    </div>
  );
}

export default Devolucao;
