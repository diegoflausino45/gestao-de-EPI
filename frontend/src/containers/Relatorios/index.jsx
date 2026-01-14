import { useState, useEffect, useMemo, useRef } from "react";
import { Download, Filter, Search, ChevronDown, FileText, Printer, Eye, X, User, Package, Calendar, ShieldCheck } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import styles from "./styles.module.css";
import relatorioStyles from "./relatorio.module.css";
import modalStyles from "./modal.module.css";

// Importando Mock (ou definindo um expandido aqui para testes)
import { relatorioMock } from "../../data/relatorioMock";

// Mock expandido para testes mais robustos
const MOCK_DATA = [
  ...relatorioMock,
  { id: 101, funcionario: "Carlos Mendes", setor: "Logística", epi: "Bota de Segurança", quantidade: 1, dataEntrega: "2024-12-01", status: "Ativa", tipo: "ENTREGA" },
  { id: 102, funcionario: "Ana Paula", setor: "Administrativo", epi: "Protetor Auricular", quantidade: 5, dataEntrega: "2024-12-15", status: "Vencendo", tipo: "ENTREGA" },
  { id: 103, funcionario: "João Silva", setor: "Produção", epi: "Luva de Malha", quantidade: 2, dataEntrega: "2024-11-10", status: "Devolvida", tipo: "DEVOLUCAO" },
  { id: 104, funcionario: "Roberto Costa", setor: "Manutenção", epi: "Cinto Paraquedista", quantidade: 1, dataEntrega: "2024-01-10", status: "Vencida", tipo: "ENTREGA" },
];

export default function Relatorios() {
  const [activeTab, setActiveTab] = useState("movimentacoes"); // movimentacoes | vencimentos
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    funcionario: "",
    setor: "",
  });
  
  // Estado para controlar o menu dropdown
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef(null);
  
  // Estado para o Modal de Detalhes
  const [selectedMovimentacao, setSelectedMovimentacao] = useState(null);

  // Fechar o menu se clicar fora
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
  
  // Dados filtrados "vivos"
  const filteredData = useMemo(() => {
    return MOCK_DATA.filter(item => {
      // Filtro de Aba
      if (activeTab === "vencimentos") {
        if (item.status !== "Vencendo" && item.status !== "Vencida") return false;
      }

      // Filtros de Usuário
      if (filters.funcionario && !item.funcionario.toLowerCase().includes(filters.funcionario.toLowerCase())) return false;
      if (filters.setor && item.setor !== filters.setor) return false;
      
      // Filtro de Data
      if (filters.startDate || filters.endDate) {
        const itemDate = new Date(item.dataEntrega);
        if (filters.startDate && itemDate < new Date(filters.startDate)) return false;
        if (filters.endDate && itemDate > new Date(filters.endDate)) return false;
      }

      return true;
    });
  }, [filters, activeTab]);

  // Função de Exportação CSV
  const handleExportCSV = () => {
    const headers = ["ID", "Funcionário", "Setor", "EPI", "Quantidade", "Data", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredData.map(row => 
        `${row.id},"${row.funcionario}","${row.setor}","${row.epi}",${row.quantidade},${row.dataEntrega},${row.status}`
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_${activeTab}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportMenuOpen(false);
  };

  // Função de Exportação PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text("Relatório de Gestão de EPIs", 14, 22);
    
    // Subtítulo e Data
    doc.setFontSize(11);
    doc.setTextColor(100);
    const tipoRelatorio = activeTab === 'movimentacoes' ? 'Histórico de Movimentações' : 'Alertas de Vencimento';
    doc.text(`${tipoRelatorio} - Gerado em: ${new Date().toLocaleDateString()}`, 14, 30);

    // Filtros Aplicados (Opcional, mas útil)
    let filterText = "Filtros: ";
    if (filters.setor) filterText += `Setor: ${filters.setor} | `; 
    if (filters.startDate) filterText += `De: ${new Date(filters.startDate).toLocaleDateString()} | `; 
    if (filters.endDate) filterText += `Até: ${new Date(filters.endDate).toLocaleDateString()}`;
    if (filterText === "Filtros: ") filterText += "Nenhum filtro aplicado";
    
    doc.setFontSize(10);
    doc.text(filterText, 14, 38);

    // Configuração da Tabela
    const tableColumn = ["Data", "Tipo", "Funcionário", "Setor", "EPI", "Qtd", "Status"];
    const tableRows = [];

    filteredData.forEach(item => {
      const rowData = [
        new Date(item.dataEntrega).toLocaleDateString(),
        item.tipo || 'ENTREGA',
        item.funcionario,
        item.setor,
        item.epi,
        item.quantidade,
        item.status
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 }, // Azul padrão
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    doc.save(`relatorio_${activeTab}_${new Date().toISOString().slice(0,10)}.pdf`);
    setIsExportMenuOpen(false);
  };

  // Função de Impressão (Gera PDF e abre janela de impressão)
  const handlePrint = () => {
    const doc = new jsPDF();
    
    // ... Mesma lógica de geração do PDF ...
    doc.setFontSize(18);
    doc.text("Relatório de Gestão de EPIs", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    const tipoRelatorio = activeTab === 'movimentacoes' ? 'Histórico de Movimentações' : 'Alertas de Vencimento';
    doc.text(`${tipoRelatorio} - Gerado em: ${new Date().toLocaleDateString()}`, 14, 30);
    
    const tableColumn = ["Data", "Tipo", "Funcionário", "Setor", "EPI", "Qtd", "Status"];
    const tableRows = filteredData.map(item => [
      new Date(item.dataEntrega).toLocaleDateString(),
      item.tipo || 'ENTREGA',
      item.funcionario,
      item.setor,
      item.epi,
      item.quantidade,
      item.status
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
    });

    // Abre a janela de impressão nativa do navegador com o PDF gerado
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
    setIsExportMenuOpen(false);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <h1 style={{margin: 0}}>Relatórios Gerenciais</h1>
            <span className={styles.badge}>{filteredData.length} registros</span>
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
                    <button onClick={handleExportCSV} className={styles.dropdownItem}>
                        <FileText size={16} /> CSV (Excel)
                    </button>
                    <button onClick={handleExportPDF} className={styles.dropdownItem}>
                        <FileText size={16} /> PDF (Documento)
                    </button>
                    <div className={styles.divider}></div>
                    <button onClick={handlePrint} className={styles.dropdownItem}>
                        <Printer size={16} /> Imprimir
                    </button>
                </div>
            )}
        </div>
      </header>

      {/* --- ABAS --- */}
      <div className={relatorioStyles.tabs}>
        <button 
            className={`${relatorioStyles.tab} ${activeTab === 'movimentacoes' ? relatorioStyles.active : ''}`}
            onClick={() => setActiveTab('movimentacoes')}
        >
            Histórico de Movimentações
        </button>
        <button 
            className={`${relatorioStyles.tab} ${activeTab === 'vencimentos' ? relatorioStyles.active : ''}`}
            onClick={() => setActiveTab('vencimentos')}
        >
            Alertas de Vencimento
        </button>
      </div>

      {/* --- ÁREA DE FILTROS --- */}
      <div className={relatorioStyles.tableWrapper}>
        <div className={relatorioStyles.header}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <Filter size={16} color="#666"/>
            <h3>Filtros Avançados</h3>
          </div>
        </div>

        <div className={relatorioStyles.filterGrid}>
          
          <div className={relatorioStyles.field}>
            <label>Período</label>
            <div className={relatorioStyles.periodoInputs}>
              <div className={relatorioStyles.inputIcon}>
                <input 
                    type="date" 
                    name="startDate"
                    value={filters.startDate} 
                    onChange={handleFilterChange} 
                />
              </div>
              <span style={{alignSelf: 'center', color: '#999'}}>até</span>
              <div className={relatorioStyles.inputIcon}>
                 <input 
                    type="date" 
                    name="endDate"
                    value={filters.endDate} 
                    onChange={handleFilterChange} 
                />
              </div>
            </div>
          </div>

          <div className={relatorioStyles.field}>
            <label>Funcionário</label>
            <div className={relatorioStyles.inputIconWrapper}>
                <Search size={16} className={relatorioStyles.icon} />
                <input 
                    placeholder="Buscar por nome..." 
                    name="funcionario"
                    value={filters.funcionario}
                    onChange={handleFilterChange}
                    className={relatorioStyles.inputWithIcon}
                />
            </div>
          </div>

          <div className={relatorioStyles.field}>
            <label>Setor</label>
            <select name="setor" value={filters.setor} onChange={handleFilterChange}>
              <option value="">Todos os Setores</option>
              <option value="Produção">Produção</option>
              <option value="Administrativo">Administrativo</option>
              <option value="Logística">Logística</option>
              <option value="Manutenção">Manutenção</option>
              <option value="Segurança do Trabalho">Segurança do Trabalho</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- TABELA DE RESULTADOS --- */}
      <div className={relatorioStyles.resultsCard}>
        <table className={relatorioStyles.table}>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Funcionário</th>
                    <th>Setor</th>
                    <th>EPI</th>
                    <th>Qtd</th>
                    <th>Status</th>
                    <th style={{width: '60px'}}></th> {/* Coluna de Ações */}
                </tr>
            </thead>
            <tbody>
                {filteredData.length > 0 ? (
                    filteredData.map(item => (
                        <tr key={item.id}>
                            <td>{new Date(item.dataEntrega).toLocaleDateString()}</td>
                            <td>
                                <span className={item.tipo === 'DEVOLUCAO' ? relatorioStyles.tagDevolucao : relatorioStyles.tagEntrega}>
                                    {item.tipo || 'ENTREGA'}
                                </span>
                            </td>
                            <td><strong>{item.funcionario}</strong></td>
                            <td>{item.setor}</td>
                            <td>{item.epi}</td>
                            <td>{item.quantidade}</td>
                            <td>
                                <StatusBadge status={item.status} />
                            </td>
                            <td>
                                <button 
                                  className={relatorioStyles.actionBtn}
                                  onClick={() => setSelectedMovimentacao(item)}
                                  title="Ver Detalhes"
                                >
                                  <Eye size={18} />
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="8" style={{textAlign: 'center', padding: '32px', color: '#999'}}>
                            Nenhum registro encontrado para os filtros selecionados.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      {/* --- MODAL DE DETALHES --- */}
      {selectedMovimentacao && (
        <div className={modalStyles.overlay} onClick={() => setSelectedMovimentacao(null)}>
          <div className={modalStyles.modal} onClick={e => e.stopPropagation()}>
            <div className={modalStyles.header}>
              <div>
                <h2>Detalhes da Movimentação</h2>
                <span className={modalStyles.idBadge}>#{selectedMovimentacao.id}</span>
              </div>
              <button className={modalStyles.closeBtn} onClick={() => setSelectedMovimentacao(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className={modalStyles.body}>
              {/* Status Banner */}
              <div className={`${modalStyles.statusBanner} ${selectedMovimentacao.tipo === 'DEVOLUCAO' ? modalStyles.devolucao : modalStyles.entrega}`}>
                 {selectedMovimentacao.tipo === 'DEVOLUCAO' ? 'DEVOLUÇÃO REALIZADA' : 'ENTREGA REALIZADA'}
              </div>

              <div className={modalStyles.grid}>
                 {/* Coluna 1: Funcionário */}
                 <div className={modalStyles.section}>
                    <h3><User size={16}/> Colaborador</h3>
                    <div className={modalStyles.infoRow}>
                        <label>Nome:</label>
                        <span>{selectedMovimentacao.funcionario}</span>
                    </div>
                    <div className={modalStyles.infoRow}>
                        <label>Setor:</label>
                        <span>{selectedMovimentacao.setor}</span>
                    </div>
                 </div>

                 {/* Coluna 2: EPI */}
                 <div className={modalStyles.section}>
                    <h3><Package size={16}/> Equipamento</h3>
                    <div className={modalStyles.infoRow}>
                        <label>Item:</label>
                        <span>{selectedMovimentacao.epi}</span>
                    </div>
                    <div className={modalStyles.infoRow}>
                        <label>Quantidade:</label>
                        <span>{selectedMovimentacao.quantidade} un.</span>
                    </div>
                 </div>

                 {/* Coluna 3: Log */}
                 <div className={modalStyles.section}>
                    <h3><Calendar size={16}/> Registro</h3>
                    <div className={modalStyles.infoRow}>
                        <label>Data:</label>
                        <span>{new Date(selectedMovimentacao.dataEntrega).toLocaleDateString()}</span>
                    </div>
                    <div className={modalStyles.infoRow}>
                        <label>Status:</label>
                        <StatusBadge status={selectedMovimentacao.status} />
                    </div>
                 </div>
              </div>

              {/* Área de Segurança / Assinatura */}
              <div className={modalStyles.securityBox}>
                 <div className={modalStyles.securityIcon}>
                    <ShieldCheck size={32} />
                 </div>
                 <div className={modalStyles.securityInfo}>
                    <h4>Assinatura Biométrica Validada</h4>
                    <p>Autenticado via leitor biométrico em {new Date(selectedMovimentacao.dataEntrega).toLocaleDateString()} às 14:30 (simulado)</p>
                    <small>Hash: 8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4</small>
                 </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function StatusBadge({ status }) {
    let color = '#64748b';
    let bg = '#f1f5f9';

    if(status === 'Ativa') { color = '#16a34a'; bg = '#dcfce7'; }
    if(status === 'Vencendo') { color = '#ea580c'; bg = '#ffedd5'; }
    if(status === 'Vencida') { color = '#dc2626'; bg = '#fee2e2'; }
    if(status === 'Devolvida') { color = '#2563eb'; bg = '#dbeafe'; }

    return (
        <span style={{
            backgroundColor: bg,
            color: color,
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase'
        }}>
            {status}
        </span>
    )
}
