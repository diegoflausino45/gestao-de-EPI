import React from 'react';
import { Briefcase, CheckCircle, QrCode } from "lucide-react";
import styles from "../styles.module.css";
import BiometryWidget from "./BiometryWidget";

const IdentityCard = React.memo(({ user }) => {
  
  const getInitials = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <aside className={styles.identityCard}>
      <div className={styles.avatarWrapper}>
        {getInitials(user?.nome)}
      </div>
      
      <h2 className={styles.userName}>{user?.nome || "Usuário"}</h2>
      <div className={styles.userRole}>{user?.cargo || "Técnico de Segurança"}</div>

      <div className={styles.infoList}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>ID</span>
          <span className={styles.infoValue}>#8492</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Status</span>
          <span className={styles.infoValue} style={{color: '#16a34a'}}>Ativo</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Setor</span>
          <span className={styles.infoValue}>{user?.setor || "SESMT"}</span>
        </div>
      </div>

      <BiometryWidget />
    </aside>
  );
});

export default IdentityCard;
