import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

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
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  const { data: { user } } = await supabase.auth.getUser();

  // Proteção de Rotas
  const url = new URL(request.url);
  const path = url.pathname;

  // 0. Redirecionar utilizadores logados para longe das páginas de autenticação
  if (user && (path.startsWith("/auth/login") || path.startsWith("/auth/signup"))) {
    let next = url.searchParams.get("next") || "/";
    // Proteção contra Open Redirect: garantir que 'next' seja um caminho relativo (começa com /)
    if (next.startsWith("http") || next.startsWith("//")) {
      next = "/";
    }
    return NextResponse.redirect(new URL(next, request.url));
  }

  // 1. Proteção de Checkout, Perfil e Onboarding
  if (path.startsWith("/checkout") || path.startsWith("/profile") || path.startsWith("/auth/complete-profile")) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // 2. Proteção do Painel Administrativo (/admin)
  if (path.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Verificar Role na tabela profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      // Se não for admin, redireciona para a home
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
