"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getClientModules } from "../actions";

export default function ClientModulesPage() {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClientModules().then(res => {
      setModules(res);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-built-red border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-5 md:p-8 max-w-4xl">
      <div className="mb-8">
        <p className="font-condensed text-[11px] text-built-red uppercase tracking-[0.25em] mb-1">Educație</p>
        <h1 className="font-display text-4xl tracking-wider text-built-white">Academia BUILT</h1>
        <p className="text-zinc-500 mt-1">Evoluția ta începe cu fundația mentală și strategică.</p>
      </div>

      {modules.length === 0 ? (
        <div className="bg-[#111111] border border-white/5 rounded-xl p-8 text-center">
          <p className="text-zinc-500">Modulele tale educaționale vor apărea aici în curând.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((m) => (
            <Link key={m.id} href={`/client/module/${m.id}`}
              className="bg-[#111111] border border-white/10 hover:border-built-red/40 rounded-xl p-5 transition-all group relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-[10px] font-bold text-built-red uppercase tracking-widest mb-2 block">Modulul {m.module_number}</span>
                <h3 className="text-lg font-bold text-white group-hover:text-built-red transition-colors">{m.title}</h3>
                <p className="text-xs text-zinc-500 mt-2">Accesează materialul →</p>
              </div>
              <div className="absolute -right-4 -bottom-8 text-7xl font-bold text-white/5 group-hover:text-built-red/10 transition-colors pointer-events-none">
                {m.module_number}
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12 p-6 bg-built-red/5 border border-built-red/20 rounded-xl">
        <h4 className="text-sm font-bold text-built-red mb-2 uppercase tracking-wider">De ce Academia BUILT?</h4>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Fiecare modul este conceput să schimbe o piesă din arhitectura ta mentală sau biologică. Nu te grăbi — implementează fiecare protocol înainte de a trece la următorul.
        </p>
      </div>
    </div>
  );
}
