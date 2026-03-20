import { createClient } from "@supabase/supabase-js";
import { generateAndDeliverPDF } from "../lib/whatsapp/pdf-delivery";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Carregar variáveis de ambiente do .env.local
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const whatsappPhone = "258847563555"; // Substitua pelo seu número de teste se necessário

async function runHealthCheck() {
  console.log("--- 🚀 INICIANDO TESTE DE ENTREGA DE PDF ---");

  if (!supabaseUrl || !supabaseServiceKey || supabaseServiceKey.includes("INSIRA_SUA_CHAVE")) {
    console.error("❌ ERRO: SUPABASE_SERVICE_ROLE_KEY não configurada no .env.local");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Validar Conexão e buscar um Template e uma Order de teste
    console.log("1. Buscando dados de teste...");
    const { data: template } = await supabase.from("templates").select("id, slug").limit(1).single();
    if (!template) throw new Error("Nenhum template encontrado na tabela 'templates'.");

    const { data: order } = await supabase.from("orders").select("id").limit(1).single();
    if (!order) throw new Error("Nenhuma ordem encontrada na tabela 'orders'.");

    console.log(`✅ Usando Template: ${template.slug} | Order: ${order.id}`);

    // 2. Dados fictícios para simular o preenchimento do formulário
    const mockFormData = {
      full_name: "UTILIZADOR TESTE DOKU",
      current_city: "MAPUTO",
      current_date: new Date().toLocaleDateString("pt-PT"),
      target_authority: "AO EXCELENTÍSSIMO SENHOR DIRECTOR",
      institution_name: "CONSELHO MUNICIPAL DA CIDADE DE MAPUTO",
      subject: "PEDIDO DE VAGA DE EMPREGO (TESTE SISTEMA)",
      address: "AVENIDA KARL MARX, 1234",
      bi_number: "123456789012A",
    };

    console.log(`2. Disparando generateAndDeliverPDF para ${whatsappPhone}...`);
    
    // 3. Chamar a função principal de entrega
    await generateAndDeliverPDF(
      order.id,      // ID de uma order real ou válida
      template.id,   // ID de um template real ou válido
      mockFormData,  // Dados simulados
      whatsappPhone, // Seu número de WhatsApp (com 258)
      null           // Sem user_id (perfil convidado)
    );

    console.log("\n--- ✨ PROCESSO FINALIZADO ---");
    console.log("Verifique seu WhatsApp e o Storage do Supabase (bucket 'documents').");

  } catch (error: any) {
    console.error("\n❌ FALHA NO TESTE:");
    console.error(error.message || error);
  }
}

runHealthCheck();
