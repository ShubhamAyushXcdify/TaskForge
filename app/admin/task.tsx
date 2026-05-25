"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Todo {
  id: string;
  title: string;
  isCompleted: boolean;
}

interface TaskModalProps {
  backendUrl: string;
  token?: string;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function apiFetchTodos(backendUrl: string, token?: string): Promise<Todo[]> {
  try {
    const headers: HeadersInit = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${backendUrl}/api/Todo`, { headers });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json?.data ?? json ?? [];
    return (Array.isArray(data) ? data : []).map((t: any) => ({
      id: String(t.id ?? t.Id),
      title: t.title ?? t.Title ?? "",
      isCompleted: t.isCompleted ?? t.IsCompleted ?? false,
    }));
  } catch {
    return [];
  }
}

async function apiCreateTodo(backendUrl: string, title: string, token?: string): Promise<Todo | null> {
  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${backendUrl}/api/Todo`, {
      method: "POST",
      headers,
      body: JSON.stringify({ Title: title }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const t = json?.data ?? json;
    return { id: String(t.id ?? t.Id), title: t.title ?? t.Title ?? title, isCompleted: false };
  } catch {
    return null;
  }
}

async function apiToggleTodo(backendUrl: string, id: string, isCompleted: boolean, token?: string): Promise<boolean> {
  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${backendUrl}/api/Todo/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ IsCompleted: isCompleted }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function apiDeleteTodo(backendUrl: string, id: string, token?: string): Promise<boolean> {
  try {
    const headers: HeadersInit = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${backendUrl}/api/Todo/${id}`, { method: "DELETE", headers });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TaskModal({ backendUrl, token }: TaskModalProps) {
  const [open, setOpen]         = useState(false);
  const [todos, setTodos]       = useState<Todo[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading]   = useState(false);
  const [adding, setAdding]     = useState(false);
  const [filter, setFilter]     = useState<"all" | "active" | "done">("all");
  const inputRef                = useRef<HTMLInputElement>(null);

  // Load todos when modal opens
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    apiFetchTodos(backendUrl, token).then((data) => {
      setTodos(data);
      setLoading(false);
    });
  }, [open, backendUrl, token]);

  // Focus input when modal opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const handleAdd = useCallback(async () => {
    const title = inputVal.trim();
    if (!title || adding) return;
    setAdding(true);
    const created = await apiCreateTodo(backendUrl, title, token);
    if (created) setTodos((prev) => [created, ...prev]);
    setInputVal("");
    setAdding(false);
    inputRef.current?.focus();
  }, [inputVal, adding, backendUrl, token]);

  const handleToggle = useCallback(async (todo: Todo) => {
    const next = !todo.isCompleted;
    setTodos((prev) => prev.map((t) => t.id === todo.id ? { ...t, isCompleted: next } : t));
    const ok = await apiToggleTodo(backendUrl, todo.id, next, token);
    if (!ok) setTodos((prev) => prev.map((t) => t.id === todo.id ? { ...t, isCompleted: todo.isCompleted } : t));
  }, [backendUrl, token]);

  const handleDelete = useCallback(async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    await apiDeleteTodo(backendUrl, id, token);
  }, [backendUrl, token]);

  const handleClearCompleted = useCallback(() => {
    const completed = todos.filter((t) => t.isCompleted);
    setTodos((prev) => prev.filter((t) => !t.isCompleted));
    completed.forEach((t) => apiDeleteTodo(backendUrl, t.id, token));
  }, [todos, backendUrl, token]);

  const filtered = todos.filter((t) =>
    filter === "all" ? true : filter === "active" ? !t.isCompleted : t.isCompleted
  );
  const activeCount    = todos.filter((t) => !t.isCompleted).length;
  const completedCount = todos.filter((t) => t.isCompleted).length;

  return (
    <>
      {/* ── Sidebar trigger button ───────────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 w-full rounded-xl text-sm font-medium transition-all px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800"
      >
        <span className="w-5 h-5 rounded-md bg-slate-700 hover:bg-indigo-600 flex items-center justify-center shrink-0 transition-colors">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </span>
        <span className="flex-1 text-left">Tasks</span>
        {activeCount > 0 && (
          <span className="text-[9px] font-bold bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded-md">
            {activeCount}
          </span>
        )}
      </button>

      {/* ── Modal ────────────────────────────────────────────────────────── */}
     {open && createPortal (
  <div className="fixed inset-0 z-[999] flex items-center justify-center">

    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    />

          {/* Panel */}
         <div className="relative bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-md mx-4 flex flex-col overflow-hidden max-h-[80vh] z-[1000]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M2 4h11M2 7.5h7M2 11h5" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">My Tasks</h3>
                  <p className="text-[10px] text-slate-500">
                    {activeCount} active · {completedCount} done
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition"
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Add task input */}
            <div className="px-5 py-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl px-3.5 py-2.5 focus-within:border-indigo-500/50 focus-within:bg-slate-800 transition-all">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-slate-500 shrink-0">
                  <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder="Add a new task and press Enter..."
                  className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 outline-none"
                />
                {inputVal.trim() && (
                  <button
                    onClick={handleAdd}
                    disabled={adding}
                    className="shrink-0 text-[10px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-lg transition disabled:opacity-50"
                  >
                    {adding ? "Adding…" : "Add"}
                  </button>
                )}
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 px-5 pt-3 pb-1">
              {(["all", "active", "done"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-[10px] font-semibold px-3 py-1.5 rounded-lg capitalize transition-all ${
                    filter === f
                      ? "bg-indigo-600 text-white"
                      : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Task list */}
            <div className="h-64 overflow-y-auto px-5 py-3 space-y-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-[11px] text-slate-600">Loading tasks…</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg">
                    {filter === "done" ? "✓" : "📝"}
                  </div>
                  <p className="text-xs text-slate-600">
                    {filter === "done"
                      ? "No completed tasks yet"
                      : filter === "active"
                      ? "All caught up!"
                      : "No tasks yet — add one above"}
                  </p>
                </div>
              ) : (
                filtered.map((todo) => (
                  <div
                    key={todo.id}
                    className="group flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/50 transition-all"
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggle(todo)}
                      className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                        todo.isCompleted
                          ? "bg-indigo-600 border-indigo-600"
                          : "border-slate-600 hover:border-indigo-500"
                      }`}
                    >
                      {todo.isCompleted && (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>

                    {/* Title */}
                    <span className={`flex-1 text-xs leading-relaxed break-words transition-all ${
                      todo.isCompleted ? "line-through text-slate-600" : "text-slate-200"
                    }`}>
                      {todo.title}
                    </span>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="opacity-0 group-hover:opacity-100 mt-0.5 w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-950/40 transition-all shrink-0"
                    >
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                        <path d="M1 1l7 7M8 1L1 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {completedCount > 0 && (
              <div className="px-5 py-3 border-t border-slate-800">
                <button
                  onClick={handleClearCompleted}
                  className="w-full text-[11px] font-medium text-slate-600 hover:text-red-400 hover:bg-red-950/20 py-2 rounded-xl transition-all"
                >
                  Clear {completedCount} completed task{completedCount > 1 ? "s" : ""}
                </button>
              </div>
            )}
          </div>
        </div>,
         document.body
      )}
    </>
  );
}