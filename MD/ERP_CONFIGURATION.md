# 🔧 Integração do Banco ERP - Guia de Configuração

## 📋 Visão Geral

Seu sistema GestaoEPI agora está configurado para **consultar dados de EPIs do banco ERP/NEXT** enquanto mantém o controle no banco local (GestaoEPI).

## 📊 Arquitetura

```
┌─────────────────────┐
│   GestaoEPI (Local) │  ← Controle, histórico, entregas, devoluções
├─────────────────────┤
│  Backend Express.js │  ← API unificada
├─────────────────────┤
│  ERP/NEXT (Remoto)  │  ← Consulta itens e saldos
└─────────────────────┘
```

## 🚀 Configuração

### 1. Variáveis de Ambiente (`.env`)

Seu `.env` já está configurado:
```
NEXTSI_HOST=APLIC-SERVER
NEXTSI_PORT=1433
NEXTSI_USER=sa
NEXTSI_PASSWORD=Admin@next
NEXTSI_DATABASE=NEXTSI_HOMOLOG  # ← Ajuste se necessário
```

### 2. Estrutura de Tabelas ERP

⚠️ **IMPORTANTE**: Você precisa ajustar as queries em `src/services/erpService.js` conforme sua estrutura ERP.

As queries padrão usam:
- **Tabela G01**: Itens/Produtos
- **Tabela E01**: Estoque/Saldos

Se seu ERP usa nomes diferentes, ajuste as queries no serviço.

## 📡 Endpoints Disponíveis

### Consultar Todos os EPIs do ERP
```
GET http://localhost:3333/epis-erp
```

**Resposta:**
```json
{
  "sucesso": true,
  "total": 45,
  "dados": [
    {
      "codigo": "001",
      "nome": "Óculos de Proteção",
      "categoria": "OCULARES",
      "saldoEstoque": 120
    }
  ]
}
```

### Buscar EPI Específico
```
GET http://localhost:3333/epis-erp/001
```

### Buscar Saldos de Múltiplos Itens
```
POST http://localhost:3333/epis-erp/saldos
Content-Type: application/json

{
  "codigos": ["001", "002", "003"]
}
```

### Buscar EPIs por Categoria
```
GET http://localhost:3333/epis-erp/categoria/OCULARES
```

## 🔌 Instalação de Dependências

Execute no diretório `backend/`:
```bash
npm install mssql
```

## 🧪 Testando a Conexão

1. Inicie o servidor:
```bash
npm run dev
```

2. Teste a conexão com curl:
```bash
curl http://localhost:3333/epis-erp
```

Se receber a lista de itens do ERP, está funcionando! ✅

## ⚙️ Ajustando as Queries ERP

Edite `backend/src/services/erpService.js` e ajuste as queries SQL conforme sua estrutura real:

### Exemplo: Se suas tabelas são diferentes
```javascript
// ANTES (padrão):
const query = `
  SELECT 
    G01_CODIGO as codigo,
    G01_DESCRI as nome,
    ...
  FROM G01
  LEFT JOIN E01 ON ...
`;

// DEPOIS (sua estrutura real):
const query = `
  SELECT 
    ITEM_COD as codigo,
    ITEM_DESC as nome,
    ...
  FROM ITENS
  LEFT JOIN ESTOQUE ON ...
`;
```

## 💡 Casos de Uso

### 1️⃣ Sincronizar Estoque
```javascript
// No frontend ou em um cron job:
const saldosErp = await fetch('http://localhost:3333/epis-erp/saldos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    codigos: ['001', '002', '003'] 
  })
});
```

### 2️⃣ Verificar Disponibilidade antes de Entregar
```javascript
// Ao criar entrega:
const epiErp = await fetch(`http://localhost:3333/epis-erp/${codigoEpi}`);
const { saldoEstoque } = await epiErp.json();

if (saldoEstoque < quantidadeRequirida) {
  // Avisar usuário sobre saldo insuficiente
}
```

### 3️⃣ Dashboard com Dados do ERP
```javascript
// Combinar dados locais com do ERP:
const epiLocal = await fetch('http://localhost:3333/epis/1');
const epiErp = await fetch('http://localhost:3333/epis-erp/001');

const dadosCombinados = {
  ...epiLocal,
  saldoErp: epiErp.saldoEstoque,
  saldoLocal: epiLocal.estoqueAtual
};
```

## 🔒 Segurança

- **Não versione** suas credenciais no `.env`
- Use **variáveis de ambiente** em produção
- **Limite as queries** ao mínimo necessário
- Considere implementar **cache** para reduzir consultas

## 🐛 Troubleshooting

### Erro: "Cannot find module 'mssql'"
```bash
npm install mssql
```

### Erro: "Falha ao conectar ao ERP"
1. Verifique as credenciais no `.env`
2. Teste a conexão com `sqlcmd` ou SQL Server Management Studio
3. Verifique firewall (porta 1433)

### Erro: "Tabela não encontrada"
1. Ajuste o nome das tabelas em `erpService.js`
2. Verifique o nome correto do banco ERP
3. Teste a query direto no SQL Server

## 📞 Próximos Passos

1. ✅ Instalar dependências: `npm install mssql`
2. ✅ Ajustar nome do banco em `.env` (se diferente)
3. ✅ Ajustar queries SQL em `erpService.js`
4. ✅ Testar endpoints
5. ✅ Integrar no frontend

## 📝 Notas

- O serviço ERP usa **pool de conexões** para melhor performance
- Conexões são **reutilizadas** automaticamente
- Suporta **múltiplas queries** simultâneas
- Tratamento de erros integrado em cada função

---

**Dúvidas?** Revise os comentários no código de `erpService.js`! 📖
