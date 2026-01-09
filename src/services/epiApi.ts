import axios from "axios";

// Ajuste a URL base (porta do backend)
const api = axios.create({
  baseURL: "http://localhost:4000",
});

// Lista todos os EPIs
export async function listarEpis() {
  const { data } = await api.get("/api/epis");
  return data;
}

// Consulta de saldos em lote
export async function buscarSaldosErp(codigos: string[]) {
  const { data } = await api.post("/api/itens/saldos-erp", { codigos });
  // data.saldos = [{ codigo, saldo }]
  return data.saldos as { codigo: string; saldo: number }[];
}

// Consulta saldo de um item específico
export async function obterSaldoItem(codigo: string) {
  const { data } = await api.get(`/api/itens/${codigo}/saldo-erp`);
  return data.saldo as number;
}
