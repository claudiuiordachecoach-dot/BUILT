export function EmptyState({
  icon = "○",
  title,
  subtitle,
}: {
  icon?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="anim-scale-in bg-[#111111] border border-white/10 rounded-xl px-6 py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-built-red/10 border border-built-red/20 flex items-center justify-center text-xl text-built-red mx-auto mb-4">
        {icon}
      </div>
      <p className="font-condensed text-sm uppercase tracking-wider text-zinc-200">{title}</p>
      {subtitle && <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto leading-relaxed">{subtitle}</p>}
    </div>
  );
}
