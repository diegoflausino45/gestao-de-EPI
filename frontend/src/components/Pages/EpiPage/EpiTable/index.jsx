import styles from "./styles.module.css";

function EpiTable({ dados, onEdit }) {
  return (
    <div className={styles.tableWrapper}>
      <table>
        <thead>
          <tr>
            <th className={styles.estoque}>Código</th>
            <th className={styles.estoque}>Nome</th>
            <th className={styles.estoque}>Tipo</th>
            <th className={styles.validadeCA}>Validade CA</th>
            <th className={styles.estoque}>Estoque Atual</th>
            <th className={styles.estoque}>Estoque Mínimo</th>
            <th className={styles.estoque}>Status</th>
            <th className={styles.estoque}>Ações</th>
          </tr>
        </thead>

        <tbody>
          {dados && dados.length > 0 ? (
            dados.map((f) => (
              <tr key={f.id}>
                <td>{f.codigo || "-"}</td>
                <td>{f.nome || "-"}</td>
                <td>{f.tipo || "-"}</td>
                <td className={styles.estoque}>
                  {f.validadeCA
                    ? new Date(f.validadeCA).toLocaleDateString("pt-BR")
                    : "-"}
                </td>
                <td className={styles.estoque}>{f.estoqueAtual ?? 0}</td>
                <td className={styles.estoque}>{f.estoqueMinimo ?? 0}</td>
                <td>
                  <span
                    className={`${styles.status} ${
                      styles[
                        f.status?.toLowerCase().replace(/\s/g, "-") || "ok"
                      ]
                    }`}
                  >
                    {f.status || "OK"}
                  </span>
                </td>

                <td className={styles.actions}>
                  <button className={styles.editBtn} onClick={() => onEdit(f)}>
                    Editar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
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
