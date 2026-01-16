import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileText, Printer } from "lucide-react";
import styles from "../styles.module.css";

const RelatorioHeader = React.memo(({ count, onExportCSV, onExportPDF, onPrint }) => {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setIsExportMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAction = (action) => {
      action();
      setIsExportMenuOpen(false);
  }

  return (
    <header className={styles.header}>
      <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <h1 style={{margin: 0}}>Relatórios Gerenciais</h1>
          <span className={styles.badge}>{count} registros</span>
      </div>
      
      {/* DROPDOWN DE EXPORTAÇÃO */}
      <div className={styles.exportWrapper} ref={exportMenuRef}>
          <button 
              className={styles.addBtn} 
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
          >
              <Download size={18} /> Exportar
              <ChevronDown size={16} style={{ marginLeft: '4px', transform: isExportMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }}/>
          </button>

          {isExportMenuOpen && (
              <div className={styles.dropdownMenu}>
                  <button onClick={() => handleAction(onExportCSV)} className={styles.dropdownItem}>
                      <FileText size={16} /> CSV (Excel)
                  </button>
                  <button onClick={() => handleAction(onExportPDF)} className={styles.dropdownItem}>
                      <FileText size={16} /> PDF (Documento)
                  </button>
                  <div className={styles.divider}></div>
                  <button onClick={() => handleAction(onPrint)} className={styles.dropdownItem}>
                      <Printer size={16} /> Imprimir
                  </button>
              </div>
          )}
      </div>
    </header>
  );
});

export default RelatorioHeader;
