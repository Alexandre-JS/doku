import { createServerSupabase } from '@/src/lib/supabase-server';
import { notFound } from 'next/navigation';
import EditorClient from '@/app/editor/[slug]/EditorClient';

export default async function EditorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServerSupabase();

  // 1. Buscar o Template do documento na tabela correta
  const { data: template, error: tError } = await supabase
    .from('document_templates') // Alterado de 'templates'
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true) // Garantir que está ativo
    .single();

  if (tError || !template) notFound();

  // 2. Buscar o Perfil do utilizador (se logado)
  const { data: { user } } = await supabase.auth.getUser();
  let profileData = {};

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profileData = profile || {};
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <EditorClient 
        template={template} 
        profileData={profileData} 
      />
    </div>
  );
}
