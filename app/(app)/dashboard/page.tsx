"use client";

import { useState } from "react";
import { Sk }                from "@/app/(app)/dashboard/components/SharedUI";
import { StatCards }         from "@/app/(app)/dashboard/components/StatCards";
import { WeeklyChart }       from "@/app/(app)/dashboard/components/WeeklyChart";
import { InsightCards }      from "@/app/(app)/dashboard/components/InsightCards";
import { RightSidebar }      from "@/app/(app)/dashboard/components/RightSidebar";
import { TodoCard }          from "@/app/(app)/dashboard/components/TodoCard";
import { ActivityDropdown }  from "@/app/(app)/dashboard/components/ActivityDropdown";
import { useDashboard }      from "@/app/(app)/dashboard/components/useDashboard";
import type { ChartKey }     from "@/app/(app)/dashboard/components/dashboard";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const {
    stats, statsLoading, statsError,
    weeklyHours, weeklyLoading,
    categories, categoriesLoading,
    activity, activityLoading,
    todos, todosLoading,
    toggleTodo, addTodo,
  } = useDashboard();

  const [expandedChart, setExpandedChart] = useState<ChartKey | null>(null);
  const [showActivity,  setShowActivity]  = useState(false);
  const { data: session } = useSession();

  const fullName  = session?.user?.name ?? "";
  const firstName = fullName.split(" ")[0] || "there";
  const initial   = firstName[0]?.toUpperCase() ?? "U";
  const hr        = new Date().getHours();
  const greeting  = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";

 
  if (session === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 pb-12">
        <div className="max-w-7xl mx-auto px-6 pt-6 space-y-5">
          <Sk className="h-16 rounded-2xl" />
          <div className="grid grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <Sk key={i} className="h-[86px] rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-2 space-y-5">
              <Sk className="h-60 rounded-2xl" />
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => <Sk key={i} className="h-44 rounded-2xl" />)}
              </div>
            </div>
            <div className="space-y-5">
              <Sk className="h-72 rounded-2xl" />
              <Sk className="h-60 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  
  return (
    <div className="min-h-screen bg-slate-50 pb-16" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl px-5 py-4 flex justify-between items-center shadow-lg">
          <div>
            <p className="text-xs font-medium opacity-80 uppercase tracking-wider mb-0.5">
              {greeting}
            </p>
            <h1 className="text-base font-semibold leading-tight">{firstName}</h1>
          </div>

          <div className="flex items-center gap-2.5">
            <ActivityDropdown
              activity={activity}
              loading={activityLoading}
              open={showActivity}
              onToggle={() => setShowActivity(v => !v)}
              onClose={() => setShowActivity(false)}
            />
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">
              {initial}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 pt-5 space-y-5">

        {/* Stat cards */}
        <StatCards stats={stats} loading={statsLoading} error={statsError} />

        {/* Main grid */}
        <div className="grid grid-cols-3 gap-5">

          {/* Left: chart + insight cards */}
          <div className="col-span-2 flex flex-col gap-5">
            <WeeklyChart weeklyHours={weeklyHours} loading={weeklyLoading} />
            <InsightCards
              stats={stats}
              statsLoading={statsLoading}
              categories={categories}
              categoriesLoading={categoriesLoading}
              expandedChart={expandedChart}
              setExpandedChart={setExpandedChart}
            />
          </div>

          {/* Right: completion overview + todos */}
          <div className="flex flex-col gap-5">
            <RightSidebar
              stats={stats}
              statsLoading={statsLoading}
              statsError={statsError}
              categories={categories}
              categoriesLoading={categoriesLoading}
              expandedChart={expandedChart}
              setExpandedChart={setExpandedChart}
            />
            <TodoCard
              todos={todos}
              loading={todosLoading}
              onToggle={toggleTodo}
              onAdd={addTodo}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

