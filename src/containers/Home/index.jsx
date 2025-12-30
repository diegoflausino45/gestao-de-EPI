import StatCard from "../../components/Cards/StatCard";
import styles from "./styles.module.css";
import {
    AlertTriangle,
    Package,
    Users
} from "lucide-react";

function Home() {
    return (
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
    )
}

export default Home