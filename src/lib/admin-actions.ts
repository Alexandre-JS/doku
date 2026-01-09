"use server";

import { createServerSupabase } from "./supabase-server";
import { revalidatePath } from "next/cache";

/**
 * Helper para verificar se o utilizador atual é um administrador.
 * @returns boolean
 */
async function checkAdmin() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role === "admin";
}

/**
 * Ação para apagar uma minuta.
 * @param templateId ID da minuta a apagar
 */
export async function deleteTemplate(templateId: string) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    throw new Error("Não autorizado: Apenas administradores podem apagar minutas.");
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("templates")
    .delete()
    .eq("id", templateId);

  if (error) {
    console.error("Erro ao apagar minuta:", error);
    throw new Error("Falha ao apagar minuta no banco de dados.");
  }

  revalidatePath("/admin/templates");
  return { success: true };
}

/**
 * Ação para criar ou editar uma minuta.
 * @param data Dados da minuta
 * @param id Opcional - ID para edição
 */
export async function upsertTemplate(data: any, id?: string) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    throw new Error("Não autorizado: Apenas administradores podem modificar minutas.");
  }

  const supabase = await createServerSupabase();
  
  if (id) {
    const { error } = await supabase
      .from("templates")
      .update(data)
      .eq("id", id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("templates")
      .insert(data);
    if (error) throw error;
  }

  revalidatePath("/admin/templates");
  revalidatePath("/templates");
  return { success: true };
}
