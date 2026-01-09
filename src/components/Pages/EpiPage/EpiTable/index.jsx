import styles from "./styles.module.css";

function EpiTable({dados, onEdit}) {

  return (
    <div className={styles.tableWrapper}>
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Validade CA</th>
            <th>Estoque Atual</th>
            <th>Estoque Mínimo</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {dados && dados.length > 0 ? (
            dados.map(f => (
              <tr key={f.id} >
                <td>{f.codigo || '-'}</td>
                <td>{f.nome || '-'}</td>
                <td>{f.tipo || '-'}</td>
                <td>{f.validadeCA ? new Date(f.validadeCA).toLocaleDateString('pt-BR') : '-'}</td>
                <td className={styles.estoque}>{f.estoqueAtual ?? 0}</td>
                <td>{f.estoqueMinimo ?? 0}</td>
                <td>
                  <span className={`${styles.status} ${styles[f.status?.toLowerCase().replace(/\s/g, '-') || 'ok']}`}>
                    {f.status || 'OK'}
                  </span>
                </td>
                <td className={styles.actions}>
                  <button className={styles.editBtn} onClick={() => onEdit(f)}>
                    Editar
                  </button>

                  <button className={styles.deleteBtn}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" style={{textAlign: 'center', padding: '20px'}}>
                Nenhum EPI encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default EpiTable;
