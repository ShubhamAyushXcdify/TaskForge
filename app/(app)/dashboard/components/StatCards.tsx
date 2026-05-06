import { Sk } from "@/app/(app)/dashboard/components/SharedUI";
import type { DashboardStats } from "@/app/(app)/dashboard/components/dashboard";

interface Props {
  stats: DashboardStats;
  loading: boolean;
  error: boolean;
}

export function StatCards({ stats, loading, error }: Props) {
  const cards = [
    { label: "Assigned",    icon: "📚", value: stats.assigned,                                sub: "total courses",  dark: false },
    { label: "Completed",   icon: "✅", value: stats.completed,                               sub: `${stats.completionRate}% done`, dark: true  },
    { label: "In Progress", icon: "▶️", value: stats.inProgress,                              sub: "active now",     dark: false },
    { label: "Not Started", icon: "⏳", value: stats.notStarted,                              sub: "pending",        dark: false },
    { label: "Hours Spent", icon: "⏱️", value: `${stats.totalHoursSpent}h`,                  sub: "total learning", dark: false },
    { label: "Avg Score",   icon: "🎯", value: stats.avgScore != null ? `${stats.avgScore}%` : "—", sub: "quiz average", dark: false },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Sk key={i} className="h-[86px] rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-6 gap-3">
      {cards.map(({ label, icon, value, sub, dark }) => (
        <div
          key={label}
          className={`rounded-2xl px-4 py-3.5 border transition-all duration-200 ${
            dark
              ? "bg-gradient-to-br from-teal-600 to-teal-700 border-teal-700 shadow-md"
              : "bg-white border-gray-100 hover:border-teal-200 hover:shadow-sm shadow-sm"
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <p className={`text-[9px] font-bold uppercase tracking-widest ${dark ? "text-teal-100" : "text-gray-400"}`}>
              {label}
            </p>
            <span className="text-xs leading-none">{icon}</span>
          </div>
          <p
            className={`text-[1.45rem] font-semibold leading-none ${dark ? "text-white" : "text-gray-900"}`}
            style={{ fontFamily: "Georgia, serif" }}
          >
            {error ? "—" : value}
          </p>
          <p className={`text-[10px] mt-1.5 ${dark ? "text-teal-100" : "text-gray-400"}`}>
            {sub}
          </p>
        </div>
      ))}
    </div>
  );
}
