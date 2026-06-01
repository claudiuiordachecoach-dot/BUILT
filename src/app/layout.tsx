import type { Metadata } from "next";
import { Bebas_Neue, Barlow_Condensed, Barlow, JetBrains_Mono } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getSupabaseAuth } from "@/lib/supabase/auth-server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "900"],
  display: "swap",
});

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BUILT — AI Command Center",
  description: "Sistemul AI personal al lui Iordache Claudiu pentru BUILT.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const supabase = await getSupabaseAuth();
  const { data: { user } } = await supabase.auth.getUser();

  // Blochează orice pagină în afară de /login dacă nu ești logat
  if (!user && pathname !== "/login") redirect("/login");

  return (
    <html
      lang="ro"
      className={`${bebasNeue.variable} ${barlowCondensed.variable} ${barlow.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <div className="flex min-h-screen">
            {user && <Sidebar />}
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
