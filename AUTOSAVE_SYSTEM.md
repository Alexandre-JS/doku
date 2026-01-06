# Sistema de Auto-Save e Recuperação - DOKU

## 📋 Visão Geral

Sistema robusto de persistência automática para formulários de minutas com recuperação inteligente, UX discreto e segurança de dados.

---

## 🏗️ Arquitetura

### 1. **Hook Customizado: `useFormPersistence`**

**Arquivo**: `src/hooks/useFormPersistence.ts`

#### Características:

- ✅ **Auto-save em tempo real** com debounce de 300ms (configurável)
- ✅ **Recuperação automática** ao montar o componente
- ✅ **Detecção de dados recuperados** para UX inteligente
- ✅ **Tratamento de erros** (localStorage cheio, dados corrompidos)
- ✅ **Cleanup automático** ao desmontar
- ✅ **Logs para debugging** em desenvolvimento

#### Uso:

```tsx
const {
  formData, // Estado atual do formulário
  updateField, // Atualizar um campo individual
  updateMultiple, // Atualizar múltiplos campos
  clearSavedData, // Limpar dados salvos (após sucesso)
  hasRestoredData, // Flag indicando se houve restauração
  getSavedDataSize, // Obter tamanho em bytes
} = useFormPersistence(initialData, {
  storageKey: "doku_form_auto_save",
  debounceMs: 300,
  onRestore: (data) => console.log("Dados restaurados:", data),
});
```

#### Fluxo de Persistência:

```
Usuário digita → updateField() → Debounce 300ms → localStorage.setItem()
```

---

### 2. **Componente Toast: `Toast.tsx`**

**Arquivo**: `components/Toast.tsx`

#### Características:

- ✅ **Animação suave** com Framer Motion
- ✅ **Múltiplos tipos**: success, error, info, warning
- ✅ **Auto-dismiss** com duração customizável
- ✅ **Mobile-friendly** com responsive spacing
- ✅ **Acessibilidade integrada** (aria-live, aria-label)
- ✅ **Suporte a múltiplos toasts simultâneos** (ToastContainer)

#### Tipos de Toast:

```
success  → Verde com CheckCircle2
error    → Vermelho com AlertCircle
warning  → Âmbar com AlertTriangle
info     → Azul com Info
```

---

### 3. **Integração no Formulário**

**Arquivo**: `app/form/page.tsx`

#### Fluxos:

**A. Ao Carregar a Página:**

```tsx
// Se existem dados salvos → Toast de sucesso
"✓ Retomamos o seu preenchimento de onde parou";
```

**B. Durante a Digitação:**

```tsx
// Debounce automático → Salva no localStorage
// Nenhuma UI bloqueante
```

**C. Ao Finalizar (Sucesso do PDF):**

```tsx
// 1. Limpa localStorage
// 2. Mostra toast: "✓ Documento gerado com sucesso! Dados removidos por segurança."
// 3. Fecha modal de pagamento
```

---

## 🔐 Segurança

### 1. **Limpeza de Dados**

- ✅ Remove dados apenas após sucesso comprovado (Download do PDF)
- ✅ Não deixa dados sensíveis expostos
- ✅ Tratamento de erros sem expor dados

### 2. **Proteção de localStorage**

- ✅ Verifica quota disponível
- ✅ Remove dados corrompidos automaticamente
- ✅ Logs de segurança em desenvolvimento

### 3. **Privacidade em Mobile**

- ✅ localStorage funciona localmente (não envia para servidores)
- ✅ Sobrevive a mudança de abas/apps
- ✅ Limpo automaticamente após sucesso

---

## ⚡ Performance

### Debounce Strategy:

```
Sem debounce:  100 updates/segundo → localStorage saturado
Com 300ms:     ~3-4 updates/segundo → Otimizado
```

### Impacto:

- ✅ **Digitação**: Sem lag perceptível
- ✅ **localStorage**: ~2-5KB por formulário (OK)
- ✅ **Memória**: Minimal (useCallback + useRef)

---

## 📱 Mobile Behavior

### Chrome Mobile:

1. Usuário preenche formulário
2. Alterna para WhatsApp
3. Volta para navegador
4. Dados intactos + Toast de recuperação ✓

### Safari Mobile:

1. Mesmo comportamento que Chrome
2. localStorage persistente entre sessões
3. Limpeza automática após sucesso ✓

---

## 🧪 Testando o Sistema

### 1. **Teste de Persistência:**

```javascript
// No DevTools Console
localStorage.getItem("doku_form_auto_save");
// Resultado: {"full_name":"João Silva","bi_number":"..."}
```

### 2. **Teste de Recovery:**

1. Preencha alguns campos
2. Feche a aba
3. Abra novamente
4. Toast deve aparecer + dados restaurados

### 3. **Teste de Limpeza:**

1. Complete o pagamento com sucesso
2. localStorage.getItem('doku_form_auto_save') deve retornar `null`
3. Toast de sucesso deve aparecer

---

## 📊 Eventos e Logs

### Desenvolvimento:

```
[DOKU AutoSave] Dados restaurados do localStorage
  → fields: 8
  → timestamp: 2026-01-06T10:30:45.123Z

[DOKU AutoSave] Dados salvos
  → fields: 8
  → timestamp: 2026-01-06T10:30:46.500Z
```

---

## 🔄 Fluxo Completo

```
┌─────────────────────────────────────────────────────┐
│ 1. Página Carrega                                   │
│    ↓                                                 │
│ 2. Hook: useFormPersistence                         │
│    ↓                                                 │
│    ├─ Busca localStorage                            │
│    └─ Se existe → restaura + Toast                  │
│                                                      │
│ 3. Usuário Digita                                   │
│    ↓                                                 │
│ 4. updateField() → Debounce 300ms                   │
│    ↓                                                 │
│ 5. localStorage.setItem() (não bloqueante)          │
│                                                      │
│ 6. Usuário Clica "Finalizar Documento"              │
│    ↓                                                 │
│ 7. PaymentModal abre                                │
│    ↓                                                 │
│ 8. generatePDF() + Sucesso                          │
│    ↓                                                 │
│ 9. onSuccess() callback                             │
│    ├─ clearSavedData()                              │
│    └─ Toast: "Documento gerado! Dados removidos"    │
│                                                      │
│ 10. Modal Fecha                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Próximas Melhorias

- [ ] Backup em cloud (optional)
- [ ] Versionamento de formulários salvos
- [ ] Export/Import de formulários
- [ ] Histórico de alterações
- [ ] Sincronização entre abas

---

## 📦 Dependências

- `framer-motion` - Animações
- `lucide-react` - Ícones
- React Hooks nativas (useState, useEffect, useRef, useCallback)

---

## ✨ Resultado Final

✅ **Auto-save robusto** com debounce inteligente  
✅ **UX discreto** com toasts elegantes  
✅ **Segurança** com limpeza automática  
✅ **Performance** sem impacto na digitação  
✅ **Mobile-ready** em todos os navegadores

**Status**: Pronto para produção ✓
