import { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

import styles from "./styles.module.css";
import EntregaHeader from "./components/EntregaHeader";
import FuncionarioCard from "./components/FuncionarioCard";
import EntregaCart from "./components/EntregaCart";
import EntregaFooter from "./components/EntregaFooter";
import EntregaEpiSelectModal from "./components/EntregaEpiSelectModal";
import BiometriaAuthModal from "../../components/BiometriaAuthModal";

// MOCKS & SERVICES
import funcionariosMock from "../../data/funcionarioMock";
import { epiMock } from "../../data/epiMock";
import { listarEpis } from "../../services/epiApi";

export default function Entregas() {
  const { user } = useAuth();

  // ESTADOS PRINCIPAIS
  const [busca, setBusca] = useState("");
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  const [dataEntrega, setDataEntrega] = useState(new Date().toISOString().split('T')[0]);
  const [responsavel] = useState(user?.nome || "Almoxarife");
  
  // Modal de Seleção de Itens
  const [isModalSelectEpiOpen, setIsModalSelectEpiOpen] = useState(false);
  const [episDisponiveis, setEpisDisponiveis] = useState([]);
  const [loadingEpis, setLoadingEpis] = useState(false);

  // Modal de Biometria
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);

  // Cesta de Itens
  const [cesta, setCesta] = useState([]);

  // Carrega EPIs apenas quando abre o modal (lazy load)
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
      setEpisDisponiveis(epiMock); // Fallback
    } finally {
      setLoadingEpis(false);
    }
  };

  // BUSCA DE FUNCIONÁRIOS
  const funcionariosFiltrados = useMemo(() => {
    if (!busca || funcionarioSelecionado) return [];
    return funcionariosMock.filter(f => 
      f.nome.toLowerCase().includes(busca.toLowerCase()) ||
      f.setor.toLowerCase().includes(busca.toLowerCase())
    ).slice(0, 5);
  }, [busca, funcionarioSelecionado]);

  // AÇÕES - useCallbacks para manter a memoização
  const handleSelecionarFuncionario = useCallback((func) => {
    setFuncionarioSelecionado(func);
    setBusca(func.nome);
  }, []);

  const handleLimparFuncionario = useCallback(() => {
    setFuncionarioSelecionado(null);
    setBusca("");
    setCesta([]); // Limpa cesta se mudar o funcionário (opcional, mas seguro)
  }, []);

  const handleAdicionarItem = useCallback((epi) => {
    setCesta(prev => {
      // Verifica se já existe na cesta dentro do callback para ter o estado mais recente
      const existe = prev.find(item => item.id === epi.id || item.codigo === epi.codigo);
      
      if (existe) {
        toast.info("Este item já está na cesta. Ajuste a quantidade.");
        setIsModalSelectEpiOpen(false);
        return prev;
      }

      toast.success(`${epi.nome} adicionado.`);
      setIsModalSelectEpiOpen(false);
      
      return [...prev, { 
        ...epi, 
        quantidade: 1, 
        caEntrega: epi.ca || epi.CA || "", 
        validadeEntrega: epi.validadeCA || "" 
      }];
    });
  }, []);

  const handleRemoverItem = useCallback((codigo) => {
    setCesta(prev => prev.filter(item => item.codigo !== codigo));
  }, []);

  const handleUpdateField = useCallback((codigo, field, value) => {
    setCesta(prev => prev.map(item => 
      item.codigo === codigo ? { ...item, [field]: value } : item
    ));
  }, []);

  const handleUpdateQuantity = useCallback((codigo, delta) => {
    setCesta(prev => prev.map(item => {
      if (item.codigo === codigo) {
        const novaQtd = Math.max(1, item.quantidade + delta);
        if (novaQtd > (item.estoqueAtual || 999)) {
          toast.warning("Quantidade excede o estoque atual.");
          return item;
        }
        return { ...item, quantidade: novaQtd };
      }
      return item;
    }));
  }, []);

  const handleIniciarEntrega = useCallback(() => {
    // Validações simples não precisam de dependências complexas se usarem os valores passados ou refs, 
    // mas aqui dependemos do estado renderizado. 
    // Como esta função é chamada pelo botão, ela será recriada se as dependências mudarem.
    // Para evitar recriação excessiva, poderíamos usar refs, mas a simplicidade vence aqui.
    setIsBioModalOpen(true);
  }, []);

  const handleConfirmarEntrega = useCallback(() => {
    // Aqui seria a chamada ao backend para salvar a entrega
    toast.success("Entrega realizada com sucesso!");
    // Reset total
    setFuncionarioSelecionado(null);
    setBusca("");
    setCesta([]);
    setIsBioModalOpen(false);
  }, []);

  const totalItems = useMemo(() => cesta.reduce((acc, item) => acc + item.quantidade, 0), [cesta]);

  return (
    <div className={styles.container}>
      <EntregaHeader />

      <div className={styles.grid}>
        
        {/* ESQUERDA: IDENTIFICAÇÃO */}
        <FuncionarioCard 
          busca={busca}
          setBusca={setBusca}
          funcionariosFiltrados={funcionariosFiltrados}
          funcionarioSelecionado={funcionarioSelecionado}
          onSelecionar={handleSelecionarFuncionario}
          onLimpar={handleLimparFuncionario}
          dataEntrega={dataEntrega}
          setDataEntrega={setDataEntrega}
          responsavel={responsavel}
        />

        {/* DIREITA: CESTA DE ITENS */}
        <main className={styles.rightColumn}>
          <EntregaCart 
            cesta={cesta}
            onRemoveItem={handleRemoverItem}
            onUpdateField={handleUpdateField}
            onUpdateQuantity={handleUpdateQuantity}
            onOpenSelectModal={() => setIsModalSelectEpiOpen(true)}
          />

          <EntregaFooter 
            totalItems={totalItems}
            onConfirm={handleIniciarEntrega}
            disabled={!funcionarioSelecionado || cesta.length === 0}
          />
        </main>
      </div>

      {/* MODALS */}
      <EntregaEpiSelectModal 
        isOpen={isModalSelectEpiOpen}
        onClose={() => setIsModalSelectEpiOpen(false)}
        onSelect={handleAdicionarItem}
        epis={episDisponiveis}
        loading={loadingEpis}
      />

      <BiometriaAuthModal 
        isOpen={isBioModalOpen}
        onClose={() => setIsBioModalOpen(false)}
        onSuccess={handleConfirmarEntrega}
        userTemplate={funcionarioSelecionado?.biometriaTemplate}
        userName={funcionarioSelecionado?.nome}
      />

    </div>
  );
}