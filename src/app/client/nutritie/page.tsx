"use client";
import { useState, useEffect } from "react";
import { getNutritionPlan } from "../actions";
import { EmptyState } from "../components/EmptyState";
import { PageSkeleton } from "../components/Skeleton";

type Meal = { name: string; foods: string[]; calories?: number; protein_g?: number };
type NutritionPlan = { calories: number; protein_g: number; carbs_g: number; fat_g: number; meals: Meal[]; notes?: string; quickref_url?: string };

export default function NutritiePage() {
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getNutritionPlan().then(p => setPlan(p as NutritionPlan | null)).finally(() => setLoading(false)); }, []);

  if (loading) return <PageSkeleton cards={3} />;

  if (!plan) return (
    <div className="p-5 md:p-8 max-w-3xl">
      <h1 className="font-display text-4xl tracking-wider text-built-white mb-6">Plan Nutrițional</h1>
      <EmptyState icon="◉" title="Planul tău se construiește" subtitle="Claudiu îți pregătește sistemul nutrițional. Apare aici în curând." />
    </div>
  );

  if (plan.quickref_url) {
    return (
      <iframe
        src={plan.quickref_url}
        className="w-full border-0 h-[calc(100dvh-8rem)] md:h-[calc(100vh-1rem)]"
        title="Plan Nutrițional"
      />
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="font-display text-4xl tracking-wider text-built-white mb-6">Plan Nutrițional</h1>
      <div className="stagger grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Calorii", value: plan.calories, unit: "kcal", color: "text-built-red" },
          { label: "Proteine", value: plan.protein_g, unit: "g", color: "text-built-white" },
          { label: "Carbohidrați", value: plan.carbs_g, unit: "g", color: "text-built-white" },
          { label: "Grăsimi", value: plan.fat_g, unit: "g", color: "text-built-white" },
        ].map(m => (
          <div key={m.label} className="hover-lift bg-[#111111] border border-white/10 rounded-2xl p-4 text-center">
            <p className={`font-display text-2xl leading-none ${m.color}`}>{m.value}</p>
            <p className="text-xs text-zinc-500 mt-1">{m.unit}</p>
            <p className="font-condensed text-[10px] text-zinc-500 uppercase tracking-[0.15em] mt-1">{m.label}</p>
          </div>
        ))}
      </div>
      <div className="stagger space-y-3">
        {plan.meals?.map((meal, i) => (
          <div key={i} className="hover-lift bg-[#111111] border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-condensed text-[11px] text-zinc-400 uppercase tracking-[0.2em]">{meal.name}</p>
              {meal.calories && <span className="text-xs text-zinc-500">{meal.calories} kcal · {meal.protein_g}g prot</span>}
            </div>
            <ul className="space-y-0.5">
              {meal.foods?.map((food, j) => (
                <li key={j} className="text-xs text-zinc-400 flex gap-2"><span className="text-zinc-700">·</span>{food}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {plan.notes && (
        <div className="mt-5 bg-[#111111] border border-white/5 rounded-2xl p-4">
          <p className="font-condensed text-[10px] text-zinc-500 uppercase tracking-[0.15em] mb-1">Note de la Claudiu</p>
          <p className="text-sm text-zinc-300">{plan.notes}</p>
        </div>
      )}
    </div>
  );
}
