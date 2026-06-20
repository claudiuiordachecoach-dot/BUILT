import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  const response = NextResponse.redirect(new URL("/login", request.url));
  
  // Sterge toate cookie-urile de supabase
  allCookies.forEach(cookie => {
    if (cookie.name.includes("sb-")) {
      response.cookies.delete(cookie.name);
    }
  });
  
  return response;
}
