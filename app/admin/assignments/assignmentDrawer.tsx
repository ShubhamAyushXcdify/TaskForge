import { useCallback, useEffect, useMemo, useState } from "react";
import { useApiFetch } from "./apiFetch";
import { Assignment, AssignmentStatus } from "./types";
import { toast } from "sonner";
import { fmtDate, initials2, isOverdue } from "./utils";
import { categoryColor, defaultCatColor, statusBadge, statusDot } from "./colors";
import { mapAssignment } from "./mappers";
import SkeletonRow from "./skeletonRow";
import AssignModal from "./assignModal";
import EditAssignmentModal from "./editAssignmentModal";


export  function AssignmentDrawer({
  assignmentId,
  onClose,
  onEditClick,
}: {
  assignmentId: string;
  onClose: () => void;
  onEditClick: (a: Assignment) => void;
}) {
  const apiFetch = useApiFetch();
  const [data,    setData]    = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiFetch<any>(`/api/admin/assignments/${assignmentId}`)
      .then((res) => setData(mapAssignment(res.data ?? res)))
      .catch((err) => { setError(err.message); toast.error(err.message); })
      .finally(() => setLoading(false));
  }, [assignmentId, apiFetch]);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-[440px] h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col z-10">

        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <p className="text-sm font-semibold text-white">Assignment details</p>
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

              {/* Employee card */}
              <div className="bg-slate-800/40 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-sm font-bold shrink-0">
                    {initials2(data.employeeName)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{data.employeeName}</p>
                    <p className="text-[11px] text-slate-500">{data.employeeCode}</p>
                  </div>
                </div>
                <div className="border-t border-slate-700/50 pt-3">
                  <div className="flex items-start gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-0.5 ${categoryColor[data.courseCategory] ?? defaultCatColor}`}>
                      {data.courseCategory}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-white">{data.courseTitle}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">⏱ {data.courseDurationHours}h</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status + progress */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Status</span>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusBadge[data.status]}`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${statusDot[data.status]}`} />
                    {data.status === "InProgress" ? "In Progress" : data.status}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Progress</span>
                    <span className="font-bold text-white">{data.progressPercentage}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full transition-all"
                      style={{ width: `${data.progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <p className="text-xs font-semibold text-slate-300 mb-3">Timeline</p>
                <div className="space-y-2.5">
                  {[
                    { label: "Due date",      value: fmtDate(data.dueDate),         icon: "📅", warn: isOverdue(data.dueDate, data.status) },
                    { label: "Started",       value: fmtDate(data.startedAt),       icon: "▶️" },
                    { label: "Completed",     value: fmtDate(data.completedAt),     icon: "✅" },
                    { label: "Last accessed", value: fmtDate(data.lastAccessedAt),  icon: "👁" },
                  ].map(({ label, value, icon, warn }) => (
                    <div key={label} className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{icon} {label}</span>
                      <span className={warn ? "text-red-400 font-medium" : "text-slate-300"}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ─── Main Component ───────────────────────────────────────────────────────────

const STATUS_FILTERS = ["all", "Assigned", "InProgress", "Completed", "Overdue"] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

export default function Assignments() {
  const apiFetch = useApiFetch();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("all");
  const [showAssign, setShowAssign] = useState(false);
  const [editItem, setEditItem] = useState<Assignment | null>(null);
  const [drawerItemId, setDrawerItemId] = useState<string | null>(null);

  const fetchAssignments = useCallback(() => {
    setLoading(true);
    setError(null);
    apiFetch<any>("/api/admin/assignments")
      .then((response) => {
        const list = response.assignments ?? response.Data ?? response.data ?? [];
        setAssignments(Array.isArray(list) ? list.map(mapAssignment) : []);
      })
      .catch((err) => {
        setError(err.message);
        toast.error(err.message ?? "Failed to load assignments.");
      })
      .finally(() => setLoading(false));
  }, [apiFetch]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const handleAssigned = useCallback((newOnes: Assignment[]) => setAssignments((p) => [...newOnes, ...p]), []);
  const handleUpdated = useCallback((a: Assignment) => setAssignments((p) => p.map((x) => x.assignmentId === a.assignmentId ? a : x)), []);
  const handleDeleted = useCallback((id: string) => setAssignments((p) => p.filter((x) => x.assignmentId !== id)), []);

  const stats = useMemo(() => ({
    total: assignments.length,
    completed: assignments.filter((a) => a.status === "Completed").length,
    inProgress: assignments.filter((a) => a.status === "InProgress").length,
    overdue: assignments.filter((a) => a.status === "Overdue" || isOverdue(a.dueDate, a.status)).length,
  }), [assignments]);

  const filtered = useMemo(() => {
    return assignments.filter((a) => {
      const q = search.toLowerCase();
      const matchSearch =
        a.employeeName.toLowerCase().includes(q) ||
        a.courseTitle.toLowerCase().includes(q) ||
        a.employeeCode.toLowerCase().includes(q) ||
        a.courseCategory.toLowerCase().includes(q) ||
        a.employeeDepartment.toLowerCase().includes(q);
      const matchStatus = filterStatus === "all" || a.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [assignments, search, filterStatus]);

  return (
    <>
      <div className="space-y-5">


        {/* Stats cards */}
        {!loading && !error && assignments.length > 0 && (
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Total", value: stats.total, color: "text-white", bg: "bg-slate-800/60" },
              { label: "Completed", value: stats.completed, color: "text-teal-400", bg: "bg-teal-900/20" },
              { label: "In Progress", value: stats.inProgress, color: "text-indigo-400", bg: "bg-indigo-900/20" },
              { label: "Overdue", value: stats.overdue, color: "text-red-400", bg: stats.overdue > 0 ? "bg-red-900/20" : "bg-slate-800/60" },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-2xl p-4 border border-slate-800/50`}>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative min-w-[220px] max-w-xs flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee, course, dept…"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 pl-9 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s} onClick={() => setFilterStatus(s)}
                className={`text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  filterStatus === s ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {s !== "all" && <span className={`w-1.5 h-1.5 rounded-full ${statusDot[s as AssignmentStatus]}`} />}
                {s === "all" ? "All" : s === "InProgress" ? "In Progress" : s}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <p className="text-xs text-slate-500">{filtered.length} assignments</p>
            <button
              onClick={() => setShowAssign(true)}
              className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition"
            >
              + Assign course
            </button>
          </div>
        </div>

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-950/30 border border-red-900/50 rounded-2xl p-6 text-center">
            <p className="text-sm text-red-300">{error}</p>
            <button onClick={fetchAssignments} className="mt-3 text-xs text-red-400 underline">Retry</button>
          </div>
        )}

        {/* Table */}
        {!error && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_80px] gap-4 px-4 py-2.5 border-b border-slate-800 bg-slate-800/30">
              {["Employee", "Course", "Status", "Progress", "Due date", ""].map((h) => (
                <p key={h} className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{h}</p>
              ))}
            </div>

            {loading
              ? Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
              : filtered.length === 0
              ? <div className="py-16 text-center text-slate-600 text-sm">{assignments.length === 0 ? "No assignments yet" : "No matches"}</div>
              : filtered.map((a) => {
                  const overdueFlag = isOverdue(a.dueDate, a.status);
                  const effectiveStatus: AssignmentStatus = overdueFlag && a.status !== "Completed" ? "Overdue" : a.status;
                  return (
                    <div
                      key={a.assignmentId}
                      onClick={() => setDrawerItemId(a.assignmentId)}
                      className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_80px] gap-4 items-center px-4 py-3 border-b border-slate-800/50 hover:bg-slate-800/30 transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {initials2(a.employeeName)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate">{a.employeeName}</p>
                          <p className="text-[10px] text-slate-500 truncate">{a.employeeCode}</p>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-white truncate">{a.courseTitle}</p>

                      </div>
                      <div>
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border inline-flex items-center gap-1.5 ${statusBadge[effectiveStatus]}`}>
                          <span className={`w-1 h-1 rounded-full ${statusDot[effectiveStatus]}`} />
                          {effectiveStatus === "InProgress" ? "In Progress" : effectiveStatus}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full" style={{ width: `${a.progressPercentage}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-500 w-7 text-right">{a.progressPercentage}%</span>
                        </div>
                      </div>
                      <div>
                        <span className={`text-xs ${overdueFlag && a.status !== "Completed" ? "text-red-400 font-medium" : "text-slate-500"}`}>
                          {fmtDate(a.dueDate)}
                        </span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditItem(a); }}
                          className="text-[10px] font-semibold text-indigo-300 bg-indigo-900/40 hover:bg-indigo-900/70 px-2.5 py-1 rounded-lg transition"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        )}

        {!loading && !error && <p className="text-xs text-slate-600">{filtered.length} of {assignments.length} shown</p>}
      </div>

      {showAssign && <AssignModal onClose={() => setShowAssign(false)} onAssigned={handleAssigned} />}
      {editItem && (
        <EditAssignmentModal
          assignment={editItem}
          onClose={() => setEditItem(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}
      {drawerItemId && (
        <AssignmentDrawer
          assignmentId={drawerItemId}
          onClose={() => setDrawerItemId(null)}
          onEditClick={(a) => { setDrawerItemId(null); setEditItem(a); }}
        />
      )}
    </>
  );
}