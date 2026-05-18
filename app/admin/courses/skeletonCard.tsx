export default function SkeletonCard() {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3">
      <div className="flex justify-between">
        <div className="h-5 w-20 bg-slate-800 rounded-full animate-pulse" />
        <div className="h-5 w-14 bg-slate-800 rounded-full animate-pulse" />
      </div>
      <div className="space-y-1.5">
        <div className="h-4 w-3/4 bg-slate-800 rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-slate-800 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => <div key={i} className="h-14 bg-slate-800 rounded-xl animate-pulse" />)}
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full animate-pulse" />
    </div>
  );
}