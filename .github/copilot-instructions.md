# Gestão de EPI - Copilot Instructions

## Architecture Overview

This is a **full-stack monorepo** with Frontend (React/Vite) and Backend (Node/Express/Prisma) in separate directories. The system manages PPE (EPI - Equipamento de Proteção Individual) inventory, deliveries, and returns.

### Directory Structure
- **`src/`** - React frontend with Vite
- **`gestao-epi-backend/`** - Express backend with Prisma ORM + SQL Server
- **`public/`** - Static assets

### Data Model (3 core entities)
```
Epi (SKU) → MovimentacaoEpi ← Colaborador
```
- **Epi**: PPE items (codigo, tipo, descricao, CA, vidaUtilMeses, estoqueMinimo)
- **Colaborador**: Employees (nome, matricula, setor, funcao)
- **MovimentacaoEpi**: Delivery/return transactions (ENTREGA|DEVOLUCAO, quantidade, lote, timestamp)

## Frontend Patterns

### Component Structure
- **`components/`** - Reusable UI elements (Cards, Charts, Tables, Modals, Header, SideBar)
- **`containers/`** - Page-level containers (Home, EPIs, Entregas, Devolucao, Relatorios, Configuracoes, etc.)
- **`data/`** - Mock data files (no real API yet in most pages)

**Key containers**: Home (dashboard), EPIs (inventory), Entregas (deliveries), Devolucao (returns), Relatorios (reports), Configuracoes (settings).

### Styling Convention
- CSS Modules: `styles.module.css` (scoped component styles)
- Global variables: `styles/variables.css`
- Global styles: `styles/global.css`

### Dependencies
- **React Router v7**: App routing via `routes/routes.jsx`
- **Recharts**: Charts (EpiConsumptionChart, EpiCategoryChart)
- **Lucide-react** + **React-icons**: Icons
- **Vite**: Build tool with HMR

### UI Patterns Observed
- StatCard component for metric display
- Tables with LastDeliveriesTable pattern
- AlertsPanel for warnings/alerts
- Breadcrumb navigation
- Modal components for forms
- SideBar navigation

## Backend Patterns

### Tech Stack
- **Express v5**: REST API server
- **Prisma v7**: ORM with SQL Server adapter
- **TypeScript**: Type safety
- **dotenv**: Environment configuration

### Service Architecture
Services handle business logic and database operations:
- `epi.service.ts` - EPI CRUD (listarEpis, criarEpi)
- `movimentacao.service.ts` - Transaction logging
- `saldo.service.ts` - Inventory balance calculations

**Pattern**: Services use Prisma client (`prisma.epi.findMany()`, `prisma.epi.create()`, etc.)

### Database Connection
- **Provider**: SQL Server via `@prisma/adapter-mssql`
- **Config**: `src/db/prisma.ts` reads environment variables (SQL_HOST, SQL_USER, SQL_PASSWORD, SQL_DB)
- **Default DB**: "GESTAOEPI2" on localhost:1433
- **Authentication**: User "api_epi_rw"

### API Routes Example
```
GET  /api/epis                           - List all EPIs from GESTAOEPI2
POST /api/epis                           - Create EPI
GET  /api/itens/:codigo/saldo-erp        - Get balance for item from NEXTSI_HOMOLOG
POST /api/itens/saldos-erp              - Get balances for multiple items (batch)
GET  /api/itens/:codigo/saldo-erp/detalhe - Get balance details (by lot/serial/location)
```

### Integration Pattern: EPIs with ERP Balances
**Pages Integrated**: `src/containers/EPIs/` loads EPIs from GESTAOEPI2 and enriches with saldos from NEXTSI_HOMOLOG

**Flow**:
1. Component mounts → calls `listarEpis()` (GESTAOEPI2)
2. Extract codigo array → calls `buscarSaldosErp(codigos)` (NEXTSI_HOMOLOG.dbo.erp_SaldoItens)
3. Map saldos back to EPIs and determine status (OK|ATENÇÃO based on estoqueMinimo)
4. Display table with real-time balances

**Key Services**:
- `src/services/epiApi.ts` - Frontend API client (axios)
- `gestao-epi-backend/src/services/saldo.service.ts` - Backend saldo queries with Prisma raw SQL

## Developer Workflows

### Frontend Development
```bash
cd frontend
npm install
npm run dev          # Start Vite dev server (HMR enabled)
npm run build        # Production build
npm run lint         # ESLint check
npm run preview      # Preview production build
```

### Backend Development
```bash
cd frontend/gestao-epi-backend
npm install
npm run dev                              # Run with tsx (TypeScript execution)
npm run build                            # Compile to dist/
npm start                                # Run compiled JS
npm run prisma:generate                  # Generate Prisma client
npm run prisma:migrate                   # Create/run migrations
npm run prisma:deploy                    # Deploy migrations to prod
```

### Database Migrations
Migrations stored in `gestao-epi-backend/prisma/migrations/`. Use `prisma migrate dev` to add schema changes.

## Integration Points & Patterns

### Frontend → Backend Communication
- **Current**: API client in `src/services/epiApi.ts` (axios-based)
- **Base URL**: `http://localhost:4000` (backend port)
- **Example**: `buscarSaldosErp(codigos)` calls `POST /api/itens/saldos-erp`
- **Pages with API Integration**:
  - `EPIs` - loads EPIs + saldos (✅ IMPLEMENTED)
  - `Entregas` - still uses mock data
  - `Devolucao` - still uses mock data
  - Other pages - still use mock data

### Multi-Database Architecture
- **GESTAOEPI2** (Primary DB): EPIs master data, Colaboradores, MovimentacaoEpi
- **NEXTSI_HOMOLOG** (ERP): erp_SaldoItens table (via dbo.erp_SaldoItens synonym) for real-time inventory

**Why Separate**: 
- EPI management is custom (GESTAOEPI2)
- Inventory balances come from legacy ERP (NEXTSI_HOMOLOG)
- Backend bridges both via service layer

### Auth & Configuration
- Login page exists (`containers/Login`) but integration status unclear
- Perfil (profile), Configuracoes (company/sector config, EPI types) pages planned
- No visible auth middleware in current backend routes

## Project-Specific Conventions

1. **Naming**: Brazilian Portuguese for domain terms (Epi, Colaborador, Movimentacao, Devolucao, Entregas)
2. **Date handling**: Prisma defaults to `now()`, CA validity dates in schema
3. **Status fields**: MovimentacaoEpi.tipo uses string literals ("ENTREGA", "DEVOLUCAO")
4. **Database indexes**: Added on (colaboradorId, dataHora) and (epiId, dataHora) for query performance
5. **Error handling**: Backend wraps routes in try-catch with `next(err)` for Express error handling

## Common Tasks

- **Add EPI field**: Update Prisma schema, generate client, create migration, update service
- **Add API endpoint**: Create service function, add Express route with error handling
- **Add page**: Create container component, add route in `routes.jsx`, add data/mock if needed
- **Add API integration**: Create function in `src/services/epiApi.ts`, use in container
- **Styling component**: Create `styles.module.css`, import as `Styles` object, use class names

## Key Files Reference

- App entry: [src/main.jsx](src/main.jsx)
- Frontend routing: [src/routes/routes.jsx](src/routes/routes.jsx)
- Backend entry: [gestao-epi-backend/src/index.ts](gestao-epi-backend/src/index.ts)
- Data schema: [gestao-epi-backend/prisma/schema.prisma](gestao-epi-backend/prisma/schema.prisma)
- Prisma config: [gestao-epi-backend/src/db/prisma.ts](gestao-epi-backend/src/db/prisma.ts)
- API client: [src/services/epiApi.ts](src/services/epiApi.ts)
