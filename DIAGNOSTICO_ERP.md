# 🔍 Diagnóstico - Sistema não puxa do ERP

## ✅ Erros Corrigidos

1. **Frontend - Erro TypeScript em arquivo .js**
   - ✅ Removidas anotações de tipo de `api.js`
   - ✅ Arquivo agora está compilando

## 🔧 Próximos Passos para Conectar ao ERP

### Passo 1: Instalar Dependência `mssql` (OBRIGATÓRIO)

```bash
cd backend
npm install mssql
```

Se você já tentou e ainda está com problema, tente:
```bash
npm install mssql --force
```

### Passo 2: Verificar o `.env`

```
# backend/.env - Verifique se tem:
NEXTSI_HOST=APLIC-SERVER
NEXTSI_PORT=1433
NEXTSI_USER=sa
NEXTSI_PASSWORD=Admin@next
NEXTSI_DATABASE=NEXTSI_HOMOLOG
```

### Passo 3: Verificar Estrutura ERP

Abra SQL Server Management Studio e execute:
```sql
USE NEXTSI_HOMOLOG
SELECT TOP 5 * FROM G01
SELECT TOP 5 * FROM E01
```

Se receber erro "tabela não encontrada", os nomes das tabelas são diferentes.

### Passo 4: Ajustar as Queries (se necessário)

Se as tabelas não forem G01 e E01, edite:
```
backend/src/services/erpService.js
```

Procure pelas queries SQL e ajuste os nomes das tabelas.

### Passo 5: Reiniciar Backend

```bash
cd backend
npm run dev
```

Você deve ver:
```
✅ Conectado ao banco ERP
🚀 API rodando em http://localhost:3333
```

### Passo 6: Testar Conexão

```bash
curl http://localhost:3333/epis-erp
```

Deve retornar JSON com EPIs do ERP.

---

## 🆘 Se Ainda Não Funcionar

### Problema: "Cannot find module 'mssql'"
```bash
# Solução:
npm install mssql
npm run dev
```

### Problema: "ELOGIN - Login failed"
```
Verifique:
1. NEXTSI_USER e NEXTSI_PASSWORD no .env
2. Se o usuário `sa` tem permissões no SQL Server
3. Se o servidor APLIC-SERVER está acessível
```

### Problema: "ETIMEOUT - Connection timeout"
```
Verifique:
1. Se APLIC-SERVER está online: ping APLIC-SERVER
2. Firewall permite porta 1433
3. Se SQL Server está rodando
```

### Problema: "Tabela G01 não encontrada"
```
Verifique:
1. Nome correto da tabela de itens
2. Nome correto da tabela de estoque
3. Ajuste em backend/src/services/erpService.js
```

---

## 📋 Checklist para Funcionar

- [ ] `mssql` instalado (`npm list mssql`)
- [ ] `.env` tem NEXTSI_HOST, NEXTSI_USER, etc
- [ ] Backend inicia sem erros (`npm run dev`)
- [ ] Console mostra "✅ Conectado ao banco ERP"
- [ ] `curl http://localhost:3333/epis-erp` retorna dados
- [ ] Frontend mostra EPIs na interface

---

## 💾 Resumo das Dependências Necessárias

```json
{
  "dependencies": {
    "express": "^5.2.1",
    "mssql": "^11.4.0",      ← IMPORTANTE!
    "dotenv": "^17.2.3",
    "cors": "^2.8.5",
    "nodemon": "^3.1.11",
    "@prisma/adapter-mssql": "^7.2.0",
    "@prisma/client": "^7.2.0"
  }
}
```

---

**Status:** Aguardando instalação de dependências

**Próximo comando:** `npm install mssql` no backend

