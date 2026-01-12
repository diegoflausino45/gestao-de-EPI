import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3333"
});

// ==================== USUÁRIOS ====================
export const usuariosAPI = {
  list: () => api.get("/usuarios"),
  getById: (id) => api.get(`/usuarios/${id}`),
  create: (data) => api.post("/usuarios", data),
  update: (id, data) => api.put(`/usuarios/${id}`, data),
  delete: (id) => api.delete(`/usuarios/${id}`)
};

// ==================== SETORES ====================
export const setoresAPI = {
  list: () => api.get("/setores"),
  getById: (id) => api.get(`/setores/${id}`),
  create: (data) => api.post("/setores", data),
  update: (id, data) => api.put(`/setores/${id}`, data),
  delete: (id) => api.delete(`/setores/${id}`)
};

// ==================== FUNCIONÁRIOS ====================
export const funcionariosAPI = {
  list: () => api.get("/funcionarios"),
  getById: (id) => api.get(`/funcionarios/${id}`),
  create: (data) => api.post("/funcionarios", data),
  update: (id, data) => api.put(`/funcionarios/${id}`, data),
  delete: (id) => api.delete(`/funcionarios/${id}`)
};

// ==================== TIPOS DE EPI ====================
export const tiposEpiAPI = {
  list: () => api.get("/tipos-epi"),
  getById: (id) => api.get(`/tipos-epi/${id}`),
  create: (data) => api.post("/tipos-epi", data),
  update: (id, data) => api.put(`/tipos-epi/${id}`, data),
  delete: (id) => api.delete(`/tipos-epi/${id}`)
};

// ==================== EPIs ====================
export const episAPI = {
  list: () => api.get("/epis"),
  getById: (id) => api.get(`/epis/${id}`),
  create: (data) => api.post("/epis", data),
  update: (id, data) => api.put(`/epis/${id}`, data),
  delete: (id) => api.delete(`/epis/${id}`)
};

// Lista todos os EPIs do banco local
export async function listarEpis() {
  const { data } = await api.get("/epis");
  return data;
}
 
// Consulta de saldos em lote do ERP
export async function buscarSaldosErp(codigos) {
  const { data } = await api.post("/epis-erp/saldos", { codigos });
  // data.dados = [{ codigo, saldoEstoque }]
  return data.dados;
}
 
// Consulta saldo de um item específico do ERP
export async function obterSaldoItem(codigo) {
  const { data } = await api.get(`/epis-erp/${codigo}`);
  return data.dados.saldoEstoque;
}

// ==================== ENTREGAS ====================
export const entregasAPI = {
  list: () => api.get("/entregas"),
  getById: (id) => api.get(`/entregas/${id}`),
  getByFuncionario: (funcionarioId) => api.get(`/entregas/funcionario/${funcionarioId}`),
  create: (data) => api.post("/entregas", data),
  update: (id, data) => api.put(`/entregas/${id}`, data),
  delete: (id) => api.delete(`/entregas/${id}`)
};

// ==================== DEVOLUÇÕES ====================
export const devolucoesAPI = {
  list: () => api.get("/devolucoes"),
  getById: (id) => api.get(`/devolucoes/${id}`),
  getByFuncionario: (funcionarioId) => api.get(`/devolucoes/funcionario/${funcionarioId}`),
  create: (data) => api.post("/devolucoes", data),
  update: (id, data) => api.put(`/devolucoes/${id}`, data),
  delete: (id) => api.delete(`/devolucoes/${id}`)
};

