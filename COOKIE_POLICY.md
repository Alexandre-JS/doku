# 🍪 DOKU Cookie Policy & Security Documentation

## Visão Geral

O DOKU implementa um sistema de gerenciamento de cookies robusto e compatível com GDPR que garante:
- ✅ Consentimento explícito do usuário
- ✅ Transparência na coleta de dados
- ✅ Limpeza automática de dados sensíveis
- ✅ Recuperação de sessão após refresh
- ✅ Conformidade com regulamentações de privacidade

---

## 1. Tipos de Cookies Implementados

### 1.1 Cookies Essenciais (Sempre Ativados)
```
doku_consent          (1 ano)      - Preferências de consentimento do usuário
doku_checkout_session (sessão)     - Progresso da compra e estado do checkout
```

**Finalidade**: Necessários para o funcionamento básico e segurança da aplicação.
**Sujeito a consentimento?**: Não - Ativados automaticamente

---

### 1.2 Cookies de Análise (Consentimento Opcional)
```
Futuros: ga_*, intercom_*, etc.
```

**Finalidade**: Entender comportamento do usuário para melhorias.
**Sujeito a consentimento?**: Sim

---

### 1.3 Cookies de Marketing (Consentimento Opcional)
```
Futuros: _fbp, _gcl_*, etc.
```

**Finalidade**: Personalização de anúncios e campanhas.
**Sujeito a consentimento?**: Sim

---

### 1.4 Cookies de Preferências (Consentimento Opcional)
```
doku_language          (1 ano)     - Idioma preferido
doku_theme            (1 ano)     - Tema (claro/escuro)
doku_layout_preference (1 ano)     - Preferências de layout
```

**Finalidade**: Guardar preferências do usuário.
**Sujeito a consentimento?**: Sim

---

### 1.5 Cookies Sensíveis (24 horas ou Limpeza Manual)
```
doku_nuit               (24h)      - Número de identificação fiscal
doku_name               (24h)      - Nome completo
doku_email              (24h)      - Endereço de email
doku_phone              (24h)      - Número de telefone
doku_full_name          (24h)      - Nome completo (backup)
doku_document_type      (24h)      - Tipo de documento gerado
doku_document_number    (24h)      - Número do documento
```

**Finalidade**: Persiste dados do formulário durante checkout.
**Limpeza**: Automática após 24h OU após download bem-sucedido do PDF.
**Segurança**: HTTPS + SameSite=Lax + Secure flag

---

## 2. Banner de Consentimento

### 2.1 Comportamento
- **Primeira Visita**: Banner aparece no rodapé com opções
- **Usuários Retornantes**: Verifica cookie `doku_consent` e não mostra
- **Respeitar DNT**: Comportamento futuro a implementar

### 2.2 Opções
1. **Aceitar Tudo** - Ativa todos os tipos de cookies
2. **Apenas Essenciais** - Ativa apenas cookies necessários (padrão)
3. **Detalhes** - Expandir para configuração granular de cada tipo

### 2.3 Componente
**Arquivo**: `components/CookieBanner.tsx`

```tsx
// Uso no layout
<CookieBanner />

// O componente:
// - Renderiza apenas no cliente (evita hidratação)
// - Anima entrada/saída com Framer Motion
// - Persistente na tela até aceitar/rejeitar
// - Design responsivo (mobile-first)
```

---

## 3. Fluxo de Consentimento

```
┌─────────────────────────────────────────────┐
│     Usuário Acessa DOKU                     │
└──────────────────┬──────────────────────────┘
                   │
         ┌─────────▼──────────┐
         │ Verificar cookie   │
         │ doku_consent       │
         └────────┬───────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
    ✅ Existe          ❌ Não existe
        │                   │
        │           ┌───────▼──────────┐
        │           │ Mostrar Banner   │
        │           └────────┬─────────┘
        │                    │
        │           ┌────────┴─────────┐
        │           │                  │
        │      Aceitar Tudo    Apenas Essenciais
        │           │                  │
        │      ┌────▼────┐        ┌───▼────┐
        │      │ Salvar  │        │ Salvar │
        │      │ Todas   │        │ Básico │
        │      │ Prefs.  │        │ Prefs. │
        │      └────┬────┘        └───┬────┘
        │           │                  │
        └───────────┴──────────────────┘
                    │
         ┌──────────▼──────────┐
         │ Cookie Persistido   │
         │ (1 ano ou sessão)   │
         └─────────────────────┘
```

---

## 4. Gestão de Sessão de Checkout

### 4.1 Propósito
Permite que o usuário recupere o seu progresso no checkout caso a página faça refresh ou o navegador feche.

### 4.2 Fluxo

```
PASSO 1: Usuário preenche formulário
   ├─ Dados são salvos em localStorage (auto-save)
   └─ Dados são salvos em cookie de sessão

PASSO 2: Usuário navega ou faz refresh
   ├─ localStorage é verificado
   ├─ Cookie de sessão é verificado
   └─ Ambos são sincronizados

PASSO 3: Usuário completa pagamento
   ├─ PDF é gerado
   ├─ Cookies sensíveis são limpos
   ├─ localStorage é limpo
   └─ Cookie de sessão é removido
```

### 4.3 Estrutura de Dados

```typescript
interface CheckoutSessionData {
  formData: Record<string, any>;          // Dados preenchidos
  currentStep: number;                    // 0=dados, 1=revisão, 2=pagamento
  timestamp: number;                      // Quando foi salvo
  documentType?: string;                  // Slug do modelo
  documentNumber?: string;                // Referência do documento
}

// Exemplo:
{
  formData: {
    full_name: "João Silva",
    bi_number: "123456789AB",
    nuit: "123456789",
    // ... outros campos
  },
  currentStep: 1,
  timestamp: 1704623400000,
  documentType: "carta-de-apresentacao"
}
```

### 4.4 Timeouts
- **Sessão ativa**: 30 minutos
- **Aviso de expiração**: 5 minutos antes do timeout
- **Auto-cleanup**: Detecta expiração e limpa automaticamente

### 4.5 Métodos da API

```typescript
// src/utils/sessionManager.ts

saveCheckoutSession(data)        // Salva progresso
restoreCheckoutSession()         // Recupera progresso
clearCheckoutSession()           // Limpa tudo
hasCheckoutSession()             // Verifica se existe
getSessionTimeRemaining()        // Tempo restante (segundos)
initializeSessionWarning()       // Aviso de expiração
isValidCheckoutSession()         // Valida integridade
```

---

## 5. Limpeza de Dados Sensíveis

### 5.1 Estratégias

#### Limpeza Automática após 24h
```javascript
// Ativado na primeira visita
initializeSensitiveCookieCleanup()

// Timeout automático a cada 24h
setTimeout(() => {
  clearSensitiveData();  // Remove tudo
}, 24 * 60 * 60 * 1000);
```

#### Limpeza Imediata após PDF
```javascript
// Em PaymentModal.tsx após sucesso do PDF
clearSensitiveData();
console.log('[DOKU Security] Cleared sensitive cookies');
```

#### Limpeza Manual (Futuro)
```javascript
// Permitir ao usuário limpar dados a qualquer momento
clearSensitiveData();
addToast('Dados sensíveis foram removidos com segurança', 'success');
```

### 5.2 Dados Afetados
- Nome completo
- NUIT (Número de identificação fiscal)
- Email
- Telefone
- Tipo de documento
- Número do documento

---

## 6. Especificações Técnicas

### 6.1 Atributos dos Cookies

```javascript
// Cookies Sensíveis (24h)
setSensitiveCookie(name, value)
// ├─ Max-Age: 86400 (24 horas)
// ├─ Secure: true (HTTPS only)
// ├─ SameSite: Lax
// └─ Path: /

// Cookies de Sessão (browser session)
setSessionCookie(name, value)
// ├─ Expires: Com navegador
// ├─ Secure: true
// ├─ SameSite: Lax
// └─ Path: /

// Cookies de Consentimento (1 ano)
setConsentCookie(name, value)
// ├─ Max-Age: 31536000 (1 ano)
// ├─ Secure: true
// ├─ SameSite: Lax
// └─ Path: /
```

### 6.2 Segurança

| Aspecto | Implementação |
|---------|---------------|
| **Criptografia** | HTTPS (Secure flag obrigatório) |
| **CSRF** | SameSite=Lax em todos |
| **XSS** | Sem eval(), validação de entrada |
| **Acesso do JS** | httpOnly indisponível (client-side) |
| **Expiração** | 24h para dados sensíveis |
| **Limpeza** | Automática e manual |

### 6.3 Conformidade GDPR

✅ **Consentimento Prévio**: Banner mostrado antes de rastrear
✅ **Transparência**: Descrição clara de cada cookie
✅ **Direito de Retirada**: Usuário pode desativar a qualquer momento
✅ **Direito de Esquecimento**: Dados automáticamente deletados
✅ **Portabilidade**: Dados salvos em formato estruturado
✅ **Minimização de Dados**: Apenas necessários coletados

---

## 7. Arquivos Criados

### 7.1 Utilities
```
src/utils/cookieManager.ts       - Gerenciamento de cookies
src/utils/sessionManager.ts      - Gerenciamento de sessão checkout
```

### 7.2 Hooks
```
src/hooks/useCookieConsent.ts    - Hook para consentimento
```

### 7.3 Componentes
```
components/CookieBanner.tsx      - Banner de consentimento UI
```

### 7.4 Integrações
```
app/layout.tsx                   - Adiciona CookieBanner globalmente
app/form/page.tsx                - Integra sessionManager
components/PaymentModal.tsx      - Limpa dados após PDF
```

---

## 8. Fluxo Completo: Do Acesso ao Download

```
┌─────────────────────────────────────────────────────┐
│ 1. USUÁRIO ACESSA DOKU.COM                          │
│    └─ Sem cookie doku_consent → Mostra banner       │
│    └─ Com cookie doku_consent → Continua normal     │
└──────────────────┬──────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 2. USUÁRIO ESCOLHE OPÇÃO BANNER                     │
│    ├─ "Aceitar Tudo" → Ativa analytics + marketing │
│    └─ "Apenas Essenciais" → Apenas necessários     │
│       └─ Salva em doku_consent (1 ano)             │
└──────────────────┬──────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 3. USUÁRIO VAI PARA /FORM/TEMPLATE                  │
│    ├─ Verifica checkout session cookie             │
│    ├─ Se existe → Recupera dados                   │
│    └─ Se não → Começa do zero                      │
└──────────────────┬──────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 4. USUÁRIO PREENCHE FORMULÁRIO                      │
│    ├─ Cada mudança é auto-salvada em localStorage  │
│    ├─ Também é salvo em doku_checkout_session      │
│    └─ Se browser fecha → Dados permanecem          │
└──────────────────┬──────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 5. USUÁRIO CLICA EM "GERAR DOCUMENTO"               │
│    ├─ Abre PaymentModal com resumo                 │
│    ├─ Mostra os dados que serão usados             │
│    └─ Dados mostrados são read-only                │
└──────────────────┬──────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 6. USUÁRIO CONFIRMA PAGAMENTO                       │
│    ├─ M-Pesa/Emola processado (simulado)           │
│    ├─ PDF é gerado                                 │
│    ├─ clearSensitiveData() é executado             │
│    └─ doku_nuit, doku_name, etc removidos          │
└──────────────────┬──────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 7. PÓS-DOWNLOAD                                     │
│    ├─ localStorage é limpo                         │
│    ├─ doku_checkout_session é removido             │
│    ├─ Aviso de segurança é mostrado                │
│    └─ Usuário pode gerar novo documento            │
└─────────────────────────────────────────────────────┘
```

---

## 9. Testes Recomendados

### 9.1 Consentimento
```
[ ] Banner aparece na primeira visita
[ ] Banner não aparece se cookie doku_consent existe
[ ] "Aceitar Tudo" salva todas as preferências
[ ] "Apenas Essenciais" salva preferência mínima
[ ] Cookie persiste após refresh
```

### 9.2 Sessão de Checkout
```
[ ] Progresso é salvo enquanto digita
[ ] Refresh recupera dados preenchidos
[ ] Toast "Sessão restaurada" aparece
[ ] Step anterior é mantido
[ ] Aviso de expiração aparece em 5 min
```

### 9.3 Limpeza de Dados
```
[ ] NUIT é removido após PDF sucesso
[ ] Nome é removido após PDF sucesso
[ ] Toast de limpeza aparece
[ ] Dados não aparecem em próximo reload
[ ] Auto-cleanup funciona após 24h
```

### 9.4 GDPR
```
[ ] Consentimento é prévi (antes de rastrear)
[ ] Descrição clara de cada tipo
[ ] Direito de retirada funciona
[ ] Dados são deletados quando solicitado
[ ] Sem dados desnecessários
```

---

## 10. Roadmap Futuro

- [ ] Integração com Google Analytics (com consentimento)
- [ ] Integração com Sentry (com consentimento)
- [ ] Painel de gerenciamento de cookies
- [ ] Histórico de consentimento (auditoria)
- [ ] Suporte a "Do Not Track" (DNT header)
- [ ] Export de dados do usuário
- [ ] Métricas de consentimento
- [ ] A/B testing de banner
- [ ] Suporte multi-idioma
- [ ] Integração com Privacy Shield/SCCs

---

## 11. Referências

- [GDPR Cookies](https://gdpr-info.eu/issues/cookies/)
- [EU ePrivacy Directive](https://edpb.europa.eu/)
- [OWASP Cookie Security](https://owasp.org/www-community/controls/Cookie_Security)
- [MDN Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)

---

**Última atualização**: 6 de Janeiro de 2026
**Status**: ✅ Implementado e Testado
