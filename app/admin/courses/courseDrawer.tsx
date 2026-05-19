import { useEffect, useState } from "react";
import { Course, CourseAssignment, CourseDetail } from "./types";
import { assignBadge, categoryColor, defaultCatColor, fmtDate, initials2 } from "./utils";
import { mapCourse, useApiFetch } from "./api";
import { toast } from "sonner";

export default function CourseDrawer({
  courseId,
  onClose,
  onEditClick,
}: {
  courseId: string;
  onClose: () => void;
  onEditClick: (course: Course) => void;
}) {
  const apiFetch = useApiFetch();
  const [data,    setData]    = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiFetch<any>(`/api/admin/courses/${courseId}`)
      .then((res) => {
        const raw = res.data ?? res;
        const course = mapCourse(raw);
        const assignments: CourseAssignment[] = (raw.Assignments ?? raw.assignments ?? []).map((a: any) => ({
          assignmentId:       a.AssignmentId       ?? a.assignmentId       ?? "",
          employeeId:         a.EmployeeId         ?? a.employeeId         ?? "",
          employeeName:       a.EmployeeName       ?? a.employeeName       ?? "",
          employeeCode:       a.EmployeeCode       ?? a.employeeCode       ?? "",
          status:             a.Status             ?? a.status             ?? "Assigned",
          progressPercentage: a.ProgressPercentage ?? a.progressPercentage ?? 0,
          dueDate:            a.DueDate            ?? a.dueDate            ?? null,
          startedAt:          a.StartedAt          ?? a.startedAt          ?? null,
          completedAt:        a.CompletedAt        ?? a.completedAt        ?? null,
          lastAccessedAt:     a.LastAccessedAt     ?? a.lastAccessedAt     ?? null,
        }));
        setData({ ...course, assignments });
      })
      .catch((err) => {
        setError(err.message);
        toast.error(err.message ?? "Failed to load course.");
      })
      .finally(() => setLoading(false));
  }, [courseId, apiFetch]);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-[520px] h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col z-10">

        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <p className="text-sm font-semibold text-white">Course details</p>
          <div className="flex items-center gap-2">
            {data && (
              <button
                onClick={() => { onClose(); onEditClick(data); }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium px-3 py-1.5 bg-indigo-900/30 rounded-lg transition"
              >
                Edit
              </button>
            )}
            <button onClick={onClose} className="text-slate-500 hover:text-white text-xl leading-none transition">×</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center h-48">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {error && !loading && (
            <div className="p-6 text-center text-sm text-slate-500">{error}</div>
          )}
          {data && !loading && (
            <div className="p-6 space-y-6">

              {/* Header */}
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${categoryColor[data.category.name] ?? defaultCatColor}`}>
                    {data.category.name}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    data.isActive ? "bg-emerald-900/40 text-emerald-400" : "bg-slate-800 text-slate-500"
                  }`}>
                    {data.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white leading-snug">{data.title}</h3>
                {data.description && <p className="text-xs text-slate-400 mt-2 leading-relaxed">{data.description}</p>}
                <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-500">
                  <span>⏱ {data.durationHours}h</span>
                  <span>📦 {data.provider.name}</span>
                  <span>🗓 {fmtDate(data.createdAt)}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Assigned",    value: data.stats.assigned,   color: "text-white"      },
                  { label: "Completed",   value: data.stats.completed,  color: "text-teal-400"   },
                  { label: "In Progress", value: data.stats.inProgress, color: "text-indigo-400" },
                  { label: "Pending",     value: data.stats.pending,    color: "text-slate-400"  },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-slate-800/60 rounded-xl p-3 text-center">
                    <p className={`text-xl font-bold ${color}`}>{value}</p>
                    <p className="text-[9px] text-slate-600 mt-0.5 uppercase tracking-wide">{label}</p>
                  </div>
                ))}
              </div>

              {/* Completion bar */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Completion rate</span>
                  <span className="font-bold text-white">{data.stats.completionRate.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full"
                    style={{ width: `${data.stats.completionRate}%` }}
                  />
                </div>
              </div>

              {/* Assigned employees */}
              <div>
                <p className="text-xs font-semibold text-slate-300 mb-3">
                  Assigned employees
                  <span className="text-slate-600 font-normal ml-1.5">({data.assignments.length})</span>
                </p>
                {data.assignments.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl">
                    <p className="text-sm text-slate-600">No employees assigned yet</p>
                    <p className="text-xs text-slate-700 mt-1">Use the Assignments page to assign employees</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {data.assignments.map((a) => (
                      <div key={a.assignmentId} className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {initials2(a.employeeName)}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-white">{a.employeeName}</p>
                              <p className="text-[9px] text-slate-600">{a.employeeCode}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${assignBadge[a.status] ?? "bg-slate-800 text-slate-400"}`}>
                            {a.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full"
                              style={{ width: `${a.progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 w-8 text-right">{a.progressPercentage}%</span>
                        </div>
                        {a.dueDate && (
                          <p className="text-[10px] text-slate-600 mt-1.5">Due {fmtDate(a.dueDate)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}