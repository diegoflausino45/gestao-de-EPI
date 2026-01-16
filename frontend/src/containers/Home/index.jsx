import { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Package, 
  PackagePlus, 
  RotateCcw, 
  TrendingDown, 
  Calendar,
} from "lucide-react";

import styles from "./styles.module.css";

// Components
import StatCard from "./components/StatCard";
import EpiConsumptionChart from "./components/EpiConsumptionChart";
import EpiCategoryChart from "./components/EpiCategoryChart";
import TimelineFeed from "./components/TimelineFeed";
import LastDeliveriesTable from "./components/LastDeliveriesTable";

// Mocks & Services
import { epiConsumptionData, epiCategoryData } from "../../data/dashboardMock";
import { lastDeliveriesMock } from "../../data/lastDeliveriesMock";
import { listarEpis, buscarSaldosErp } from "../../services/epiApi";

// Mock de Atividades
const activitiesMock = [
  { type: 'success', time: '10:42', title: 'Entrega: Luva de Vaqueta para João Silva' },
  { type: 'warning', time: '10:15', title: 'Alerta: Capacete MSA atingiu estoque mínimo' },
  { type: 'info', time: '09:30', title: 'Login: Admin acessou o sistema' },
  { type: 'danger', time: 'Ontem', title: 'Devolução recusada: Bota Danificada' },
  { type: 'success', time: 'Ontem', title: 'Entrega: Bota nº 42 para Marcos' },
  { type: 'info', time: 'Ontem', title: 'Sistema: Backup automático realizado' },
  { type: 'warning', time: '15/01', title: 'Vencimento: 3 EPIs vencem amanhã' },
];

function Home() {
  const [loading, setLoading] = useState(true);
  const [totalEstoque, setTotalEstoque] = useState(0);
  const [ruptura, setRuptura] = useState(0);
  const [vencendo, setVencendo] = useState(0);
  const [vencidos, setVencidos] = useState(0);

  useEffect(() => {
    carregarMetricas();
  }, []);

  async function carregarMetricas() {
    try {
      setLoading(true);
      
      const epis = await listarEpis();
      
      const codigos = (epis || []).map((e) => e.codigo).filter(Boolean);
      let saldos = [];
      if (codigos.length > 0) {
        saldos = await buscarSaldosErp(codigos);
      }

      const somaTotal = (saldos || []).reduce(
        (acc, s) => acc + (s.saldo || 0),
        0
      );
      setTotalEstoque(somaTotal);

      let countRuptura = 0;
      (epis || []).forEach(e => {
        const saldoEpi = (saldos || []).find(s => s.codigo === e.codigo)?.saldo || 0;
        if (e.estoqueMinimo && saldoEpi < e.estoqueMinimo) {
          countRuptura += 1;
        }
      });
      setRuptura(countRuptura);

      const hoje = new Date();
      const PRAZO_VENCENDO_DIAS = 30;
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
      console.error("Erro:", err);
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

  return (
    <div className={styles.home}>
      {/* Header */}
      <div className={styles.headerControls}>
        <div className={styles.welcomeSection}>
          <h1>Dashboard</h1>
          <p>Visão geral de estoque e operações</p>
        </div>
        
        <div className={styles.actionButtons}>
          <button className={styles.secondaryBtn}>
            <RotateCcw size={18} /> Devolução
          </button>
          <button className={styles.primaryBtn}>
            <PackagePlus size={18} /> Nova Entrega
          </button>
        </div>
      </div>

      {/* BENTO GRID */}
      <div className={styles.bentoGrid}>
        
        {/* Linha 1: KPIs */}
        <StatCard
          gridArea={styles.areaKpi1}
          title="Itens em Estoque"
          value={totalEstoque}
          icon={<Package size={24} />}
          status="info"
        />

        <StatCard
          gridArea={styles.areaKpi2}
          title="Abaixo do Mínimo"
          value={ruptura}
          icon={<TrendingDown size={24} />}
          status={ruptura > 0 ? "danger" : "success"}
        />

        <StatCard
          gridArea={styles.areaKpi3}
          title="EPIs Vencendo"
          value={vencendo}
          icon={<Calendar size={24} />}
          status="warning"
        />

        <StatCard
          gridArea={styles.areaKpi4}
          title="EPIs Vencidos"
          value={vencidos}
          icon={<AlertTriangle size={24} />}
          status="danger"
        />

        {/* Blocos Maiores */}
        <EpiConsumptionChart data={epiConsumptionData} />
        
        <TimelineFeed activities={activitiesMock} />
        
        <LastDeliveriesTable deliveries={lastDeliveriesMock} />
        
        <EpiCategoryChart data={epiCategoryData} />

      </div>
    </div>
  );
}

export default Home;
