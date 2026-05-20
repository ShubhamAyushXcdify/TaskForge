"use client";

import { Category, EmailTemplate, Provider } from "./types";

export function mapCategory(raw: any): Category {
  return {
    id: raw.id ?? raw.Id ?? "",
    name: raw.name ?? raw.Name ?? "—",
    description: raw.description ?? raw.Description ?? "",
    courseCount:
      raw.courseCount ??
      raw.CourseCount ??
      raw.totalCourses ??
      raw.TotalCourses ??
      0,
  };
}

export function mapProvider(raw: any): Provider {
  return {
    id: raw.id ?? raw.Id ?? "",
    name: raw.name ?? raw.Name ?? "—",
    website: raw.website ?? raw.Website ?? "",
    courseCount:
      raw.courseCount ??
      raw.CourseCount ??
      raw.totalCourses ??
      raw.TotalCourses ??
      0,
  };
}

export function mapEmailTemplate(raw: any): EmailTemplate {
  return {
    id: raw.id ?? raw.Id ?? "",
    name: raw.name ?? raw.Name ?? "—",
    subject: raw.subject ?? raw.Subject ?? "",
    body: raw.body ?? raw.Body ?? "",
    description: raw.description ?? raw.Description ?? "",
    isActive: raw.isActive ?? raw.IsActive ?? true,
  };
}