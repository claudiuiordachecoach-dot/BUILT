"use client";
import { useState } from "react";
import { signIn, resetPassword } from "./actions";
import { BrandLogo } from "@/components/BrandLogo";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

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
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <BrandLogo variant="full" />
        </div>
        <div className="bg-[#111111] border border-white/10 rounded-xl p-8">
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
  );
}
