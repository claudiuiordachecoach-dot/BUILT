import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Injectează pathname ca header — citit în root layout pentru auth guard
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { pathname } = request.nextUrl;

  // Rute publice — trec liber
  if (pathname.startsWith("/login") || pathname.startsWith("/api") || pathname.startsWith("/p/")) {
    return response;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();

    // Neautentificat → login
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Determină rolul
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? "client";

    // Client încearcă să acceseze admin → redirecționează la portalul lui
    if (role === "client" && !pathname.startsWith("/client")) {
      return NextResponse.redirect(new URL("/client/dashboard", request.url));
    }
  } catch {
    // Orice eroare → redirect la login (fail-safe)
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|quickref).*)"],
};
