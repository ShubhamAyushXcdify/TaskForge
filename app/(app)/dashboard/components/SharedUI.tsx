export function Sk({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 ${className}`} />;
}



export function EmptyState({
  icon,
  label,
  sub,
}: {
  icon: string;
  label: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2 select-none">
      <span className="text-2xl opacity-20">{icon}</span>
      <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400">
        {label}
      </p>
      {sub && (
        <p className="text-[9px] text-gray-400 text-center">{sub}</p>
      )}
    </div>
  );
}



const ACT_COLORS: Record<string, string> = {
  completed:   "#0d9488",
  certificate: "#d97706",
  started:     "#3b82f6",
  assigned:    "#8b5cf6",
};

export function ActDot({ type }: { type: string }) {
  return (
    <span
      className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
      style={{ background: ACT_COLORS[type] ?? "#9ca3af" }}
    />
  );
}
