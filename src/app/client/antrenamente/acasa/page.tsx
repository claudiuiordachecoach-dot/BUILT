import Link from "next/link";

export default function AntrenamentAcasaPage() {
  return (
    <div className="flex flex-col w-full" style={{ height: "calc(100vh - 60px)" }}>
      <div className="flex gap-2 px-4 py-2 bg-[#111111] border-b border-white/10 shrink-0">
        <Link
          href="/client/antrenamente"
          className="text-xs font-semibold text-zinc-500 hover:text-zinc-200 pb-1 px-1 transition-colors"
        >
          Sală
        </Link>
        <span className="text-xs font-semibold text-built-red border-b-2 border-built-red pb-1 px-1">Acasă</span>
      </div>
      <iframe
        src="/quickref/alex-acasa.html"
        className="w-full border-0 flex-1"
        title="Protocoale Acasă"
      />
    </div>
  );
}
