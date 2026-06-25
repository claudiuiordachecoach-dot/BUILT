"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

// Pagini publice — fără chrome de dashboard, chiar dacă un admin e logat.
const PUBLIC_PREFIXES = ["/aplica", "/p/", "/login", "/fisa-start", "/debug"];

/**
 * Decide pe baza rutei (client-side, deci de încredere — spre deosebire de
 * x-pathname din middleware, care nu se propagă la root layout în setup-ul ăsta)
 * dacă afișăm sidebar-ul + padding-ul de admin. Pe paginile publice: niciodată.
 */
export function ChromeGate({ isAdmin, children }: { isAdmin: boolean; children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isPublic = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
  const showChrome = isAdmin && !isPublic;

  return (
    <div className="flex min-h-screen">
      {showChrome && <Sidebar />}
      <main className={`flex-1 min-w-0 ${showChrome ? "mobile-header-offset md:pt-0" : ""}`}>{children}</main>
    </div>
  );
}
