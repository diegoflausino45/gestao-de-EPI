# 🐛 Guia de Debugging - EPI Integration

## Cenários Comuns de Problema

### ❌ Problema: "Erro ao carregar EPIs"

#### Causa 1: Backend não está rodando
```bash
# Terminal 1 - Verificar se backend está rodando
curl http://localhost:4000/health
# Esperado: { "ok": true }
```

**Solução:**
```bash
cd gestao-epi-backend
npm run dev
# Deve aparecer: API EPI rodando na porta 4000
```

#### Causa 2: Banco de dados não está acessível
```bash
# Verificar conexão no arquivo: gestao-epi-backend/src/db/prisma.ts
# Credenciais esperadas:
# - SQL_HOST: APLIC-SERVER (ou localhost)
# - SQL_USER: api_epi_rw
# - SQL_PASSWORD: Enmaster@484539
# - SQL_DB: GESTAOEPI2
```

**Solução:**
1. Verificar se SQL Server está rodando
2. Verificar credenciais em `.env` ou `prisma.ts`
3. Testar conexão diretamente com SQL Management Studio

#### Causa 3: Tabela não existe
```sql
-- Executar no SQL Server para verificar
USE GESTAOEPI2;
SELECT COUNT(*) FROM dbo.Epi;

-- Deve retornar número de EPIs
```

**Solução:** Executar migrations do Prisma
```bash
cd gestao-epi-backend
npm run prisma:deploy
```

---

### ❌ Problema: "Saldos aparecem como 0"

#### Causa: Sinônimo ou tabela não existe no NEXTSI_HOMOLOG
```sql
-- Verificar se existe a tabela/sinônimo
USE NEXTSI_HOMOLOG;
SELECT COUNT(*) FROM dbo.erp_SaldoItens;

-- Se não existir, criar sinônimo (exemplo)
CREATE SYNONYM dbo.erp_SaldoItens FOR [NEXTSI_HOMOLOG].[dbo].E01;
```

**Solução:**
1. Verificar nome exato da tabela no NEXTSI_HOMOLOG
2. Se for outra tabela, atualizar `src/services/saldo.service.ts`:

```typescript
// Linha com: FROM dbo.erp_SaldoItens
// Trocar para: FROM [NEXTSI_HOMOLOG].[dbo].E01
// ou o nome correto
```

#### Verificar resposta da API:
```bash
# Terminal - Testar saldos
curl -X POST http://localhost:4000/api/itens/saldos-erp \
  -H "Content-Type: application/json" \
  -d '{"codigos": ["080101.00010"]}'

# Esperado:
# {"saldos":[{"codigo":"080101.00010","saldo":50}]}
```

---

### ❌ Problema: Tabela aparece vazia

#### Causa 1: Nenhum EPI cadastrado no banco
```sql
-- Verificar EPIs
USE GESTAOEPI2;
SELECT * FROM dbo.Epi;

-- Se vazio, inserir dados de teste
INSERT INTO dbo.Epi (codigo, tipo, descricao, estoqueMinimo)
VALUES ('TEST-001', 'Proteção Cabeça', 'EPI Teste', 10);
```

#### Causa 2: Erro na consulta de saldos (vide problema anterior)
- Verificar console do navegador (F12)
- Verificar logs do backend

---

### ❌ Problema: Botão "Adicionar EPI" não funciona

Este é comportamento esperado enquanto não integramos a criação com o backend.

**Próxima etapa:**
```typescript
// Em: src/containers/EPIs/index.jsx
// Atualizar handleSave() para chamar API:

async function handleSave(data) {
  try {
    const novo = await api.post('/api/epis', data);
    setEpi((prev) => [...prev, novo]);
  } catch (err) {
    alert('Erro ao salvar: ' + err.message);
  }
}
```

---

### ❌ Problema: Data de validade não aparece formatada

**Verificar no console:**
```javascript
// F12 > Console
console.log(new Date('2027-06-30T00:00:00.000Z').toLocaleDateString('pt-BR'))
// Esperado: 30/06/2027
```

**Solução:** Verificar se data está em ISO format no banco

---

### ❌ Problema: Status aparece como "undefined"

**Causa:** O campo `status` não é retornado do backend

**Solução:** Verificar resposta do backend
```bash
curl http://localhost:4000/api/epis | jq '.[0]'
# Deve incluir: estoqueMinimo, codigo, etc.
```

Se o backend não retorna `status`, o código frontend calcula automaticamente:
```javascript
status: (saldoMap[e.codigo] ?? 0) < e.estoqueMinimo ? "ATENÇÃO" : "OK"
```

---

## 🔍 Ferramentas de Debug

### VS Code
1. **Extensão REST Client** - Testar APIs sem terminal
   - Abrir: `gestao-epi-backend/requests.http`
   - Clicar em "Send Request"

2. **Debug Console** - F12 no navegador
   ```javascript
   // Copiar e colar:
   fetch('http://localhost:4000/api/epis')
     .then(r => r.json())
     .then(d => console.table(d))
   ```

### Terminal / PowerShell
```bash
# Testar backend
curl http://localhost:4000/api/epis
curl http://localhost:4000/health

# Testar conexão banco (se tiver sqlcmd)
sqlcmd -S APLIC-SERVER -U api_epi_rw -P Enmaster@484539 -d GESTAOEPI2 -Q "SELECT COUNT(*) FROM dbo.Epi"
```

### SQL Server Management Studio
```sql
-- Verificar EPIs
USE GESTAOEPI2;
SELECT TOP 10 codigo, tipo, descricao, estoqueMinimo FROM dbo.Epi;

-- Verificar saldos
USE NEXTSI_HOMOLOG;
SELECT TOP 10 E01_ITEM, SUM(E01_QUANTATUAL) FROM dbo.E01 GROUP BY E01_ITEM;
```

---

## 📊 Fluxo de Debugging

```
1. Frontend abre página EPIs
   └─ F12 > Network > Ver requisições

2. Observar requisição GET /api/epis
   ├─ Status 200? ✅
   ├─ Response válido? ✅
   └─ Sem dados? → Ir para passo 3

3. Observar requisição POST /api/itens/saldos-erp
   ├─ Status 200? ✅
   ├─ Saldos retornados? ✅
   └─ Erro? → Ir para passo 4

4. Verificar Console do Backend
   ├─ Erro na query? → Verificar SQL
   ├─ Conexão? → Verificar credenciais
   └─ Tabela não existe? → Executar migrations
```

---

## 💡 Tips & Tricks

### Limpar Cache do Frontend
```bash
# Vite tem cache agressivo
# Soluções:
1. Fechar DevTools e reabrir
2. Shift + F5 (hard refresh)
3. Limpar node_modules: rm -r node_modules && npm install
4. Reiniciar servidor: npm run dev
```

### Ver Logs do Backend em Tempo Real
```bash
# Com npm run dev - já mostra logs

# Ou adicionar mais verbose:
# Em gestao-epi-backend/src/index.ts:
console.log('📤 GET /api/epis chamado');
console.log('🔄 Resultado:', data);
```

### Testar API com Postman
1. Importar: `gestao-epi-backend/requests.http` (copiar manualmente)
2. Configurar Authorization se necessário
3. Testar cada endpoint isoladamente

---

## 🔗 Links Úteis

- **Documentação**: [INTEGRAÇÃO_EPI_SALDOS.md](INTEGRAÇÃO_EPI_SALDOS.md)
- **Resumo**: [RESUMO_IMPLEMENTAÇÃO.md](RESUMO_IMPLEMENTAÇÃO.md)
- **Instruções IA**: [.github/copilot-instructions.md](.github/copilot-instructions.md)

---

## 📞 Próximas Ações

Se após todos os passos ainda tiver problema:

1. Coletar logs do console (F12 ou backend)
2. Testar requisição HTTP diretamente:
   ```bash
   curl -v http://localhost:4000/api/epis
   ```
3. Verificar variáveis de ambiente
4. Contactar dev responsável com logs anexados
