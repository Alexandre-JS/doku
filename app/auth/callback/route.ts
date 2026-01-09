import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/templates";

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Buscar o perfil para ver se é admin
      const { data: { user } } = await supabase.auth.getUser();
      
      let redirectUrl = next;

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name, nuit")
          .eq("id", user.id)
          .maybeSingle();

        // Se for admin, manda para admin
        if (profile?.role === "admin") {
          redirectUrl = "/admin";
        } 
        // Se não tiver perfil ou faltar dados básicos, vai para onboarding (apenas se o alvo for templates ou home)
        else if ((!profile || !profile.full_name) && (next === "/templates" || next === "/")) {
          redirectUrl = "/auth/complete-profile";
        }
      }

      return NextResponse.redirect(`${origin}${redirectUrl}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
}
