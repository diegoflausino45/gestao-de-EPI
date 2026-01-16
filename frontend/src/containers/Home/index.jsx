import styles from "./styles.module.css";
import { 
  AlertTriangle, 
  Package, 
  Users, 
  PackagePlus, 
  RotateCcw, 
  TrendingDown, 
  Calendar,
  ChevronRight,
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight
} from "lucide-react";
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
  Cell,
} from "recharts";

import { epiConsumptionData, epiCategoryData } from "../../data/dashboardMock";
import { alertsMock } from "../../data/alertsMock";
import { lastDeliveriesMock } from "../../data/lastDeliveriesMock";
import { useState, useEffect, useRef } from "react";
import { listarEpis, buscarSaldosErp } from "../../services/epiApi";

const COLORS = ['#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#64748b'];

function StatCard({ title, value, icon, status = "info" }) {
  return (
    <div className={`${styles.card} ${styles[status]}`}>
      <div className={styles.cardIcon}>
        {icon}
      </div>
      <div className={styles.cardInfo}>
        <span className={styles.cardTitle}>{title}</span>
        <span className={styles.cardValue}>{value}</span>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <div className={styles.tooltipHeader}>
           {label || payload[0].name}
        </div>
        <div className={styles.tooltipBody}>
          <span className={styles.tooltipLabel}>Quantidade:</span>
          <span className={styles.tooltipValue}>
            {payload[0].value} un
          </span>
        </div>
      </div>
    );
  }
  return null;
};

function EpiCategoryChart({ data }) {
  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3>EPIs por Categoria</h3>
      </div>
      
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const PERIOD_OPTIONS = [
  { value: "3m", label: "Últimos 3 meses" },
  { value: "6m", label: "Últimos 6 meses" },
  { value: "12m", label: "Este ano" },
];

function EpiConsumptionChart({ data }) {
  const [period, setPeriod] = useState(PERIOD_OPTIONS[1]); // Default 6m
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3>Consumo de EPIs</h3>
        
        {/* Custom Dropdown */}
        <div className={styles.dropdownContainer} ref={dropdownRef}>
          <button 
            type="button" 
            className={`${styles.dropdownButton} ${isOpen ? styles.active : ''}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <span>{period.label}</span>
            <ChevronDown size={16} color="var(--gray-500)" />
          </button>

          {isOpen && (
            <div className={styles.dropdownMenu}>
              {PERIOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.dropdownItem} ${period.value === option.value ? styles.selected : ''}`}
                  onClick={() => {
                    setPeriod(option);
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#64748b', fontSize: 12}}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#64748b', fontSize: 12}}
            />
            <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
            <Bar 
              dataKey="quantity" 
              fill="var(--primary-color)" 
              radius={[4, 4, 0, 0]} 
              barSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TimelineFeed({ activities }) {
  return (
    <div className={styles.timelinePanel}>
      <h3 className={styles.titleAlerts}>Atividades Recentes</h3>
      <div className={styles.timelineList}>
        {activities.map((activity, index) => (
          <div key={index} className={styles.timelineItem}>
            <div className={styles.timelineLine}></div>
            <div className={`${styles.timelineDot} ${styles[activity.type]}`}>
               {activity.type === 'success' && <CheckCircle size={14} />}
               {activity.type === 'warning' && <AlertTriangle size={14} />}
               {activity.type === 'danger' && <XCircle size={14} />}
               {activity.type === 'info' && <Clock size={14} />}
            </div>
            <div className={styles.timelineContent}>
              <span className={styles.timelineTime}>{activity.time}</span>
              <p className={styles.timelineText}>
                <strong>{activity.title}</strong> {activity.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LastDeliveriesTable({ deliveries }) {
  return (
    <div className={styles.cardEntregas}>
      <div className={styles.tableHeaderAction}>
        <h3 className={styles.titleEntregas}>Últimas Entregas</h3>
        <button className={styles.outlineBtn}>
          Ver todas <ArrowRight size={16} className={styles.btnIcon} />
        </button>
      </div>

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
          {deliveries.slice(0, 5).map((item) => (
            <tr key={item.id}>
              <td className={styles.empName}>{item.employee}</td>
              <td>
                <div className={styles.stackedBadges}>
                    <span className={styles.badge}>{item.epi}</span>
                    {/* Exemplo de badge empilhado se houvesse mais itens */}
                    {/* <span className={styles.badgeCount}>+2</span> */}
                </div>
              </td>
              <td>{item.quantity}</td>
              <td>{item.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Mock de Atividades
const activitiesMock = [
  { type: 'success', time: '10:42', title: 'Entrega Realizada', description: 'Luva de Vaqueta para João Silva' },
  { type: 'warning', time: '10:15', title: 'Estoque Baixo', description: 'Capacete MSA atingiu nível mínimo' },
  { type: 'info', time: '09:30', title: 'Login', description: 'Usuário Admin acessou o sistema' },
  { type: 'danger', time: 'Ontem', title: 'Devolução Recusada', description: 'Bota de Segurança (Dano)' },
];

function HomeSkeleton() {
  return (
    <div className={styles.home}>
      <div className={styles.headerControls}>
        <div>
          <div className={`${styles.skeleton} ${styles.skeletonHeader}`}></div>
          <div className={`${styles.skeleton} ${styles.skeletonSub}`}></div>
        </div>
      </div>

      <div className={styles.cardsGrid}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`${styles.skeleton} ${styles.skeletonCard}`}></div>
        ))}
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.leftColumn}>
          <div className={`${styles.skeleton} ${styles.skeletonChart}`}></div>
          <div className={`${styles.skeleton} ${styles.skeletonChart}`} style={{height: '250px'}}></div>
        </div>
        <div className={styles.rightColumn}>
          <div className={`${styles.skeleton} ${styles.skeletonTimeline}`}></div>
        </div>
      </div>
    </div>
  );
}

function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      setError(null);

      // Delay artificial de 5 segundos para visualizar o skeleton
      await new Promise(resolve => setTimeout(resolve, 5000));

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

      // Calcula Ruptura
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
      console.error("Erro ao carregar métricas:", err);
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <HomeSkeleton />;
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
      {/* Header com Ações Rápidas */}
      <div className={styles.headerControls}>
        <div className={styles.welcomeSection}>
          <h1>Dashboard</h1>
          <p>Visão geral de estoque e movimentações</p>
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

      {/* Grid de KPIs */}
      <div className={styles.cardsGrid}>
        <StatCard
          title="Itens em Estoque"
          value={totalEstoque}
          icon={<Package size={24} />}
          status="info"
        />

        <StatCard
          title="Abaixo do Mínimo"
          value={ruptura}
          icon={<TrendingDown size={24} />}
          status={ruptura > 0 ? "danger" : "success"}
        />

        <StatCard
          title="EPIs Vencendo"
          value={vencendo}
          icon={<Calendar size={24} />}
          status="warning"
        />

        <StatCard
          title="EPIs Vencidos"
          value={vencidos}
          icon={<AlertTriangle size={24} />}
          status="danger"
        />
      </div>

      {/* Layout Principal: Esquerda (Gráficos) + Direita (Timeline) */}
      <div className={styles.mainLayout}>
        
        <div className={styles.leftColumn}>
          {/* Gráfico Principal */}
          <div className={styles.chartSection}>
             <EpiConsumptionChart data={epiConsumptionData} />
          </div>

          {/* Tabelas e Alertas Secundários */}
          <div className={styles.tablesGrid}>
             <LastDeliveriesTable deliveries={lastDeliveriesMock} />
          </div>
        </div>

        <div className={styles.rightColumn}>
          {/* Nova Timeline Lateral */}
          <TimelineFeed activities={activitiesMock} />
          
          {/* Gráfico Secundário (Categoria) pode virar um widget menor aqui */}
          <div style={{marginTop: '24px'}}>
            <EpiCategoryChart data={epiCategoryData} />
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;