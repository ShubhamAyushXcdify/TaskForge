import { useCallback, useState } from "react";
import { useApiFetch } from "./apiFetch";
import { Assignment, AssignmentStatus } from "./types";
import { toast } from "sonner";
import { fmtDate, initials2 } from "./utils";
import { statusDot } from "./colors";

export default function EditAssignmentModal({
  assignment,
  onClose,
  onUpdated,
  onDeleted,
}: {
  assignment: Assignment;
  onClose: () => void;
  onUpdated: (a: Assignment) => void;
  onDeleted: (id: string) => void;
}) {
  const apiFetch = useApiFetch();

  const [progress,          setProgress]          = useState(String(assignment.progressPercentage));
  const [status,            setStatus]            = useState<AssignmentStatus>(assignment.status);
  const [loading,           setLoading]           = useState(false);
  const [deleteLoading,     setDeleteLoading]     = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  

  const handleSave = useCallback(async () => {
    const prog = parseInt(progress, 10);
    if (isNaN(prog) || prog < 0 || prog > 100) { toast.error("Progress must be 0–100"); return; }
    setLoading(true);
    try {
      await apiFetch(`/api/admin/assignments/${assignment.assignmentId}`, {
        method: "PATCH",
        body: JSON.stringify({
          ProgressPercentage: prog,
          Status:             status,
          LastAccessedAt:     new Date().toISOString(),
          
        }),
        
      });
      
      toast.success("Assignment updated!");
      onUpdated({ ...assignment, progressPercentage: prog, status });
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to update.");
    } finally {
      setLoading(false);
    }
  }, [progress, status, assignment, apiFetch, onUpdated, onClose]);

  const handleDelete = useCallback(async () => {
    setDeleteLoading(true);
    try {
      await apiFetch(`/api/admin/assignments/${assignment.assignmentId}`, { method: "DELETE" });
      toast.success("Assignment removed.");
      onDeleted(assignment.assignmentId);
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to delete.");
    } finally {
      setDeleteLoading(false);
    }
  }, [assignment, apiFetch, onDeleted, onClose]);

  const statusOptions: AssignmentStatus[] = ["Assigned", "InProgress", "Completed", "Overdue"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md z-10 flex flex-col max-h-[90vh]">

        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-white">Edit assignment</h3>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[280px]">
              {assignment.employeeName} · {assignment.courseTitle}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl leading-none transition">×</button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Employee & course info */}
          <div className="bg-slate-800/40 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0">
                {initials2(assignment.employeeName)}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{assignment.employeeName}</p>
                <p className="text-[11px] text-slate-500">{assignment.employeeCode} </p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-700/50">
              <p className="text-xs font-medium text-slate-300">{assignment.courseTitle}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {assignment.courseCategory}
              </p>
            </div>
            {assignment.dueDate && (
              <p className="text-[10px] text-slate-600">Due: {fmtDate(assignment.dueDate)}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`text-xs py-2.5 px-3 rounded-xl font-semibold transition flex items-center gap-2
                    ${status === s
                      ? s === "Completed"  ? "bg-teal-700/60 text-teal-300 border border-teal-700"
                      : s === "InProgress" ? "bg-indigo-700/60 text-indigo-300 border border-indigo-700"
                      : s === "Overdue"    ? "bg-red-700/60 text-red-300 border border-red-700"
                      : "bg-slate-600 text-white border border-slate-500"
                      : "bg-slate-800 text-slate-500 hover:text-white border border-transparent"
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot[s]}`} />
                  {s === "InProgress" ? "In Progress" : s}
                </button>
              ))}
            </div>
          </div>

      
          {showDeleteConfirm && (
            <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-4 space-y-3">
              <p className="text-xs text-red-300">
                Remove this assignment? <span className="font-semibold">{assignment.employeeName}</span>'s progress will be lost.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete} disabled={deleteLoading}
                  className="flex-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 py-2 rounded-lg transition flex items-center justify-center gap-1.5"
                >
                  {deleteLoading && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {deleteLoading ? "Removing…" : "Yes, remove"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 space-y-2 shrink-0">
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl transition">
              Cancel
            </button>
            <button
              onClick={handleSave} disabled={loading}
              className="flex-1 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 py-2.5 rounded-xl transition flex items-center justify-center gap-2"
            >
              {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? "Saving…" : "Save changes"}
            </button>
          </div>
          {!showDeleteConfirm && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/40 py-2 rounded-xl transition"
            >
              Remove assignment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}