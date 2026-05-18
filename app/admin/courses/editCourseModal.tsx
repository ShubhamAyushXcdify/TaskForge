"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useApiFetch } from "./api";
import { Course } from "./types";


export default 
function EditCourseModal({
  course,
  onClose,
  onUpdated,
  onDeleted,
}: {
  course: Course;
  onClose: () => void;
  onUpdated: (course: Course) => void;
  onDeleted: (id: string) => void;
}) {
  const apiFetch = useApiFetch();

  const [form, setForm] = useState({
    title:         course.title,
    description:   course.description,
    durationHours: String(course.durationHours),
    isActive:      course.isActive,
  });
  const [loading,           setLoading]           = useState(false);
  const [deleteLoading,     setDeleteLoading]     = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const setStr = (k: "title" | "description" | "durationHours") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = useCallback(async () => {
    if (!form.title.trim()) { toast.error("Title is required."); return; }
    setLoading(true);
    try {
      const payload: Record<string, any> = {};
      if (form.title !== course.title)                                payload.title         = form.title;
      if (form.description !== course.description)                    payload.description   = form.description;
      if (parseInt(form.durationHours, 10) !== course.durationHours) payload.durationHours = parseInt(form.durationHours, 10);
      if (form.isActive !== course.isActive)                          payload.isActive      = form.isActive;

      if (Object.keys(payload).length === 0) { toast("No changes to save."); onClose(); return; }

      await apiFetch(`/api/admin/courses/${course.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      toast.success("Course updated!");
      onUpdated({ ...course, ...payload });
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to update course.");
    } finally {
      setLoading(false);
    }
  }, [form, course, apiFetch, onUpdated, onClose]);

  const handleDelete = useCallback(async () => {
    setDeleteLoading(true);
    try {
      await apiFetch(`/api/admin/courses/${course.id}`, { method: "DELETE" });
      toast.success(`"${course.title}" deleted.`);
      onDeleted(course.id);
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to delete.");
    } finally {
      setDeleteLoading(false);
    }
  }, [course, apiFetch, onDeleted, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md z-10 flex flex-col max-h-[90vh]">

        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-white">Edit course</h3>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[280px]">{course.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl leading-none transition">×</button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              value={form.title} onChange={setStr("title")}
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Description</label>
            <textarea
              value={form.description} onChange={setStr("description")} rows={3}
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none resize-none transition"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Duration (hours)</label>
              <input
                type="number" min={1} value={form.durationHours} onChange={setStr("durationHours")}
                className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Status</label>
              <div className="flex gap-2 mt-0.5">
                {([true, false] as const).map((v) => (
                  <button
                    key={String(v)}
                    onClick={() => setForm((f) => ({ ...f, isActive: v }))}
                    className={`flex-1 text-xs py-2.5 rounded-xl font-semibold transition ${
                      form.isActive === v
                        ? v ? "bg-emerald-700 text-white" : "bg-slate-700 text-white"
                        : "bg-slate-800 text-slate-500 hover:text-white"
                    }`}
                  >
                    {v ? "Active" : "Inactive"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {showDeleteConfirm && (
            <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-4 space-y-3">
              <p className="text-xs text-red-300">
                Permanently delete <span className="font-semibold">"{course.title}"</span>? This cannot be undone.
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
                  {deleteLoading ? "Deleting…" : "Yes, delete"}
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
              Delete this course
            </button>
          )}
        </div>
      </div>
    </div>
  );
}