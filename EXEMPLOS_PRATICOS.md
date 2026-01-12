# 💻 Exemplos Práticos de Código

Aqui estão exemplos prontos para copiar e colar em seu projeto.

---

## 📌 Exemplo 1: Listar EPIs do ERP em um Componente

### Arquivo: `src/containers/EPIsDoErp/index.jsx`

```jsx
import { useState } from 'react';
import { useEpisErp } from '../../hooks/useErpEpis';
import styles from './styles.module.css';

export function EPIsDoErp() {
  const { episErp, loading, erro, recarregar } = useEpisErp();
  const [busca, setBusca] = useState('');

  const episFiltrados = episErp.filter(epi => 
    epi.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    epi.codigo?.toLowerCase().includes(busca.toLowerCase())
  );

  if (loading) {
    return <div className={styles.loading}>Carregando EPIs do ERP...</div>;
  }

  if (erro) {
    return (
      <div className={styles.erro}>
        <h3>Erro ao carregar EPIs</h3>
        <p>{erro}</p>
        <button onClick={recarregar}>Tentar Novamente</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📦 Catálogo de EPIs (ERP)</h1>
        <p>Total de {episErp.length} itens disponíveis</p>
      </div>

      <input
        type="text"
        placeholder="🔍 Buscar por nome ou código..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className={styles.searchInput}
      />

      <div className={styles.grid}>
        {episFiltrados.map(epi => (
          <div key={epi.codigo} className={styles.epiCard}>
            <div className={styles.cardTop}>
              <h3>{epi.nome}</h3>
              <span className={styles.codigo}>{epi.codigo}</span>
            </div>
            
            <div className={styles.cardBody}>
              <div className={styles.info}>
                <label>Categoria:</label>
                <span>{epi.categoria || 'N/A'}</span>
              </div>
              <div className={styles.info}>
                <label>Estoque:</label>
                <span className={styles.estoque}>
                  {epi.saldoEstoque ?? '0'} un.
                </span>
              </div>
            </div>

            <button className={styles.btn}>
              Ver Detalhes
            </button>
          </div>
        ))}
      </div>

      {episFiltrados.length === 0 && (
        <div className={styles.vazio}>
          <p>Nenhum EPI encontrado</p>
        </div>
      )}
    </div>
  );
}

export default EPIsDoErp;
```

---

## 📌 Exemplo 2: Verificar Saldo Antes de Entregar

### Arquivo: `src/components/ValidarEntrega/index.jsx`

```jsx
import { useState } from 'react';
import { useSaldosErp } from '../../hooks/useErpEpis';
import styles from './styles.module.css';

export function ValidarEntrega({ codigoEpi, quantidadeRequirida }) {
  const { saldos, buscarSaldos, loading } = useSaldosErp();
  const [validado, setValidado] = useState(false);
  const [podeEntregar, setPodeEntregar] = useState(false);

  const handleValidar = async () => {
    const resultado = await buscarSaldos([codigoEpi]);
    const saldoDisponivel = resultado[codigoEpi] || 0;
    
    setValidado(true);
    setPodeEntregar(saldoDisponivel >= quantidadeRequirida);
  };

  const saldoDisponivel = saldos[codigoEpi] || 0;

  return (
    <div className={styles.validador}>
      <button 
        onClick={handleValidar} 
        disabled={loading}
        className={styles.btnValidar}
      >
        {loading ? '⏳ Verificando...' : '🔍 Verificar Saldo no ERP'}
      </button>

      {validado && (
        <div className={podeEntregar ? styles.sucesso : styles.erro}>
          <p>Saldo ERP: <strong>{saldoDisponivel}</strong> un.</p>
          <p>Solicitado: <strong>{quantidadeRequirida}</strong> un.</p>
          
          {podeEntregar ? (
            <p className={styles.mensagem}>✅ Estoque suficiente!</p>
          ) : (
            <p className={styles.mensagem}>
              ❌ Estoque insuficiente! Faltam {quantidadeRequirida - saldoDisponivel} un.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default ValidarEntrega;
```

---

## 📌 Exemplo 3: Hook Customizado para Sincronizar Dados

### Arquivo: `src/hooks/useSincronizarEstoque.js`

```javascript
import { useEffect, useState } from 'react';
import { buscarSaldosErp } from '../services/apiErp';

/**
 * Hook que sincroniza saldos do ERP com dados locais
 * Atualiza a cada X segundos (intervalo configurável)
 */
export function useSincronizarEstoque(codigosEpis, intervalSegundos = 30) {
  const [saldosAtualizados, setSaldosAtualizados] = useState({});
  const [sincronizando, setSincronizando] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const [erro, setErro] = useState(null);

  const sincronizar = async () => {
    if (!codigosEpis || codigosEpis.length === 0) return;

    setSincronizando(true);
    try {
      const saldos = await buscarSaldosErp(codigosEpis);
      const mapa = {};
      
      saldos.forEach(item => {
        mapa[item.codigo] = item.saldoEstoque;
      });
      
      setSaldosAtualizados(mapa);
      setUltimaAtualizacao(new Date());
      setErro(null);
    } catch (err) {
      setErro(err.message);
      console.error('Erro ao sincronizar estoque:', err);
    } finally {
      setSincronizando(false);
    }
  };

  // Sincronizar ao montar e a cada intervalo
  useEffect(() => {
    sincronizar(); // Sincronizar imediatamente

    const intervalo = setInterval(sincronizar, intervalSegundos * 1000);

    return () => clearInterval(intervalo);
  }, [codigosEpis, intervalSegundos]);

  return {
    saldosAtualizados,
    sincronizando,
    ultimaAtualizacao,
    erro,
    forcarSincronizacao: sincronizar
  };
}

// Uso:
/*
const { saldosAtualizados, ultimaAtualizacao } = useSincronizarEstoque(
  ['001', '002', '003'],
  30 // Sincronizar a cada 30 segundos
);
*/

export default useSincronizarEstoque;
```

---

## 📌 Exemplo 4: Dashboard com Dados Locais + ERP

### Arquivo: `src/containers/Dashboard/index.jsx`

```jsx
import { useState, useEffect } from 'react';
import { useEpisErp } from '../../hooks/useErpEpis';
import styles from './styles.module.css';

export function Dashboard() {
  const { episErp } = useEpisErp();
  const [episLocais, setEpisLocais] = useState([]);

  // Buscar EPIs locais
  useEffect(() => {
    fetch('http://localhost:3333/epis')
      .then(res => res.json())
      .then(data => setEpisLocais(data))
      .catch(err => console.error('Erro ao buscar EPIs locais:', err));
  }, []);

  // Combinar dados locais com ERP
  const epis = episLocais.map(local => {
    const doErp = episErp.find(erp => erp.codigo === String(local.id));
    return {
      ...local,
      saldoLocal: local.estoqueAtual || 0,
      saldoErp: doErp?.saldoEstoque || 0,
      saldoTotal: (local.estoqueAtual || 0) + (doErp?.saldoEstoque || 0)
    };
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📊 Dashboard de Estoque</h1>
        <p>Comparação: Estoque Local vs ERP</p>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <h3>Total Local</h3>
          <p className={styles.number}>
            {epis.reduce((acc, e) => acc + e.saldoLocal, 0)}
          </p>
          <span className={styles.label}>unidades</span>
        </div>

        <div className={styles.stat}>
          <h3>Total ERP</h3>
          <p className={styles.number}>
            {epis.reduce((acc, e) => acc + e.saldoErp, 0)}
          </p>
          <span className={styles.label}>unidades</span>
        </div>

        <div className={styles.stat}>
          <h3>Total Geral</h3>
          <p className={styles.number}>
            {epis.reduce((acc, e) => acc + e.saldoTotal, 0)}
          </p>
          <span className={styles.label}>unidades</span>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>EPI</th>
            <th>Código</th>
            <th>Local</th>
            <th>ERP</th>
            <th>Total</th>
            <th>Diferença</th>
          </tr>
        </thead>
        <tbody>
          {epis.map(epi => (
            <tr key={epi.id}>
              <td>{epi.nome}</td>
              <td className={styles.codigo}>{epi.id}</td>
              <td className={styles.number}>{epi.saldoLocal}</td>
              <td className={styles.number}>{epi.saldoErp}</td>
              <td className={styles.number}><strong>{epi.saldoTotal}</strong></td>
              <td className={epi.saldoLocal > epi.saldoErp ? styles.positivo : styles.negativo}>
                {epi.saldoLocal - epi.saldoErp > 0 ? '+' : ''}{epi.saldoLocal - epi.saldoErp}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
```

---

## 📌 Exemplo 5: Formulário de Entrega com Validação ERP

### Arquivo: `src/components/FormEntrega/index.jsx`

```jsx
import { useState } from 'react';
import { buscarEpiErp } from '../../services/apiErp';
import styles from './styles.module.css';

export function FormEntrega() {
  const [formData, setFormData] = useState({
    codigoEpi: '',
    quantidade: '',
    funcionarioId: ''
  });

  const [validacao, setValidacao] = useState({
    epiValido: false,
    saldoDisponivel: false,
    mensagem: ''
  });

  const [carregando, setCarregando] = useState(false);

  const handleValidarEpi = async () => {
    if (!formData.codigoEpi) {
      setValidacao({
        epiValido: false,
        saldoDisponivel: false,
        mensagem: 'Digite o código do EPI'
      });
      return;
    }

    setCarregando(true);
    try {
      const epi = await buscarEpiErp(formData.codigoEpi);

      if (!epi) {
        setValidacao({
          epiValido: false,
          saldoDisponivel: false,
          mensagem: '❌ EPI não encontrado no ERP'
        });
        return;
      }

      const temSaldo = epi.saldoEstoque >= formData.quantidade;

      setValidacao({
        epiValido: true,
        saldoDisponivel: temSaldo,
        mensagem: temSaldo
          ? `✅ ${epi.nome} - Estoque: ${epi.saldoEstoque} un.`
          : `❌ Saldo insuficiente! Disponível: ${epi.saldoEstoque} un.`
      });
    } catch (err) {
      setValidacao({
        epiValido: false,
        saldoDisponivel: false,
        mensagem: `❌ Erro: ${err.message}`
      });
    } finally {
      setCarregando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validacao.saldoDisponivel) {
      alert('❌ Valide o EPI primeiro!');
      return;
    }

    try {
      const response = await fetch('http://localhost:3333/entregas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          epiId: parseInt(formData.codigoEpi),
          funcionarioId: parseInt(formData.funcionarioId),
          quantidade: parseInt(formData.quantidade)
        })
      });

      if (response.ok) {
        alert('✅ Entrega registrada com sucesso!');
        setFormData({ codigoEpi: '', quantidade: '', funcionarioId: '' });
        setValidacao({ epiValido: false, saldoDisponivel: false, mensagem: '' });
      }
    } catch (err) {
      alert(`❌ Erro: ${err.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>📝 Registrar Entrega</h2>

      <div className={styles.fieldGroup}>
        <label htmlFor="codigo">Código do EPI:</label>
        <div className={styles.inputGroup}>
          <input
            id="codigo"
            type="text"
            placeholder="Ex: 001"
            value={formData.codigoEpi}
            onChange={(e) => setFormData({ ...formData, codigoEpi: e.target.value })}
            className={styles.input}
          />
          <button
            type="button"
            onClick={handleValidarEpi}
            disabled={carregando}
            className={styles.btnValidar}
          >
            {carregando ? '⏳' : '🔍'} Validar
          </button>
        </div>
        {validacao.mensagem && (
          <p className={validacao.saldoDisponivel ? styles.sucesso : styles.erro}>
            {validacao.mensagem}
          </p>
        )}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="quantidade">Quantidade:</label>
        <input
          id="quantidade"
          type="number"
          min="1"
          placeholder="Ex: 5"
          value={formData.quantidade}
          onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
          className={styles.input}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="funcionario">Funcionário:</label>
        <select
          id="funcionario"
          value={formData.funcionarioId}
          onChange={(e) => setFormData({ ...formData, funcionarioId: e.target.value })}
          className={styles.input}
        >
          <option value="">Selecione um funcionário</option>
          <option value="1">João Silva</option>
          <option value="2">Maria Santos</option>
          <option value="3">Pedro Costa</option>
        </select>
      </div>

      <button 
        type="submit" 
        disabled={!validacao.saldoDisponivel}
        className={styles.btnSubmit}
      >
        ✅ Confirmar Entrega
      </button>
    </form>
  );
}

export default FormEntrega;
```

---

## 📌 Exemplo 6: Teste com cURL

### Arquivo: `test_api.sh` (para Windows PowerShell)

```powershell
# 1. Listar todos os EPIs do ERP
Write-Host "=== Listando EPIs do ERP ===" -ForegroundColor Green
curl http://localhost:3333/epis-erp

# 2. Buscar EPI específico
Write-Host "`n=== Buscando EPI 001 ===" -ForegroundColor Green
curl http://localhost:3333/epis-erp/001

# 3. Buscar múltiplos saldos
Write-Host "`n=== Buscando saldos de múltiplos itens ===" -ForegroundColor Green
curl -X POST http://localhost:3333/epis-erp/saldos `
  -H "Content-Type: application/json" `
  -d '{"codigos":["001","002","003"]}'

# 4. Buscar por categoria
Write-Host "`n=== Buscando EPIs da categoria OCULARES ===" -ForegroundColor Green
curl http://localhost:3333/epis-erp/categoria/OCULARES
```

---

## 📌 Exemplo 7: Integrar em Layout Existente

### Como adicionar ao seu menu/sidebar:

```jsx
import { Link } from 'react-router-dom';

function SideBar() {
  return (
    <nav>
      {/* ... outros itens ... */}
      
      <Link to="/epis-erp" className="menu-item">
        <span>📦</span>
        <span>EPIs (ERP)</span>
      </Link>

      {/* ... outros itens ... */}
    </nav>
  );
}
```

### Adicionar rota em `routes.jsx`:

```jsx
import EPIsDoErp from '../containers/EPIsDoErp';

const routes = [
  // ... outras rotas ...
  {
    path: '/epis-erp',
    element: <EPIsDoErp />
  },
  // ... outras rotas ...
];
```

---

## ✨ Pronto para Usar!

Todos esses exemplos estão prontos para copiar e colar. Customize conforme necessário para seu projeto.

