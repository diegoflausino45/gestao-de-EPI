import { useState, useMemo, useRef, useEffect } from "react";
import { 
  Search, 
  User, 
  Calendar, 
  Package, 
  Trash2, 
  Plus, 
  CheckCircle,
  Clock,
  ChevronDown
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import styles from "./styles.module.css";
import EntregaEpiSelectModal from "./components/EntregaEpiSelectModal";
import BiometriaAuthModal from "../../components/BiometriaAuthModal";
import { useAuth } from "../../context/AuthContext";

// MOCKS & SERVICES
import funcionariosMock from "../../data/funcionarioMock";
import { epiMock } from "../../data/epiMock";
import { listarEpis } from "../../services/epiApi";

export default function Entregas() {
  const navigate = useNavigate();
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

  // AÇÕES
  const handleSelecionarFuncionario = (func) => {
    setFuncionarioSelecionado(func);
    setBusca(func.nome);
  };

  const handleLimparFuncionario = () => {
    setFuncionarioSelecionado(null);
    setBusca("");
    setCesta([]); // Limpa cesta se mudar o funcionário (opcional, mas seguro)
  };

  const handleAdicionarItem = (epi) => {
    // Verifica se já existe na cesta
    const existe = cesta.find(item => item.id === epi.id || item.codigo === epi.codigo);
    
    if (existe) {
      toast.info("Este item já está na cesta. Ajuste a quantidade.");
      setIsModalSelectEpiOpen(false);
      return;
    }

    setCesta(prev => [...prev, { 
      ...epi, 
      quantidade: 1, 
      caEntrega: epi.ca || epi.CA || "", 
      validadeEntrega: epi.validadeCA || "" 
    }]);
    setIsModalSelectEpiOpen(false);
    toast.success(`${epi.nome} adicionado.`);
  };

  const handleRemoverItem = (codigo) => {
    setCesta(prev => prev.filter(item => item.codigo !== codigo));
  };

  const handleItemFieldChange = (codigo, field, value) => {
    setCesta(prev => prev.map(item => 
      item.codigo === codigo ? { ...item, [field]: value } : item
    ));
  };

  const handleQuantidadeChange = (codigo, delta) => {
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
  };

  const handleIniciarEntrega = () => {
    if (!funcionarioSelecionado) return toast.error("Selecione um funcionário.");
    if (cesta.length === 0) return toast.error("Adicione itens à entrega.");

    setIsBioModalOpen(true);
  };

  const handleConfirmarEntrega = () => {
    // Aqui seria a chamada ao backend para salvar a entrega
    toast.success("Entrega realizada com sucesso!");
    // Reset total
    setFuncionarioSelecionado(null);
    setBusca("");
    setCesta([]);
    setIsBioModalOpen(false);
  };

  const getInitials = (name) => {
    return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Terminal de Entrega</h1>
        <span className={styles.dateBadge}>
          <Clock size={14} /> {new Date().toLocaleDateString('pt-BR')}
        </span>
      </header>

      <div className={styles.grid}>
        
        {/* ESQUERDA: IDENTIFICAÇÃO */}
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
                    if (funcionarioSelecionado) setFuncionarioSelecionado(null);
                  }}
                />
                
                {/* DROPDOWN RESULTADOS */}
                {funcionariosFiltrados.length > 0 && (
                  <div className={styles.searchResults}>
                    {funcionariosFiltrados.map(f => (
                      <div 
                        key={f.id} 
                        className={styles.resultItem}
                        onClick={() => handleSelecionarFuncionario(f)}
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
                  <button onClick={handleLimparFuncionario} className={styles.changeBtn}>
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

        {/* DIREITA: CESTA DE ITENS */}
        <main className={styles.rightColumn}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <Package size={18} />
              <h3>Itens da Entrega</h3>
              <div className={styles.itemCount}>
                {cesta.length} {cesta.length === 1 ? 'item' : 'itens'}
              </div>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>EPI</th>
                      <th style={{width: '120px'}}>CA</th>
                      <th style={{width: '150px'}}>Validade</th>
                      <th style={{textAlign: 'center'}}>Qtd.</th>
                      <th style={{width: '40px'}}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cesta.length > 0 ? (
                      cesta.map((item) => (
                        <tr key={item.codigo}>
                          <td>
                            <div className={styles.itemMeta}>
                              <span className={styles.itemName}>{item.nome}</span>
                              <span className={styles.itemCode}>Cód: {item.codigo}</span>
                            </div>
                          </td>
                          <td>
                            <input 
                              type="text"
                              className={styles.inlineInput}
                              value={item.caEntrega}
                              onChange={(e) => handleItemFieldChange(item.codigo, 'caEntrega', e.target.value)}
                              placeholder="Nº CA"
                            />
                          </td>
                          <td>
                            <input 
                              type="date"
                              className={styles.inlineInput}
                              value={item.validadeEntrega ? item.validadeEntrega.split('T')[0] : ''}
                              onChange={(e) => handleItemFieldChange(item.codigo, 'validadeEntrega', e.target.value)}
                            />
                          </td>
                          <td>
                            <div className={styles.qtyControl}>
                              <button onClick={() => handleQuantidadeChange(item.codigo, -1)}>-</button>
                              <span>{item.quantidade}</span>
                              <button onClick={() => handleQuantidadeChange(item.codigo, 1)}>+</button>
                            </div>
                          </td>
                          <td>
                            <button className={styles.removeBtn} onClick={() => handleRemoverItem(item.codigo)}>
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5">
                          <div className={styles.emptyState}>
                            <Package size={40} strokeWidth={1} />
                            <p>Nenhum item adicionado à entrega.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <button className={styles.addItemBtn} onClick={() => setIsModalSelectEpiOpen(true)}>
                <Plus size={18} /> Adicionar EPI
              </button>
            </div>
          </div>

          <div className={styles.footerActions}>
             <div className={styles.totalInfo}>
                <span>Total de Itens:</span>
                <strong>{cesta.reduce((acc, item) => acc + item.quantidade, 0)}</strong>
             </div>
             <button 
               className={styles.confirmBtn} 
               onClick={handleIniciarEntrega}
               disabled={!funcionarioSelecionado || cesta.length === 0}
             >
               <CheckCircle size={20} /> Confirmar Entrega
             </button>
          </div>
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
