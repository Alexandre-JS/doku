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

  // 2. Buscar Dados do Perfil se o utilizador estiver logado
  const { data: { user } } = await supabase.auth.getUser();
  let profileData = {};

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, father_name, mother_name, bi_number, nuit, address_details, phone_number')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      // Mapeamento para as chaves esperadas pelo formulário
      profileData = {
        full_name: profile.full_name || "",
        fullName: profile.full_name || "",
        nome_completo: profile.full_name || "",
        father_name: profile.father_name || "",
        nome_pai: profile.father_name || "",
        mother_name: profile.mother_name || "",
        nome_mae: profile.mother_name || "",
        bi_number: profile.bi_number || "",
        biNumber: profile.bi_number || "",
        num_bi: profile.bi_number || "",
        nuit: profile.nuit || "",
        num_nuit: profile.nuit || "",
        address: profile.address_details || "",
        endereco: profile.address_details || "",
        phone: profile.phone_number || "",
        phone_number: profile.phone_number || "",
      };
    }
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
