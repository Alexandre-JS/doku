# DOKU - Gerador de Documentos Oficiais

DOKU é uma plataforma inteligente para geração de documentos oficiais em Moçambique, permitindo criar requerimentos, declarações e cartas formais de forma rápida e profissional.

## 🚀 Tecnologias

- **Framework:** Next.js 16 (App Router)
- **Estilização:** Tailwind CSS 4
- **Backend:** Supabase (Auth & Database)
- **Animações:** Framer Motion

## 🛠️ Configuração Local

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env.local`
   - Preencha com suas credenciais do Supabase
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 🌐 Deploy na Vercel

Para publicar o projeto na Vercel:

1. Conecte seu repositório GitHub à Vercel.
2. Configure as seguintes **Environment Variables** no painel da Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. O comando de build padrão (`npm run build`) será executado automaticamente.

## 📝 Scripts Úteis

- `npm run build`: Gera a versão de produção.
- `node scripts/generate-form-schema.js <slug>`: Gera o esquema de formulário para um novo template.
