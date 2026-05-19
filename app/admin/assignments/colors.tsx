import { AssignmentStatus } from './types';

export const categoryColor: Record<string, string> = {
  Frontend: "bg-teal-900/60 text-teal-300 border-teal-800",
  Backend: "bg-blue-900/60 text-blue-300 border-blue-800",
  Cloud: "bg-sky-900/60 text-sky-300 border-sky-800",
  DevOps: "bg-purple-900/60 text-purple-300 border-purple-800",
  "Soft Skills": "bg-green-900/60 text-green-300 border-green-800",
  Analytics: "bg-orange-900/60 text-orange-300 border-orange-800",
  Programming: "bg-rose-900/60 text-rose-300 border-rose-800",
  "UI/UX": "bg-pink-900/60 text-pink-300 border-pink-800",
  AI: "bg-violet-900/60 text-violet-300 border-violet-800",
};

export const defaultCatColor = "bg-slate-700 text-slate-300 border-slate-600";

export const statusBadge: Record<AssignmentStatus, string> = {
  Completed: "bg-teal-900/50 text-teal-400 border-teal-800/50",
  InProgress: "bg-indigo-900/50 text-indigo-400 border-indigo-800/50",
  Assigned: "bg-slate-800 text-slate-400 border-slate-700",
  Overdue: "bg-red-900/50 text-red-400 border-red-800/50",
};

export const statusDot: Record<AssignmentStatus, string> = {
  Completed: "bg-teal-400",
  InProgress: "bg-indigo-400",
  Assigned: "bg-slate-500",
  Overdue: "bg-red-400",
};

export const STATUS_FILTERS = ["all", "Assigned", "InProgress", "Completed", "Overdue"] as const;