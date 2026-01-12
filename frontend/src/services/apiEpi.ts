import axios from "axios";

// Ajuste a URL base (porta do backend)
const api = axios.create({
  baseURL: "http://localhost:3333",
});
 
// Lista todos os EPIs do banco local
export async function listarEpis() {
  const { data } = await api.get("/epis");
  return data;
}
 
// Consulta de saldos em lote do ERP
export async function buscarSaldosErp(codigos: string[]) {
  const { data } = await api.post("/epis-erp/saldos", { codigos });
  // data.dados = [{ codigo, saldoEstoque }]
  return data.dados as { codigo: string; saldoEstoque: number }[];
}
 
// Consulta saldo de um item específico do ERP
export async function obterSaldoItem(codigo: string) {
  const { data } = await api.get(`/epis-erp/${codigo}`);
  return data.dados.saldoEstoque as number;
}
 