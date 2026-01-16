import React, { useState, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown } from "lucide-react";
import styles from "../styles.module.css";

const PERIOD_OPTIONS = [
  { value: "3m", label: "3 Meses" },
  { value: "6m", label: "6 Meses" },
  { value: "12m", label: "Este Ano" },
];

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

// Memoized Component
const EpiConsumptionChart = React.memo(({ data }) => {
  const [period, setPeriod] = useState(PERIOD_OPTIONS[1]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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
    <div className={`${styles.bentoItem} ${styles.areaChartMain}`}>
      <div className={styles.cardHeader}>
        <h3>Consumo de EPIs</h3>
        
        <div className={styles.dropdownContainer} ref={dropdownRef}>
          <button 
            type="button" 
            className={styles.dropdownButton}
            onClick={() => setIsOpen(!isOpen)}
          >
            <span>{period.label}</span>
            <ChevronDown size={14} />
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

      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94a3b8', fontSize: 12, fontFamily: 'Outfit'}}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94a3b8', fontSize: 12, fontFamily: 'Outfit'}}
            />
            <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc', radius: 4}} />
            <Bar 
              dataKey="quantity" 
              fill="url(#colorGradient)" 
              radius={[6, 6, 0, 0]} 
              barSize={40}
            >
               <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary-color)" stopOpacity={1}/>
                  <stop offset="100%" stopColor="var(--primary-color)" stopOpacity={0.6}/>
                </linearGradient>
              </defs>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

export default EpiConsumptionChart;