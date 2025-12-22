import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase environment variables are not set. Create .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

/**
 * Cliente para uso em Client Components (Browser)
 */
export const createBrowserSupabase = () =>
  createBrowserClient(supabaseUrl, supabaseAnonKey);

// Cliente estático para scripts simples ou casos onde cookies não são necessários
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

export default supabase;
