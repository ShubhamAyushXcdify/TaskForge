import { Assignment, Employee, CourseOption } from './types';

export function mapAssignment(raw: any): Assignment {
  return {
    assignmentId: raw.assignmentId ?? raw.AssignmentId ?? "",
    courseId: raw.courseId ?? raw.course?.Id ?? raw.CourseId ?? "",
    courseTitle: raw.courseTitle ?? raw.course?.Title ?? raw.CourseTitle ?? "—",
    courseCategory: raw.courseCategory ?? raw.course?.Category ?? raw.CourseCategory ?? "—",
    courseDurationHours: Number(raw.courseDurationHours ?? raw.course?.DurationHours ?? raw.CourseDurationHours ?? 0),
    employeeId: raw.employeeId ?? raw.employee?.Id ?? raw.EmployeeId ?? "",
    employeeName: raw.employeeName ?? raw.EmployeeName ??
      (raw.employee?.FirstName && raw.employee?.LastName
        ? `${raw.employee.FirstName} ${raw.employee.LastName}`
        : raw.employee?.Name ?? "—"),
    employeeCode: raw.employeeCode ?? raw.employee?.EmployeeCode ?? raw.EmployeeCode ?? "",
    employeeDepartment: raw.employeeDepartment ?? raw.employee?.Department ?? raw.EmployeeDepartment ?? "—",
    status: raw.status ?? raw.Status ?? "Assigned",
    progressPercentage: Number(raw.progressPercentage ?? raw.ProgressPercentage ?? 0),
    dueDate: raw.dueDate ?? raw.DueDate ?? null,
    startedAt: raw.startedAt ?? raw.StartedAt ?? null,
    completedAt: raw.completedAt ?? raw.CompletedAt ?? null,
    lastAccessedAt: raw.lastAccessedAt ?? raw.LastAccessedAt ?? null,
  };
}

export function mapEmployee(raw: any): Employee {
  return {
    id: String(
      raw.Id ??
      raw.id ??
      ""
    ),

    name: String(
      (raw.FirstName || raw.firstName) &&
      (raw.LastName || raw.lastName)
        ? `${raw.FirstName ?? raw.firstName} ${raw.LastName ?? raw.lastName}`
        : raw.FirstName ??
          raw.firstName ??
          raw.LastName ??
          raw.lastName ??
          raw.Name ??
          raw.name ??
          raw.FullName ??
          raw.fullName ??
          "Unknown"
    ),

    code: String(
      raw.EmployeeCode ??
      raw.employeeCode ??
      raw.Code ??
      raw.code ??
      ""
    ),

    department: String(
      raw.Department ??
      raw.department ??
      ""
    ),
  };
}
export function mapCourse(raw: any): CourseOption {
  return {
    id: String(raw.Id ?? raw.id ?? raw.CourseId ?? ""),
    title: String(raw.Title ?? raw.title ?? raw.CourseTitle ?? "Unknown"),
    category: String(raw.Category?.Name ?? raw.category?.name ?? raw.CourseCategory ?? "General"),
    durationHours: Number(raw.DurationHours ?? raw.durationHours ?? raw.CourseDurationHours ?? 0),
  };
}