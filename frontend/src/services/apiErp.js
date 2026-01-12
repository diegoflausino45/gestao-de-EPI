import axios from "axios";

const API_URL = "http://localhost:3333";

/**
 * Cliente para consultar EPIs do banco ERP
 */

/**
 * Listar todos os EPIs do ERP
 */
export async function listarEpisErp() {
  try {
    const response = await axios.get(`${API_URL}/epis-erp`);
    return response.data.dados || [];
  } catch (error) {
    console.error("Erro ao listar EPIs do ERP:", error);
    throw error;
  }
}

/**
 * Buscar EPI específico do ERP por código
 */
export async function buscarEpiErp(codigo) {
  try {
    const response = await axios.get(`${API_URL}/epis-erp/${codigo}`);
    return response.data.dados;
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn(`EPI ${codigo} não encontrado no ERP`);
      return null;
    }
    console.error("Erro ao buscar EPI do ERP:", error);
    throw error;
  }
}

/**
 * Buscar saldos de múltiplos EPIs
 */
export async function buscarSaldosErp(codigos) {
  try {
    const response = await axios.post(`${API_URL}/epis-erp/saldos`, { 
      codigos 
    });
    return response.data.dados || [];
  } catch (error) {
    console.error("Erro ao buscar saldos do ERP:", error);
    throw error;
  }
}

/**
 * Buscar EPIs por categoria
 */
export async function buscarEpisPorCategoriaErp(categoria) {
  try {
    const response = await axios.get(`${API_URL}/epis-erp/categoria/${categoria}`);
    return response.data.dados || [];
  } catch (error) {
    console.error("Erro ao buscar EPIs por categoria:", error);
    throw error;
  }
}

export default {
  listarEpisErp,
  buscarEpiErp,
  buscarSaldosErp,
  buscarEpisPorCategoriaErp
};
