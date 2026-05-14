"use client";
import { useState } from "react";
import { signIn } from "./actions";
import { BrandLogo } from "@/components/BrandLogo";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <BrandLogo variant="full" />
        </div>
        <div className="bg-[#111111] border border-white/10 rounded-xl p-8">
          <h1 className="text-xl font-bold text-white mb-1">Intră în cont</h1>
          <p className="text-sm text-zinc-500 mb-6">BUILT AI Command Center</p>
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
        </div>
        <p className="text-center text-[11px] text-zinc-700 mt-6">
          BUILT AI Command Center · v0.2
        </p>
      </div>
    </div>
  );
}
