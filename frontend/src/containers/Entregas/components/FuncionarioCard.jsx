import React, { useMemo } from 'react';
import { User, Search, Calendar } from "lucide-react";
import styles from "../styles.module.css";

const FuncionarioCard = React.memo(({ 
  busca, 
  setBusca, 
  funcionariosFiltrados, 
  funcionarioSelecionado, 
  onSelecionar, 
  onLimpar,
  dataEntrega,
  setDataEntrega,
  responsavel
}) => {

  const getInitials = (name) => {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  };

  return (
    <aside className={styles.leftColumn}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <User size={18} />
          <h3>Identificação do Colaborador</h3>
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
                if (funcionarioSelecionado) onLimpar();
              }}
            />
            
            {/* DROPDOWN RESULTADOS */}
            {funcionariosFiltrados.length > 0 && (
              <div className={styles.searchResults}>
                {funcionariosFiltrados.map(f => (
                  <div 
                    key={f.id} 
                    className={styles.resultItem}
                    onClick={() => onSelecionar(f)}
                  >
                    <div className={styles.avatarSmall}>{getInitials(f.nome)}</div>
                    <div>
                      <div className={styles.resName}>{f.nome}</div>
                      <div className={styles.resRole}>{f.cargo}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CARD SELECIONADO */}
          {funcionarioSelecionado && (
            <div className={styles.employeeCard}>
              <div className={styles.avatarLarge}>
                {getInitials(funcionarioSelecionado.nome)}
              </div>
              <div className={styles.empInfo}>
                <h4>{funcionarioSelecionado.nome}</h4>
                <span className={styles.empDetail}>{funcionarioSelecionado.cargo}</span>
                <span className={styles.empDetail}>{funcionarioSelecionado.setor}</span>
              </div>
              <button onClick={onLimpar} className={styles.changeBtn}>
                Alterar
              </button>
            </div>
          )}

          {/* DADOS ADICIONAIS */}
          <div className={styles.infoGroup}>
            <label>Data da Entrega</label>
            <div className={styles.inputWrapper}>
              <Calendar size={16} className={styles.inputIcon} />
              <input 
                type="date" 
                value={dataEntrega}
                onChange={(e) => setDataEntrega(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.infoGroup}>
            <label>Responsável</label>
            <div className={styles.inputWrapper}>
              <User size={16} className={styles.inputIcon} />
              <input 
                type="text" 
                value={responsavel}
                readOnly
                className={styles.readOnly}
              />
            </div>
          </div>

        </div>
      </div>
    </aside>
  );
});

export default FuncionarioCard;
