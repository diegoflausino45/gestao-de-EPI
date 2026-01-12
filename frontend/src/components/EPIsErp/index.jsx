import { useState, useEffect } from 'react';
import { useEpisErp, useSaldosErp } from '../../hooks/useErpEpis';
import styles from './styles.module.css';

/**
 * Componente de exemplo para listar EPIs do ERP
 * Mostra como integrar dados do banco ERP com seu sistema
 */
function EPIsErp() {
  const { episErp, loading, erro, recarregar } = useEpisErp();
  const { saldos } = useSaldosErp();
  const [filtro, setFiltro] = useState('');

  // Filtrar EPIs conforme o usuário digita
  const episFiltrados = episErp.filter(epi =>
    epi.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
    epi.codigo?.toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading) {
    return <div className={styles.loading}>⏳ Carregando EPIs do ERP...</div>;
  }

  if (erro) {
    return (
      <div className={styles.erro}>
        <p>❌ Erro ao carregar: {erro}</p>
        <button onClick={recarregar}>Tentar Novamente</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>📦 EPIs do ERP</h2>
        <p>Total: {episErp.length} itens</p>
      </div>

      <input
        type="text"
        placeholder="🔍 Buscar por nome ou código..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className={styles.searchInput}
      />

      <div className={styles.grid}>
        {episFiltrados.map((epi) => (
          <div key={epi.codigo} className={styles.card}>
            <div className={styles.cardHeader}>
              <strong>{epi.nome}</strong>
              <span className={styles.codigo}>{epi.codigo}</span>
            </div>

            <div className={styles.cardBody}>
              <p>
                <span className={styles.label}>Categoria:</span>
                <span className={styles.value}>{epi.categoria || 'N/A'}</span>
              </p>
              <p>
                <span className={styles.label}>Saldo ERP:</span>
                <span className={styles.value}>
                  {epi.saldoEstoque ?? 'N/A'} unidades
                </span>
              </p>
            </div>

            <div className={styles.cardFooter}>
              <button className={styles.btnDetalhes}>
                Ver Detalhes
              </button>
            </div>
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

export default EPIsErp;
