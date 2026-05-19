export interface CourseCategory {
  id: string;
  name: string;
}

export interface CourseProvider {
  id: string;
  name: string;
}

export interface CourseStats {
  assigned: number;
  completed: number;
  inProgress: number;
  pending: number;
  completionRate: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  provider: CourseProvider;
  durationHours: number;
  isActive: boolean;
  createdAt: string;
  stats: CourseStats;
}

export interface CourseAssignment {
  assignmentId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  status: "Assigned" | "InProgress" | "Completed" | "Overdue";
  progressPercentage: number;
  dueDate: string | null;
  startedAt: string | null;
  completedAt: string | null;
  lastAccessedAt: string | null;
}

export interface CourseDetail extends Course {
  assignments: CourseAssignment[];
}