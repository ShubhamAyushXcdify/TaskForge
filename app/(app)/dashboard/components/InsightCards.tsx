"use client";

import { Sk, EmptyState } from "@/app/(app)/dashboard/components/SharedUI";
import { CompletionDonut } from "@/app/(app)/dashboard/components/CompletionDonut";
import { CategoryDonut }   from "@/app/(app)/dashboard/components/CategoryDonut";
import type { DashboardStats, CategoryBreakdown, ChartKey } from "@/app/(app)/dashboard/components/dashboard";

interface Props {
  stats: DashboardStats;
  statsLoading: boolean;
  categories: CategoryBreakdown[];
  categoriesLoading: boolean;
  expandedChart: ChartKey | null;
  setExpandedChart: (key: ChartKey | null) => void;
}

export function InsightCards({
  stats, statsLoading,
  categories, categoriesLoading,
  expandedChart, setExpandedChart,
}: Props) {
  const cardClass = (key: ChartKey) =>
    `bg-white rounded-2xl p-4 border cursor-pointer select-none transition-all duration-200 group ${
      expandedChart === key
        ? "border-teal-400 ring-1 ring-teal-100 shadow-md"
        : "border-gray-100 hover:border-teal-200 hover:shadow-sm"
    }`;

  const toggle = (key: ChartKey) =>
    setExpandedChart(expandedChart === key ? null : key);

  return (
    <div className="grid grid-cols-3 gap-4">

      {/* ── Peak Hours ──────────────────────────────────────────────── */}
      <div onClick={() => toggle("peak")} className={cardClass("peak")}>
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs font-semibold text-gray-800" style={{ fontFamily: "Georgia,serif" }}>
            {expandedChart === "peak" ? "Completion" : "Peak Hours"}
          </p>
          <span className="text-[9px] text-gray-300 group-hover:text-teal-400 transition-colors">
            {expandedChart === "peak" ? "↩" : "↗"}
          </span>
        </div>

        {expandedChart === "peak" ? (
          statsLoading ? (
            <Sk className="h-16" />
          ) : (
            <CompletionDonut {...stats} rate={stats.completionRate} size="sm" />
          )
        ) : (
          <>
            <div className="flex items-end justify-between gap-1 h-12 mb-2.5">
              {[22, 38, 54, 62, 74, 90, 84, 68, 44].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm"
                  style={{
                    height: `${h}%`,
                    background: "linear-gradient(to top, #0d9488, #2dd4bf)",
                    opacity: 0.3 + (h / 100) * 0.7,
                  }}
                />
              ))}
            </div>
            <p className="text-[10px] text-gray-400">
              Peak: <span className="font-semibold text-teal-600">2–4 pm</span>
            </p>
          </>
        )}
      </div>

      {/* ── Categories ──────────────────────────────────────────────── */}
      <div onClick={() => toggle("category")} className={cardClass("category")}>
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-semibold text-gray-800" style={{ fontFamily: "Georgia,serif" }}>
            {expandedChart === "category" ? "Completion" : "Categories"}
          </p>
          <span className="text-[9px] text-gray-300 group-hover:text-teal-400 transition-colors">
            {expandedChart === "category" ? "↩" : "↗"}
          </span>
        </div>

        {expandedChart === "category" ? (
          statsLoading ? (
            <Sk className="h-16" />
          ) : (
            <CompletionDonut {...stats} rate={stats.completionRate} size="sm" />
          )
        ) : categoriesLoading ? (
          <Sk className="h-16 mt-1" />
        ) : (
          <CategoryDonut data={categories} size="sm" />
        )}
      </div>

      {/* ── Monthly Trend ───────────────────────────────────────────── */}
      <div onClick={() => toggle("trend")} className={cardClass("trend")}>
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs font-semibold text-gray-800" style={{ fontFamily: "Georgia,serif" }}>
            {expandedChart === "trend" ? "Completion" : "Monthly Trend"}
          </p>
          <span className="text-[9px] text-gray-300 group-hover:text-teal-400 transition-colors">
            {expandedChart === "trend" ? "↩" : "↗"}
          </span>
        </div>

        {expandedChart === "trend" ? (
          statsLoading ? (
            <Sk className="h-16" />
          ) : (
            <CompletionDonut {...stats} rate={stats.completionRate} size="sm" />
          )
        ) : stats.completed === 0 ? (
          <EmptyState icon="📈" label="No data yet" />
        ) : (
          <>
            <svg viewBox="0 0 150 60" className="w-full h-14 mb-2">
              <defs>
                <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#0d9488" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0d9488" stopOpacity="0"    />
                </linearGradient>
              </defs>
              <path d="M10,52 35,42 60,30 85,18 110,10 135,4 135,60 10,60 Z" fill="url(#tg)" />
              <polyline
                points="10,52 35,42 60,30 85,18 110,10 135,4"
                fill="none" stroke="#0d9488" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
              />
              {[[10,52],[35,42],[60,30],[85,18],[110,10],[135,4]].map(([cx,cy]) => (
                <circle key={cx} cx={cx} cy={cy} r="2" fill="#0d9488" stroke="white" strokeWidth="1.5" />
              ))}
            </svg>
            <p className="text-[10px] text-gray-400">
              <span className="font-semibold text-teal-600">+22%</span> vs last month
            </p>
          </>
        )}
      </div>

    </div>
  );
}
