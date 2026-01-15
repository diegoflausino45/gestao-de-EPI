import { useState, useMemo, useRef, useEffect } from "react";
import { 
  Search, 
  User, 
  Calendar, 
  AlertTriangle, 
  Package, 
  Trash2, 
  Plus, 
  CheckCircle,
  ChevronDown,
  Activity,
  CalendarClock,
  UserX,
  RefreshCw,
  X
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import styles from "./styles.module.css";
import EpiSelectModal from "./components/EpiSelectModal";

// MOCKS
import funcionariosMock from "../../data/funcionarioMock";
import { epiMock } from "../../data/epiMock";

// SERVIÇOS
import { listarEpis } from "../../services/epiApi";

// Opções de Motivo para o Dropdown Rico
const MOTIVOS = [
  { value: "Desgaste Natural", label: "Desgaste Natural", icon: Activity },
  { value: "Vencimento CA", label: "Vencimento do CA", icon: CalendarClock },
  { value: "Danificado", label: "Danificado em Operação", icon: AlertTriangle },
  { value: "Desligamento", label: "Desligamento/Demissão", icon: UserX },
  { value: "Troca", label: "Troca de Tamanho/Modelo", icon: RefreshCw }
];

export default function Devolucao() {
  const navigate = useNavigate();

  // ESTADOS PRINCIPAIS
  const [busca, setBusca] = useState("");
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  const [dataDevolucao, setDataDevolucao] = useState(new Date().toISOString().split('T')[0]);
  const [motivoSelecionado, setMotivoSelecionado] = useState(MOTIVOS[0]);
  const [observacaoGeral, setObservacaoGeral] = useState("");
  
  // Controle do Dropdown de Motivo
  const [isMotivoOpen, setIsMotivoOpen] = useState(false);
  const motivoDropdownRef = useRef(null);

  // Modal de Seleção de EPIs
  const [isModalSelectEpiOpen, setIsModalSelectEpiOpen] = useState(false);
  const [episDisponiveis, setEpisDisponiveis] = useState([]);
  const [loadingEpis, setLoadingEpis] = useState(false);

  // Lista de Itens a Devolver
  const [itensParaDevolver, setItensParaDevolver] = useState([]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (motivoDropdownRef.current && !motivoDropdownRef.current.contains(event.target)) {
        setIsMotivoOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Filtra EPIs no modal - Não é mais necessário aqui pois foi movido para o modal
  // Mas precisamos manter a lógica de carregar EPIs para passar a lista bruta

  // Filtragem de funcionários para a busca
  const funcionariosFiltrados = useMemo(() => {
    if (!busca || funcionarioSelecionado) return [];
    return funcionariosMock.filter(f => 
      f.nome.toLowerCase().includes(busca.toLowerCase()) ||
      f.setor.toLowerCase().includes(busca.toLowerCase())
    ).slice(0, 5); // Limita a 5 resultados para o dropdown
  }, [busca, funcionarioSelecionado]);

  // FUNÇÕES DE AÇÃO
  const handleSelecionarFuncionario = (func) => {
    setFuncionarioSelecionado(func);
    setBusca(func.nome);
    
    // Simulação: Ao selecionar o funcionário, carregamos os itens
    const itensIniciais = [
      { ...epiMock[0], estado: 'bom', observacao: '' },
      { ...epiMock[1], estado: 'danificado', observacao: '' }
    ];
    setItensParaDevolver(itensIniciais);
  };

  const handleLimparFuncionario = () => {
    setFuncionarioSelecionado(null);
    setBusca("");
    setItensParaDevolver([]);
  };

  const handleAdicionarItem = () => {
    setIsModalSelectEpiOpen(true);
  };

  const handleSelecionarEpi = (epi) => {
    setItensParaDevolver(prev => [...prev, { ...epi, id: Date.now(), estado: 'bom', observacao: '' }]);
    setIsModalSelectEpiOpen(false);
    toast.success(`${epi.nome} adicionado à lista.`);
  };

  const handleRemoverItem = (id) => {
    setItensParaDevolver(prev => prev.filter(item => item.id !== id));
  };

  const handleChangeEstado = (id, novoEstado) => {
    setItensParaDevolver(prev => prev.map(item => 
      item.id === id ? { ...item, estado: novoEstado } : item
    ));
  };

  const handleChangeItemObs = (id, obs) => {
    setItensParaDevolver(prev => prev.map(item => 
      item.id === id ? { ...item, observacao: obs } : item
    ));
  };

  const resetForm = () => {
    setFuncionarioSelecionado(null);
    setBusca("");
    setItensParaDevolver([]);
    setObservacaoGeral("");
    setMotivoSelecionado(MOTIVOS[0]);
    setDataDevolucao(new Date().toISOString().split('T')[0]);
  };

  const handleConfirmar = () => {
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
  };

  const getInitials = (name) => {
    return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  };

  // Ícone dinâmico do motivo selecionado
  const MotivoIcon = motivoSelecionado.icon;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Devolução de Equipamentos (EPI)</h1>
      </header>

      <div className={styles.grid}>
        
        {/* --- COLUNA ESQUERDA: CONTEXTO --- */}
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
                    if (funcionarioSelecionado) setFuncionarioSelecionado(null);
                  }}
                />
                
                {/* Resultados da Busca */}
                {funcionariosFiltrados.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, 
                    background: 'white', border: '1px solid #e2e8f0', 
                    borderRadius: '8px', zIndex: 10, marginTop: '4px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                  }}>
                    {funcionariosFiltrados.map(f => (
                      <div 
                        key={f.id} 
                        className={styles.searchResultItem}
                        onClick={() => handleSelecionarFuncionario(f)}
                        style={{
                          padding: '10px 15px', cursor: 'pointer', display: 'flex', 
                          alignItems: 'center', gap: '10px', borderBottom: '1px solid #f1f5f9'
                        }}
                      >
                        <div className={styles.avatar} style={{width: '32px', height: '32px', fontSize: '0.8rem'}}>
                          {getInitials(f.nome)}
                        </div>
                        <div>
                          <div style={{fontSize: '0.85rem', fontWeight: 600}}>{f.nome}</div>
                          <div style={{fontSize: '0.7rem', color: '#64748b'}}>{f.cargo} • {f.setor}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CARD DO FUNCIONÁRIO SELECIONADO (ESTILO UNIFICADO) */}
              {funcionarioSelecionado && (
                <div className={styles.employeeCard}>
                  <div className={styles.avatar}>
                    {getInitials(funcionarioSelecionado.nome)}
                  </div>
                  <div className={styles.employeeInfo}>
                    <h4>{funcionarioSelecionado.nome}</h4>
                    <p>{funcionarioSelecionado.cargo}</p>
                    <p><strong>Setor:</strong> {funcionarioSelecionado.setor}</p>
                  </div>
                  <button 
                    onClick={handleLimparFuncionario}
                    style={{marginLeft: 'auto', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer'}}
                  >
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

              {/* DROPDOWN RICO DE MOTIVO (Igual ao UserModal) */}
              <div className={styles.formGroup} ref={motivoDropdownRef}>
                <label>Motivo</label>
                <div className={styles.dropdownContainer}>
                  <button 
                    type="button" 
                    className={`${styles.dropdownButton} ${isMotivoOpen ? styles.active : ''}`}
                    onClick={() => setIsMotivoOpen(!isMotivoOpen)}
                  >
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                      {/* Ícone Absolute por CSS no .inputIcon, mas aqui precisamos do ícone dinâmico do lado esquerdo */}
                      <MotivoIcon size={16} className={styles.inputIcon} style={{position: 'absolute', left: '12px', color: '#94a3b8'}} />
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

        {/* --- COLUNA DIREITA: ITENS --- */}
        <main className={styles.rightColumn}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <Package size={18} />
              <h3>Itens para Devolução</h3>
              <span style={{marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8', background: '#f1f5f9', padding: '2px 8px', borderRadius: '10px'}}>
                {itensParaDevolver.length} itens
              </span>
            </div>
            
            <div className={styles.cardBody}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Equipamento</th>
                    <th>Estado de Conservação</th>
                    <th style={{width: '50px'}}></th>
                  </tr>
                </thead>
                <tbody>
                  {itensParaDevolver.length > 0 ? (
                    itensParaDevolver.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className={styles.itemInfo}>
                            <h5>{item.nome}</h5>
                            <span>{item.CA || item.ca || "CA não informado"}</span>
                          </div>
                          {/* Campo de observação condicional para itens danificados/inutilizáveis */}
                          {(item.estado === 'danificado' || item.estado === 'inutilizavel') && (
                            <input 
                              type="text" 
                              placeholder="Descreva o problema..."
                              className={`${styles.itemObsInput} ${item.estado === 'inutilizavel' && !item.observacao ? styles.errorInput : ''}`}
                              value={item.observacao}
                              onChange={(e) => handleChangeItemObs(item.id, e.target.value)}
                              style={{
                                marginTop: '8px', padding: '4px 8px', fontSize: '0.75rem', 
                                border: '1px solid #e2e8f0', borderRadius: '4px', width: '100%'
                              }}
                            />
                          )}
                        </td>
                        <td>
                          <div className={styles.statePills}>
                            <button 
                              className={`${styles.pill} ${item.estado === 'bom' ? `${styles.pillActive} ${styles.good}` : ''}`}
                              onClick={() => handleChangeEstado(item.id, 'bom')}
                            >
                              Bom
                            </button>
                            <button 
                              className={`${styles.pill} ${item.estado === 'danificado' ? `${styles.pillActive} ${styles.damaged}` : ''}`}
                              onClick={() => handleChangeEstado(item.id, 'danificado')}
                            >
                              Danificado
                            </button>
                            <button 
                              className={`${styles.pill} ${item.estado === 'inutilizavel' ? `${styles.pillActive} ${styles.broken}` : ''}`}
                              onClick={() => handleChangeEstado(item.id, 'inutilizavel')}
                            >
                              Inutilizável
                            </button>
                          </div>
                        </td>
                        <td>
                          <button className={styles.removeBtn} onClick={() => handleRemoverItem(item.id)}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>
                        <Package size={32} style={{marginBottom: '10px', opacity: 0.5}} />
                        <p>Nenhum item selecionado.</p>
                        <p style={{fontSize: '0.8rem'}}>Selecione um funcionário ou adicione itens manualmente.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <button className={styles.addItemBtn} onClick={handleAdicionarItem}>
                <Plus size={16} />
                Adicionar Equipamento Manualmente
              </button>
            </div>
          </div>

          {/* RODAPÉ DE AÇÕES */}
          <div className={styles.actionsFooter}>
            <button className={styles.btnCancel} onClick={() => navigate("/")}>
              Cancelar
            </button>
            <button className={styles.btnConfirm} onClick={handleConfirmar}>
              <CheckCircle size={20} />
              Confirmar Devolução
            </button>
          </div>
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