import React, { useState, useRef, useEffect } from 'react';
import { User, Search, Calendar, ChevronDown, Activity, CalendarClock, AlertTriangle, UserX, RefreshCw } from "lucide-react";
import styles from "../styles.module.css";

export const MOTIVOS = [
  { value: "Desgaste Natural", label: "Desgaste Natural", icon: Activity },
  { value: "Vencimento CA", label: "Vencimento do CA", icon: CalendarClock },
  { value: "Danificado", label: "Danificado em Operação", icon: AlertTriangle },
  { value: "Desligamento", label: "Desligamento/Demissão", icon: UserX },
  { value: "Troca", label: "Troca de Tamanho/Modelo", icon: RefreshCw }
];

const DevolucaoContextCard = React.memo(({
  busca,
  setBusca,
  funcionariosFiltrados,
  funcionarioSelecionado,
  onSelecionarFuncionario,
  onLimparFuncionario,
  dataDevolucao,
  setDataDevolucao,
  motivoSelecionado,
  setMotivoSelecionado,
  observacaoGeral,
  setObservacaoGeral
}) => {
  const [isMotivoOpen, setIsMotivoOpen] = useState(false);
  const motivoDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (motivoDropdownRef.current && !motivoDropdownRef.current.contains(event.target)) {
        setIsMotivoOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  };

  const MotivoIcon = motivoSelecionado.icon;

  return (
    <aside className={styles.leftColumn}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <User size={18} />
          <h3>Identificação e Motivo</h3>
        </div>
        <div className={styles.cardBody}>
          
          {/* BUSCA */}
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <input 
              type="text" 
              className={styles.searchInput}
              placeholder="Buscar funcionário..."
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                if (funcionarioSelecionado) onLimparFuncionario();
              }}
            />
            
            {/* Resultados da Busca */}
            {funcionariosFiltrados.length > 0 && (
              <div className={styles.searchResults}>
                {funcionariosFiltrados.map(f => (
                  <div 
                    key={f.id} 
                    className={styles.searchResultItem}
                    onClick={() => onSelecionarFuncionario(f)}
                  >
                    <div className={styles.avatarSmall}>
                      {getInitials(f.nome)}
                    </div>
                    <div>
                      <div className={styles.resName}>{f.nome}</div>
                      <div className={styles.resRole}>{f.cargo} • {f.setor}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CARD DO FUNCIONÁRIO SELECIONADO */}
          {funcionarioSelecionado && (
            <div className={styles.employeeCard}>
              <div className={styles.avatarLarge}>
                {getInitials(funcionarioSelecionado.nome)}
              </div>
              <div className={styles.employeeInfo}>
                <h4>{funcionarioSelecionado.nome}</h4>
                <span className={styles.empDetail}>{funcionarioSelecionado.cargo}</span>
                <span className={styles.empDetail}>{funcionarioSelecionado.setor}</span>
              </div>
              <button onClick={onLimparFuncionario} className={styles.changeBtn}>
                Alterar
              </button>
            </div>
          )}

          {/* CAMPOS ADICIONAIS */}
          <div className={styles.formGroup}>
            <label>Data da Devolução</label>
            <div className={styles.inputIconWrapper}>
              <Calendar className={styles.inputIcon} size={16} />
              <input 
                type="date" 
                value={dataDevolucao}
                onChange={(e) => setDataDevolucao(e.target.value)}
              />
            </div>
          </div>

          {/* DROPDOWN RICO DE MOTIVO */}
          <div className={styles.formGroup} ref={motivoDropdownRef}>
            <label>Motivo</label>
            <div className={styles.dropdownContainer}>
              <button 
                type="button" 
                className={`${styles.dropdownButton} ${isMotivoOpen ? styles.active : ''}`}
                onClick={() => setIsMotivoOpen(!isMotivoOpen)}
              >
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <MotivoIcon size={16} className={styles.dropdownIconLeft} />
                  <span style={{marginLeft: '2px'}}>{motivoSelecionado.label}</span>
                </div>
                <ChevronDown size={16} color="#64748b" />
              </button>

              {isMotivoOpen && (
                <div className={styles.dropdownMenu}>
                  {MOTIVOS.map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.value}
                        type="button"
                        className={`${styles.dropdownItem} ${motivoSelecionado.value === m.value ? styles.selected : ''}`}
                        onClick={() => {
                          setMotivoSelecionado(m);
                          setIsMotivoOpen(false);
                        }}
                      >
                        <div className={styles.listIconWrapper}>
                          <Icon size={16} />
                        </div>
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Observações Gerais</label>
            <textarea 
              rows="3" 
              placeholder="Informações adicionais sobre a devolução..."
              value={observacaoGeral}
              onChange={(e) => setObservacaoGeral(e.target.value)}
            />
          </div>

        </div>
      </div>
    </aside>
  );
});

export default DevolucaoContextCard;
