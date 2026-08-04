"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, resetPassword } from "./actions";
import { BrandLogo } from "@/components/BrandLogo";

/* ─── Pop-up fullscreen: Plată Restantă (Andy) ─── */
function PaymentRequiredModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#1a1a1a] to-[#111111] border border-amber-500/30 rounded-2xl p-8 shadow-2xl shadow-amber-500/10">
        {/* Glow accent */}
        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
        
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl mx-auto mb-5">
          ⚠️
        </div>

        <h2 className="text-xl font-bold text-white text-center mb-2">
          Acces Suspendat Temporar
        </h2>
        <p className="text-sm text-zinc-400 text-center mb-6 leading-relaxed">
          Accesul tău la platforma BUILT a fost suspendat temporar din cauza unei <span className="text-amber-400 font-semibold">plăți restante</span>.
        </p>

        <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 mb-6">
          <p className="text-sm text-zinc-300 text-center leading-relaxed">
            Pentru a-ți reactiva contul, te rugăm să finalizezi plata restantă. 
            Contactează echipa BUILT pentru detalii.
          </p>
        </div>

        <a
          href="https://wa.me/40772173755?text=Salut%2C%20vreau%20s%C4%83%20rezolv%20plata%20restant%C4%83%20pentru%20BUILT"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold py-3 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 mb-3"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Contactează BUILT pe WhatsApp
        </a>

        <button
          onClick={onClose}
          className="w-full text-xs text-zinc-600 hover:text-zinc-400 transition-colors text-center py-2"
        >
          Închide
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

/* ─── Banner: Cont Dezactivat (Alex) ─── */
function AccountDisabledBanner() {
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-red-500/15 border border-red-500/25 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
          ✕
        </div>
        <div>
          <p className="text-sm font-semibold text-red-400 mb-1">Cont dezactivat</p>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Contul tău a fost dezactivat permanent. Contactează echipa BUILT dacă crezi că este o eroare.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Login Form (interiorul care folosește useSearchParams) ─── */
function LoginForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDisabledBanner, setShowDisabledBanner] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "payment_required") {
      setShowPaymentModal(true);
    } else if (errorParam === "account_disabled") {
      setShowDisabledBanner(true);
    }
  }, [searchParams]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  async function handleReset() {
    if (!resetEmail) return;
    setLoading(true);
    setError(null);
    const result = await resetPassword(resetEmail);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setResetSent(true);
    }
  }

  return (
    <>
      {showPaymentModal && (
        <PaymentRequiredModal onClose={() => setShowPaymentModal(false)} />
      )}
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center">
            <BrandLogo variant="full" />
          </div>
          <div className="bg-[#111111] border border-white/10 rounded-xl p-8">
            {showDisabledBanner && <AccountDisabledBanner />}
            {!resetMode ? (
              <>
                <h1 className="text-xl font-bold text-white mb-1">Intră în cont</h1>
                <p className="text-sm text-zinc-500 mb-6">Command Center</p>
                <form action={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">Email</label>
                    <input
                      name="email"
                      type="email"
                      required
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-built-red/50"
                      placeholder="email@tau.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">Parolă</label>
                    <input
                      name="password"
                      type="password"
                      required
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-built-red/50"
                      placeholder="••••••••"
                    />
                  </div>
                  {error && (
                    <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                      {error}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-built-red hover:bg-built-red/90 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-all"
                  >
                    {loading ? "Se conectează..." : "Intră"}
                  </button>
                </form>
                <button
                  onClick={() => { setResetMode(true); setError(null); }}
                  className="w-full mt-4 text-xs text-zinc-500 hover:text-zinc-300 transition-colors text-center"
                >
                  Ai uitat parola?
                </button>
              </>
            ) : resetSent ? (
              <>
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl mx-auto mb-4">✓</div>
                  <h1 className="text-lg font-bold text-white mb-2">Email trimis</h1>
                  <p className="text-sm text-zinc-400">Verifică inbox-ul la <span className="text-white">{resetEmail}</span> și urmează link-ul de resetare.</p>
                </div>
                <button
                  onClick={() => { setResetMode(false); setResetSent(false); setResetEmail(""); }}
                  className="w-full mt-6 text-xs text-zinc-500 hover:text-zinc-300 transition-colors text-center"
                >
                  ← Înapoi la login
                </button>
              </>
            ) : (
              <>
                <h1 className="text-xl font-bold text-white mb-1">Resetează parola</h1>
                <p className="text-sm text-zinc-500 mb-6">Îți trimitem un link pe email.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-built-red/50"
                      placeholder="email@tau.com"
                    />
                  </div>
                  {error && (
                    <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                      {error}
                    </p>
                  )}
                  <button
                    onClick={handleReset}
                    disabled={loading || !resetEmail}
                    className="w-full bg-built-red hover:bg-built-red/90 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-all"
                  >
                    {loading ? "Se trimite..." : "Trimite link"}
                  </button>
                </div>
                <button
                  onClick={() => { setResetMode(false); setError(null); }}
                  className="w-full mt-4 text-xs text-zinc-500 hover:text-zinc-300 transition-colors text-center"
                >
                  ← Înapoi la login
                </button>
              </>
            )}
          </div>
          <p className="text-center text-[11px] text-zinc-700 mt-6">
            BUILT · Command Center
          </p>
        </div>
      </div>
    </>
  );
}

/* ─── Page wrapper cu Suspense (necesar pentru useSearchParams) ─── */
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-zinc-600 text-sm">Se încarcă...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
