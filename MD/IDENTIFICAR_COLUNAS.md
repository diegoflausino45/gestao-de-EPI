# 🔧 Identificar Nomes Corretos das Colunas

## 🎯 O que precisa ser feito

A query do ERP está usando nomes de colunas que não existem. Preciso que você identifique os nomes **reais** das colunas.

## 📊 Execute estas queries no SQL Server Management Studio

### Query 1: Ver todas as colunas da tabela G01
```sql
USE NEXTSI_HOMOLOG
GO

SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'G01' 
ORDER BY ORDINAL_POSITION;
GO
```

### Query 2: Ver algumas colunas principais
```sql
USE NEXTSI_HOMOLOG
GO

SELECT TOP 5 * FROM G01;
GO
```

Isso vai mostrar os nomes reais das colunas.

## 📝 Depois, preencha aqui

Após executar as queries, identifique:

| Função | Nome Atual (Errado) | Nome Real (Correto) |
|--------|-------------------|-------------------|
| **Código do Item** | G01_CODIGO | \_\_\_\_\_\_\_\_\_\_\_ |
| **Descrição** | G01_DESCRI | \_\_\_\_\_\_\_\_\_\_\_ |
| **Categoria** | G01_CATEGOR | \_\_\_\_\_\_\_\_\_\_\_ |
| **Tipo** | G01_TIPO | \_\_\_\_\_\_\_\_\_\_\_ |

### Query 3: Ver colunas da tabela E01 (Estoque)
```sql
USE NEXTSI_HOMOLOG
GO

SELECT TOP 5 * FROM E01;
GO
```

| Função | Nome Atual (Errado) | Nome Real (Correto) |
|--------|-------------------|-------------------|
| **Código** | E01_CODIGO | \_\_\_\_\_\_\_\_\_\_\_ |
| **Saldo** | E01_SALDO | \_\_\_\_\_\_\_\_\_\_\_ |

## 📌 Exemplo de resposta esperada

Se você executar as queries e vir:
```
G01_CODIGO
G01_DESC        ← (note: DESC, não DESCRI)
G01_CAT         ← (note: CAT, não CATEGOR)
G01_TP
```

Então você me diz:
- Código do Item: **G01_CODIGO** ✅
- Descrição: **G01_DESC** (não é DESCRI!)
- Categoria: **G01_CAT** (não é CATEGOR!)
- Tipo: **G01_TP** (não é G01_TIPO!)

E para E01:
```
E01_CODIGO
E01_ESTOQUE     ← (note: ESTOQUE, não SALDO!)
```

Então:
- Código: **E01_CODIGO** ✅
- Saldo: **E01_ESTOQUE** (não é E01_SALDO!)

## ✅ Próximo Passo

Depois que você identificar os nomes corretos, me avisa aqui e eu ajusto o código automaticamente!

---

**Não consegue executar as queries?** Me diga quais foram os nomes das colunas que você viu quando fez `SELECT TOP 5 * FROM G01`
