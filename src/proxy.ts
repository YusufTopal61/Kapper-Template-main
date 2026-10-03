import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabasePublishableKey, supabaseUrl } from "@/lib/env";

const LOGIN_PAD = "/admin/login";

/**
 * First lock for the admin panel (in Next.js 16 middleware is called "proxy").
 * Sends everyone without a session to the login page and refreshes the session
 * cookies on every request.
 *
 * This is an optimistic check: only whether a signed-in user exists. Whether
 * they are also an admin is checked by the admin layout, and every admin
 * action checks again in the use case (assertAdmin) and in Row Level Security.
 */
export async function proxy(request: NextRequest) {
  const onLoginPage = request.nextUrl.pathname === LOGIN_PAD;
  let response = NextResponse.next({ request });

  // Without Supabase configuration the login page explains what is still missing.
  if (!supabaseUrl || !supabasePublishableKey) {
    return onLoginPage ? response : NextResponse.redirect(new URL(LOGIN_PAD, request.url));
  }

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        // Prevents a CDN from caching a response with auth cookies and serving it to another visitor.
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
