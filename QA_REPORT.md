# Relatório de Análise de QA - Projecto DOKU

Este relatório detalha as descobertas da análise de qualidade e segurança realizada no projecto.

## 1. Vulnerabilidades Críticas (Prioridade 1)

### 1.1 Bypass de Pagamento no Checkout

- **Arquivo:** [app/checkout/page.tsx](app/checkout/page.tsx)
- **Descoberta:** A função `handlePayment` utiliza um `setTimeout` para simular o processamento do pagamento. Não há verificação real da transação M-Pesa/e-Mola antes de permitir o download do PDF.
- **Impacto:** Qualquer utilizador pode obter documentos pagos gratuitamente.
- **Recomendação:** Implementar a chamada real à API de status de pagamento (`/api/payments/status/[reference]`) e aguardar o status 'SUCCESS' antes de libertar o documento.

### 1.2 Manipulação de Preços via LocalStorage

- **Arquivo:** [app/editor/[slug]/EditorClient.tsx](app/editor/[slug]/EditorClient.tsx) e [app/checkout/page.tsx](app/checkout/page.tsx)
- **Descoberta:** O preço é guardado no `localStorage` pelo editor e lido pelo checkout.
- **Impacto:** Um utilizador pode alterar o valor no console do navegador (`localStorage.setItem('doku_current_price', '0')`) para contornar a cobrança.
- **Recomendação:** O preço deve ser validado no servidor ou recuperado directamente da base de dados Supabase no momento do checkout, usando o ID do template.

### 1.3 Geração de PDF no Client-Side

- **Arquivo:** [src/utils/pdfGenerator.ts](src/utils/pdfGenerator.ts)
- **Descoberta:** Toda a lógica de geração de documentos oficiais ocorre no navegador.
- **impacto:** Facilita o acesso não autorizado ao conteúdo total dos documentos sem passar pelo fluxo de negócio.
- **Recomendação:** Mover a geração de PDF para um Route Handler no servidor (usando `jspdf` no Node.js ou outra biblioteca) e apenas servir o ficheiro após confirmação de pagamento.

## 2. Segurança

### 2.1 Exposição de Credenciais (RESOLVIDO ✅)

- **Arquivo:** `scripts/check_tables.js`, `scripts/check_user_documents.js`, etc.
- **Estado:** Corrigido.
- **Mudança:** Removidas as chaves `URL` e `Anon Key` do Supabase que estavam no código. Agora os scripts utilizam `process.env`.
- **Recomendação:** Certificar-se de ter um ficheiro `.env.local` configurado ao executar os scripts localmente.

### 2.2 Sanitização de Templates (RESOLVIDO ✅)

- **Estado:** Corrigido.
- **Mudança:** Implementada a função `escapeHTML` dentro de `documentProcessor.ts` e `pdfGenerator.ts`.
- **Resultado:** Agora todos os inputs dos utilizadores são escapados antes de serem inseridos no template, evitando que tags HTML maliciosas ou acidentais quebrem a estrutura do documento ou causem comportamentos inesperados na geração do PDF.

## 3. Qualidade de Código e UX (MELHORADO ✨)

- **Feedback de Pagamento (RESOLVIDO ✅):** Implementado polling real em `app/checkout/page.tsx` com limite de 2 minutos e feedback visual ("Verifique o seu telemóvel").
- **Tratamento de Erros (RESOLVIDO ✅):** Adicionada resiliência ao polling (ignora erros pontuais de rede/API e continua tentando) e validação robusta de preços no servidor.
- **Persistência (RESOLVIDO ✅):** Migrado de chaves globais (`doku_form_data`) para chaves baseadas em slug (`doku_form_save_[slug]`) no Editor e Checkout, permitindo a edição de múltiplos documentos em abas diferentes sem conflitos.

## 4. Resultados de Testes Automatizados

### 4.1 Build do Next.js: ✅ PASSOU

```
✓ Compiled successfully in 3.8s
✓ Generating static pages (23/23)
```

O projecto compila sem erros de TypeScript e gera todas as rotas correctamente.

### 4.2 ESLint: ❌ 126 Erros | ⚠️ 124 Avisos

| Categoria                               | Quantidade | Ficheiros Afectados                     |
| --------------------------------------- | ---------- | --------------------------------------- |
| `@typescript-eslint/no-explicit-any`    | ~35 erros  | DynamicForm, Navbar, PaymentModal, etc. |
| `react-hooks/error-boundaries`          | ~40 erros  | PopularTemplates.tsx, TemplatesGrid.tsx |
| `@typescript-eslint/no-unused-vars`     | ~30 avisos | DocumentPreview, Footer, Hero, etc.     |
| `@typescript-eslint/no-require-imports` | 10 erros   | Todos os scripts em `/scripts/`         |
| `react-hooks/set-state-in-effect`       | 1 erro     | useFormPersistence.ts                   |
| `@next/next/no-img-element`             | 2 avisos   | LogoLoading.tsx, admin                  |

**Erros Críticos Identificados:**

1. **JSX dentro de try/catch:** Os componentes `PopularTemplates.tsx` e `TemplatesGrid.tsx` usam try/catch em volta do return JSX, o que não captura erros de renderização.
2. **setState em useEffect:** O hook `useFormPersistence.ts` chama `setFormData` directamente no corpo do effect, causando re-renders em cascata.
3. **Tipagem fraca:** Uso extensivo de `any` em vez de tipos específicos reduz a segurança de tipos.

### 4.3 Ficheiros com Mais Problemas

| Ficheiro                                                           | Erros | Avisos |
| ------------------------------------------------------------------ | ----- | ------ |
| [components/PopularTemplates.tsx](components/PopularTemplates.tsx) | 20    | 2      |
| [components/TemplatesGrid.tsx](components/TemplatesGrid.tsx)       | 12    | 1      |
| [components/PaymentModal.tsx](components/PaymentModal.tsx)         | 2     | 8      |
| [src/hooks/useFormPersistence.ts](src/hooks/useFormPersistence.ts) | 9     | 3      |
| [components/DocumentPreview.tsx](components/DocumentPreview.tsx)   | 2     | 6      |

## 5. Plano de Testes Recomendado

1. **Testes Unitários:** Validar a lógica de preenchimento de placeholders no `pdfGenerator.ts`.
2. **Testes de Integração:** Verificar o fluxo completo: Escolha de Template -> Preenchimento -> Checkout -> Webhook de Pagamento -> Download.
3. **Testes de Segurança (PenTesting):** Tentar injectar scripts no formulário e manipular o estado do checkout.

## 6. Prioridades de Correção

### Alta Prioridade (Segurança/Negócio)

- [x] Corrigir bypass de pagamento no checkout (Implementado polling real e validação de referência)
- [x] Validar preço no servidor, não no localStorage (Implementado em `mpesa/route.ts` e `checkout/page.tsx`)
- [x] Mover geração de PDF para o servidor (Implementado `/api/generate-pdf` e `pdfGeneratorServer.ts`)
- [x] Mover credenciais hardcoded para .env (Scripts atualizados para usar `process.env`)

### Média Prioridade (Qualidade de Código)

- [x] Melhorar tratamento de erros em componentes de catálogo (`PopularTemplates.tsx` e `TemplatesGrid.tsx`)
- [x] Reduzir uso de `any` em componentes principais
- [ ] Corrigir setState síncrono em `useFormPersistence.ts`

### Baixa Prioridade (Manutenção)

- [ ] Remover imports não utilizados
- [ ] Converter `<img>` para `<Image />` do Next.js
- [ ] Adicionar framework de testes (Jest/Vitest)

---

_Atualizado por GitHub Copilot - Especialista em QA_
_Data: 29 de Janeiro de 2026_ (Actualizado)
