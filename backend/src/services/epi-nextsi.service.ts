// src/services/epi-nextsi.service.ts
/**
 * Serviço para consultar dados do NEXTSI_HOMOLOG diretamente
 * Usa conexão SQL Server direta (sem Prisma) para melhor performance e controle
 */

import sql from "mssql";

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
