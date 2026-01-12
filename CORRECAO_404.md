# 🔧 Correção de URLs - Erro 404

## ❌ Problema Identificado

```
GET http://localhost:3333/api/epis 404 (Not Found)
```

O frontend estava tentando acessar as rotas com prefixo `/api/`, mas as rotas no backend estão registradas sem esse prefixo.

---

## ✅ Correção Aplicada

### Arquivo: `frontend/src/services/apiEpi.ts`

**Antes:**
```typescript
api.get("/api/epis")                          // ❌
api.post("/api/itens/saldos-erp", { codigos })
api.get(`/api/itens/${codigo}/saldo-erp`)
```

**Depois:**
```typescript
api.get("/epis")                              // ✅
api.post("/epis-erp/saldos", { codigos })
api.get(`/epis-erp/${codigo}`)
```

### Arquivo: `frontend/src/services/api.js`

Mesmas correções aplicadas.

---

## 📡 URLs Corretos Agora

```
GET    /epis                    ← Lista todos os EPIs locais
GET    /epis-erp                ← Lista EPIs do ERP
GET    /epis-erp/:codigo        ← EPI específico do ERP
POST   /epis-erp/saldos         ← Múltiplos saldos do ERP
```

---

## 🧪 Como Testar

### 1. Reiniciar Frontend
```bash
cd frontend
npm run dev
```

### 2. Teste no navegador
- Vá para a página de EPIs
- Os dados devem aparecer sem erro 404

### 3. Console do navegador
- Abra F12
- Vá para Network
- Verifique se as requisições estão em `/epis` e `/epis-erp`

---

## ✅ Status

- [x] Erro 404 corrigido
- [x] URLs atualizadas em `apiEpi.ts`
- [x] URLs atualizadas em `api.js`
- [x] Pronto para testar

**Próximo passo:** Recarregue a página e verifique se os EPIs aparecem! 🚀
