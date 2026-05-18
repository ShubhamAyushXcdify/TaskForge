import { Assignment, AssignmentStatus } from './types';
import { categoryColor, defaultCatColor } from './colors';

export function initials2(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { 
    month: "short", 
    day: "numeric", 
    year: "numeric" 
  });
}

export function isOverdue(dueDate: string | null, status: AssignmentStatus): boolean {
  if (!dueDate || status === "Completed") return false;
  return new Date(dueDate) < new Date();
}

export function getCategoryColor(category: string): string {
  return categoryColor[category] ?? defaultCatColor;
}