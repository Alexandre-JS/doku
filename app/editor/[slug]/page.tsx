import { createServerSupabase } from '@/src/lib/supabase-server';
import { notFound } from 'next/navigation';
import EditorClient from '@/app/editor/[slug]/EditorClient';

export default async function EditorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServerSupabase();

  // 1. Buscar o Template do documento na tabela correta
  const { data: template, error: tError } = await supabase
    .from('templates')
    .select('*')
    .eq('slug', slug)
    .single();

  if (tError || !template) notFound();

  // 2. Perfil ainda não é funcional: não buscar nem injetar dados de perfil
  const profileData = {};

  return (
    <div className="min-h-screen bg-slate-50">
      <EditorClient 
        template={template} 
        profileData={profileData} 
      />
    </div>
  );
}
