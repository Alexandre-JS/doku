"use server";

import { createServerSupabase } from "./supabase-server";

/**
 * Valida o formato básico de um e-mail.
 */
function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Subscreve um e-mail na newsletter.
 * @param email O e-mail do utilizador.
 * @param source (Opcional) A origem da subscrição (ex: 'banner', 'footer').
 */
export async function subscribeToNewsletter(email: string, source: string = "banner") {
  if (!email || !isValidEmail(email)) {
    return { success: false, message: "Por favor, insira um e-mail válido." };
  }

  const supabase = await createServerSupabase();

  const { error } = await supabase.from("newsletter_subscribers").insert([
    {
      email: email.toLowerCase().trim(),
      source: source,
    },
  ]);

  if (error) {
    // Código de erro 23505 é Unique Constraint Violation no PostgreSQL
    if (error.code === "23505") {
      return { 
        success: true, 
        message: "Obrigado! Você já faz parte da nossa lista exclusiva." 
      };
    }

    console.error("Erro ao subscrever newsletter:", error);
    return { 
      success: false, 
      message: "Ocorreu um erro ao processar sua inscrição. Tente novamente mais tarde." 
    };
  }

  return { 
    success: true, 
    message: "Inscrição realizada com sucesso! Bem-vindo à Dokumoz." 
  };
}
