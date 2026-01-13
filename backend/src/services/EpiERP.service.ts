//JUNÇÃO DE epi.service.ts + epi-nextsi.service.ts + saldo.service.ts + movimentacao.service.ts

// src/services/epi.service.ts
import { prisma } from "../db/prisma.js";
import { Prisma } from "@prisma/client";
import sql from "mssql";

export async function listarEpis() {
  return prisma.epi.findMany();
}

export async function criarEpi(data: {
  codigo: string;
  tipo: string;
  descricao: string;
  CA?: string;
  validadeCA?: Date;
  vidaUtilMeses?: number;
  fabricante?: string;
  estoqueMinimo?: number;
}) {
  return prisma.epi.create({ data });
}


// src/services/epi-nextsi.service.ts
/**
 * Serviço para consultar dados do NEXTSI_HOMOLOG diretamente
 * Usa conexão SQL Server direta (sem Prisma) para melhor performance e controle
 */
const config = {
  server: process.env.NEXTSI_HOST || "APLIC-SERVER",
  port: Number(process.env.NEXTSI_PORT || 1433),
  database: "NEXTSI_HOMOLOG",
  user: process.env.NEXTSI_USER || "sa",
  password: process.env.NEXTSI_PASSWORD || "",
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

let pool: sql.ConnectionPool | null = null;

async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log("[NEXTSI] Pool de conexão SQL estabelecido");
  }
  return pool;
}

export async function listarItensEPNextsi() {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .query(`
        SELECT TOP 500
          G01_ID,
          G01_CODIGO,
          G01_DESCRICAO,
          G01_TIPO,
          G01_GRUPOITEM,
          G01_UM,
          G01_FABRICANTE,
          G01_DTNASC,
          G01_OBSERVACOES
        FROM dbo.G01
        WHERE G01_TIPO = 'EP'
          AND G01_EXCLUIDO = 'N'
        ORDER BY G01_DESCRICAO
      `);

    return result.recordset || [];
  } catch (err) {
    console.error("[NEXTSI] Erro ao listar itens EP:", err);
    throw err;
  }
}

export async function obterSaldosNextsi(codigos: string[]) {
  try {
    if (!codigos || codigos.length === 0) return [];

    const pool = await getPool();
    const placeholders = codigos.map((_, i) => `@cod${i}`).join(",");

    const request = pool.request();
    codigos.forEach((cod, i) => {
      request.input(`cod${i}`, sql.VarChar(50), cod);
    });

    const result = await request.query(`
      SELECT 
        E01_ITEM,
        SUM(CAST(E01_QUANTATUAL AS DECIMAL(18, 2))) AS SaldoTotal
      FROM dbo.E01
      WHERE E01_ITEM IN (${placeholders})
        AND E01_EXCLUIDO = 'N'
      GROUP BY E01_ITEM
    `);

    return result.recordset || [];
  } catch (err) {
    console.error("[NEXTSI] Erro ao obter saldos:", err);
    throw err;
  }
}

export async function obterSaldoDetalheNextsi(codigo: string) {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("codigo", sql.VarChar(50), codigo)
      .query(`
        SELECT 
          E01_ITEM,
          E01_LOCAL,
          E01_LOTE,
          E01_SERIE,
          E01_QUANTATUAL,
          E01_VENCTOLOTE
        FROM dbo.E01
        WHERE E01_ITEM = @codigo
          AND E01_EXCLUIDO = 'N'
        ORDER BY E01_LOCAL, E01_LOTE, E01_SERIE
      `);

    return result.recordset || [];
  } catch (err) {
    console.error("[NEXTSI] Erro ao obter detalhes do saldo:", err);
    throw err;
  }
}

// Função para fechar o pool (chamar no shutdown da app)
export async function closePool() {
  if (pool) {
    await pool.close();
    pool = null;
    console.log("[NEXTSI] Pool de conexão fechado");
  }
}



/**saldo.service.ts
 * Retorna o saldo (SUM de E01_QUANTATUAL) para um item no ERP (sinônimo dbo.erp_SaldoItens).
 * Se E01_QUANTATUAL for VARCHAR, descomente o CAST.
 */
export async function obterSaldoItem(codigoItem: string) {
  const rows = await prisma.$queryRaw<
    { E01_ITEM: string; SaldoAtual: number }[]
  >`SELECT E01_ITEM,
           SUM(/* CAST( */ E01_QUANTATUAL /* AS DECIMAL(18,4)) */) AS SaldoAtual
     FROM dbo.erp_SaldoItens
     WHERE E01_ITEM = ${codigoItem}
     GROUP BY E01_ITEM`;

  return rows?.[0]?.SaldoAtual ?? 0;
}

/**
 * (Opcional) Lista saldos por Local/Lote/Série do item (útil para auditoria e conferência física)
 */
export async function listarSaldosDetalhados(codigoItem: string) {
  const rows = await prisma.$queryRaw<
    {
      E01_ITEM: string;
      E01_LOCAL: string | null;
      E01_LOTE: string | null;
      E01_SERIE: string | null;
      Quantidade: number;
    }[]
  >`SELECT E01_ITEM, E01_LOCAL, E01_LOTE, E01_SERIE,
           SUM(/* CAST( */ E01_QUANTATUAL /* AS DECIMAL(18,4)) */) AS Quantidade
     FROM dbo.erp_SaldoItens
     WHERE E01_ITEM = ${codigoItem}
     GROUP BY E01_ITEM, E01_LOCAL, E01_LOTE, E01_SERIE
     ORDER BY E01_LOCAL, E01_LOTE, E01_SERIE`;

  return rows;
}

/**
 * Retorna saldos para uma lista de códigos.
 * - codigos: array de strings (ex.: ["EPI-001", "EPI-002"])
 * - Consulta via sinônimo dbo.erp_SaldoItens (NEXTSI_HOMOLOG.dbo.E01)
 */
export async function obterSaldosPorItens(codigos: string[]) {
  if (!Array.isArray(codigos) || codigos.length === 0) return [];

  // Constrói lista parametrizada para IN (...)
  const params = Prisma.join(codigos.map((c) => Prisma.sql`${c}`));

  // Se E01_QUANTATUAL for VARCHAR, descomente CAST p/ DECIMAL
  const query = Prisma.sql`
    SELECT E01_ITEM AS codigo,
           SUM(/* CAST( */ E01_QUANTATUAL /* AS DECIMAL(18,4)) */) AS saldo
    FROM dbo.erp_SaldoItens
    WHERE E01_ITEM IN (${params})
    GROUP BY E01_ITEM
  `;

  const rows = await prisma.$queryRaw<{ codigo: string; saldo: number }[]>(
    query
  );
  return rows;
}

// src/services/movimentacao.service.ts

type MovDto = {
  epiId: number;
  colaboradorId: number;
  quantidade: number;
  responsavel: string;
  observacao?: string;
  lote?: string;
};

export async function entregar(dto: MovDto) {
  return prisma.$transaction(async (tx) => {
    const mov = await tx.movimentacaoEpi.create({
      data: {
        epiId: dto.epiId,
        colaboradorId: dto.colaboradorId,
        tipo: "ENTREGA",
        quantidade: dto.quantidade,
        responsavel: dto.responsavel,
        observacao: dto.observacao,
        lote: dto.lote,
      },
    });
    return mov;
  });
}

export async function devolver(dto: MovDto) {
  return prisma.$transaction(async (tx) => {
    const mov = await tx.movimentacaoEpi.create({
      data: {
        epiId: dto.epiId,
        colaboradorId: dto.colaboradorId,
        tipo: "DEVOLUCAO",
        quantidade: dto.quantidade,
        responsavel: dto.responsavel,
        observacao: dto.observacao,
        lote: dto.lote,
      },
    });
    return mov;
  });
}