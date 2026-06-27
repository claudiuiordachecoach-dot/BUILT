"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getModuleContent } from "../../actions";
import Link from "next/link";

export default function ModuleViewerPage() {
  const { id } = useParams();
  const router = useRouter();
  const [module, setModule] = useState<{ module_number: number; title: string; content_html: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getModuleContent(parseInt(id as string)).then(res => {
        setModule(res);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="w-8 h-8 border-4 border-built-red border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!module) return (
    <div className="p-8 text-center text-zinc-500">
      Modulul nu a fost găsit sau nu ai acces.
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100dvh-8rem)] md:h-screen bg-black overflow-hidden">
      {/* Header bar for viewer */}
      <div className="h-14 bg-[#0A0A0A] border-b border-white/10 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/client/module" className="text-zinc-500 hover:text-white transition-colors text-sm flex items-center gap-1">
            <span>←</span> Înapoi
          </Link>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <h1 className="text-sm font-bold text-white tracking-wider uppercase">
            M{module.module_number} · {module.title}
          </h1>
        </div>
        <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-tighter">
          BUILT Academy // Core Learning System
        </div>
      </div>

      {/* The Module Content (Renders in IFrame to preserve custom styles) */}
      <div className="flex-1 w-full bg-black">
        <iframe
          srcDoc={module.content_html}
          className="w-full h-full border-none"
          title={module.title}
          sandbox="allow-scripts allow-popups allow-forms allow-same-origin"
        />
      </div>
    </div>
  );
}
