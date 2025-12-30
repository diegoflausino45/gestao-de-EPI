import StatCard from "../../components/Cards/StatCard";
import styles from "./styles.module.css";
import {
    AlertTriangle,
    Package,
    Users
} from "lucide-react";
import EpiConsumptionChart from "../../components/Graficos/EpiConsumptionChart";
import EpiCategoryChart from "../../components/Graficos/EpiCategoryChart";
import { epiConsumptionData, epiCategoryData } from "../../data/dashboardMock";

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
        </div>
    )
}

export default Home