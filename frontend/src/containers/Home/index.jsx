import styles from "./styles.module.css";
import { AlertTriangle, Package, Users } from "lucide-react";
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { epiConsumptionData, epiCategoryData } from "../../data/dashboardMock";
import { alertsMock } from "../../data/alertsMock";
import { lastDeliveriesMock } from "../../data/lastDeliveriesMock";
import { useState, useEffect } from "react";
import { listarEpis, buscarSaldosErp } from "../../services/epiApi";

function StatCard({ title, value, icon, status = "default" }) {
  return (
    <div className={`${styles.card} ${styles[status]}`}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>

      <div className={styles.value}>{value}</div>
    </div>
  );
}

function EpiCategoryChart({ data }) {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <h3 style={{ marginBottom: 12 }}>EPIs por categoria</h3>

      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            label
            outerRadius={100}
          />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function EpiConsumptionChart({ data }) {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <h3 style={{ marginBottom: 12 }}>Consumo de EPIs por mês</h3>

      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="quantity" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function AlertsPanel({ alerts }) {
  return (
    <div className={styles.panel}>
      <h3 className={styles.titleAlerts}>Avisos e Alertas</h3>

      <ul className={styles.listAlerts}>
        {alerts.map((alert) => (
          <li
            key={alert.id}
            className={`${styles.alert} ${styles[alert.type]}`}
          >
            <strong>{alert.title}</strong>
            <span>{alert.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LastDeliveriesTable({ deliveries }) {
  return (
    <div className={styles.cardEntregas}>
      <h3 className={styles.titleEntregas}>Últimas Entregas</h3>

      <table className={styles.tableEntregas}>
        <thead>
          <tr>
            <th>Funcionário</th>
            <th>EPI</th>
            <th>Qtd</th>
            <th>Data</th>
          </tr>
        </thead>

        <tbody>
          {deliveries.map((item) => (
            <tr key={item.id}>
              <td>{item.employee}</td>
              <td>{item.epi}</td>
              <td>{item.quantity}</td>
              <td>{item.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalEstoque, setTotalEstoque] = useState(0);
  const [totalEpis, setTotalEpis] = useState(0);
  const [vencendo, setVencendo] = useState(0);
  const [vencidos, setVencidos] = useState(0);

  useEffect(() => {
    carregarMetricas();
  }, []);

  async function carregarMetricas() {
    try {
      setLoading(true);
      setError(null);

      // Carrega lista de EPIs (pode vir com validadeCA)
      const epis = await listarEpis();
      setTotalEpis(Array.isArray(epis) ? epis.length : 0);

      // Extrai códigos e busca saldos por lote (consulta ao ERP - E01)
      const codigos = (epis || []).map((e) => e.codigo).filter(Boolean);
      let saldos = [];
      if (codigos.length > 0) {
        saldos = await buscarSaldosErp(codigos);
      }

      // Soma saldos retornados
      const somaTotal = (saldos || []).reduce(
        (acc, s) => acc + (s.saldo || 0),
        0
      );
      setTotalEstoque(somaTotal);

      // Calcula vencidos / vencendo (prazo em dias)
      const hoje = new Date();
      const PRAZO_VENCENDO_DIAS = 30; // ajustar conforme regra de negócio
      const limiteVencendo = new Date();
      limiteVencendo.setDate(hoje.getDate() + PRAZO_VENCENDO_DIAS);

      let countVencidos = 0;
      let countVencendo = 0;

      (epis || []).forEach((e) => {
        const dataVal = e.validadeCA ? new Date(e.validadeCA) : null;
        if (dataVal) {
          if (dataVal < hoje) countVencidos += 1;
          else if (dataVal <= limiteVencendo) countVencendo += 1;
        }
      });

      setVencidos(countVencidos);
      setVencendo(countVencendo);
    } catch (err) {
      console.error("Erro ao carregar métricas:", err);
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.home}>
        <div className={styles.loadingMessage}>Carregando métricas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.home}>
        <div className={styles.errorMessage}>Erro: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.home}>
      <div className={styles.cardsGrid}>
        <StatCard
          title="EPIs em Estoque"
          value={totalEstoque}
          icon={<Package />}
          status="success"
        />

        <StatCard
          title="EPIs Vencendo"
          value={vencendo}
          icon={<AlertTriangle />}
          status="warning"
        />

        <StatCard
          title="EPIs Vencidos"
          value={vencidos}
          icon={<AlertTriangle />}
          status="danger"
        />

        <StatCard
          title="Funcionários sem EPI"
          value={0}
          icon={<Users />}
          status="danger"
        />
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <EpiConsumptionChart data={epiConsumptionData} />
        </div>

        <div className={styles.chartCard}>
          <EpiCategoryChart data={epiCategoryData} />
        </div>
      </div>

      <div className={styles.bottomGrid}>
        <AlertsPanel alerts={alertsMock} />
        <LastDeliveriesTable deliveries={lastDeliveriesMock} />
      </div>
    </div>
  );
}

export default Home;
