import Link from "next/link";
import { getWorkoutPlan } from "../../actions";
import NativeSheet from "../../components/NativeSheet";

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
    <div className="p-5 md:p-8 max-w-5xl mx-auto">
      <div className="flex gap-4 mb-5">
        <Link href="/client/antrenamente" className="font-condensed text-[11px] uppercase tracking-wider text-zinc-500 hover:text-built-white transition-colors">Sală</Link>
        <span className="font-condensed text-[11px] uppercase tracking-wider text-built-red border-b-2 border-built-red pb-0.5">Acasă</span>
      </div>
      <NativeSheet url={plan.quickref_acasa_url} />
    </div>
  );
}
