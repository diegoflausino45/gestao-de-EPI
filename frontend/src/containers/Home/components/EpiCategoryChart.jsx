import React from 'react';
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import styles from "../styles.module.css";

const COLORS = ['#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#64748b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <div className={styles.tooltipHeader}>
           {label || payload[0].name}
        </div>
        <div className={styles.tooltipValue}>
          {payload[0].value} un
        </div>
      </div>
    );
  }
  return null;
};

// Memoized Component: Only re-renders if 'data' prop changes
const EpiCategoryChart = React.memo(({ data }) => {
  return (
    <div className={`${styles.bentoItem} ${styles.areaChartSec}`}>
      <div className={styles.cardHeader}>
        <h3>Por Categoria</h3>
      </div>
      
      <div style={{ width: "100%", height: "100%", minHeight: 200 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              label={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

export default EpiCategoryChart;