import styles from "./styles.module.css";

function EntregasTable({ dados = [], onView }) { // Valor padrão para evitar erro se dados for undefined

  // Verifica se a lista está vazia para mostrar mensagem amigável
  if (dados.length === 0) {
    return (
        <div className={styles.tableWrapper}>
          <p className={styles.emptyMessage}>Nenhuma entrega encontrada.</p>
        </div>
    );
  }

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
          {dados.map((f) => (
              <tr key={f.id}>
                {/* O ?. evita erro se o objeto for nulo */}
                <td>{f.funcionario?.nome || "---"}</td>
                <td>{f.epi?.nome || "---"}</td>
                <td>{f.quantidade}</td>
                {/* Sugestão: Formatar a data para o padrão BR aqui ou no backend */}
                <td>{f.dataEntrega}</td>
                <td>{f.responsavel}</td>
                <td className={styles.actions}>
                  <button className={styles.viewBtn} onClick={() => onView(f)}>
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