import { useState, useEffect } from 'react';
import { 
  listarEpisErp, 
  buscarSaldosErp, 
  buscarEpiErp 
} from '../../services/apiErp';

/**
 * Hook customizado para gerenciar consultas ao ERP
 */
export function useEpisErp() {
  const [episErp, setEpisErp] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const carregarEpisErp = async () => {
    setLoading(true);
    setErro(null);
    try {
      const dados = await listarEpisErp();
      setEpisErp(dados);
    } catch (err) {
      setErro(err.message);
      console.error('Erro ao carregar EPIs do ERP:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEpisErp();
  }, []);

  return {
    episErp,
    loading,
    erro,
    recarregar: carregarEpisErp
  };
}

/**
 * Hook para buscar saldos de EPIs específicos do ERP
 */
export function useSaldosErp() {
  const [saldos, setSaldos] = useState({});
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const buscarSaldos = async (codigos) => {
    setLoading(true);
    setErro(null);
    try {
      const dados = await buscarSaldosErp(codigos);
      const saldosPorCodigo = {};
      dados.forEach(item => {
        saldosPorCodigo[item.codigo] = item.saldoEstoque;
      });
      setSaldos(saldosPorCodigo);
      return saldosPorCodigo;
    } catch (err) {
      setErro(err.message);
      console.error('Erro ao buscar saldos:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    saldos,
    loading,
    erro,
    buscarSaldos
  };
}

/**
 * Hook para buscar EPI específico
 */
export function useEpiErp(codigo) {
  const [epi, setEpi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const buscar = async (codigoParam) => {
    const codigoParaBuscar = codigoParam || codigo;
    if (!codigoParaBuscar) return;

    setLoading(true);
    setErro(null);
    try {
      const dados = await buscarEpiErp(codigoParaBuscar);
      setEpi(dados);
    } catch (err) {
      setErro(err.message);
      console.error('Erro ao buscar EPI:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (codigo) {
      buscar(codigo);
    }
  }, [codigo]);

  return {
    epi,
    loading,
    erro,
    buscar
  };
}

export default {
  useEpisErp,
  useSaldosErp,
  useEpiErp
};
