-- 📋 SCRIPT DE TESTE - Verificar Estrutura do Banco ERP
-- Execute estas queries no SQL Server Management Studio

-- 1. Listar todas as tabelas do banco ERP
USE NEXTSI_HOMOLOG;  -- Ajuste conforme seu banco ERP
GO

SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

-- 2. Verificar estrutura da tabela de Itens (G01 ou similar)
-- Procure por tabelas que contenham dados de produtos/itens
EXEC sp_help 'G01';  -- Se a tabela existe

-- 3. Verificar estrutura da tabela de Estoque (E01 ou similar)
EXEC sp_help 'E01';

-- 4. Ver alguns registros de itens
SELECT TOP 10 * FROM G01;

-- 5. Ver alguns registros de estoque
SELECT TOP 10 * FROM E01;

-- 6. Relacionar Itens e Estoque
SELECT TOP 10
  g.G01_CODIGO,
  g.G01_DESCRI,
  g.G01_CATEGOR,
  e.E01_SALDO
FROM G01 g
LEFT JOIN E01 e ON g.G01_CODIGO = e.E01_CODIGO;

-- Se as tabelas tiverem nomes diferentes, procure por:
-- - Tabelas que começam com três letras (ex: G01, E01, C05, etc)
-- - Colunas que terminam com _CODIGO, _DESCRI, _SALDO, _CATEGOR

-- 7. Se não encontrar G01/E01, liste tabelas e colunas relacionadas a produtos:
SELECT 
  TABLE_NAME,
  COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE COLUMN_NAME LIKE '%CODIGO%' OR COLUMN_NAME LIKE '%DESCRI%'
ORDER BY TABLE_NAME;

-- 8. Após identificar as tabelas corretas, use como referência:
-- Atualize os nomes das tabelas e colunas em: 
-- backend/src/services/erpService.js

-- Exemplo de possíveis nomes alternativos:
-- G01_CODIGO → ITEM_COD, PROD_COD, IT_CODIGO
-- G01_DESCRI → ITEM_DESC, PROD_DESC, IT_DESCRICAO
-- G01_CATEGOR → CATEGORIA, CATEG, TIPO
-- E01_SALDO → ESTOQUE, SALDO, QTDE_ESTOQUE

-- 9. Testando a query que será usada na aplicação:
SELECT 
  G01_CODIGO as codigo,
  G01_DESCRI as nome,
  G01_CATEGOR as categoria,
  E01_SALDO as saldoEstoque
FROM G01
LEFT JOIN E01 ON G01_CODIGO = E01_CODIGO
WHERE G01_TIPO = 'P'
ORDER BY G01_DESCRI;

-- Se receber erro, procure por G01_TIPO ou verifique os nomes das colunas

-- 10. Contar total de itens
SELECT COUNT(*) as total_itens FROM G01;
SELECT COUNT(*) as total_estoque FROM E01;

-- 11. Itens sem estoque relacionado
SELECT G01_CODIGO, G01_DESCRI 
FROM G01 g
LEFT JOIN E01 e ON g.G01_CODIGO = e.E01_CODIGO
WHERE e.E01_CODIGO IS NULL;

-- 12. Items com maior estoque
SELECT TOP 20
  G01_CODIGO,
  G01_DESCRI,
  E01_SALDO
FROM G01
LEFT JOIN E01 ON G01_CODIGO = E01_CODIGO
ORDER BY E01_SALDO DESC;

-- 13. Verificar tipos de dados das colunas
SELECT 
  COLUMN_NAME,
  DATA_TYPE,
  CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'G01'
ORDER BY ORDINAL_POSITION;

-- Depois de executar estas queries e identificar a estrutura real,
-- volte para backend/src/services/erpService.js e ajuste os nomes das colunas.
