"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getClientDashboard } from "../actions";

type DashData = Awaited<ReturnType<typeof getClientDashboard>>;

export default function ClientDashboardPage() {
  const [data, setData] = useState<DashData>(null);

  useEffect(() => { getClientDashboard().then(setData); }, []);

  if (!data) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-built-red border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { client, weekNumber, daysInProgram, latestCheckin, unreadCount } = data;

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Bună, {client?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-zinc-500 mt-1">
          Ziua {daysInProgram} din program · Săptămâna {weekNumber}
        </p>
      </div>

      <div className="bg-[#111111] border border-white/10 rounded-xl p-5 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-zinc-200">Progres program 90 zile</span>
          <span className="text-sm font-bold text-built-red">{Math.min(daysInProgram, 90)}/90 zile</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-built-red rounded-full transition-all"
            style={{ width: `${Math.min((daysInProgram / 90) * 100, 100)}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        {[
          { label: "Aderență antrenament", value: `${latestCheckin?.training_adherence ?? "--"}%`, sub: "Săptămâna trecută" },
          { label: "Aderență nutriție", value: `${latestCheckin?.nutrition_adherence ?? "--"}%`, sub: "Săptămâna trecută" },
          { label: "Energie", value: `${latestCheckin?.energy_level ?? "--"}/10`, sub: "" },
          { label: "Dispoziție", value: `${latestCheckin?.mood ?? "--"}/10`, sub: "" },
        ].map(s => (
          <div key={s.label} className="bg-[#111111] border border-white/10 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            {s.sub && <p className="text-xs text-zinc-600 mt-0.5">{s.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { href: "/client/antrenamente", icon: "⚡", title: "Antrenamentul de azi", sub: "Vezi planul săptămânii" },
          { href: "/client/checkin", icon: "✓", title: "Check-in săptămânal", sub: "Trimite raportul săptămânii" },
          { href: "/client/nutritie", icon: "◉", title: "Plan nutrițional", sub: "Macros + mese zilnice" },
          { href: "/client/module", icon: "📚", title: "Academia BUILT", sub: "Module educaționale" },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className="bg-[#111111] border border-white/10 hover:border-built-red/30 rounded-xl p-4 transition-all group">
            <span className="text-lg mb-2 block">{item.icon}</span>
            <p className="text-sm font-semibold text-zinc-200 group-hover:text-white">{item.title}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{item.sub}</p>
          </Link>
        ))}
        <Link href="/client/mesaje"
          className="bg-[#111111] border border-white/10 hover:border-built-red/30 rounded-xl p-4 transition-all group relative">
          <span className="text-lg mb-2 block">◎</span>
          <p className="text-sm font-semibold text-zinc-200 group-hover:text-white">Mesaje</p>
          <p className="text-xs text-zinc-500 mt-0.5">Chat cu Claudiu</p>
          {unreadCount > 0 && (
            <span className="absolute top-3 right-3 w-5 h-5 bg-built-red rounded-full text-[10px] text-white font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
