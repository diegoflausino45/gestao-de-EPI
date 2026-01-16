import { useState, useMemo, useCallback } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import styles from "./styles.module.css";

// Components
import RelatorioHeader from "./components/RelatorioHeader";
import RelatorioTabs from "./components/RelatorioTabs";
import RelatorioFilters from "./components/RelatorioFilters";
import RelatorioTable from "./components/RelatorioTable";
import RelatorioModal from "./components/RelatorioModal";

// Importando Mock
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
  
  // Estado para o Modal de Detalhes
  const [selectedMovimentacao, setSelectedMovimentacao] = useState(null);

  // Handlers
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleViewDetails = useCallback((item) => {
    setSelectedMovimentacao(item);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedMovimentacao(null);
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
  const handleExportCSV = useCallback(() => {
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
  }, [filteredData, activeTab]);

  // Função de Exportação PDF
  const handleExportPDF = useCallback(() => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text("Relatório de Gestão de EPIs", 14, 22);
    
    // Subtítulo e Data
    doc.setFontSize(11);
    doc.setTextColor(100);
    const tipoRelatorio = activeTab === 'movimentacoes' ? 'Histórico de Movimentações' : 'Alertas de Vencimento';
    doc.text(`${tipoRelatorio} - Gerado em: ${new Date().toLocaleDateString()}`, 14, 30);

    // Filtros Aplicados
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
  }, [filteredData, activeTab, filters]);

  // Função de Impressão
  const handlePrint = useCallback(() => {
    const doc = new jsPDF();
    
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

    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  }, [filteredData, activeTab]);

  return (
    <div className={styles.container}>
      <RelatorioHeader 
        count={filteredData.length}
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
        onPrint={handlePrint}
      />

      <RelatorioTabs 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />

      <RelatorioFilters 
        filters={filters} 
        onChange={handleFilterChange} 
      />

      <RelatorioTable 
        data={filteredData} 
        onViewDetails={handleViewDetails} 
      />

      <RelatorioModal 
        data={selectedMovimentacao} 
        onClose={handleCloseModal} 
      />
    </div>
  );
}