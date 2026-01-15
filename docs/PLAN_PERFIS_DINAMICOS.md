# Proposta de Arquitetura: Sistema de Perfis de Acesso Dinâmicos e Personalizáveis (ACL)

**Data de Criação:** 14/01/2026
**Contexto:** Atualmente, o sistema utiliza um campo `String` estático (`role`) na tabela `Usuario` para definir permissões ('admin', 'user', 'tecnico'). Este documento detalha o plano de migração para um sistema de controle de acesso dinâmico (RBAC - Role-Based Access Control) para implementações futuras.

---

## 1. Objetivo
Permitir que administradores criem novos perfis de acesso (ex: "Auditor", "Gerente Regional") e definam granularmente quais ações cada perfil pode realizar no sistema, sem necessidade de alteração de código.

## 2. Alterações no Banco de Dados (Prisma Schema)

Será necessário normalizar a estrutura de permissões, criando duas novas entidades: `Role` (Perfil) e `Permission` (Permissão), e alterando `Usuario`.

```prisma
// schema.prisma

model Usuario {
  id        Int      @id @default(autoincrement())
  // ... outros campos (nome, email, senha)
  
  // Relacionamento: Usuário pertence a um Perfil
  roleId    Int
  role      Role     @relation(fields: [roleId], references: [id])
}

model Role {
  id          Int          @id @default(autoincrement())
  nome        String       @unique // Ex: "Administrador", "Auditor"
  descricao   String?
  usuarios    Usuario[]
  permissions Permission[] // Relação N:N (Um perfil tem várias permissões)
}

model Permission {
  id          Int     @id @default(autoincrement())
  recurso     String  // Ex: "usuarios", "epis", "relatorios"
  acao        String  // Ex: "create", "read", "update", "delete"
  descricao   String? // Ex: "Pode criar novos usuários"
  
  roles       Role[]  // Relação N:N
}
```

## 3. Alterações no Backend (API)

### Novos Endpoints Necessários

#### Gestão de Perfis (CRUD)
*   `GET /roles` - Lista todos os perfis disponíveis (para popular o Dropdown do Frontend).
*   `POST /roles` - Cria um novo perfil (ex: "Gerente").
*   `PUT /roles/:id` - Edita nome ou permissões de um perfil.
*   `DELETE /roles/:id` - Remove um perfil (validar se não há usuários vinculados).

#### Gestão de Permissões
*   `GET /permissions` - Lista todas as permissões possíveis do sistema (para a tela de criação de perfil).

### Middleware de Autorização
O atual `authMiddleware` verifica apenas se o usuário está logado. O novo middleware deverá checar as permissões:

```typescript
// Exemplo de uso nas rotas
router.post('/usuarios', checkPermission('usuarios', 'create'), UserController.store);
```

## 4. Alterações no Frontend

### Componente UserModal (Dropdown Dinâmico)
O Dropdown de seleção de perfil deixará de ser fixo (`const ROLES = [...]`) e passará a buscar dados da API:

```javascript
// useEffect no Modal
useEffect(() => {
  api.get('/roles').then(response => {
    setRolesList(response.data); // Popula o Dropdown com dados do banco
  });
}, []);
```

### Nova Tela: Gestão de Perfis e Permissões
Será necessária uma nova tela em "Configurações" para gerenciar esses perfis.
*   **Visual:** Lista de Perfis à esquerda, Checkboxes de Permissões à direita.
*   **Funcionalidade:** O admin marca "Pode ver Relatórios" e "Pode Editar EPIs" e salva o novo perfil "Auditor de Estoque".

## 5. Plano de Migração (Passo a Passo)

1.  **Backup:** Dump completo do banco SQL Server.
2.  **Schema:** Criar tabelas `Role` e `Permission` via migration.
3.  **Seed:** Criar script para popular a tabela `Role` com os perfis atuais ('admin', 'user', 'tecnico') e migrar os usuários existentes (associar `roleId` baseado na string antiga `role`).
4.  **Backend:** Atualizar `auth.routes.ts` e Controllers para usar a nova lógica.
5.  **Frontend:** Atualizar `UserModal` para buscar perfis da API e criar a tela de Gestão de Perfis.

---

**Estimativa de Esforço:** Alta (Refatoração Core do Sistema).
**Recomendação:** Implementar apenas quando houver demanda real por perfis customizados pelo cliente.
