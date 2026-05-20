"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useApiFetch } from "./api";
import { Course, CourseCategory, CourseProvider } from "./types";


export default function AddCourseModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (course: Course) => void;
}) {
  const apiFetch = useApiFetch();

  const [form, setForm] = useState({
    title:        "",
    description:  "",
    categoryId:   "",
    providerId:   "",
    durationHours: "",
    isActive:     true,
    courseUrl: "",
  });

  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [providers,  setProviders]  = useState<CourseProvider[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [errors,     setErrors]     = useState<Partial<Record<keyof typeof form, string>>>({});

  // Fetch categories and providers on mount
  useEffect(() => {
    apiFetch<any>("/api/CourseCategory")
      .then((res) => {
        const list = res.Data ?? res.data ?? res ?? [];
        setCategories(
          (Array.isArray(list) ? list : []).map((c: any) => ({
            id:   c.Id   ?? c.id,
            name: c.Name ?? c.name,
          }))
        );
      })
      .catch(() => toast.error("Could not load categories."));

    apiFetch<any>("/api/CourseProvider")
      .then((res) => {
        const list = res.Data ?? res.data ?? res ?? [];
        setProviders(
          (Array.isArray(list) ? list : []).map((p: any) => ({
            id:   p.Id   ?? p.id,
            name: p.Name ?? p.name,
          }))
        );
      })
      .catch(() => toast.error("Could not load providers."));
  }, [apiFetch]);

  const setStr = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
      setErrors((er) => ({ ...er, [k]: "" }));
    };

  const validate = () => {
    const e: Partial<Record<keyof typeof form, string>> = {};
    if (!form.title.trim())  e.title = "Required";
    if (!form.categoryId) e.categoryId = "Category is required";
    if (!form.providerId) e.providerId = "Provider is required";
    if (!form.durationHours) e.durationHours = "Required";
    else if (isNaN(Number(form.durationHours)) || Number(form.durationHours) < 1)
      e.durationHours = "Must be a positive number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const raw = await apiFetch<any>("/api/admin/courses", {
  method: "POST",
body: JSON.stringify({
  title: form.title,
  description: form.description,
  categoryId: form.categoryId || null,
  providerId: form.providerId || null,
  durationHours: parseInt(form.durationHours, 10),
  isActive: form.isActive,
  courseUrl: form.courseUrl,
}),
});

      const selectedCat = categories.find((c) => c.id === form.categoryId);
      const selectedPro = providers.find((p)  => p.id === form.providerId);

      toast.success(`"${form.title}" created!`);
      onCreated({
        id:            raw.Id ?? raw.id ?? "",
        title:         raw.Title ?? raw.title ?? form.title,
        description:   form.description,
        category:      { id: form.categoryId, name: selectedCat?.name ?? "—" },
        provider:      { id: form.providerId,  name: selectedPro?.name ?? "—" },
        durationHours: parseInt(form.durationHours, 10),
        isActive:      form.isActive,
        createdAt:     raw.CreatedAt ?? raw.createdAt ?? new Date().toISOString(),
        stats:         { assigned: 0, completed: 0, inProgress: 0, pending: 0, completionRate: 0 },
      });
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to create course.");
    } finally {
      setLoading(false);
    }
  }, [form, categories, providers, apiFetch, onCreated, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md z-10 flex flex-col max-h-[90vh]">

        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-white">Add new course</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Can be assigned to employees after creation</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl leading-none transition">×</button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              value={form.title} onChange={setStr("title")}
              placeholder="e.g. React Advanced Patterns"
              className={`w-full bg-slate-800 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition
                ${errors.title ? "border-red-500" : "border-slate-700 focus:border-indigo-500"}`}
            />
            {errors.title && <p className="text-[10px] text-red-400 mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Description</label>
            <textarea
              value={form.description} onChange={setStr("description")} rows={3}
              placeholder="Brief overview of the course…"
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none resize-none transition"
            />
          </div>
          <div>
  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
    Course URL
  </label>

  <input
    value={form.courseUrl}
    onChange={setStr("courseUrl")}
    placeholder="https://..."
    className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition"
  />
</div>

          {/* Duration + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                Duration (hours) <span className="text-red-400">*</span>
              </label>
              <input
                type="number" min={1} value={form.durationHours} onChange={setStr("durationHours")}
                placeholder="12"
                className={`w-full bg-slate-800 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition
                  ${errors.durationHours ? "border-red-500" : "border-slate-700 focus:border-indigo-500"}`}
              />
              {errors.durationHours && <p className="text-[10px] text-red-400 mt-1">{errors.durationHours}</p>}
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

          {/* Category dropdown */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Category</label>
            <select
              value={form.categoryId} onChange={setStr("categoryId")}
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition appearance-none"
            >
              <option value="">Select category (optional)</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Provider dropdown */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Provider</label>
            <select
              value={form.providerId} onChange={setStr("providerId")}
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition appearance-none"
            >
              <option value="">Select provider (optional)</option>
              {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl transition">
            Cancel
          </button>
          <button
            onClick={handleSubmit} disabled={loading}
            className="flex-1 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed py-2.5 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {loading ? "Creating…" : "Create course"}
          </button>
        </div>
      </div>
    </div>
  );
}