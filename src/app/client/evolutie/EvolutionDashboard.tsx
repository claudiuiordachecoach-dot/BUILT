'use client';
import { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Cell } from 'recharts';
import type { MetricPoint } from '../actions';
import type { NutritionLog } from '../actions';

// Re-folosim stilul brandului
function fmtDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
}

function getMacroColor(consumed: number | null, target: number | null) {
  if (!consumed || !target) return '#71717a';
  const ratio = consumed / target;
  if (ratio >= 0.85 && ratio <= 1.15) return '#3FAE6A'; // Verde (optim)
  if (ratio >= 0.70 && ratio <= 1.30) return '#F59E0B'; // Galben (ok-ish)
  return '#C0392B'; // Rosu (departe de target)
}

function getAdherenceColor(ratio: number) {
  if (ratio >= 0.85) return 'text-[#3FAE6A]';
  if (ratio >= 0.7) return 'text-[#F59E0B]';
  return 'text-[#C0392B]';
}

export default function EvolutionDashboard({ 
  metrics, 
  nutritionLogs,
  targetWeight
}: { 
  metrics: MetricPoint[], 
  nutritionLogs: NutritionLog[],
  targetWeight: number | null
}) {
  const [activeTab, setActiveTab] = useState<'macros' | 'greutate'>('macros');

  const weightData = useMemo(() => {
    return metrics.map(p => ({
      date: fmtDate(p.date),
      weight: p.weight ?? null,
      body_fat: p.body_fat ?? null
    }));
  }, [metrics]);

  const nutritionData = useMemo(() => {
    return nutritionLogs.map(log => ({
      ...log,
      date_fmt: fmtDate(log.log_date)
    }));
  }, [nutritionLogs]);

  // Calcule pentru sumar saptamanal (ultimele 7 zile cu date)
  const recentLogs = nutritionData.slice(-7);
  const avgProteins = recentLogs.reduce((acc, l) => acc + (l.protein_g || 0), 0) / (recentLogs.length || 1);
  const avgCarbs = recentLogs.reduce((acc, l) => acc + (l.carbs_g || 0), 0) / (recentLogs.length || 1);
  const avgFats = recentLogs.reduce((acc, l) => acc + (l.fat_g || 0), 0) / (recentLogs.length || 1);
  const avgKcal = recentLogs.reduce((acc, l) => acc + (l.calories_consumed || 0), 0) / (recentLogs.length || 1);
  
  const targetKcal = recentLogs[0]?.calories_goal || 1845;
  const targetP = recentLogs[0]?.protein_target || 160;
  
  const adherenceScore = Math.min(100, Math.round((avgProteins / targetP) * 100));

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6 pb-24">
      <header className="mb-6">
        <h1 className="font-display text-4xl tracking-wider text-built-white mb-2">Evoluția Ta</h1>
        <p className="text-sm text-zinc-400">Urmărește progresul tău în timp real.</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 bg-[#111] p-1 rounded-lg border border-white/10">
        <button
          onClick={() => setActiveTab('macros')}
          className={`flex-1 py-2 text-xs font-condensed uppercase tracking-widest rounded-md transition-colors ${activeTab === 'macros' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Nutriție & Macros
        </button>
        <button
          onClick={() => setActiveTab('greutate')}
          className={`flex-1 py-2 text-xs font-condensed uppercase tracking-widest rounded-md transition-colors ${activeTab === 'greutate' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Greutate & Corp
        </button>
      </div>

      {/* Continut Tabs */}
      {activeTab === 'macros' && (
        <div className="space-y-6 anim-fade-in">
          {nutritionData.length === 0 ? (
            <div className="bg-[#111] border border-white/10 rounded-2xl p-8 text-center">
              <p className="text-zinc-400 text-sm">Nu avem date de nutriție încă.</p>
            </div>
          ) : (
            <>
              {/* Grafic Calorii */}
              <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
                <div className="mb-4">
                  <p className="font-condensed text-[11px] text-zinc-400 uppercase tracking-[0.2em]">Evoluție Calorii</p>
                </div>
                <div className="h-48 -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={nutritionData} margin={{ top: 5, right: 8, left: -22, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="date_fmt" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                        labelStyle={{ color: '#a1a1aa', fontSize: 11 }}
                        itemStyle={{ fontSize: 12, color: '#fff' }}
                        formatter={(val: any) => [`${val} kcal`, 'Consumat']}
                      />
                      {nutritionData[0]?.calories_goal && (
                        <ReferenceLine y={nutritionData[0].calories_goal} stroke="#3FAE6A" strokeDasharray="4 4" />
                      )}
                      <Bar dataKey="calories_consumed" radius={[4,4,0,0]}>
                        {nutritionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getMacroColor(entry.calories_consumed, entry.calories_goal)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tabel Sumar Macros */}
              <div className="bg-[#111] border border-white/10 rounded-2xl p-5 overflow-hidden">
                <div className="mb-4">
                  <p className="font-condensed text-[11px] text-zinc-400 uppercase tracking-[0.2em]">Istoric Mese & Macros</p>
                </div>
                <div className="overflow-x-auto -mx-5 px-5">
                  <table className="w-full text-left min-w-[500px]">
                    <thead>
                      <tr className="border-b border-white/10 text-[10px] font-condensed uppercase tracking-widest text-zinc-500">
                        <th className="pb-3 font-normal">Data</th>
                        <th className="pb-3 font-normal text-right">Calorii</th>
                        <th className="pb-3 font-normal text-right">Proteine</th>
                        <th className="pb-3 font-normal text-right">Carbs</th>
                        <th className="pb-3 font-normal text-right">Grăsimi</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {[...nutritionData].reverse().map(log => (
                        <tr key={log.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                          <td className="py-3 text-zinc-300">{log.date_fmt}</td>
                          <td className="py-3 text-right">
                            <span className="text-white font-medium">{log.calories_consumed || '-'}</span>
                            <span className="text-zinc-600 text-xs ml-1">/ {log.calories_goal || '-'}</span>
                          </td>
                          <td className="py-3 text-right">
                            <span style={{color: getMacroColor(log.protein_g, log.protein_target)}} className="font-medium">{log.protein_g || '-'}g</span>
                          </td>
                          <td className="py-3 text-right">
                            <span style={{color: getMacroColor(log.carbs_g, log.carbs_target)}} className="font-medium">{log.carbs_g || '-'}g</span>
                          </td>
                          <td className="py-3 text-right">
                            <span style={{color: getMacroColor(log.fat_g, log.fat_target)}} className="font-medium">{log.fat_g || '-'}g</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sumar Ultimele 7 zile */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-[#111] border border-white/10 rounded-2xl p-4 text-center">
                  <p className={`font-display text-3xl leading-none ${getAdherenceColor(adherenceScore / 100)}`}>{adherenceScore}%</p>
                  <p className="text-[10px] font-condensed text-zinc-500 uppercase tracking-widest mt-2">Aderență Proteine</p>
                </div>
                <div className="bg-[#111] border border-white/10 rounded-2xl p-4 text-center">
                  <p className="font-display text-3xl leading-none text-white">{Math.round(avgProteins)}<span className="text-lg text-zinc-500">g</span></p>
                  <p className="text-[10px] font-condensed text-zinc-500 uppercase tracking-widest mt-2">Media Proteine</p>
                </div>
                <div className="bg-[#111] border border-white/10 rounded-2xl p-4 text-center">
                  <p className="font-display text-3xl leading-none text-white">{Math.round(avgCarbs)}<span className="text-lg text-zinc-500">g</span></p>
                  <p className="text-[10px] font-condensed text-zinc-500 uppercase tracking-widest mt-2">Media Carbs</p>
                </div>
                <div className="bg-[#111] border border-white/10 rounded-2xl p-4 text-center">
                  <p className="font-display text-3xl leading-none text-white">{Math.round(avgFats)}<span className="text-lg text-zinc-500">g</span></p>
                  <p className="text-[10px] font-condensed text-zinc-500 uppercase tracking-widest mt-2">Media Grăsimi</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'greutate' && (
        <div className="space-y-6 anim-fade-in">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
             <div className="flex items-center justify-between mb-4">
                <p className="font-condensed text-[11px] text-zinc-400 uppercase tracking-[0.2em]">Evoluție Greutate (kg)</p>
             </div>
             {weightData.length < 2 ? (
               <p className="text-zinc-500 text-sm py-10 text-center">Avem nevoie de cel puțin 2 măsurători pentru a arăta evoluția.</p>
             ) : (
               <div className="h-64 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightData} margin={{ top: 5, right: 8, left: -22, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 10 }} domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip
                      contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                      labelStyle={{ color: '#a1a1aa', fontSize: 10 }} itemStyle={{ fontSize: 11 }}
                    />
                    {targetWeight != null && <ReferenceLine y={targetWeight} stroke="#3FAE6A" strokeDasharray="4 4" />}
                    <Line type="monotone" dataKey="weight" stroke="#C0392B" strokeWidth={2} dot={{ r: 3, fill: '#C0392B' }} name="Greutate (kg)" connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
