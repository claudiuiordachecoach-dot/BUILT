import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
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

  // Rute complet publice — trec fără autentificare
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/p/") ||
    pathname.startsWith("/debug") ||
    pathname.startsWith("/fisa-start")
  ) {
    return response;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();

    // Neautentificat → login
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Citim rolul din profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;

    // Dacă nu există profil → redirect la login (date incomplete)
    if (!role) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const isClientRoute = pathname.startsWith("/client");
    const isAdminRoute = !isClientRoute;

    if (role === "admin") {
      // Admin încearcă să acceseze ruta de client → OK (View as Client)
      // Admin poate accesa tot
      return response;
    }

    if (role === "client") {
      // Client încearcă să acceseze rută admin → redirect forţat la portalul lui
      if (isAdminRoute) {
        return NextResponse.redirect(new URL("/client/dashboard", request.url));
      }
      return response;
    }

    // Orice alt rol necunoscut → login
    return NextResponse.redirect(new URL("/login", request.url));

  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|quickref|icons).*)" ],
};
