"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  safeFetch, isOk, getData,
  mapStats, mapDay, mapCat, mapAct,
  fetchTodos, createTodo, toggleTodoApi,
} from "@/app/(app)/dashboard/components/dashboardApi";
import type { DashboardStats, WeeklyHours, CategoryBreakdown, Activity, Todo } from "@/app/(app)/dashboard/components/dashboard";
import { DEFAULT_STATS } from "@/app/(app)/dashboard/components/dashboard";

export function useDashboard() {
  const { data: session } = useSession();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = session?.user?.token as string | undefined;

  // ── Stats ─────────────────────────────────────────────────────────────────
  const [stats,             setStats]             = useState<DashboardStats>(DEFAULT_STATS);
  const [statsLoading,      setStatsLoading]      = useState(true);
  const [statsError,        setStatsError]        = useState(false);

  // ── Weekly hours ──────────────────────────────────────────────────────────
  const [weeklyHours,       setWeeklyHours]       = useState<WeeklyHours>({ thisWeek: [], lastWeek: [] });
  const [weeklyLoading,     setWeeklyLoading]     = useState(true);

  // ── Categories ────────────────────────────────────────────────────────────
  const [categories,        setCategories]        = useState<CategoryBreakdown[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // ── Activity ──────────────────────────────────────────────────────────────
  const [activity,          setActivity]          = useState<Activity[]>([]);
  const [activityLoading,   setActivityLoading]   = useState(true);

  // ── Todos ─────────────────────────────────────────────────────────────────
  const [todos,             setTodos]             = useState<Todo[]>([]);
  const [todosLoading,      setTodosLoading]      = useState(true);

  // ── Fetch all ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (session === undefined) return;

    if (!backendUrl) {
      [setStatsLoading, setWeeklyLoading, setCategoriesLoading, setActivityLoading, setTodosLoading]
        .forEach(fn => fn(false));
      return;
    }

    const t = token;

    safeFetch(`${backendUrl}/api/Dashboard/stats`, t)
      .then(j => {
        if (isOk(j) && getData(j)) setStats(mapStats(getData(j)));
        else setStatsError(true);
      })
      .finally(() => setStatsLoading(false));

    safeFetch(`${backendUrl}/api/Dashboard/weekly-hours`, t)
      .then(j => {
        if (isOk(j) && getData(j)) {
          const d = getData(j);
          setWeeklyHours({
            thisWeek: (d.ThisWeek ?? d.thisWeek ?? []).map(mapDay),
            lastWeek: (d.LastWeek ?? d.lastWeek ?? []).map(mapDay),
          });
        }
      })
      .finally(() => setWeeklyLoading(false));

    safeFetch(`${backendUrl}/api/Dashboard/category-breakdown`, t)
      .then(j => { if (isOk(j)) setCategories((getData(j) ?? []).map(mapCat)); })
      .finally(() => setCategoriesLoading(false));

    safeFetch(`${backendUrl}/api/Dashboard/activity`, t)
      .then(j => { if (isOk(j)) setActivity((getData(j) ?? []).map(mapAct)); })
      .finally(() => setActivityLoading(false));

    // Todos use /api/Todo (matches actual API)
    fetchTodos(backendUrl, t)
      .then(setTodos)
      .finally(() => setTodosLoading(false));
  }, [session, backendUrl]);

  // ── Todo actions ──────────────────────────────────────────────────────────

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo || !backendUrl) return;
    const next = !todo.isCompleted;

    // Optimistic update
    setTodos(l => l.map(t => t.id === id ? { ...t, isCompleted: next } : t));

    const ok = await toggleTodoApi(backendUrl, id, next, token);
    if (!ok) {
      // Rollback
      setTodos(l => l.map(t => t.id === id ? { ...t, isCompleted: todo.isCompleted } : t));
    }
  };

  const addTodo = async (title: string): Promise<boolean> => {
    if (!title.trim() || !backendUrl) return false;

    const tempId = `temp-${Date.now()}`;
    setTodos(l => [...l, { id: tempId, title, isCompleted: false }]);

    const created = await createTodo(backendUrl, title, token);
    if (created) {
      setTodos(l => l.map(t => t.id === tempId ? created : t));
      return true;
    } else {
      // Rollback optimistic item
      setTodos(l => l.filter(t => t.id !== tempId));
      return false;
    }
  };

  return {
    session,
    stats, statsLoading, statsError,
    weeklyHours, weeklyLoading,
    categories, categoriesLoading,
    activity, activityLoading,
    todos, todosLoading,
    toggleTodo, addTodo,
  };
}
