export interface Employee {
  id: string;
  name: string;
  code: string;
  department?: string;
}

export interface CourseOption {
  id: string;
  title: string;
  category: string;
  durationHours: number;
}

export type AssignmentStatus = "Assigned" | "InProgress" | "Completed" | "Overdue";

export interface Assignment {
  assignmentId: string;
  courseId: string;
  courseTitle: string;
  courseCategory: string;
  courseDurationHours: number;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  employeeDepartment: string;
  status: AssignmentStatus;
  progressPercentage: number;
  dueDate: string | null;
  startedAt: string | null;
  completedAt: string | null;
  lastAccessedAt: string | null;
}

export type StatusFilter = "all" | AssignmentStatus;