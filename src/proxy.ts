import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseAnonKey, supabaseUrl } from "@/lib/env";

const LOGIN_PAD = "/admin/login";

/**
 * Eerste slot voor het beheerpaneel (in Next.js 16 heet middleware "proxy").
 * Stuurt iedereen zonder sessie naar de loginpagina en ververst de sessie-
 * cookies bij elk request.
 *
 * Dit is een optimistische check: alleen of er een ingelogde gebruiker is. Of
 * die ook beheerder is, controleert de beheer-layout, en elke beheeractie
 * controleert het opnieuw in de use case (assertAdmin) en in Row Level Security.
 */
export async function proxy(request: NextRequest) {
  const onLoginPage = request.nextUrl.pathname === LOGIN_PAD;
  let response = NextResponse.next({ request });

  // Zonder Supabase-configuratie legt de loginpagina uit wat er nog mist.
  if (!supabaseUrl || !supabaseAnonKey) {
    return onLoginPage ? response : NextResponse.redirect(new URL(LOGIN_PAD, request.url));
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        // Voorkomt dat een CDN een response mét auth-cookies cachet en aan een andere bezoeker serveert.
        for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !onLoginPage) {
    return NextResponse.redirect(new URL(LOGIN_PAD, request.url));
  }

  return response;
}

export const config = { matcher: ["/admin/:path*"] };
