# 📋 Estrutura de Dados - EPI Integration

## 📊 Bancos de Dados Envolvidos

### GESTAOEPI2 (Banco Principal)
Armazena toda a lógica de gestão de EPIs.

#### Tabela: `dbo.Epi`
```
┌──────────────────────────────────────────────────────────────┐
│                           Epi                                 │
├──────────────────────────────────────────────────────────────┤
│ id               INT         @id @default(autoincrement)      │
│ codigo           STRING      @unique                          │
│ tipo             STRING      (ex: "Proteção Cabeça")          │
│ descricao        STRING      (ex: "Capacete de Segurança")    │
│ CA               STRING?     (ex: "CA 31469")                 │
│ validadeCA       DateTime?   (ex: "2027-06-30")               │
│ vidaUtilMeses    INT         (ex: 24)                         │
│ fabricante       STRING?     (ex: "Protec")                   │
│ estoqueMinimo    INT         (ex: 30)                         │
│ Movimentacoes    MovimentacaoEpi[] (Relacionamento 1:N)       │
└──────────────────────────────────────────────────────────────┘

Exemplo de Registro:
{
  "id": 1,
  "codigo": "080101.00010",
  "tipo": "Proteção Respiratória",
  "descricao": "MASCARA DE SOLDA ESAB A20",
  "CA": "67890",
  "validadeCA": "2027-06-30T00:00:00.000Z",
  "vidaUtilMeses": 24,
  "fabricante": "Protec",
  "estoqueMinimo": 5
}
```

---

### NEXTSI_HOMOLOG (Banco ERP Externo)
Armazena saldos e movimentação de estoque.

#### Tabela: `dbo.erp_SaldoItens` (Sinônimo de E01)
```
┌─────────────────────────────────────────────┐
│            erp_SaldoItens                   │
├─────────────────────────────────────────────┤
│ E01_ITEM         STRING (Código do item)    │
│ E01_QUANTATUAL   NUMERIC (Quantidade)       │
│ E01_LOCAL        STRING? (Local estoque)    │
│ E01_LOTE         STRING? (Número lote)      │
│ E01_SERIE        STRING? (Série/Serial)     │
└─────────────────────────────────────────────┘

Exemplo de Registros:
┌─────────────────┬──────────────┬────────┬─────────┬────────┐
│ E01_ITEM        │ E01_QUANTATUAL│ E01_LOCAL│ E01_LOTE│ E01_SERIE│
├─────────────────┼──────────────┼────────┼─────────┼────────┤
│ 080101.00010    │ 50           │ PA-01  │ L001    │ NULL   │
│ 080101.00010    │ 30           │ PA-02  │ L002    │ NULL   │
│ 080102.00020    │ 100          │ PA-01  │ L003    │ SN123  │
└─────────────────┴──────────────┴────────┴─────────┴────────┘

Query SUM:
SELECT E01_ITEM, SUM(E01_QUANTATUAL)
FROM dbo.erp_SaldoItens
WHERE E01_ITEM = '080101.00010'
GROUP BY E01_ITEM
→ Resultado: 80 (50 + 30)
```

---

## 🔄 Fluxo de Dados - Frontend

### 1. Estado React (src/containers/EPIs/index.jsx)

```javascript
// Estado antes de carregar
{
  epi: [],                    // Array de EPIs com saldos
  epiFiltrados: [],           // EPIs filtrados pela busca
  loading: true,              // Mostrando spinner
  error: null,                // Sem erro
  search: ""                  // Campo de busca vazio
}

// Estado após carregar
{
  epi: [
    {
      id: 1,
      codigo: "080101.00010",
      tipo: "Proteção Respiratória",
      descricao: "MASCARA DE SOLDA ESAB A20",
      CA: "67890",
      validadeCA: "2027-06-30T00:00:00.000Z",
      vidaUtilMeses: 24,
      fabricante: "Protec",
      estoqueMinimo: 5,
      // Campos adicionados pelo frontend:
      estoqueAtual: 80,        // Vem do NEXTSI_HOMOLOG
      status: "OK"             // Calculado: 80 >= 5 ? "OK" : "ATENÇÃO"
    },
    // ... mais EPIs
  ],
  epiFiltrados: [...], // Filtrado por search
  loading: false,      // Acabou de carregar
  error: null,
  search: ""
}
```

---

### 2. Resposta API - GET /api/epis

```json
[
  {
    "id": 1,
    "codigo": "080101.00010",
    "tipo": "Proteção Respiratória",
    "descricao": "MASCARA DE SOLDA ESAB A20",
    "CA": "67890",
    "validadeCA": "2027-06-30T00:00:00.000Z",
    "vidaUtilMeses": 24,
    "fabricante": "Protec",
    "estoqueMinimo": 5
  },
  {
    "id": 2,
    "codigo": "080102.00020",
    "tipo": "Proteção Visual",
    "descricao": "ÓCULOS DE PROTEÇÃO",
    "CA": "11234",
    "validadeCA": "2025-07-10T00:00:00.000Z",
    "vidaUtilMeses": 36,
    "fabricante": "3M",
    "estoqueMinimo": 20
  }
]
```

---

### 3. Requisição POST - /api/itens/saldos-erp

**Request:**
```json
{
  "codigos": [
    "080101.00010",
    "080102.00020"
  ]
}
```

**Response:**
```json
{
  "saldos": [
    {
      "codigo": "080101.00010",
      "saldo": 80
    },
    {
      "codigo": "080102.00020",
      "saldo": 45
    }
  ]
}
```

---

### 4. Merge no Frontend

```javascript
// Função carregarEpis():

// 1. Carrega EPIs
const epis = await listarEpis();
// epis = [{ id: 1, codigo: "080101.00010", ... }, ...]

// 2. Extrai códigos
const codigos = epis.map(e => e.codigo);
// codigos = ["080101.00010", "080102.00020"]

// 3. Carrega saldos
const saldos = await buscarSaldosErp(codigos);
// saldos = [
//   { codigo: "080101.00010", saldo: 80 },
//   { codigo: "080102.00020", saldo: 45 }
// ]

// 4. Cria mapa para acesso rápido
const saldosMap = {
  "080101.00010": 80,
  "080102.00020": 45
};

// 5. Combina dados
const epicsComSaldo = epis.map(e => ({
  ...e,
  estoqueAtual: saldosMap[e.codigo] ?? 0,
  status: (saldosMap[e.codigo] ?? 0) < e.estoqueMinimo ? "ATENÇÃO" : "OK"
}));

// Resultado final:
// [
//   { 
//     id: 1, codigo: "080101.00010", ..., 
//     estoqueAtual: 80,
//     status: "OK"
//   },
//   { 
//     id: 2, codigo: "080102.00020", ..., 
//     estoqueAtual: 45,
//     status: "ATENÇÃO"
//   }
// ]
```

---

## 🎨 Props da Tabela (EpiTable)

```javascript
<EpiTable 
  dados={[
    {
      id: 1,
      codigo: "080101.00010",        // Novo!
      nome: "MASCARA DE SOLDA",
      tipo: "Proteção Respiratória",
      validadeCA: "2027-06-30T...",
      estoqueAtual: 80,              // Do NEXTSI_HOMOLOG
      estoqueMinimo: 5,
      status: "OK"                   // Calculado
    }
  ]}
  onEdit={(epi) => { ... }}
/>
```

---

## 📱 Renderização na Tabela

| Coluna | Valor | Origem | Formatação |
|--------|-------|--------|------------|
| Código | 080101.00010 | GESTAOEPI2 | String bruta |
| Nome | MASCARA DE SOLDA ESAB A20 | GESTAOEPI2 | String bruta |
| Tipo | Proteção Respiratória | GESTAOEPI2 | String bruta |
| Validade CA | 30/06/2027 | GESTAOEPI2 | Convertido de ISO para dd/mm/yyyy |
| Estoque Atual | 80 | NEXTSI_HOMOLOG | Número alinhado à direita |
| Estoque Mínimo | 5 | GESTAOEPI2 | Número |
| Status | OK | Calculado | Badge verde (#d4edda) |

---

## 🔌 Conexão Backend → Frontend

### API Client (epiApi.ts)
```typescript
// Base URL
const api = axios.create({
  baseURL: "http://localhost:4000"
});

// Funciona para qualquer servidor que implemente essas rotas
// Pode ser movido para prod apenas mudando baseURL
```

### Tratamento de Erros
```javascript
try {
  // Carrega dados
} catch (err) {
  // Exibe mensagem amigável
  // "Erro ao carregar EPIs. Verifique a conexão com o backend."
  
  // Oferece botão retry
  <button onClick={carregarEpis}>Tentar Novamente</button>
}
```

---

## 📈 Performance

### Consultas SQL Usadas

**Backend - listarEpis():**
```sql
SELECT * FROM dbo.Epi;
-- Índices: Nenhum específico, mas id é PK
-- Tempo esperado: < 100ms (se < 10k EPIs)
```

**Backend - buscarSaldosErp():**
```sql
SELECT E01_ITEM AS codigo,
       SUM(E01_QUANTATUAL) AS saldo
FROM dbo.erp_SaldoItens
WHERE E01_ITEM IN (?, ?, ?, ...)  -- parametrizado
GROUP BY E01_ITEM;
-- Índices: Recomendado em E01_ITEM
-- Tempo esperado: 50-500ms (depende volume)
```

### Otimizações Futuras
1. **Cache**: Armazenar saldos por 5-10 minutos
2. **Pagination**: Carregar EPIs em chunks (25 por vez)
3. **Índices**: Adicionar índice em erp_SaldoItens.E01_ITEM
4. **Batch Size**: Limitar a 100 códigos por request

---

## 🔐 Segurança de Dados

### Informações Sensíveis
- ✅ Saldos são públicos (ERP interno)
- ✅ Códigos de EPI são públicos
- ⚠️ CA/Datas de validade são públicas
- ⚠️ Sem autenticação no backend (Implementar futuramente)

### Recomendações
1. Adicionar auth middleware
2. Implementar rate limiting
3. Validar entrada em /api/itens/saldos-erp
4. Log de acessos

---

## 📝 Exemplo Completo de Fluxo

```
[Browser]
   │
   ├─→ GET http://localhost:5173/epis
   │   ↓
   │   [React App monta]
   │   ↓
   │   useEffect chama carregarEpis()
   │
   ├─→ carregarEpis() async function:
   │
   │   1️⃣ listarEpis()
   │      └─→ GET http://localhost:4000/api/epis
   │          └─→ [Backend Express]
   │              └─→ SELECT * FROM GESTAOEPI2.dbo.Epi
   │              ← JSON: [{ id, codigo, tipo, ... }]
   │
   │   2️⃣ Extract codigos
   │      ["080101.00010", "080102.00020", ...]
   │
   │   3️⃣ buscarSaldosErp(codigos)
   │      └─→ POST http://localhost:4000/api/itens/saldos-erp
   │          └─→ [Backend Express]
   │              └─→ SELECT E01_ITEM, SUM(E01_QUANTATUAL)
   │                  FROM NEXTSI_HOMOLOG.dbo.erp_SaldoItens
   │              ← JSON: { saldos: [{ codigo, saldo }, ...] }
   │
   │   4️⃣ Merge & Calculate Status
   │      [{ id, codigo, ..., estoqueAtual, status }, ...]
   │
   │   5️⃣ setEpi(epicsComSaldo)
   │
   ├─→ Component renders with data
   │   ├─ <EpiTable dados={epi} />
   │   │  └─ <table>
   │   │     └─ <tr>
   │   │        ├─ <td>080101.00010</td>
   │   │        ├─ <td>MASCARA DE SOLDA</td>
   │   │        ├─ <td>30/06/2027</td>
   │   │        ├─ <td>80</td>
   │   │        └─ <td><span class="status ok">OK</span></td>
   │
   └─→ User sees table with real-time data ✅
```
