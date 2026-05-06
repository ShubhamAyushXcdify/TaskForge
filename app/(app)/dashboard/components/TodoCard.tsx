"use client";

import { useState, useRef } from "react";
import { Sk, EmptyState } from "@/app/(app)/dashboard/components/SharedUI";
import type { Todo } from "@/app/(app)/dashboard/components/dashboard";

interface Props {
  todos: Todo[];
  loading: boolean;
  onToggle: (id: string) => void;
  onAdd: (title: string) => Promise<boolean>;
}

export function TodoCard({ todos, loading, onToggle, onAdd }: Props) {
  const [addingTodo, setAddingTodo]   = useState(false);
  const [newTodo,    setNewTodo]      = useState("");
  const addInputRef                   = useRef<HTMLInputElement>(null);

  const completedCount = todos.filter(t => t.isCompleted).length;

  const handleAdd = () => {
    setAddingTodo(true);
    setTimeout(() => addInputRef.current?.focus(), 40);
  };

  const handleSubmit = async () => {
    const title = newTodo.trim();
    if (!title) return;
    setNewTodo("");
    setAddingTodo(false);
    await onAdd(title);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter")  handleSubmit();
    if (e.key === "Escape") { setAddingTodo(false); setNewTodo(""); }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900" style={{ fontFamily: "Georgia,serif" }}>
            To-do
          </h3>
          {todos.length > 0 && (
            <p className="text-[10px] text-gray-400 mt-0.5">
              <span className="font-semibold text-teal-600">{completedCount}</span>/{todos.length} done
            </p>
          )}
        </div>
        <button
          onClick={handleAdd}
          className="text-[10px] font-bold text-teal-600 hover:text-teal-700 uppercase tracking-widest transition-colors"
        >
          + Add
        </button>
      </div>

      {/* Add input */}
      {addingTodo && (
        <div className="flex gap-1.5 mb-3">
          <input
            ref={addInputRef}
            value={newTodo}
            onChange={e => setNewTodo(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="New task…"
            className="flex-1 text-xs px-3 py-2 rounded-xl border border-teal-200 bg-teal-50/50 text-gray-700 placeholder-gray-300 outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100 transition-all"
          />
          <button
            onClick={handleSubmit}
            className="px-3 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition"
          >
            ✓
          </button>
          <button
            onClick={() => { setAddingTodo(false); setNewTodo(""); }}
            className="px-3 py-2 rounded-xl bg-gray-100 text-gray-500 text-xs font-bold hover:bg-gray-200 transition"
          >
            ✕
          </button>
        </div>
      )}

      {/* List — scrollable, fixed height */}
      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5 flex-1">
        {loading ? (
          <div className="space-y-1.5">
            <Sk className="h-9" />
            <Sk className="h-9" />
            <Sk className="h-9" />
          </div>
        ) : todos.length === 0 && !addingTodo ? (
          <EmptyState icon="✓" label="No tasks yet" sub="Add a task to get started" />
        ) : (
          todos.map(todo => (
            <div
              key={todo.id}
              role="checkbox"
              aria-checked={todo.isCompleted}
              tabIndex={0}
              onKeyDown={e => e.key === " " && onToggle(todo.id)}
              onClick={() => onToggle(todo.id)}
              className={`flex gap-2.5 p-2.5 rounded-xl transition-all cursor-pointer select-none group ${
                todo.isCompleted
                  ? "bg-gray-50 hover:bg-gray-100"
                  : "bg-teal-50/50 hover:bg-teal-50"
              }`}
            >
              {/* Checkbox */}
              <div
                className={`w-4 h-4 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                  todo.isCompleted
                    ? "bg-teal-600 border-teal-600"
                    : "border-gray-300 group-hover:border-teal-400"
                }`}
              >
                {todo.isCompleted && (
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    />
                  </svg>
                )}
              </div>

              {/* Title */}
              <p
                className={`text-[11px] leading-snug flex-1 min-w-0 font-medium transition-all ${
                  todo.isCompleted ? "text-gray-400 line-through" : "text-gray-700"
                }`}
              >
                {todo.title}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Progress bar */}
      {todos.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(completedCount / todos.length) * 100}%`,
                background: "linear-gradient(to right, #0d9488, #2dd4bf)",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
