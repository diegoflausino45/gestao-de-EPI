import { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import styles from "./styles.module.css";
import DevolucaoHeader from "./components/DevolucaoHeader";
import DevolucaoContextCard, { MOTIVOS } from "./components/DevolucaoContextCard";
import DevolucaoItemsCard from "./components/DevolucaoItemsCard";
import DevolucaoFooter from "./components/DevolucaoFooter";
import EpiSelectModal from "./components/EpiSelectModal";

// MOCKS & SERVICES
import funcionariosMock from "../../data/funcionarioMock";
import { epiMock } from "../../data/epiMock";
import { listarEpis } from "../../services/epiApi";

export default function Devolucao() {
  const navigate = useNavigate();

  // ESTADOS PRINCIPAIS
  const [busca, setBusca] = useState("");
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  const [dataDevolucao, setDataDevolucao] = useState(new Date().toISOString().split('T')[0]);
  const [motivoSelecionado, setMotivoSelecionado] = useState(MOTIVOS[0]);
  const [observacaoGeral, setObservacaoGeral] = useState("");
  
  // Modal de Seleção de EPIs
  const [isModalSelectEpiOpen, setIsModalSelectEpiOpen] = useState(false);
  const [episDisponiveis, setEpisDisponiveis] = useState([]);
  const [loadingEpis, setLoadingEpis] = useState(false);

  // Lista de Itens a Devolver
  const [itensParaDevolver, setItensParaDevolver] = useState([]);

  // Carrega EPIs quando abre o modal
  useEffect(() => {
    if (isModalSelectEpiOpen) {
      carregarEpis();
    }
  }, [isModalSelectEpiOpen]);

  const carregarEpis = async () => {
    try {
      setLoadingEpis(true);
      const epis = await listarEpis();
      setEpisDisponiveis(epis);
    } catch (err) {
      console.error("Erro ao carregar EPIs:", err);
      // Fallback para mock em caso de erro
      setEpisDisponiveis(epiMock);
    } finally {
      setLoadingEpis(false);
    }
  };

  // Filtragem de funcionários para a busca
  const funcionariosFiltrados = useMemo(() => {
    if (!busca || funcionarioSelecionado) return [];
    return funcionariosMock.filter(f => 
      f.nome.toLowerCase().includes(busca.toLowerCase()) ||
      f.setor.toLowerCase().includes(busca.toLowerCase())
    ).slice(0, 5); // Limita a 5 resultados para o dropdown
  }, [busca, funcionarioSelecionado]);

  // FUNÇÕES DE AÇÃO (useCallback)
  const handleSelecionarFuncionario = useCallback((func) => {
    setFuncionarioSelecionado(func);
    setBusca(func.nome);
    
    // Simulação: Ao selecionar o funcionário, carregamos os itens
    const itensIniciais = [
      { ...epiMock[0], estado: 'bom', observacao: '' },
      { ...epiMock[1], estado: 'danificado', observacao: '' }
    ];
    setItensParaDevolver(itensIniciais);
  }, []);

  const handleLimparFuncionario = useCallback(() => {
    setFuncionarioSelecionado(null);
    setBusca("");
    setItensParaDevolver([]);
  }, []);

  const handleAdicionarItem = useCallback(() => {
    setIsModalSelectEpiOpen(true);
  }, []);

  const handleSelecionarEpi = useCallback((epi) => {
    setItensParaDevolver(prev => [...prev, { ...epi, id: Date.now(), estado: 'bom', observacao: '' }]);
    setIsModalSelectEpiOpen(false);
    toast.success(`${epi.nome} adicionado à lista.`);
  }, []);

  const handleRemoverItem = useCallback((id) => {
    setItensParaDevolver(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleChangeEstado = useCallback((id, novoEstado) => {
    setItensParaDevolver(prev => prev.map(item => 
      item.id === id ? { ...item, estado: novoEstado } : item
    ));
  }, []);

  const handleChangeItemObs = useCallback((id, obs) => {
    setItensParaDevolver(prev => prev.map(item => 
      item.id === id ? { ...item, observacao: obs } : item
    ));
  }, []);

  const resetForm = useCallback(() => {
    setFuncionarioSelecionado(null);
    setBusca("");
    setItensParaDevolver([]);
    setObservacaoGeral("");
    setMotivoSelecionado(MOTIVOS[0]);
    setDataDevolucao(new Date().toISOString().split('T')[0]);
  }, []);

  const handleConfirmar = useCallback(() => {
    if (!funcionarioSelecionado) {
      toast.error("Selecione um funcionário primeiro.");
      return;
    }
    if (itensParaDevolver.length === 0) {
      toast.error("Adicione ao menos um item para devolução.");
      return;
    }

    // Validação de observação obrigatória para itens ruins
    const pendencias = itensParaDevolver.filter(item => item.estado === 'inutilizavel' && !item.observacao);
    if (pendencias.length > 0) {
      toast.warning("Itens inutilizáveis exigem uma observação do motivo.");
      return;
    }

    // Sucesso
    toast.success("Devolução registrada com sucesso!");
    resetForm();
  }, [funcionarioSelecionado, itensParaDevolver, resetForm]);

  return (
    <div className={styles.container}>
      <DevolucaoHeader />

      <div className={styles.grid}>
        
        {/* --- COLUNA ESQUERDA: CONTEXTO --- */}
        <DevolucaoContextCard 
          busca={busca}
          setBusca={setBusca}
          funcionariosFiltrados={funcionariosFiltrados}
          funcionarioSelecionado={funcionarioSelecionado}
          onSelecionarFuncionario={handleSelecionarFuncionario}
          onLimparFuncionario={handleLimparFuncionario}
          dataDevolucao={dataDevolucao}
          setDataDevolucao={setDataDevolucao}
          motivoSelecionado={motivoSelecionado}
          setMotivoSelecionado={setMotivoSelecionado}
          observacaoGeral={observacaoGeral}
          setObservacaoGeral={setObservacaoGeral}
        />

        {/* --- COLUNA DIREITA: ITENS --- */}
        <main className={styles.rightColumn}>
          <DevolucaoItemsCard 
            itens={itensParaDevolver}
            onRemoveItem={handleRemoverItem}
            onChangeEstado={handleChangeEstado}
            onChangeObs={handleChangeItemObs}
            onAddItem={handleAdicionarItem}
          />

          {/* RODAPÉ DE AÇÕES */}
          <DevolucaoFooter 
            onCancel={() => navigate("/")} 
            onConfirm={handleConfirmar} 
          />
        </main>

        {/* MODAL DE SELEÇÃO DE EPIs */}
        <EpiSelectModal
          isOpen={isModalSelectEpiOpen}
          onClose={() => setIsModalSelectEpiOpen(false)}
          onSelect={handleSelecionarEpi}
          epis={episDisponiveis}
          loading={loadingEpis}
        />
      </div>
    </div>
  );
}
