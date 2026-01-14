// src/services/epi-erp.service.ts
import { prismaNextsi } from "../db/prisma-nextsi.js";

/**
 * Busca todos os itens EP (Equipamento de Proteção) do ERP
 * Fonte: NEXTSI_HOMOLOG.dbo.G01 onde G01_TIPO = 'EP'
 */
export async function listarItensEP() {
  const epis = await prismaNextsi.$queryRaw<
    {
      G01_ID: number;
      G01_CODIGO: string;
      G01_DESCRICAO: string;
      G01_TIPO: string;
      G01_GRUPOITEM?: string | null;
      G01_UM?: string | null;
      G01_FABRICANTE?: string | null;
      G01_DTNASC?: Date | null;
      G01_OBSERVACOES?: string | null;
      G01_PP?: string | null;
    }[]
  >`
    SELECT 
      G01_ID,
      G01_CODIGO,
      G01_DESCRICAO,
      G01_TIPO,
      G01_GRUPOITEM,
      G01_UM,
      G01_FABRICANTE,
      G01_DTNASC,
      G01_OBSERVACOES,
      G01_PP
    FROM dbo.G01
    WHERE G01_TIPO = 'EP'
      AND G01_EXCLUIDO = 'N'
    ORDER BY G01_DESCRICAO
  `;

  return epis;
}
/**
 * Busca saldos de itens no ERP
 * Fonte: NEXTSI_HOMOLOG.dbo.E01
 * Agrupa por item e soma as quantidades
 */
export async function obterSaldosItensERP(codigos: string[]) {
  if (!Array.isArray(codigos) || codigos.length === 0) return [];

  // Construir lista parametrizada para IN (...)
  const placeholders = codigos.map((_, i) => `$${i + 1}`).join(",");

  const saldos = await prismaNextsi.$queryRaw<
    { E01_ITEM: string; SaldoTotal: number }[]
  >`
    SELECT 
      E01_ITEM,
      SUM(CAST(E01_QUANTATUAL AS DECIMAL(18, 2))) AS SaldoTotal
    FROM dbo.E01
    WHERE E01_ITEM IN (${codigos.join(", ")})
      AND E01_EXCLUIDO = 'N'
    GROUP BY E01_ITEM
  `;

  return saldos || [];
}

/**
 * Busca saldos detalhados de um item (por local, lote, série)
 * Fonte: NEXTSI_HOMOLOG.dbo.E01
 */
export async function obterSaldosDetalhesERP(codigo: string) {
  const detalhes = await prismaNextsi.$queryRaw<
    {
      E01_ITEM: string;
      E01_LOCAL: string | null;
      E01_LOTE: string | null;
      E01_SERIE: string | null;
      E01_QUANTATUAL: number;
      E01_VENCTOLOTE: Date | null;
    }[]
  >`
    SELECT 
      E01_ITEM,
      E01_LOCAL,
      E01_LOTE,
      E01_SERIE,
      E01_QUANTATUAL,
      E01_VENCTOLOTE
    FROM dbo.E01
    WHERE E01_ITEM = ${codigo}
      AND E01_EXCLUIDO = 'N'
    ORDER BY E01_LOCAL, E01_LOTE, E01_SERIE
  `;

  return detalhes || [];
}
