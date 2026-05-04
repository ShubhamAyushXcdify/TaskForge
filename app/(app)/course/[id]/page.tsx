"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

// ─── Types matching GET /api/courses/:id response ───────────────────────────

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  category: string;       // from CourseCategory.Name
  providerName: string;   // from CourseProvider.Name
  durationHours: number;
  isActive: boolean;
  createdAt: string;
}

interface AssignmentDetail {
  assignmentId: string;
  status: "Assigned" | "InProgress" | "Completed" | "Overdue";
  progressPercentage: number;
  dueDate: string;
  startedAt: string;
  completedAt: string | null;
  lastAccessedAt: string | null;
}

interface DocumentDetail {
  id: string;
  fileName: string;
  fileType: "Certificate" | "Report";
  createdAt: string;
}

interface CoursePageData {
  course: CourseDetail;
  assignment: AssignmentDetail | null;
  documents: DocumentDetail[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusStyles: Record<string, string> = {
  Assigned:   "bg-slate-100 text-slate-600",
  InProgress: "bg-teal-100 text-teal-700",
  Completed:  "bg-emerald-100 text-emerald-700",
  Overdue:    "bg-red-100 text-red-600",
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<CoursePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    if (!id || !backendUrl) return;

    async function fetchCourse() {
      try {
        const res = await fetch(`${backendUrl}/api/courses/${id}`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.message || "Failed to load course");
        }
      } catch {
        setError("Failed to load course");
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [id, backendUrl]);

  if (loading)
    return <div className="p-12 text-center text-slate-500">Loading course...</div>;
  if (error || !data)
    return (
      <div className="p-12 text-center text-red-500">
        {error ?? "Course not found"}
      </div>
    );

  const { course, assignment, documents } = data;

  const progress       = assignment?.progressPercentage ?? 0;
  const dueDate        = assignment?.dueDate ?? null;
  const isOverdue      = dueDate ? dueDate < new Date().toISOString() : false;
  const certificateDoc = documents.find((d) => d.fileType === "Certificate") ?? null;
  const otherDocs      = documents.filter((d) => d.fileType !== "Certificate");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/40 pb-16">

      {/* ── Hero banner ────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-teal-300 text-[11px] mb-5">
            <span className="hover:text-white cursor-pointer transition">Courses</span>
            <span>›</span>
            <span className="hover:text-white cursor-pointer transition">{course.category}</span>
            <span>›</span>
            <span className="text-white">{course.title}</span>
          </div>

          <div className="flex items-start justify-between gap-8">
            <div className="flex-1 max-w-2xl">

              {/* Tags */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-medium text-teal-300 bg-teal-700/50 px-2 py-0.5 rounded-full">
                  {course.category}
                </span>
                {assignment && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyles[assignment.status]}`}>
                    {assignment.status}
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold leading-snug mb-2">{course.title}</h1>
              <p className="text-sm text-teal-100 leading-relaxed mb-5">{course.description}</p>

              {/* Meta row */}
              <div className="flex items-center gap-5 text-[11px] text-teal-200 flex-wrap">
                <span className="flex items-center gap-1.5">⏱ {course.durationHours}h total</span>
                <span className="flex items-center gap-1.5">🏫 {course.providerName}</span>
                {assignment?.startedAt && (
                  <span className="flex items-center gap-1.5">
                    📅 Started{" "}
                    {new Date(assignment.startedAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </span>
                )}
                {assignment?.lastAccessedAt && (
                  <span className="flex items-center gap-1.5">
                    🕐 Last accessed{" "}
                    {new Date(assignment.lastAccessedAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>

            {/* Progress card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 w-72 shrink-0 border border-white/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-teal-100">Your progress</span>
                <span className="text-xl font-bold text-white">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-teal-900/50 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-teal-300 to-teal-200 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {assignment?.status === "Completed" ? (
                <button className="w-full bg-yellow-400 text-yellow-900 font-semibold text-sm py-2.5 rounded-xl hover:bg-yellow-300 transition shadow-sm">
                  🏆 {certificateDoc ? "Download Certificate" : "Course Completed"}
                </button>
              ) : (
                <button className="w-full bg-white text-teal-700 font-semibold text-sm py-2.5 rounded-xl hover:bg-teal-50 transition shadow-sm">
                  ▶ {assignment?.status === "Assigned" ? "Start Course" : "Continue Learning"}
                </button>
              )}

              {dueDate && (
                <div className={`mt-3 text-center text-[10px] ${isOverdue ? "text-red-300" : "text-teal-300"}`}>
                  {isOverdue ? "⚠ Overdue · " : "Due "}
                  {new Date(dueDate).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 pt-7">
        <div className="grid grid-cols-3 gap-6">

          {/* ── Left column ─────────────────────────────────────────────────── */}
          <div className="col-span-1 flex flex-col gap-5">

            {/* Course stats */}
            <div className="bg-white rounded-2xl p-4 border border-teal-100 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-3">Course stats</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    label: "Status",
                    value: assignment?.status ?? "—",
                    sub: assignment ? "" : "Not assigned",
                  },
                  {
                    label: "Duration",
                    value: `${course.durationHours}h`,
                    sub: "total length",
                  },
                  {
                    label: "Due date",
                    value: dueDate
                      ? new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      : "—",
                    sub: dueDate ? (isOverdue ? "⚠ overdue" : "on track") : "no deadline",
                  },
                  {
                    label: "Completed on",
                    value: assignment?.completedAt
                      ? new Date(assignment.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      : "—",
                    sub: assignment?.completedAt ? "finished" : "in progress",
                  },
                ].map(({ label, value, sub }) => (
                  <div key={label} className="bg-teal-50 rounded-xl p-2.5">
                    <p className="text-[9px] text-teal-500 font-bold uppercase tracking-wide mb-0.5">{label}</p>
                    <p className="text-sm font-bold text-teal-900 leading-tight">{value}</p>
                    <p className="text-[9px] text-teal-400 mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Provider */}
            <div className="bg-white rounded-2xl p-4 border border-teal-100 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-3">Provider</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {course.providerName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-teal-900">{course.providerName}</p>
                  <p className="text-[10px] text-teal-500">{course.category}</p>
                </div>
              </div>
            </div>

            {/* Certificate */}
            <div className={`rounded-2xl p-4 border shadow-sm ${
              certificateDoc ? "bg-yellow-50 border-yellow-200" : "bg-white border-teal-100"
            }`}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-3">Certificate</p>
              {certificateDoc ? (
                <div className="text-center py-2">
                  <p className="text-2xl mb-1">🏆</p>
                  <p className="text-sm font-semibold text-yellow-800">Earned!</p>
                  <p className="text-[10px] text-yellow-600 mt-0.5 mb-3">
                    {new Date(certificateDoc.createdAt).toLocaleDateString("en-US", {
                      month: "long", day: "numeric", year: "numeric",
                    })}
                  </p>
                  <a
                    href={`${backendUrl}/api/documents/${certificateDoc.id}/download`}
                    className="block w-full text-xs font-semibold text-center text-yellow-700 bg-yellow-100 py-2 rounded-xl hover:bg-yellow-200 transition"
                  >
                    Download Certificate
                  </a>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-lg">🏆</div>
                    <div>
                      <p className="text-xs font-semibold text-teal-900">Complete to earn</p>
                      <p className="text-[10px] text-teal-400">{100 - Math.round(progress)}% remaining</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-teal-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-teal-400 mt-1 text-right">{Math.round(progress)}% complete</p>
                </div>
              )}
            </div>

            {/* Other documents */}
            {otherDocs.length > 0 && (
              <div className="bg-white rounded-2xl p-4 border border-teal-100 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-3">Documents</p>
                <div className="space-y-2">
                  {otherDocs.map((doc) => (
                    <a
                      key={doc.id}
                      href={`${backendUrl}/api/documents/${doc.id}/download`}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-teal-50 transition group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-sm shrink-0">📄</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-teal-900 truncate group-hover:text-teal-700">
                          {doc.fileName}
                        </p>
                        <p className="text-[10px] text-teal-400">{doc.fileType}</p>
                      </div>
                      <span className="text-teal-300 group-hover:text-teal-500 text-sm">↓</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ── Right column ────────────────────────────────────────────────── */}
          <div className="col-span-2 flex flex-col gap-5">

            {/* Progress overview */}
            <div className="bg-white rounded-2xl p-6 border border-teal-100 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-4">Progress overview</p>

              <div className="flex items-center gap-6 mb-6">
                {/* Circle progress */}
                <div className="relative w-24 h-24 shrink-0">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="40" fill="none" stroke="#f0fdfa" strokeWidth="10" />
                    <circle
                      cx="48" cy="48" r="40"
                      fill="none"
                      stroke="#14b8a6"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-teal-900">{Math.round(progress)}%</span>
                    <span className="text-[9px] text-teal-400">complete</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500 font-medium">Overall progress</span>
                      <span className="font-semibold text-teal-700">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="text-xs text-slate-500">
                      <span className="block font-semibold text-slate-800 text-sm">{course.durationHours}h</span>
                      Total duration
                    </div>
                    <div className="text-xs text-slate-500">
                      <span className={`block font-semibold text-sm ${isOverdue ? "text-red-600" : "text-slate-800"}`}>
                        {dueDate
                          ? new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "No deadline"}
                      </span>
                      Due date
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignment timeline */}
              <div className="border-t border-teal-50 pt-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-4">Assignment timeline</p>
                <div className="relative">
                  <div className="absolute left-3.5 top-0 bottom-0 w-px bg-teal-100" />
                  <div className="space-y-5">
                    {[
                      {
                        label: "Assigned",
                        date: assignment?.startedAt ?? null,
                        done: !!assignment,
                        icon: "📋",
                      },
                      {
                        label: "Started",
                        date: assignment?.startedAt ?? null,
                        done: !!assignment?.startedAt,
                        icon: "🚀",
                      },
                      {
                        label: "In Progress",
                        date: assignment?.lastAccessedAt ?? null,
                        done: (assignment?.progressPercentage ?? 0) > 0,
                        icon: "📖",
                      },
                      {
                        label: "Completed",
                        date: assignment?.completedAt ?? null,
                        done: !!assignment?.completedAt,
                        icon: "✅",
                      },
                    ].map(({ label, date, done, icon }) => (
                      <div key={label} className="flex items-start gap-4 relative">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 z-10 ${
                          done ? "bg-teal-600 text-white" : "bg-white border-2 border-teal-200 text-teal-300"
                        }`}>
                          {done ? "✓" : icon}
                        </div>
                        <div className="pt-0.5">
                          <p className={`text-xs font-semibold ${done ? "text-teal-900" : "text-slate-400"}`}>
                            {label}
                          </p>
                          {date && (
                            <p className="text-[10px] text-teal-400 mt-0.5">
                              {new Date(date).toLocaleDateString("en-US", {
                                month: "short", day: "numeric", year: "numeric",
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* About this course */}
            <div className="bg-white rounded-2xl p-6 border border-teal-100 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-3">About this course</p>
              <p className="text-sm text-slate-600 leading-relaxed">{course.description}</p>

              <div className="mt-5 flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">⏱</span>
                  {course.durationHours} hours
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">🏫</span>
                  {course.providerName}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">📂</span>
                  {course.category}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}