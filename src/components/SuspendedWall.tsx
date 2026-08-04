"use client";
import { SignOutButton } from "@/components/SignOutButton";

export function SuspendedWall() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-[#0A0A0A] text-center px-4 relative">
      <div className="absolute top-6 right-6">
        <SignOutButton />
      </div>
      <div className="w-16 h-16 bg-built-red/10 rounded-full flex items-center justify-center mb-6">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-built-red">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <h2 className="text-2xl font-condensed uppercase tracking-wider text-white mb-2">Abonament Suspendat</h2>
      <p className="text-zinc-400 mb-8 max-w-md mx-auto">
        Pentru a putea accesa din nou platforma și programele, abonamentul tău necesită reînnoire.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <a 
          href="https://wa.me/40772173755" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 press transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          Reînnoiește pe WhatsApp
        </a>
      </div>
    </div>
  );
}
