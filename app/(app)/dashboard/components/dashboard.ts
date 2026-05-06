export interface DashboardStats {
  assigned: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  completionRate: number;
  totalHoursSpent: number;
  avgScore: number | null;
}

export interface DayHours {
  day: string;
  hours: number;
}

export interface WeeklyHours {
  thisWeek: DayHours[];
  lastWeek: DayHours[];
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
}

export interface Activity {
  id: string;
  type: "completed" | "started" | "certificate" | "assigned";
  title: string;
  timestamp: string;
}

export interface Todo {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate?: string;
  createdAt?: string;
}

export type ChartKey = "peak" | "category" | "trend";

export const DEFAULT_STATS: DashboardStats = {
  assigned: 0,
  completed: 0,
  inProgress: 0,
  notStarted: 0,
  completionRate: 0,
  totalHoursSpent: 0,
  avgScore: null,
};
