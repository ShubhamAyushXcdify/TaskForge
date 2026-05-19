export default function SkeletonRow() {
  return (
    <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_80px] gap-4 items-center px-4 py-3 border-b border-slate-800/50">
      {[...Array(6)].map((_, i) => (
        <div key={i} className={`h-4 bg-slate-800 rounded animate-pulse ${i === 5 ? "w-16" : ""}`} />
      ))}
    </div>
  );
}