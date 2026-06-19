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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Calorii", value: plan.calories, unit: "kcal", color: "text-built-red" },
          { label: "Proteine", value: plan.protein_g, unit: "g", color: "text-built-white" },
          { label: "Carbohidrați", value: plan.carbs_g, unit: "g", color: "text-built-white" },
          { label: "Grăsimi", value: plan.fat_g, unit: "g", color: "text-built-white" },
        ].map(m => (
          <div key={m.label} className="bg-[#111111] border border-white/10 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{m.unit}</p>
            <p className="text-[11px] text-zinc-600 mt-1">{m.label}</p>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {plan.meals?.map((meal, i) => (
          <div key={i} className="bg-[#111111] border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-zinc-200">{meal.name}</p>
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
        <div className="mt-5 bg-[#111111] border border-white/5 rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-1">Note de la Claudiu</p>
          <p className="text-sm text-zinc-300">{plan.notes}</p>
        </div>
      )}
    </div>
  );
}
