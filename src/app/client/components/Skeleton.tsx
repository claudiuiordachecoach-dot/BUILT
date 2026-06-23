export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`shimmer rounded-lg ${className}`} />;
}

/** Skeleton generic pentru paginile care încarcă: titlu + câteva carduri. */
export function PageSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="p-5 md:p-8 max-w-3xl">
      <Skeleton className="h-9 w-48 mb-6" />
      <div className="space-y-3">
        {Array.from({ length: cards }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}
