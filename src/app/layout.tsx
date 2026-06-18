import type { Metadata } from "next";
import { Bebas_Neue, Barlow_Condensed, Barlow, JetBrains_Mono } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getSupabaseAuth } from "@/lib/supabase/auth-server";
import { getUserRole } from "@/lib/supabase/auth-server";
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
  title: "BUILT",
  description: "Command Center — Metoda BUILT",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BUILT",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

import { NotificationProvider } from '@/app/client/components/NotificationProvider';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await getSupabaseAuth();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user ? await getUserRole().catch(() => null) : null;
  const isAdmin = role === "admin";

  return (
    <html
      lang="ro"
      suppressHydrationWarning
      className={`${bebasNeue.variable} ${barlowCondensed.variable} ${barlow.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0A0A0A" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js')` }} />
      </head>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <div className="flex min-h-screen">
            {isAdmin && <Sidebar />}
            <NotificationProvider>
              <main className={`flex-1 min-w-0 ${isAdmin ? "pt-12 md:pt-0" : ""}`}>{children}</main>
            </NotificationProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
