import { prisma } from "../db/prisma.js";
import { Prisma } from "@prisma/client";
import sql from "mssql";

// src/services/epi.service.ts -- junção de epi.service.ts + epi-nextsi.service.ts + saldo.service.ts + movimentacao.service.ts

//LISTA TODOS OS EPIs DO BANCO LOCAL 
export async function listarEpis() {
  return prisma.epi.findMany();
}

// CRIA UM NOVO EPI NO BANCO LOCAL
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
  server: process.env.NEXTSI_HOST,
  port: Number(process.env.NEXTSI_PORT ?? 1433),
  user: process.env.NEXTSI_USER,
  password: process.env.NEXTSI_PASSWORD,
  database: "NEXTSI_HOMOLOG",
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// Pool de conexões reutilizável para o NEXTSI ERP - evita overhead de reconexão
let pool: sql.ConnectionPool | null = null;

// Função para obter o pool de conexões (cria se não existir) - SERVE PARA REUTILIZAÇÃO DE CONEXÕES
async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    // @ts-ignore
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log("[NEXTSI] Pool de conexão SQL estabelecido");
  }
  return pool;
}

// Função para checar a conexão com o NEXTSI (Healthcheck)
export async function checkConnection(): Promise<boolean> {
  try {
    const pool = await getPool();
    await pool.request().query("SELECT 1");
    return true;
  } catch (err) {
    console.error("[NEXTSI] Falha no Healthcheck:", err);
    return false;
  }
}

// Lista itens do tipo EP no NEXTSI
export async function listarItensEPNextsi() {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
        SELECT TOP 500
          G01_ID,
          G01_CODIGO,
          G01_DESCRICAO,
          G01_TIPO,
          G01_GRUPOITEM,
          G01_UM,
          G01_FABRICANTE,
          G01_DTNASC,
          G01_OBSERVACOES,
          G01_PP -- Estoque mínimo/PP (proposto) vindo do ERP
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

// Busca saldos de itens no ERP
// Fonte: NEXTSI_HOMOLOG.dbo.E01
// Agrupa por item e soma as quantidades
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

// Obtém detalhes do saldo de um item específico no NEXTSI (E01_LOCAL, E01_LOTE, E01_SERIE, etc.) 
export async function obterSaldoDetalheNextsi(codigo: string) {
  try {
    const pool = await getPool();
    const result = await pool.request().input("codigo", sql.VarChar(50), codigo)
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

// Atualiza o campo G01_PP (estoque mínimo / ponto de pedido) no NEXTSI
export async function atualizarEstoqueMinimoNextsi(
  codigo: string,
  novoPP: number
) {
  try {
    const pool = await getPool();
    await pool
      .request()
      .input("codigo", sql.VarChar(50), codigo)
      .input("pp", sql.Decimal(18, 4), novoPP).query(`
        UPDATE dbo.G01
        SET G01_PP = @pp
        WHERE G01_CODIGO = @codigo
      `);
    return { ok: true };
  } catch (err) {
    console.error("[NEXTSI] Erro ao atualizar G01_PP:", err);
    throw err;
  }
}

/**saldo.service.ts
 * Retorna o saldo (SUM de E01_QUANTATUAL) para um item no ERP (sinônimo dbo.erp_SaldoItens).
 * Se E01_QUANTATUAL for VARCHAR, descomente o CAST.
 */
/**
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

// Registra uma entrega de EPI - movimentação do tipo "ENTREGA"
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

// Registra uma devolução de EPI - movimentação do tipo "DEVOLUCAO"
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