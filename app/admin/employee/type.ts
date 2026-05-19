export interface EmployeeStats {
  assigned: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
}

export interface Employee {
  id: string;
  userId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  role: {
    id: string;
    name: string;
  };
  managerId: string | null;
  managerName: string | null;
  employmentStatus: "Active" | "Inactive" | "Resigned";
  isActive: boolean;
  createdAt: string;
  stats: EmployeeStats;
}

export interface Assignment {
  assignmentId: string;
  courseId: string;
  courseTitle: string;
  category: string;
  durationHours: number;
  status:
    | "Assigned"
    | "InProgress"
    | "Completed"
    | "Overdue"
    | "In Progress"
    | "Not Started";
  progressPercentage: number;
  dueDate: string | null;
  startedAt: string | null;
  completedAt: string | null;
  lastAccessedAt: string | null;
}

export interface EmployeeDetail extends Employee {
  assignments: Assignment[];
}

export interface Role {
  id: string;
  name: string;
}