import React, { useEffect, useState } from 'react';
import { X, User, Package, Calendar, ShieldCheck } from "lucide-react";
import StatusBadge from "./StatusBadge";
import styles from "../modal.module.css";

const RelatorioModal = React.memo(({ data, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (data) {
      setIsVisible(true);
    }
  }, [data]);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  if (!data) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2>Detalhes da Movimentação</h2>
            <span className={styles.idBadge}>#{data.id}</span>
          </div>
          <button className={styles.closeBtn} onClick={handleClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.body}>
          {/* Status Banner */}
          <div className={`${styles.statusBanner} ${data.tipo === 'DEVOLUCAO' ? styles.devolucao : styles.entrega}`}>
             {data.tipo === 'DEVOLUCAO' ? 'DEVOLUÇÃO REALIZADA' : 'ENTREGA REALIZADA'}
          </div>

          <div className={styles.grid}>
             {/* Coluna 1: Funcionário */}
             <div className={styles.section}>
                <h3><User size={16}/> Colaborador</h3>
                <div className={styles.infoRow}>
                    <label>Nome:</label>
                    <span>{data.funcionario}</span>
                </div>
                <div className={styles.infoRow}>
                    <label>Setor:</label>
                    <span>{data.setor}</span>
                </div>
             </div>

             {/* Coluna 2: EPI */}
             <div className={styles.section}>
                <h3><Package size={16}/> Equipamento</h3>
                <div className={styles.infoRow}>
                    <label>Item:</label>
                    <span>{data.epi}</span>
                </div>
                <div className={styles.infoRow}>
                    <label>Quantidade:</label>
                    <span>{data.quantidade} un.</span>
                </div>
             </div>

             {/* Coluna 3: Log */}
             <div className={styles.section}>
                <h3><Calendar size={16}/> Registro</h3>
                <div className={styles.infoRow}>
                    <label>Data:</label>
                    <span>{new Date(data.dataEntrega).toLocaleDateString()}</span>
                </div>
                <div className={styles.infoRow}>
                    <label>Status:</label>
                    <StatusBadge status={data.status} />
                </div>
             </div>
          </div>

          {/* Área de Segurança / Assinatura */}
          <div className={styles.securityBox}>
             <div className={styles.securityIcon}>
                <ShieldCheck size={32} />
             </div>
             <div className={styles.securityInfo}>
                <h4>Assinatura Biométrica Validada</h4>
                <p>Autenticado via leitor biométrico em {new Date(data.dataEntrega).toLocaleDateString()} às 14:30 (simulado)</p>
                <small>Hash: 8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4</small>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
});

export default RelatorioModal;
