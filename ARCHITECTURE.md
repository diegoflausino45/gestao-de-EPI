# 🏗️ Arquitetura de Integração ERP - Guia Visual

## 📊 Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                             │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Componentes & Hooks                                           │  │
│  │ ├─ EPIsErp (componente exemplo)                              │  │
│  │ ├─ useEpisErp() (listar todos)                              │  │
│  │ ├─ useSaldosErp() (buscar saldos)                           │  │
│  │ └─ useEpiErp(codigo) (buscar específico)                    │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                               ↓                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Services (apiErp.js)                                          │  │
│  │ ├─ listarEpisErp()                                           │  │
│  │ ├─ buscarEpiErp(codigo)                                      │  │
│  │ ├─ buscarSaldosErp(codigos[])                                │  │
│  │ └─ buscarEpisPorCategoriaErp(categoria)                      │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
                        HTTP Requests
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND API (Express.js)                         │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Routes (epiErp.routes.js)                                     │  │
│  │ ├─ GET /epis-erp                                             │  │
│  │ ├─ GET /epis-erp/:codigo                                     │  │
│  │ ├─ POST /epis-erp/saldos                                     │  │
│  │ └─ GET /epis-erp/categoria/:categoria                        │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                               ↓                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Services (erpService.js)                                      │  │
│  │ ├─ obterEpisDoErp()                                          │  │
│  │ ├─ obterEpiPorCodigo(codigo)                                 │  │
│  │ ├─ obterSaldosMultiplos(codigos[])                           │  │
│  │ ├─ obterEpisPorCategoria(categoria)                          │  │
│  │ └─ Pool de Conexão MSSQL                                     │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
                    SQL Queries via mssql
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                  BANCO DE DADOS ERP (SQL Server)                    │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Servidor: APLIC-SERVER                                      │   │
│  │ Porta: 1433                                                  │   │
│  │ Database: NEXTSI_HOMOLOG                                    │   │
│  │                                                              │   │
│  │ Tabelas:                                                    │   │
│  │ ├─ G01 (Itens/Produtos)                                     │   │
│  │ │  ├─ G01_CODIGO (chave primária)                           │   │
│  │ │  ├─ G01_DESCRI (descrição)                                │   │
│  │ │  └─ G01_CATEGOR (categoria)                               │   │
│  │ │                                                            │   │
│  │ └─ E01 (Estoque/Saldos)                                     │   │
│  │    ├─ E01_CODIGO (relaciona com G01_CODIGO)                │   │
│  │    └─ E01_SALDO (quantidade em estoque)                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de uma Requisição Completa

### 1️⃣ Usuário acessa a página de EPIs do ERP

```
Frontend: EPIsErp.jsx carrega
    ↓
useEpisErp() é executado
    ↓
apiErp.js: listarEpisErp() é chamado
    ↓
Backend: GET /epis-erp
    ↓
erpService.js: obterEpisDoErp()
    ↓
Cria conexão com banco ERP
    ↓
Executa SQL query:
    SELECT G01_CODIGO, G01_DESCRI, G01_CATEGOR, E01_SALDO
    FROM G01 LEFT JOIN E01 ON ...
    ↓
Retorna dados para o Frontend
    ↓
Componente renderiza lista de EPIs
```

---

## 🔌 Estados da Aplicação

### Estado 1: Carregando
```
Frontend exibe: "⏳ Carregando EPIs do ERP..."
Estado: { loading: true, episErp: [], erro: null }
```

### Estado 2: Sucesso
```
Frontend exibe: Lista de EPIs com saldos
Estado: { loading: false, episErp: [...], erro: null }
```

### Estado 3: Erro
```
Frontend exibe: "❌ Erro ao carregar: mensagem de erro"
Estado: { loading: false, episErp: [], erro: "Detalhes do erro" }
```

---

## 📝 Estrutura de Dados

### Resposta da API (GET /epis-erp)
```json
{
  "sucesso": true,
  "total": 45,
  "dados": [
    {
      "codigo": "001",
      "nome": "Óculos de Proteção",
      "categoria": "OCULARES",
      "saldoEstoque": 150
    },
    {
      "codigo": "002",
      "nome": "Luva de Segurança",
      "categoria": "MANUSEIO",
      "saldoEstoque": 300
    }
  ]
}
```

### Requisição de Saldos (POST /epis-erp/saldos)
```json
{
  "codigos": ["001", "002", "003"]
}
```

### Resposta de Saldos
```json
{
  "sucesso": true,
  "total": 3,
  "dados": [
    { "codigo": "001", "nome": "Óculos", "saldoEstoque": 150 },
    { "codigo": "002", "nome": "Luva", "saldoEstoque": 300 },
    { "codigo": "003", "nome": "Capacete", "saldoEstoque": 50 }
  ]
}
```

---

## 🔐 Fluxo de Segurança

```
Requisição
    ↓
Validação de entrada (códigos, categorias, etc)
    ↓
Parametrização SQL (previne SQL injection)
    ↓
Pool de conexão reutilizável
    ↓
Execução da query
    ↓
Tratamento de erros
    ↓
Resposta JSON estruturada
```

---

## 💾 Ciclo de Vida da Conexão

```
1. Primeira requisição
   ├─ getPool() verifica se pool existe
   ├─ Se não, cria nova ConnectionPool
   ├─ Conecta ao banco ERP
   └─ Log: "✅ Conectado ao banco ERP"

2. Requisições subsequentes
   ├─ Reusa a conexão do pool existente
   └─ Muito mais rápido (sem overhead de conexão)

3. Graceful shutdown (quando app termina)
   ├─ fecharConexaoErp() é chamado
   ├─ Pool.close()
   └─ Log: "🔌 Conexão ERP fechada"
```

---

## 🎯 Casos de Uso

### Caso 1: Sincronizar Estoque
```
Frontend obtém EPIs do ERP
    ↓
Compara com dados locais
    ↓
Atualiza interface com informações de saldo
```

### Caso 2: Validar Entrega
```
Ao criar entrega, verifica:
    ↓
GET /epis-erp/001
    ↓
Se saldoEstoque < quantidadeRequirida
    ↓
Exibe aviso "Saldo insuficiente no ERP"
```

### Caso 3: Dashboard com Dados do ERP
```
GET /epis (dados locais)
    +
GET /epis-erp (dados do ERP)
    ↓
Combina e exibe:
  - Saldo Local (GestaoEPI)
  - Saldo ERP (Estoque Central)
  - Diferença
```

---

## ⚙️ Configuração do Ambiente

```env
# Credenciais do ERP
NEXTSI_HOST=APLIC-SERVER          ← Servidor
NEXTSI_PORT=1433                   ← Porta padrão SQL Server
NEXTSI_USER=sa                     ← Usuário
NEXTSI_PASSWORD=Admin@next         ← Senha
NEXTSI_DATABASE=NEXTSI_HOMOLOG     ← Banco ERP

# Protocolo
├─ Encrypt: true (SSL/TLS)
└─ TrustServerCertificate: true (auto-assinado)
```

---

## 🧪 Teste Local

### 1. Verificar conexão no backend
```bash
cd backend
npm run dev

# Você deve ver: "✅ Conectado ao banco ERP"
```

### 2. Testar endpoint via curl
```bash
curl http://localhost:3333/epis-erp
```

### 3. Verificar resposta
```
Status 200 → ✅ Funcionando
Status 500 → ❌ Erro na query ou conexão
```

---

## 🔄 Sincronização de Dados

```
┌─ GestaoEPI (Local) ─────────────┐
│ ├─ Histórico de Entregas         │
│ ├─ Histórico de Devoluções       │
│ └─ Controle de Funcionários      │
└─────────────────────────────────┘
         ↑              ↓
    Leitura        Consulta
    Escrita          Apenas
                    Leitura
         ↑              ↓
┌─ ERP/NEXT (Remoto) ─────────────┐
│ ├─ Saldos de Estoque             │
│ ├─ Catálogo de Itens             │
│ └─ Informações de Produtos       │
└─────────────────────────────────┘
```

---

## 📊 Performance

### Pool de Conexões
- **Mínimo**: 0 conexões (inativas são liberadas)
- **Máximo**: 10 conexões simultâneas
- **Timeout Inativo**: 30 segundos

### Recomendações
- ✅ Reutilizar o serviço erpService.js para todas as queries
- ✅ Implementar cache para dados que mudam raramente
- ✅ Usar parametrização SQL para performance
- ⚠️ Evitar queries muito pesadas (USE TOP, WHERE)

---

## 📚 Referência Rápida

| Função | Uso | Retorna |
|--------|-----|---------|
| `listarEpisErp()` | Todos os EPIs | Array de objetos |
| `buscarEpiErp(cod)` | EPI específico | Objeto ou null |
| `buscarSaldosErp(arr)` | Múltiplos saldos | Array de objetos |
| `buscarEpisPorCategoriaErp(cat)` | EPIs por categoria | Array de objetos |

---

**Última atualização**: 12 de janeiro de 2026

**Status**: ✅ Pronto para implementação

