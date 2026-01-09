import { FiArrowDown } from "react-icons/fi";
import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import relatorio from "./relatorio.module.css";

const API_URL = "http://localhost:3333";

function RelatorioTable() {
  return (
    <div className={relatorio.tableWrapper}>
      <div className={relatorio.header}>
        <h3>Filtros</h3>
      </div>

      <div className={relatorio.row}>
        <div className={`${relatorio.field} ${relatorio.periodo}`}>
          <label>Período</label>
          <div className={relatorio.periodoInputs}>
            <input type="date" className={relatorio.date} />
            <input type="date" className={relatorio.date} />
          </div>
        </div>
      </div>

      <div className={relatorio.row}>
        <div className={relatorio.field}>
          <label>Funcionário</label>
          <select>
            <option value="">- Selecione -</option>
          </select>
        </div>

        <div className={relatorio.field}>
          <label>Setor</label>
          <select>
            <option value="">- Selecione -</option>
          </select>
        </div>
      </div>

      <button className={relatorio.button}>Gerar Relatório</button>
    </div>
  );
}

export default function Relatorios() {
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/entregas`);
      setEntregas(await response.json());
    } catch (err) {
      alert("Erro ao carregar: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Relatórios</h1>
        <button className={styles.addBtn}>
          <FiArrowDown /> Exportar...
        </button>
      </header>

      <RelatorioTable />

      <br />

      {loading ? (
        <div className={styles.loading}>Carregando...</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Funcionário</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>EPI</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Quantidade</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Data</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>Observações</th>
              </tr>
            </thead>
            <tbody>
              {entregas.map(entrega => (
                <tr key={entrega.id}>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {entrega.funcionario?.nome || "N/A"}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {entrega.epi?.nome || "N/A"}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {entrega.quantidade}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {new Date(entrega.dataEntrega).toLocaleDateString()}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {entrega.observacoes || "---"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
