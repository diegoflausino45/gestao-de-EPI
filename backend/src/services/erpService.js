import "dotenv/config";
import sql from "mssql";

// Configuração de conexão com banco ERP
const erpConfig = {
  user: process.env.NEXTSI_USER || "sa",
  password: process.env.NEXTSI_PASSWORD || "Admin@next",
  database: process.env.NEXTSI_DATABASE || "NEXTSI_HOMOLOG",
  server: process.env.NEXTSI_HOST || "APLIC-SERVER",
  port: parseInt(process.env.NEXTSI_PORT || "1433"),
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

let pool = null;

// Inicializar pool de conexão
async function getPool() {
  if (!pool) {
    pool = new sql.ConnectionPool(erpConfig);
    await pool.connect();
    console.log("✅ Conectado ao banco ERP");
  }
  return pool;
}

/**
 * Buscar todos os EPIs/Itens do banco ERP
 * Ajuste a query conforme a estrutura do seu banco ERP
 */
export async function obterEpisDoErp() {
  try {
    const pool = await getPool();
    
    // Exemplo de query - AJUSTE CONFORME SUA ESTRUTURA ERP
    // Tabelas comuns em ERPs: G01 (itens), E01 (saldos), SC5 (pedidos), etc.
    const query = `
      SELECT 
        G01_CODIGO as codigo,
        G01_DESCRICAO as nome,
        G01_GRUPOITEM as categoria,
        E01_QUANTATUAL as saldoEstoque
      FROM G01
      LEFT JOIN E01 ON G01_CODIGO = E01_ITEM AND E01_EXCLUIDO = 'N'
      WHERE G01_TIPO = 'EP'
        AND G01_EXCLUIDO = 'N'
      ORDER BY G01_DESCRICAO
    `;

    const result = await pool.request().query(query);
    return result.recordset || [];
  } catch (error) {
    console.error("❌ Erro ao buscar EPIs do ERP:", error.message);
    throw new Error(`Erro ao consultar ERP: ${error.message}`);
  }
}

/**
 * Buscar EPI específico por código
 */
export async function obterEpiPorCodigo(codigo) {
  try {
    const pool = await getPool();
    
    const query = `
      SELECT 
        G01_CODIGO as codigo,
        G01_DESCRICAO as nome,
        G01_GRUPOITEM as categoria,
        E01_QUANTATUAL as saldoEstoque
      FROM G01
      LEFT JOIN E01 ON G01_CODIGO = E01_ITEM AND E01_EXCLUIDO = 'N'
      WHERE G01_CODIGO = @codigo
        AND G01_EXCLUIDO = 'N'
    `;

    const result = await pool.request()
      .input('codigo', sql.VarChar, codigo)
      .query(query);
    
    return result.recordset?.[0] || null;
  } catch (error) {
    console.error("❌ Erro ao buscar EPI do ERP:", error.message);
    throw new Error(`Erro ao consultar ERP: ${error.message}`);
  }
}

/**
 * Buscar saldos de múltiplos itens
 */
export async function obterSaldosMultiplos(codigos) {
  try {
    const pool = await getPool();
    
    // Criar IN clause dinamicamente
    const codigosFormatados = codigos.map(c => `'${c}'`).join(',');
    
    const query = `
      SELECT 
        G01_CODIGO as codigo,
        G01_DESCRICAO as nome,
        E01_QUANTATUAL as saldoEstoque
      FROM G01 AND E01_EXCLUIDO = 'N'
      WHERE G01_CODIGO IN (${codigosFormatados})
        AND G01_EXCLUIDO = 'N'
      WHERE G01_CODIGO IN (${codigosFormatados})
    `;

    const result = await pool.request().query(query);
    return result.recordset || [];
  } catch (error) {
    console.error("❌ Erro ao buscar saldos do ERP:", error.message);
    throw new Error(`Erro ao consultar ERP: ${error.message}`);
  }
}

/**
 * Buscar EPIs por categoria
 */
export async function obterEpisPorCategoria(categoria) {
  try {
    const pool = await getPool();
    
    const query = `
      SELECT 
        G01_CODIGO as codigo,
        G01_DESCRICAO as nome,
        G01_GRUPOITEM as categoria,
        E01_QUANTATUAL as saldoEstoque AND E01_EXCLUIDO = 'N'
      WHERE G01_GRUPOITEM = @categoria
        AND G01_EXCLUIDO = 'N'
      LEFT JOIN E01 ON G01_CODIGO = E01_ITEM
      WHERE G01_GRUPOITEM = @categoria
      ORDER BY G01_DESCRICAO
    `;

    const result = await pool.request()
      .input('categoria', sql.VarChar, categoria)
      .query(query);
    
    return result.recordset || [];
  } catch (error) {
    console.error("❌ Erro ao buscar EPIs por categoria:", error.message);
    throw new Error(`Erro ao consultar ERP: ${error.message}`);
  }
}

/**
 * Fechar conexão (útil para graceful shutdown)
 */
export async function fecharConexaoErp() {
  if (pool) {
    await pool.close();
    pool = null;
    console.log("🔌 Conexão ERP fechada");
  }
}

export default {
  obterEpisDoErp,
  obterEpiPorCodigo,
  obterSaldosMultiplos,
  obterEpisPorCategoria,
  fecharConexaoErp
};
