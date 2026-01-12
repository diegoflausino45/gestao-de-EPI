# 🚀 Guia de Implementação Passo a Passo

## ⏱️ Tempo estimado: 15-30 minutos

Siga este guia na ordem para implementar a integração com o banco ERP.

---

## ✅ PASSO 1: Preparar o Ambiente (2 minutos)

### 1.1 Abra o terminal no diretório backend
```powershell
cd c:\Users\diego.flausino\Desktop\gestaoEpi\gestao-de-EPI\backend
```

### 1.2 Instale a dependência `mssql`
```powershell
npm install mssql
```

**Você deve ver algo como:**
```
added 25 packages, and audited 50 packages
```

---

## ✅ PASSO 2: Verificar Estrutura do ERP (5-10 minutos)

### 2.1 Abra SQL Server Management Studio

### 2.2 Conecte ao servidor APLIC-SERVER
```
Servidor: APLIC-SERVER
Autenticação: SQL Server
Login: sa
Senha: Admin@next
```

### 2.3 Execute o script de teste
1. Abra um novo "New Query"
2. Copie o conteúdo de `ERP_TEST_QUERIES.sql`
3. Execute as queries uma por uma (F5 ou Ctrl+E)
4. Procure por:
   - ✅ Tabelas G01 (itens) e E01 (estoque) existem?
   - ✅ Qual o nome exato das colunas?
   - ✅ Os dados estão acessíveis?

### 2.4 Ajuste os nomes conforme encontrado
Se os nomes forem diferentes (ex: não é G01_CODIGO mas ITEM_COD):
1. Abra `backend/src/services/erpService.js`
2. Procure pelas queries SQL
3. Substitua pelos nomes corretos de suas tabelas

---

## ✅ PASSO 3: Verificar Variáveis de Ambiente (1 minuto)

### 3.1 Abra o arquivo `.env` do backend
```
backend/.env
```

### 3.2 Confirme as variáveis (já devem estar lá):
```
NEXTSI_HOST=APLIC-SERVER
NEXTSI_PORT=1433
NEXTSI_USER=sa
NEXTSI_PASSWORD=Admin@next
NEXTSI_DATABASE=NEXTSI_HOMOLOG
```

**Se alguma não existir, adicione!**

---

## ✅ PASSO 4: Iniciar o Backend (2 minutos)

### 4.1 No terminal backend, execute:
```powershell
npm run dev
```

### 4.2 Aguarde até ver:
```
🚀 API rodando em http://localhost:3333
✅ Conectado ao banco ERP
```

**Se não aparecer "✅ Conectado", verifique:**
- ✗ As credenciais no `.env`
- ✗ Se o servidor APLIC-SERVER está acessível
- ✗ Se o firewall permite porta 1433

---

## ✅ PASSO 5: Testar os Endpoints (5 minutos)

### 5.1 Abra outro PowerShell (não feche o backend!)

### 5.2 Teste o primeiro endpoint
```powershell
curl http://localhost:3333/epis-erp
```

**Resposta esperada:**
```json
{
  "sucesso": true,
  "total": 45,
  "dados": [
    { "codigo": "001", "nome": "Óculos", ... },
    ...
  ]
}
```

### 5.3 Se tudo está OK, teste os outros:

**Buscar EPI específico:**
```powershell
curl http://localhost:3333/epis-erp/001
```

**Buscar múltiplos saldos:**
```powershell
curl -X POST http://localhost:3333/epis-erp/saldos `
  -H "Content-Type: application/json" `
  -d '{\"codigos\":[\"001\",\"002\"]}'
```

**Buscar por categoria:**
```powershell
curl http://localhost:3333/epis-erp/categoria/OCULARES
```

---

## ✅ PASSO 6: Integrar no Frontend (5-10 minutos)

### 6.1 Abra um novo terminal e vá para frontend
```powershell
cd c:\Users\diego.flausino\Desktop\gestaoEpi\gestao-de-EPI\frontend
```

### 6.2 Inicie o frontend (se não estiver rodando)
```powershell
npm run dev
```

### 6.3 Use os hooks no seu componente

**Exemplo simples - adicione em qualquer componente:**
```jsx
import { useEpisErp } from '../../hooks/useErpEpis';

export function MeuComponente() {
  const { episErp, loading, erro } = useEpisErp();
  
  if (loading) return <p>Carregando...</p>;
  if (erro) return <p>Erro: {erro}</p>;
  
  return (
    <ul>
      {episErp.map(epi => (
        <li key={epi.codigo}>{epi.nome}</li>
      ))}
    </ul>
  );
}
```

### 6.4 Ou use o componente pronto
```jsx
import EPIsErp from '../../components/EPIsErp';

export function Dashboard() {
  return <EPIsErp />;
}
```

---

## ✅ PASSO 7: Testar Fluxo Completo (3-5 minutos)

### 7.1 Acesse o frontend no navegador
```
http://localhost:5173  (ou a porta que estiver usando)
```

### 7.2 Navegue para a página com EPIs do ERP

### 7.3 Você deve ver:
- ✅ Lista de EPIs carregada
- ✅ Saldos do ERP visíveis
- ✅ Busca/filtro funcionando
- ✅ Sem erros no console (F12)

---

## 🆘 Troubleshooting Rápido

### Problema: "Cannot find module 'mssql'"
```powershell
npm install mssql
```

### Problema: "Tabela G01 não encontrada"
1. Verifique o nome correto da tabela no SQL Server
2. Ajuste em `backend/src/services/erpService.js`
3. Reinicie o backend

### Problema: "ELOGIN - Login failed"
1. Verifique credenciais no `.env`
2. Teste conexão direto no SSMS (SQL Server Management Studio)
3. Verifique permissões do usuário `sa`

### Problema: "ETIMEOUT - Connection timeout"
1. Verifique se servidor está online: `ping APLIC-SERVER`
2. Verifique firewall porta 1433
3. Verifique se SQL Server está rodando

---

## 📊 Verificação de Sucesso

| Item | Status | Como verificar |
|------|--------|-----------------|
| Dependência mssql instalada | ✅ | `npm list mssql` |
| Backend conectado ao ERP | ✅ | Console mostra "✅ Conectado" |
| Endpoint /epis-erp retorna dados | ✅ | `curl http://localhost:3333/epis-erp` |
| Frontend consegue listar EPIs | ✅ | Vê lista no navegador |
| Saldos aparecem corretamente | ✅ | Números visíveis |
| Sem erros no console | ✅ | F12 no navegador |

---

## 🎯 Próximas Funcionalidades (Opcionais)

Depois que tudo estiver funcionando, você pode:

1. **Sincronizar Estoque Automático**
   - Adicione um cron job para atualizar saldos periodicamente

2. **Cache de Dados**
   - Implemente Redis para reduzir consultas ao ERP

3. **Alertas de Saldo Baixo**
   - Notifique quando item estiver abaixo do mínimo

4. **Dashboard com Gráficos**
   - Visualize saldos em tempo real

5. **Integração Bidirecional**
   - Envie dados de volta para o ERP (avançado)

---

## 💾 Commits Git (Recomendado)

Depois de cada passo bem-sucedido:
```powershell
git add .
git commit -m "feat: integração com banco ERP - passo X"
git push
```

---

## 📞 Checklist Final

- [ ] npm install mssql executado
- [ ] Variáveis de ambiente verificadas
- [ ] Estrutura do ERP validada no SSMS
- [ ] Backend iniciado com sucesso
- [ ] Endpoints testados via curl
- [ ] Frontend conectado e exibindo dados
- [ ] Sem erros no console do navegador
- [ ] Testes funcionando conforme esperado

---

## ✨ Resultado Esperado

**Backend rodando:**
```
✅ Conectado ao banco ERP
GET /epis-erp 200 25ms
GET /epis-erp/001 200 18ms
POST /epis-erp/saldos 200 22ms
```

**Frontend exibindo:**
```
📦 EPIs do EPI
Total: 45 itens

[Card 1] Óculos - COD001 - Estoque: 150 unidades
[Card 2] Luva - COD002 - Estoque: 300 unidades
[Card 3] Capacete - COD003 - Estoque: 50 unidades
```

---

**Parabéns! 🎉 Sua integração com o banco ERP está completa!**

Qualquer dúvida, consulte:
- `IMPLEMENTATION_SUMMARY.md` - Resumo da implementação
- `ARCHITECTURE.md` - Arquitetura detalhada
- `ERP_CONFIGURATION.md` - Configuração avançada
- `ERP_TEST_QUERIES.sql` - Queries de teste

