import Link from "next/link";
import { getWorkoutPlan } from "../../actions";

export default async function AntrenamentAcasaPage() {
  const plan = await getWorkoutPlan();

  if (!plan || !plan.quickref_acasa_url) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-bold text-white mb-2">Acasă</h1>
        <p className="text-zinc-500 text-sm">Nu ai un protocol pentru acasă alocat.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-[calc(100dvh-8rem)] md:h-[calc(100vh-1rem)]">
      <div className="flex gap-2 px-4 py-2 bg-[#111111] border-b border-white/10 shrink-0">
        <Link href="/client/antrenamente" className="text-xs font-semibold text-zinc-500 hover:text-zinc-200 pb-1 px-1 transition-colors">Sală</Link>
        <span className="text-xs font-semibold text-built-red border-b-2 border-built-red pb-1 px-1">Acasă</span>
      </div>
      <iframe src={plan.quickref_acasa_url} className="w-full border-0 flex-1" title="Protocoale Acasă" />
    </div>
  );
}
