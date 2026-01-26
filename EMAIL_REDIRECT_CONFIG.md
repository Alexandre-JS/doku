# Configuração de Email Redirect no Supabase

## Problema

Quando o cliente confirma o email, ele é redirecionado para a página raiz (`http://localhost:3000/?code=xxx`) em vez da rota de callback correta.

## Solução

### 1. Configurar o Supabase Dashboard

Acesse o Supabase Dashboard e configure os URLs de redirect:

1. Vá para: **Authentication** → **URL Configuration**
2. Na seção **Redirect URLs**, adicione:
   - Para desenvolvimento: `http://localhost:3000/auth/callback`
   - Para produção: `https://seudominio.com/auth/callback`

3. No campo **Site URL**, configure:
   - Para desenvolvimento: `http://localhost:3000`
   - Para produção: `https://seudominio.com`

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env.local` (baseado em `.env.local.example`):

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Verificar o código

O código já foi corrigido em:

- `/app/auth/signup/page.tsx` - SignUp com email
- `/app/auth/callback/route.ts` - Handler de callback

### 4. Testar

1. Faça logout se estiver logado
2. Crie uma nova conta
3. Verifique o email
4. Clique no link de confirmação
5. Você deve ser redirecionado para: `http://localhost:3000/auth/callback?code=xxx&next=/templates`

### URLs importantes no Supabase

Certifique-se de que estes URLs estão na lista de **Redirect URLs** permitidas:

- `http://localhost:3000/auth/callback`
- `http://localhost:3000/auth/callback?next=/templates`
- `http://localhost:3000/**` (para desenvolvimento, você pode usar wildcard)

### Para Produção

Quando for para produção:

1. Adicione `https://seudominio.com/auth/callback` aos Redirect URLs
2. Configure `NEXT_PUBLIC_SITE_URL=https://seudominio.com`
3. Atualize o **Site URL** no Supabase Dashboard

## Como funciona o fluxo

1. Usuário se cadastra → `signUp` é chamado com `emailRedirectTo`
2. Supabase envia email com link → `http://localhost:3000/auth/callback?code=xxx&next=/templates`
3. Usuário clica no link → é redirecionado para `/auth/callback`
4. O callback handler:
   - Troca o `code` por uma sessão
   - Verifica se o usuário tem perfil completo
   - Redireciona para `/templates` ou `/auth/complete-profile`

## Troubleshooting

Se ainda redirecionar para a raiz:

1. Verifique se o URL está na lista de Redirect URLs no Supabase
2. Limpe o cache do navegador
3. Verifique os logs do Supabase Dashboard em **Authentication** → **Logs**
4. Teste com o email template do Supabase em **Authentication** → **Email Templates**
