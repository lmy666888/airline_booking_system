export function Skeleton({ className = "" }: { className?: string }) {
  return <span className={`block animate-pulse rounded-md bg-slate-200/80 ${className}`} aria-hidden="true" />;
}

export function SkeletonBlock({ label = "Loading content" }: { label?: string }) {
  return (
    <div className="space-y-3" role="status" aria-busy="true" aria-label={label}>
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}
