
import { createServerSupabase } from "../supabase-server";

export interface WhatsAppSession {
  id: string;
  phone_number: string;
  profile_id?: string | null;
  current_template_id?: string | null;
  current_step_index: number;
  form_data: Record<string, any>;
  last_interaction: string;
}

/**
 * Busca uma sessão ativa pelo número de telefone ou cria uma nova se não existir.
 */
export async function getOrCreateSession(phoneNumber: string): Promise<WhatsAppSession | null> {
  const supabase = await createServerSupabase();

  // 1. Tentar buscar sessão existente
  const { data: session, error: fetchError } = await supabase
    .from("whatsapp_sessions")
    .select("*")
    .eq("phone_number", phoneNumber)
    .maybeSingle();

  if (session) return session as WhatsAppSession;

  // 2. Se não existir, buscar se o usuário já tem um perfil pelo telefone
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("phone_number", phoneNumber)
    .maybeSingle();

  // 3. Criar nova sessão
  const { data: newSession, error: createError } = await supabase
    .from("whatsapp_sessions")
    .insert({
      phone_number: phoneNumber,
      profile_id: profile?.id || null,
      current_step_index: 0,
      form_data: {}
    })
    .select()
    .single();

  if (createError) {
    console.error("[WhatsApp] Erro ao criar sessão:", createError);
    return null;
  }

  return newSession as WhatsAppSession;
}

/**
 * Atualiza os dados do formulário e avança para o próximo passo.
 */
export async function updateSessionStep(
  sessionId: string, 
  newData: Record<string, any>, 
  nextIndex: number
): Promise<boolean> {
  const supabase = await createServerSupabase();

  // Primeiro buscamos os dados atuais para fazer o merge do JSONB
  const { data: currentSession } = await supabase
    .from("whatsapp_sessions")
    .select("form_data")
    .eq("id", sessionId)
    .single();

  const mergedData = {
    ...(currentSession?.form_data || {}),
    ...newData
  };

  const { error } = await supabase
    .from("whatsapp_sessions")
    .update({
      form_data: mergedData,
      current_step_index: nextIndex,
      last_interaction: new Date().toISOString()
    })
    .eq("id", sessionId);

  if (error) {
    console.error("[WhatsApp] Erro ao atualizar passo:", error);
    return false;
  }

  return true;
}

/**
 * Define o template atual que o usuário deseja preencher.
 */
export async function setSessionTemplate(sessionId: string, templateId: string): Promise<boolean> {
  const supabase = await createServerSupabase();

  const { error } = await supabase
    .from("whatsapp_sessions")
    .update({
      current_template_id: templateId,
      current_step_index: 0,
      form_data: {},
      last_interaction: new Date().toISOString()
    })
    .eq("id", sessionId);

  return !error;
}

/**
 * Remove a sessão (geralmente após a conclusão ou expiração).
 */
export async function clearSession(sessionId: string): Promise<boolean> {
  const supabase = await createServerSupabase();

  const { error } = await supabase
    .from("whatsapp_sessions")
    .delete()
    .eq("id", sessionId);

  if (error) {
    console.error("[WhatsApp] Erro ao limpar sessão:", error);
    return false;
  }

  return true;
}
