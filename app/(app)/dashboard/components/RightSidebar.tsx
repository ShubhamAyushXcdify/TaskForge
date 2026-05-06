"use client";

import { Sk, EmptyState } from "@/app/(app)/dashboard/components/SharedUI";
import { CompletionDonut } from "@/app/(app)/dashboard/components/CompletionDonut";
import { CategoryDonut }   from "@/app/(app)/dashboard/components/CategoryDonut";
import type { DashboardStats, CategoryBreakdown, ChartKey } from "@/app/(app)/dashboard/components/dashboard";

interface Props {
  stats: DashboardStats;
  statsLoading: boolean;
  statsError: boolean;
  categories: CategoryBreakdown[];
  categoriesLoading: boolean;
  expandedChart: ChartKey | null;
  setExpandedChart: (key: ChartKey | null) => void;
}

export function RightSidebar({
  stats, statsLoading, statsError,
  categories, categoriesLoading,
  expandedChart, setExpandedChart,
}: Props) {
  return (
    <div
      className={`bg-white rounded-2xl p-5 border transition-all duration-200 shadow-sm ${
        expandedChart ? "border-teal-300 shadow-md" : "border-gray-100"
      }`}
    >
      
      {!expandedChart && (
        <>
          <h3
            className="text-sm font-semibold text-gray-900 mb-4"
            style={{ fontFamily: "Georgia,serif" }}
          >
            Completion Overview
          </h3>
          {statsLoading ? (
            <Sk className="h-40 w-40 rounded-full mx-auto" />
          ) : statsError ? (
            <EmptyState icon="⚠️" label="Couldn't load" sub="Backend may be unreachable" />
          ) : stats.assigned === 0 ? (
            <EmptyState icon="🎓" label="No courses assigned" sub="Your progress will appear here" />
          ) : (
            <CompletionDonut {...stats} rate={stats.completionRate} size="lg" />
          )}
        </>
      )}

      {/* ── Peak Hours expanded ─────────────────────────────────────── */}
      {expandedChart === "peak" && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-900" style={{ fontFamily: "Georgia,serif" }}>
              Peak Hours
            </h3>
            <button
              onClick={() => setExpandedChart(null)}
              className="text-[10px] text-gray-400 hover:text-gray-700 font-medium"
            >
              ✕ close
            </button>
          </div>
          <div className="space-y-2.5">
            {["9am","10am","11am","12pm","1pm","2pm","3pm","4pm","5pm"].map((h, i) => (
              <div key={h} className="flex items-center gap-3">
                <span className="text-[10px] font-medium text-gray-400 w-9 shrink-0">{h}</span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${18 + i * 9}%`,
                      background: "linear-gradient(to right,#0d9488,#2dd4bf)",
                    }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 w-8 text-right shrink-0">
                  {(0.5 + i * 0.28).toFixed(1)}h
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-4 pt-3 border-t border-gray-100">
            Peak: <span className="font-semibold text-teal-600">2–4 pm weekdays</span>
          </p>
        </>
      )}

      {/* ── Categories expanded ─────────────────────────────────────── */}
      {expandedChart === "category" && (
        <>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-900" style={{ fontFamily: "Georgia,serif" }}>
              Categories
            </h3>
            <button
              onClick={() => setExpandedChart(null)}
              className="text-[10px] text-gray-400 hover:text-gray-700 font-medium"
            >
              ✕ close
            </button>
          </div>
          {categoriesLoading ? (
            <Sk className="h-36" />
          ) : (
            <CategoryDonut data={categories} size="lg" />
          )}
        </>
      )}

      {/* ── Monthly Trend expanded ──────────────────────────────────── */}
      {expandedChart === "trend" && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-900" style={{ fontFamily: "Georgia,serif" }}>
              Monthly Progress
            </h3>
            <button
              onClick={() => setExpandedChart(null)}
              className="text-[10px] text-gray-400 hover:text-gray-700 font-medium"
            >
              ✕ close
            </button>
          </div>

          {stats.completed === 0 ? (
            <EmptyState icon="📈" label="No progress data" sub="Complete courses to see trends" />
          ) : (
            <>
              <div className="flex items-end justify-between gap-1.5 mb-3" style={{ height: 148 }}>
                {[
                  { m: "Nov", v: 35 },
                  { m: "Dec", v: 45 },
                  { m: "Jan", v: 52 },
                  { m: "Feb", v: 68 },
                  { m: "Mar", v: 72 },
                  { m: "Apr", v: 82 },
                ].map(d => (
                  <div key={d.m} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t"
                      style={{
                        height: `${d.v * 1.5}px`,
                        background: "linear-gradient(to top,#0d9488,#2dd4bf)",
                        opacity: 0.5 + (d.v / 100) * 0.5,
                      }}
                    />
                    <span className="text-[9px] text-gray-400 font-medium">{d.m}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 pt-3 border-t border-gray-100">
                <span className="font-semibold text-teal-600">+22%</span> vs last month
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}
