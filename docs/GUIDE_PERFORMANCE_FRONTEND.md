# Guia de Performance Frontend - Padrão EPI GEMINI

Este documento detalha as estratégias de otimização de performance aplicadas ao projeto, utilizando a página de Dashboard como referência. Siga estas diretrizes ao criar ou refatorar containers complexos.

---

## 1. Memoização de Componentes (`React.memo`)

A memoização é a nossa primeira linha de defesa contra re-renderizações desnecessárias, especialmente em componentes que processam dados visuais pesados (gráficos e tabelas).

### Quando usar?
- Componentes que recebem `props` que mudam pouco (ex: dados de um gráfico que só atualizam no carregamento).
- Componentes visualmente complexos (muitos nós no DOM).
- Componentes filhos de um container que possui muitos estados independentes.

### Como implementar:
```jsx
import React from 'react';

const MeuComponentePesado = React.memo(({ dados }) => {
  return (
    <div>{/* Lógica complexa aqui */}</div>
  );
});

export default MeuComponentePesado;
```

---

## 2. Modularização e Estrutura de Pastas

Evite arquivos `index.jsx` gigantes. Dividir a interface em pequenos componentes isolados ajuda o React a gerenciar o Virtual DOM de forma mais eficiente.

### Estrutura Recomendada:
```text
containers/NomeDaPagina/
├── components/           # Sub-componentes exclusivos desta página
│   ├── ComponenteA.jsx
│   └── ComponenteB.jsx
├── index.jsx             # Orquestrador da página (Busca dados e distribui)
└── styles.module.css     # Estilos específicos
```

---

## 3. Otimização de Importações (Tree Shaking)

Importar bibliotecas inteiras aumenta drasticamente o tamanho do bundle final. Sempre utilize importações nomeadas.

### Exemplo com Lucide React:
- **Errado:** `import * as Icons from 'lucide-react';`
- **Certo:** `import { Package, Users, AlertTriangle } from 'lucide-react';`

---

## 4. Estabilidade de Layout (Prevenção de CLS)

O *Cumulative Layout Shift* (Salto de Conteúdo) prejudica a experiência do usuário e a percepção de performance.

### Diretrizes:
- **Reserva de Espaço:** Sempre defina uma altura mínima (`min-height`) para containers de gráficos ou elementos assíncronos no CSS.
- **Aspect Ratio:** Se o componente for responsivo, use propriedades que mantenham a proporção enquanto o dado não chega.

```css
/* No styles.module.css */
.chartContainer {
  min-height: 350px;
  background: var(--gray-50); /* Opcional: cor leve de placeholder */
  border-radius: var(--border-radius);
}
```

---

## 5. Modais de Alta Performance

Para garantir que modais abram instantaneamente mesmo em hardware limitado, evite o uso de `backdrop-filter: blur()`.

### Diretriz:
Use um overlay sólido escuro (`rgba`) em vez de desfoque.

**CSS Recomendado para `.overlay`:**
```css
.overlay {
  background-color: rgba(15, 23, 42, 0.75); /* Fundo sólido e performático */
  /* backdrop-filter: blur(4px); <- EVITAR em modais grandes */
  z-index: 9999;
}
```

### Animação de Entrada do Modal:
Use `will-change` se necessário e mantenha a escala sutil para evitar jitter de sub-pixel.

```css
.modal {
  will-change: transform, opacity;
  animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes scaleUp { 
  from { opacity: 0; transform: scale(0.96); } 
  to { opacity: 1; transform: scale(1); } 
}
```

---

## 6. Animações de Entrada (Staggered Fade-In)

Para criar uma experiência "Premium" sem prejudicar o TTI (Time to Interactive), use animações CSS puras escalonadas para a entrada de elementos.

**CSS Base (`fadeInUp`):**
```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
```

**Aplicação em Cascata:**
Aplique delays incrementais aos elementos filhos:

```css
.header { animation: fadeInUp 0.5s ease-out both; }
.card1 { animation: fadeInUp 0.5s ease-out 0.1s both; } /* Delay 0.1s */
.card2 { animation: fadeInUp 0.5s ease-out 0.2s both; } /* Delay 0.2s */
```

---

## 7. Gestão de Dados e Mocks

Para manter o dashboard rápido:
- **Slice de Dados:** Se um componente de "Últimas Atividades" recebe uma lista grande, limite a renderização no componente pai antes de passar via props: `activities.slice(0, 10)`.
- **Delay Controlado:** Durante o desenvolvimento, utilize delays artificiais para testar estados de loading, mas garanta que a lógica final seja puramente assíncrona e eficiente.

---

## 8. Checkbox de Performance para Novos Componentes

- [ ] O componente foi extraído para a pasta `components/`?
- [ ] O componente está usando `React.memo` se for pesado?
- [ ] As importações de ícones são granulares?
- [ ] O modal usa overlay sólido sem blur excessivo?
- [ ] Os elementos entram com animação escalonada (`staggered`)?
- [ ] O container pai usa `useCallback` para funções passadas como props?
- [ ] O CSS reserva espaço para carregamentos assíncronos?

---
*Documento gerado em Janeiro de 2026 como padrão de engenharia para o Projeto EPI GEMINI.*