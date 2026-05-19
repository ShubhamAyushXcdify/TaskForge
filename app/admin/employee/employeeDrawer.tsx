import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useApiFetch } from "./api";
import { Employee,EmployeeDetail} from "./type";
import {initials,fmtDate, statusCfg,assignBadge,} from "./utils";
// import { EditProfileModal } from "./editEmployeeModal";
import { EditProfileModal } from "@/components/EditProfile";

export default function EmployeeDrawer({
  employeeId,
  onClose,
  onStatusChange,
  onEmployeeUpdated, 
}: {
  employeeId: string;
  onClose: () => void;
  onStatusChange: (id: string, status: Employee["employmentStatus"]) => void;
  onEmployeeUpdated: (updated: Partial<Employee> & { id: string }) => void;
}) {
  const apiFetch = useApiFetch();
  const [data, setData]                     = useState<EmployeeDetail | null>(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [statusLoading, setStatusLoading]   = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showEdit, setShowEdit]             = useState(false); // ← new

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiFetch<any>(`/api/admin/employees/${employeeId}`)
      .then((res) => {
  const d = res.data ?? res;

  setData({
    id:               d.id,
    userId:           d.userId,
    employeeCode:     d.employeeCode,
    firstName:        d.firstName,
    lastName:         d.lastName,
    email:            d.email,

 role: d.role
  ? {
      id: d.role.id ?? "",
      name: d.role.name ?? "Employee",
    }
  : {
      id: "",
      name: "Employee",
    },
    managerId:   d.managerId ?? null,
    managerName:
      d.managerName && d.managerName !== "N/A"
        ? d.managerName
        : null,

    employmentStatus: d.employmentStatus,
    isActive:         d.isActive,
    createdAt:        d.createdAt,

    stats: {
      assigned:   d.stats?.assigned   ?? 0,
      completed:  d.stats?.completed  ?? 0,
      inProgress: d.stats?.inProgress ?? 0,
      pending:    d.stats?.pending    ?? 0,
      overdue:    d.stats?.overdue    ?? 0,
    },

    assignments: (d.assignments ?? []).map((a: any) => ({
      assignmentId:       a.assignmentId,
      courseId:           a.courseId ?? "",
      courseTitle:        a.courseTitle,
      category:           a.category,
      durationHours:      a.durationHours,
      status:             a.status,
      progressPercentage: a.progressPercentage,
      dueDate:            a.dueDate ?? null,
      startedAt:          a.startedAt ?? null,
      completedAt:        a.completedAt ?? null,
      lastAccessedAt:     a.lastAccessedAt ?? null,
    })),
  });
})
      .catch((err) => {
        setError(err.message);
        toast.error(err.message ?? "Failed to load.");
      })
      .finally(() => setLoading(false));
  }, [employeeId, apiFetch]);

  const handleDeactivate = useCallback(async () => {
    if (!data) return;
    setStatusLoading(true);
    try {
      await apiFetch(`/api/admin/employees/${employeeId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ employmentStatus: "Inactive", isActive: false }),
      });
      toast.success(`${data.firstName} deactivated.`);
      onStatusChange(employeeId, "Inactive");
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to update status.");
    } finally {
      setStatusLoading(false);
    }
  }, [data, employeeId, onStatusChange, onClose, apiFetch]);

  const handleActivate = useCallback(async () => {
    if (!data) return;
    setStatusLoading(true);
    try {
      await apiFetch(`/api/admin/employees/${employeeId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ employmentStatus: "Active", isActive: true }),
      });
      toast.success(`${data.firstName} activated.`);
      onStatusChange(employeeId, "Active");
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to update status.");
    } finally {
      setStatusLoading(false);
    }
  }, [data, employeeId, onStatusChange, onClose, apiFetch]);

  // ── Called by EditProfileModal on success ───────────────────────────────────
  const handleEditUpdated = useCallback(
    (updated: { id: string; firstName: string; lastName: string; email: string; employeeCode: string; role: { id: string; name: string } }) => {
      // Update local drawer state so it reflects immediately without refetch
      setData((prev) =>
        prev
          ? {
              ...prev,
              firstName:    updated.firstName,
              lastName:     updated.lastName,
              email:        updated.email,
              employeeCode: updated.employeeCode,
              role:         updated.role,
            }
          : prev
      );
      // Also bubble up to the table list
      onEmployeeUpdated(updated);
    },
    [onEmployeeUpdated]
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative ml-auto w-full max-w-[520px] h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col z-10">

          {/* Header — now with Edit button */}
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
            <p className="text-sm font-semibold text-white">Employee details</p>
            <div className="flex items-center gap-2">
              {data && !loading && (
                <button
                  onClick={() => setShowEdit(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium px-3 py-1.5 bg-indigo-900/30 hover:bg-indigo-900/50 rounded-lg transition"
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

                {/* Profile */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-lg font-bold shrink-0">
                    {initials(data.firstName, data.lastName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-white">{data.firstName} {data.lastName}</h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusCfg[data.employmentStatus]?.badge}`}>
                        {data.employmentStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{data.email}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap text-[11px] text-slate-500">
                      <span className="bg-slate-800 px-2 py-0.5 rounded-md">{data.employeeCode}</span>
                      {data.role?.name && <span>{data.role.name}</span>}
                      {data.managerName && (
                        <span>Reports to <span className="text-slate-300">{data.managerName}</span></span>
                      )}
                      <span>Joined {fmtDate(data.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { label: "Assigned",  value: data.stats.assigned,   color: "text-white"      },
                    { label: "Done",      value: data.stats.completed,  color: "text-teal-400"   },
                    { label: "Active",    value: data.stats.inProgress, color: "text-indigo-400" },
                    { label: "Pending",   value: data.stats.pending,    color: "text-slate-400"  },
                    { label: "Overdue",   value: data.stats.overdue,    color: data.stats.overdue > 0 ? "text-red-400" : "text-slate-600" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-slate-800/60 rounded-xl p-3 text-center">
                      <p className={`text-xl font-bold ${color}`}>{value}</p>
                      <p className="text-[9px] text-slate-600 mt-0.5 uppercase tracking-wide">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Overall progress bar */}
                {data.stats.assigned > 0 && (
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400">Overall completion</span>
                      <span className="font-bold text-white">
                        {Math.round((data.stats.completed / data.stats.assigned) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full"
                        style={{ width: `${Math.round((data.stats.completed / data.stats.assigned) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Assignments */}
                <div>
                  <p className="text-xs font-semibold text-slate-300 mb-3">
                    Assigned courses
                    <span className="text-slate-600 font-normal ml-1.5">({data.assignments.length})</span>
                  </p>
                  {data.assignments.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl">
                      <p className="text-sm text-slate-600">No courses assigned yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {data.assignments.map((a) => (
                        <div key={a.assignmentId} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white leading-snug">{a.courseTitle}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{a.category} · {a.durationHours}h</p>
                            </div>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${assignBadge[a.status] ?? "bg-slate-800 text-slate-400"}`}>
                              {a.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full" style={{ width: `${a.progressPercentage}%` }} />
                            </div>
                            <span className="text-[10px] text-slate-500 w-8 text-right">{a.progressPercentage}%</span>
                          </div>
                          <div className="flex gap-3 text-[10px] text-slate-600 flex-wrap">
                            {a.dueDate        && <span>Due {fmtDate(a.dueDate)}</span>}
                            {a.lastAccessedAt && <span>Last active {fmtDate(a.lastAccessedAt)}</span>}
                            {a.completedAt    && <span className="text-teal-600">✓ Completed {fmtDate(a.completedAt)}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status actions */}
                {data.employmentStatus === "Active" && (
                  <div className="pt-2 border-t border-slate-800">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-3">Danger zone</p>
                    {!showDeactivate ? (
                      <button
                        onClick={() => setShowDeactivate(true)}
                        className="text-xs font-semibold text-red-400 border border-red-900/60 hover:bg-red-950/40 px-4 py-2 rounded-xl transition"
                      >
                        Deactivate employee
                      </button>
                    ) : (
                      <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-4 space-y-3">
                        <p className="text-xs text-red-300">
                          This will immediately revoke <span className="font-semibold">{data.firstName}</span>'s access. Are you sure?
                        </p>
                        <div className="flex gap-2">
                          <button onClick={() => setShowDeactivate(false)}
                            className="flex-1 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 py-2 rounded-lg transition">
                            Cancel
                          </button>
                          <button onClick={handleDeactivate} disabled={statusLoading}
                            className="flex-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 py-2 rounded-lg transition flex items-center justify-center gap-1.5">
                            {statusLoading && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            {statusLoading ? "Deactivating…" : "Yes, deactivate"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {data.employmentStatus === "Inactive" && (
                  <div className="pt-2 border-t border-slate-800">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-3">Account actions</p>
                    <button onClick={handleActivate} disabled={statusLoading}
                      className="text-xs font-semibold text-emerald-400 border border-emerald-900/60 hover:bg-emerald-950/40 px-4 py-2 rounded-xl transition flex items-center justify-center gap-1.5">
                      {statusLoading && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      {statusLoading ? "Activating…" : "Activate employee"}
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit modal — renders on top of the drawer (z-[60]) */}
      {showEdit && data && (
        <EditProfileModal
          mode="admin"
          employee={{
            id:               data.id,
            userId:           data.userId,
            firstName:        data.firstName,
            lastName:         data.lastName,
            email:            data.email,
            employeeCode:     data.employeeCode,
            role:             data.role,
            employmentStatus: data.employmentStatus,
          }}
          onClose={() => setShowEdit(false)}
          onUpdated={handleEditUpdated}
        />
      )}
    </>
  );
}
