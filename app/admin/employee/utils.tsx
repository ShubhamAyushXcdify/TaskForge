export function initials(first?: string, last?: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

export function fmtDate(iso: string | null) {
  if (!iso) return "—";

  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const statusCfg = {
  Active: {
    dot: "bg-emerald-400",
    text: "text-emerald-400",
    badge:
      "bg-emerald-900/40 text-emerald-400 border border-emerald-800",
  },

  Inactive: {
    dot: "bg-slate-500",
    text: "text-slate-400",
    badge:
      "bg-slate-800 text-slate-400 border border-slate-700",
  },

  Resigned: {
    dot: "bg-red-400",
    text: "text-red-400",
    badge:
      "bg-red-900/40 text-red-400 border border-red-900",
  },
};

export const assignBadge: Record<string, string> = {
  Completed: "bg-teal-900/50 text-teal-400",
  InProgress: "bg-indigo-900/50 text-indigo-400",
  "In Progress": "bg-indigo-900/50 text-indigo-400",
  Assigned: "bg-slate-800 text-slate-400",
  "Not Started": "bg-slate-800 text-slate-400",
  Overdue: "bg-red-900/50 text-red-400",
};