# 📋 Backlog de Tarefas - Auditoria DOKU

Este documento contém as issues identificadas na auditoria de Janeiro de 2026, formatadas para criação no GitHub.

---

## 🏗️ 1. Segurança: Implementar Rate Limiting e Sanitização

**Título:** [Segurança] Implementar Rate Limiting e Sanitização de Inputs
**Etiquetas:** `segurança`, `alta-prioridade`

### Descrição:

Precisamos reforçar a segurança das nossas APIs e formulários para evitar abusos e ataques XSS.

**Tarefas:**

- [ ] Adicionar `DOMPurify` para sanitizar inputs no `DynamicForm.tsx`.
- [ ] Implementar Rate Limiting nas rotas de API (`/api/payments/*`) usando Upstash ou Redis.
- [ ] Validar a presença de variáveis de ambiente críticas (ex: `DEBITO_API_TOKEN`) no arranque da aplicação.

---

## 🚀 2. Performance: Optimização de Imagens e Componentes

**Título:** [Performance] Migrar para next/image e Optimização de Assets
**Etiquetas:** `performance`, `ux`

### Descrição:

A aplicação ainda usa a tag `<img>` padrão, o que prejudica o LCP (Largest Contentful Paint) e o SEO.

**Tarefas:**

- [ ] Substituir todas as tags `<img>` por `next/image` nos componentes `Navbar`, `Footer`, `Hero` e `TemplatesGrid`.
- [ ] Configurar `remotePatterns` no `next.config.ts` para carregar imagens do Supabase de forma segura e optimizada.
- [ ] Implementar `optimizePackageImports` para `lucide-react` e `framer-motion`.

---

## 🛠️ 3. Refactoring: Modularização de Componentes Grandes

**Título:** [Refactoring] Dividir PaymentModal e FormPage em sub-componentes
**Etiquetas:** `manutenibilidade`

### Descrição:

Os ficheiros `PaymentModal.tsx` e `app/form/page.tsx` excederam as 400 linhas, tornando a manutenção difícil.

**Tarefas:**

- [ ] Extrair a lógica de polling de pagamento para um hook dedicado `usePaymentStatus`.
- [ ] Dividir o `PaymentModal` em: `PaymentSelector`, `ProcessingState` e `SuccessView`.
- [ ] Tipar correctamente todos os objectos `any` em `admin-actions.ts`.

---

## 🔄 4. Performance: Cache e Fetch Estruturado

**Título:** [Performance] Implementar Caching para Listagem de Templates
**Etiquetas:** `performance`

### Descrição:

Actualmente, o `TemplatesGrid.tsx` faz fetch directo ao Supabase em cada renderização (Client Side).

**Tarefas:**

- [ ] Integrar `SWR` ou `React Query` para gerir o estado dos templates.
- [ ] Implementar revalidação periódica (stale-while-revalidate).
- [ ] (Opcional) Converter a grelha inicial em Server Component para renderização instantânea.

---

## 🧪 5. Infraestrutura: Sistema de Testes e CI

**Título:** [Infra] Configurar Vitest e Testes Unitários Básicos
**Etiquetas:** `infra`, `qualidade`

### Descrição:

O projecto não possui testes automatizados, o que aumenta o risco de regressões.

**Tarefas:**

- [ ] Instalar e configurar `Vitest`.
- [ ] Criar testes unitários para o `pdfGenerator.ts` e `parser.ts`.
- [ ] Configurar GitHub Action básica para rodar o `lint` e `type-check` em cada PR.

---

## 📱 6. UX: Suporte PWA e Offline Básico

**Título:** [UX] Adicionar suporte PWA para ambiente Moçambicano
**Etiquetas:** `ux`, `mobile`

### Descrição:

Devido à instabilidade de rede, uma PWA ajudará os utilizadores a manterem o progresso do formulário mesmo sem internet estável.

**Tarefas:**

- [ ] Configurar `next-pwa` ou `serwist`.
- [ ] Criar `manifest.json` com ícones oficiais.
- [ ] Garantir que o `useFormPersistence` funciona correctamente em modo offline.
