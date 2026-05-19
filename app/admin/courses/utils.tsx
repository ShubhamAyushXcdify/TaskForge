export const categoryColor: Record<string, string> = {
  Frontend: "bg-teal-900/60 text-teal-300 border-teal-800",
  Backend: "bg-blue-900/60 text-blue-300 border-blue-800",
};

export const defaultCatColor =
  "bg-slate-700 text-slate-300 border-slate-600";

export const assignBadge: Record<string, string> = {
  Completed: "bg-teal-900/50 text-teal-400",
  InProgress: "bg-indigo-900/50 text-indigo-400",
  Assigned: "bg-slate-800 text-slate-400",
  Overdue: "bg-red-900/50 text-red-400",
};

export function fmtDate(iso: string | null) {
  if (!iso) return "—";

  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function initials2(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}