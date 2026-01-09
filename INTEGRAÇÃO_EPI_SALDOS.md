# Integração - Página EPI com Saldos NEXTSI_HOMOLOG

## 📋 O que foi implementado

A página de EPIs (`src/containers/EPIs/`) agora carrega dados do banco de dados e consulta saldos reais do banco **NEXTSI_HOMOLOG**.

### Fluxo de Dados
1. **Carregamento**: Ao abrir a página, busca todos os EPIs do banco `GESTAOEPI2` (tabela `Epi`)
2. **Enriquecimento**: Extrai os códigos dos EPIs
3. **Consulta ERP**: Chama o endpoint `/api/itens/saldos-erp` em lote para obter saldos de `NEXTSI_HOMOLOG.dbo.erp_SaldoItens`
4. **Combinação**: Mescla dados do GESTAOEPI2 com saldos do NEXTSI_HOMOLOG
5. **Exibição**: Mostra a tabela com estoque atualizado e status automático

---

## 🛠️ Arquivos Modificados

### Frontend

#### `src/containers/EPIs/index.jsx`
- **Antes**: Usando dados mock (`epiMock.js`)
- **Depois**: 
  - `useEffect` para carregar dados ao montar
  - Função `carregarEpis()` que:
    - Chama `listarEpis()` para obter EPIs do banco
    - Extrai códigos e chama `buscarSaldosErp()` em lote
    - Combina dados e determina status automaticamente
  - Estados para `loading` e `error`
  - Tratamento de erros com botão para tentar novamente

#### `src/services/epiApi.ts`
- **Adicionados**:
  - `listarEpis()` - GET `/api/epis`
  - `obterSaldoItem()` - GET `/api/itens/{codigo}/saldo-erp`
- **Mantido**:
  - `buscarSaldosErp()` - POST `/api/itens/saldos-erp` (já existia)

#### `src/components/Pages/EpiPage/EpiTable/index.jsx`
- **Mudanças**:
  - Adicionado coluna `Código`
  - Formatação de data: `validadeCA` convertida para formato `dd/mm/yyyy`
  - Badge de status com estilos dinâmicos (OK, ATENÇÃO, ESTOQUE BAIXO)
  - Alinhamento à direita para valores de estoque

#### `src/components/Pages/EpiPage/EpiTable/styles.module.css`
- **Novos estilos**:
  - `.estoque` - alinha números à direita
  - `.status` - badges coloridas
  - `.status.ok` - verde
  - `.status.atenção` - amarelo
  - `.status.estoque-baixo` - vermelho

#### `src/containers/EPIs/styles.module.css`
- **Novos estilos**:
  - `.loadingMessage` - animação de carregamento
  - `.errorMessage` - exibição de erros
  - `.retryBtn` - botão para tentar novamente

### Backend

#### `gestao-epi-backend/src/index.ts`
- ✅ Rota GET `/api/epis` - já existe
- ✅ Rota POST `/api/itens/saldos-erp` - já existe
- ✅ Rota GET `/api/itens/:codigo/saldo-erp` - já existe

---

## 🚀 Como Usar

### 1. Iniciar o Backend
```bash
cd frontend/gestao-epi-backend
npm install  # se não tiver feito ainda
npm run dev  # inicia na porta 4000
```

### 2. Iniciar o Frontend
```bash
cd frontend
npm install  # se não tiver feito ainda
npm run dev  # inicia na porta 5173
```

### 3. Acessar a página de EPIs
- Navegue para: `http://localhost:5173/epis`
- A página carregará EPIs do banco e consultará saldos do NEXTSI_HOMOLOG automaticamente

---

## 🔍 Testes Rápidos

Use o arquivo `gestao-epi-backend/requests.http` (VS Code REST Client):

```http
### Listar EPIs
GET http://localhost:4000/api/epis

### Consultar Saldo de um Item
GET http://localhost:4000/api/itens/080101.00010/saldo-erp

### Consultar Saldos em Lote
POST http://localhost:4000/api/itens/saldos-erp
Content-Type: application/json

{
  "codigos": ["080101.00010", "080102.00020"]
}
```

---

## 📊 Banco de Dados

### Leitura
- **GESTAOEPI2**: Tabela `Epi` (código, tipo, descricao, CA, validadeCA, vidaUtilMeses, estoqueMinimo)
- **NEXTSI_HOMOLOG**: Tabela `dbo.erp_SaldoItens` (E01_ITEM, E01_QUANTATUAL)

### Escrita
- Criação/edição de EPIs salva em `GESTAOEPI2.dbo.Epi`
- Saldos são apenas lidos do ERP (não há escrita)

---

## ⚠️ Notas Importantes

1. **Saldos em Tempo Real**: Os saldos são consultados toda vez que a página carrega. Se houver muitos EPIs, pode levar alguns segundos.

2. **Tratamento de Erros**: Se o backend não estiver rodando, a página exibe mensagem de erro com botão para tentar novamente.

3. **Filtro**: A busca funciona por:
   - Nome do EPI
   - Tipo (categoria)
   - Código do item

4. **Status Automático**: O status muda automaticamente baseado em:
   - `estoqueAtual < estoqueMinimo` → "ATENÇÃO"
   - Caso contrário → "OK"

---

## 🔧 Próximas Melhorias

- [ ] Adicionar modal de detalhes com histórico de saldos
- [ ] Implementar busca por data de vencimento (CA vencido)
- [ ] Adicionar export para Excel
- [ ] Pagination para tabelas com muitos itens
- [ ] Cache de saldos (para melhorar performance)
- [ ] Integração com criação/edição de EPIs no backend
