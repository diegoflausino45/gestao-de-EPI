import styles from "./styles.module.css";
import {AlertTriangle, Package, Users} from "lucide-react";
import {PieChart, Pie, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid} from "recharts";

import { epiConsumptionData, epiCategoryData } from "../../data/dashboardMock";
import { alertsMock } from "../../data/alertsMock";
import { lastDeliveriesMock } from "../../data/lastDeliveriesMock";

function StatCard({title, value, icon, status = "default"}) {
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
    return (
        <div className={styles.home}>
            <div className={styles.cardsGrid}>
                <StatCard
                    title="EPIs em Estoque"
                    value={325}
                    icon={<Package />}
                    status="success"
                />

                <StatCard
                    title="EPIs Vencendo"
                    value={12}
                    icon={<AlertTriangle />}
                    status="warning"
                />

                <StatCard
                    title="EPIs Vencidos"
                    value={5}
                    icon={<AlertTriangle />}
                    status="danger"
                />

                <StatCard
                    title="Funcionários sem EPI"
                    value={8}
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
    )
}

export default Home