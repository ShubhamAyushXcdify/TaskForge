"use client";

import { useEffect, useState } from "react";
import { useApiFetch } from "@/app/admin/assignments/apiFetch";
import { useSession } from "next-auth/react";

type Tab = "overview" | "assignments" | "employees" | "courses" | "reports" | "settings" | "notifications";

interface Stats {
  totalEmployees: number;
  activeEmployees: number;
  activeCourses: number;
  totalAssignments: number;
  completionRate: number;
  overdueCount: number;
  certsIssued: number;
}

interface StatusBreakdown {
  assigned: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

interface CategoryBreakdown {
  category: string;
  totalCourses: number;
  assigned: number;
  completed: number;
  completionRate: number;
}

interface TopCourse {
  courseId: string;
  title: string;
  courseUrl: string;
  totalAssigned: number;
  completed: number;
  completionRate: number;
}

interface ActivityItem {
  id: string;
  type: "completed" | "enrolled";
  employeeName: string;
  action: string;
  courseTitle: string;
  time: string;
}

interface Certificate {
  assignmentId: string;
  employeeName: string;
  courseTitle: string;
  certificateUrl: string;
  issuedAt: string;
}

interface DashboardData {
  stats: Stats;
  statusBreakdown: StatusBreakdown;
  categoryBreakdown: CategoryBreakdown[];
  topCourses: TopCourse[];
  activityFeed: ActivityItem[];
  overdueEmployees: unknown[];
  recentCertificates: Certificate[];
}

interface ApiResponse {
  success: boolean;
  data: DashboardData;
}

// ─── Color palette (auto-assigned by index — supports unlimited categories) ───

const PALETTE = [
  "#1D9E75", // emerald
  "#378ADD", // blue
  "#7F77DD", // indigo
  "#EF9F27", // amber
  "#E24B4A", // red
  "#3ABCB0", // teal
  "#F472B6", // pink
  "#A78BFA", // violet
  "#34D399", // green
  "#FB923C", // orange
];

function paletteColor(index: number): string {
  return PALETTE[index % PALETTE.length];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (mins  <  60) return `${mins}m ago`;
  if (hours <  24) return `${hours}h ago`;
  if (days  ===  1) return "Yesterday";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// ─── MetricCard ───────────────────────────────────────────────────────────────

function MetricCard({
  icon,
  label,
  value,
  sub,
  badge,
  onClick,
}: {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  badge?: { text: string; variant: "success" | "warn" | "info" | "neutral" };
  onClick?: () => void;
}) {
  const badgeClasses: Record<string, string> = {
    success: "bg-emerald-500/15 text-emerald-400",
    warn:    "bg-amber-500/15 text-amber-400",
    info:    "bg-indigo-500/15 text-indigo-400",
    neutral: "bg-slate-700 text-slate-400",
  };

  return (
    <div
      onClick={onClick}
      className={`bg-slate-800/60 rounded-xl px-4 py-4 border border-slate-700/50 transition-all duration-150
        ${onClick ? "cursor-pointer hover:border-indigo-500/60 hover:bg-slate-800 active:scale-[0.98]" : ""}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <span>{icon}</span>
          <span>{label}</span>
        </div>
        {onClick && (
          <span className="text-slate-600 text-xs">↗</span>
        )}
      </div>
      <div className="text-2xl font-semibold text-white leading-none mb-1">{value}</div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
      {badge && (
        <span className={`mt-2 inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${badgeClasses[badge.variant]}`}>
          {badge.text}
        </span>
      )}
    </div>
  );
}

// ─── DonutChart ───────────────────────────────────────────────────────────────

function DonutChart({ breakdown }: { breakdown: StatusBreakdown }) {
  const total = breakdown.assigned + breakdown.inProgress + breakdown.completed + breakdown.overdue;
  const r     = 54;
  const circ  = 2 * Math.PI * r;

  const segments = [
    { label: "Completed",   value: breakdown.completed,  color: "#1D9E75" },
    { label: "Assigned",    value: breakdown.assigned,   color: "#378ADD" },
    { label: "In progress", value: breakdown.inProgress, color: "#EF9F27" },
    { label: "Overdue",     value: breakdown.overdue,    color: "#E24B4A" },
  ];

  let offset = 0;
  const drawn = segments.map((s) => {
    const dash = total > 0 ? (s.value / total) * circ : 0;
    const gap  = circ - dash;
    const el   = { ...s, dash, gap, offset };
    offset += dash;
    return el;
  });

  return (
    <div className="flex gap-5 items-center">
      {/* Donut — intentionally larger than the pills grid */}
      <svg width="140" height="140" viewBox="0 0 140 140" className="shrink-0">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#1e293b" strokeWidth="16" />
        {drawn.map((s) =>
          s.dash > 0 ? (
            <circle
              key={s.label}
              cx="70" cy="70" r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="16"
              strokeDasharray={`${s.dash} ${s.gap}`}
              strokeDashoffset={-s.offset}
              strokeLinecap="round"
              style={{ transform: "rotate(-90deg)", transformOrigin: "70px 70px" }}
            />
          ) : null
        )}
        <text x="70" y="65" textAnchor="middle" fontSize="22" fontWeight="500" fill="white">{total}</text>
        <text x="70" y="81" textAnchor="middle" fontSize="12" fill="#64748b">total</text>
      </svg>

      {/* 2×2 stat pills */}
      <div className="grid grid-cols-2 gap-2 flex-1">
        {drawn.map((s) => (
          <div
            key={s.label}
            className="rounded-xl px-3 py-2.5"
            style={{ background: `${s.color}18` }}
          >
            <div className="text-xl font-semibold leading-none" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[11px] text-slate-400 mt-1.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CategoryBars ─────────────────────────────────────────────────────────────

function CategoryBars({ categories }: { categories: CategoryBreakdown[] }) {
  const sorted = [...categories].sort((a, b) => b.completionRate - a.completionRate);

  return (
    <div className="flex flex-col gap-3 overflow-y-auto pr-1" style={{ maxHeight: `${4 * 52}px` }}  >
      {sorted.map((cat, i) => {
        const color = paletteColor(i);
        const pct   = Math.round(cat.completionRate);
        return (
          <div key={cat.category}>
            <div className="flex justify-between text-xs mb-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-slate-300">{cat.category}</span>
              </div>
              <span className="text-slate-500">{pct}%</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── TopCoursesBars ───────────────────────────────────────────────────────────

function TopCoursesBars({ courses }: { courses: TopCourse[] }) {
  return (
    <div className="flex flex-col gap-4">
      {courses.map((course, i) => {
        const pct   = Math.round(course.completionRate);
        const color = paletteColor(i);   // ← same palette, consistent across both charts
        return (
          <div key={course.courseId}>
            <div className="flex justify-between items-start mb-1.5 gap-2">
              <a
                href={course.courseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-200 hover:text-indigo-400 transition-colors leading-snug truncate"
                title={course.title}
              >
                {course.title}
              </a>
              <span className="text-xs text-slate-500 shrink-0">{pct}%</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
            <div className="text-[10px] text-slate-600 mt-1">
              {course.completed} of {course.totalAssigned} completed
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── ActivityFeed ─────────────────────────────────────────────────────────────

function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="flex flex-col divide-y divide-slate-700/50">
      {items.slice(0, 8).map((item) => (
        <div key={item.id} className="flex items-center gap-3 py-2.5">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 ${
              item.type === "completed"
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-indigo-500/15 text-indigo-400"
            }`}
          >
            {item.type === "completed" ? "✓" : "+"}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-slate-200">{item.employeeName}</span>
            <span className="text-xs text-slate-500"> {item.action} </span>
            <span className="text-xs text-slate-300 truncate">{item.courseTitle}</span>
          </div>
          <span className="text-[10px] text-slate-600 shrink-0">{relativeTime(item.time)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── CertList ─────────────────────────────────────────────────────────────────

function CertList({ certs }: { certs: Certificate[] }) {
  return (
    <div className="flex flex-col divide-y divide-slate-700/50">
      {certs.map((cert) => (
        <div key={cert.assignmentId} className="flex items-center gap-3 py-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center text-xs shrink-0">
            🏅
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-200 truncate">{cert.employeeName}</div>
            <div className="text-[11px] text-slate-500 truncate">{cert.courseTitle}</div>
          </div>
          <span className="text-[10px] text-slate-600 shrink-0">{relativeTime(cert.issuedAt)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-slate-800 rounded-lg animate-pulse ${className ?? ""}`} />;
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-44" />
        <Skeleton className="h-44" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-52" />
        <Skeleton className="h-52" />
        <Skeleton className="h-52" />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Overview({ onNavigate }: { onNavigate?: (tab: Tab) => void }) {
  const apiFetch = useApiFetch();
  const {status} = useSession();
  const [data, setData]       = useState<DashboardData | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    if(status !=="authenticated") return;

    async function fetchDashboard() {
      try {
        const json = await apiFetch<ApiResponse>("/api/admin/dashboard");
        if (!json.success) throw new Error("API returned success: false");
        setData(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [apiFetch,status]);

  if (loading) return <OverviewSkeleton />;

  if (error) {
    return (
      <div className="bg-red-950/40 border border-red-800/50 rounded-xl p-6 text-center">
        <p className="text-red-400 text-sm font-medium">Failed to load dashboard</p>
        <p className="text-red-600 text-xs mt-1">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { stats, statusBreakdown, categoryBreakdown, topCourses, activityFeed, recentCertificates } = data;

  return (
    <div className="space-y-5">

      {/* ── Metric row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          icon="👥"
          label="Active employees"
          value={stats.activeEmployees}
          sub={`${stats.totalEmployees} Total Employees`}
          onClick={onNavigate ? () => onNavigate("employees") : undefined}
        />
        <MetricCard
          icon="📚"
          label="Active courses"
          value={stats.activeCourses}
          sub={`${stats.totalAssignments} assignments`}
          onClick={onNavigate ? () => onNavigate("courses") : undefined}
        />
        <MetricCard
          icon="📊"
          label="Completion rate"
          value={`${stats.completionRate.toFixed(1)}%`}
          sub={`${statusBreakdown.completed} of ${stats.totalAssignments} done`}
          onClick={onNavigate ? () => onNavigate("assignments") : undefined}
        />
        <MetricCard
          icon="🏅"
          label="Certs issued"
          value={stats.certsIssued}
          badge={
            stats.overdueCount > 0
              ? { text: `${stats.overdueCount} overdue`, variant: "warn" }
              : { text: "0 overdue", variant: "success" }
          }
        />
      </div>

      {/* ── Status + Categories ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-xs font-medium text-slate-400 mb-4 uppercase tracking-wider">Assignment status</h3>
          <DonutChart breakdown={statusBreakdown} />
        </div>
        <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-xs font-medium text-slate-400 mb-4 uppercase tracking-wider">Category completion</h3>
          <CategoryBars categories={categoryBreakdown} />
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-700/50">
            {[...categoryBreakdown]
              .sort((a, b) => b.completionRate - a.completionRate)
              .map((cat, i) => (
                <span
                  key={cat.category}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800"
                  style={{ color: paletteColor(i) }}
                >
                  {cat.category} · {cat.totalCourses} course{cat.totalCourses !== 1 ? "s" : ""}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* ── Bottom 3-col ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-xs font-medium text-slate-400 mb-4 uppercase tracking-wider">Top courses</h3>
          <TopCoursesBars courses={topCourses} />
        </div>
        <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-xs font-medium text-slate-400 mb-4 uppercase tracking-wider">Recent certificates</h3>
          <CertList certs={recentCertificates} />
        </div>
        <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-xs font-medium text-slate-400 mb-4 uppercase tracking-wider">Activity feed</h3>
          <ActivityFeed items={activityFeed} />
        </div>
      </div>

    </div>
  );
}