"use client";

import { useRef, useEffect } from "react";
import { Sk, EmptyState, ActDot } from "@/app/(app)/dashboard/components/SharedUI";
import type { Activity } from "@/app/(app)/dashboard/components/dashboard";

interface Props {
  activity: Activity[];
  loading: boolean;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function ActivityDropdown({ activity, loading, open, onToggle, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={onToggle}
        aria-label="Recent activity"
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
          open ? "bg-white text-teal-700" : "bg-white/20 hover:bg-white/30 text-white"
        }`}
      >
        ◎
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-2.5 flex justify-between items-center border-b border-gray-100 bg-gray-50">
            <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500">
              Recent Activity
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ✕
            </button>
          </div>

          {/* List */}
          <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="p-4 space-y-2">
                <Sk className="h-8" />
                <Sk className="h-8" />
                <Sk className="h-8" />
              </div>
            ) : activity.length === 0 ? (
              <EmptyState
                icon="📭"
                label="No activity yet"
                sub="Complete a course to see activity"
              />
            ) : (
              activity.map(a => (
                <div
                  key={a.id}
                  className="flex gap-2.5 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <ActDot type={a.type} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate leading-snug">
                      {a.title}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(a.timestamp).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-center">
            <button className="text-[10px] font-bold text-teal-600 hover:text-teal-700 tracking-widest uppercase">
              View all →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
