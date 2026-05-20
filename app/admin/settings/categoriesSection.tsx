"use client";

import { useCallback, useEffect, useState } from "react";
import { useApiFetch } from "./api";
import { Category } from "./types";
import { mapCategory } from "./mappers";
import { toast } from "sonner";
import ConfirmDeleteModal from "./confirmDeleteModal";

export default function CategoriesSection() {
  const apiFetch = useApiFetch();
  const [items,   setItems]   = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  // inline form state
  const [editId,    setEditId]    = useState<string | null>(null); // null = new
  const [showForm,  setShowForm]  = useState(false);
  const [formName,  setFormName]  = useState("");
  const [formDesc,  setFormDesc]  = useState("");

  const load = useCallback(() => {
    setLoading(true);
    apiFetch<any>("/api/CourseCategory")
      .then((r) => {
        const list = r.Data ?? r.data ?? r ?? [];
        setItems(Array.isArray(list) ? list.map(mapCategory) : []);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [apiFetch]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setEditId(null);
    setFormName("");
    setFormDesc("");
    setShowForm(true);
  };

  const openEdit = (c: Category) => {
    setEditId(c.id);
    setFormName(c.name);
    setFormDesc(c.description ?? "");
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditId(null);
  };

  const handleSave = async () => {
    if (!formName.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      if (editId) {
        await apiFetch(`/api/CourseCategory/${editId}`, {
          method: "PATCH",
          body: JSON.stringify({ Name: formName, Description: formDesc }),
        });
        setItems((p) => p.map((x) => x.id === editId ? { ...x, name: formName, description: formDesc } : x));
        toast.success("Category updated!");
      } else {
        const res = await apiFetch<any>("/api/CourseCategory", {
          method: "POST",
          body: JSON.stringify({ Name: formName, Description: formDesc }),
        });
        const newItem = mapCategory(res.data ?? res.Data ?? res);
        setItems((p) => [newItem, ...p]);
        toast.success("Category created!");
      }
      cancelForm();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await apiFetch(`/api/CourseCategory/${id}`, { method: "DELETE" });
      setItems((p) => p.filter((x) => x.id !== id));
      toast.success("Category deleted.");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleting(null);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{items.length} categories</p>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition"
        >
          + New category
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 space-y-4">
          <p className="text-xs font-semibold text-white">{editId ? "Edit category" : "New category"}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Frontend"
                className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Description</label>
              <input
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Short description"
                className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={cancelForm} className="text-sm font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-xl transition">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-5 py-2 rounded-xl transition flex items-center gap-2"
            >
              {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? "Saving…" : editId ? "Update" : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="grid grid-cols-[1fr_2fr_80px_80px] gap-4 px-4 py-2.5 border-b border-slate-800 bg-slate-800/30">
          {["Name", "Description", "Courses", ""].map((h) => (
            <p key={h} className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{h}</p>
          ))}
        </div>

        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[1fr_2fr_80px_80px] gap-4 items-center px-4 py-3 border-b border-slate-800/50">
              {[...Array(4)].map((_, j) => <div key={j} className="h-4 bg-slate-800 rounded animate-pulse" />)}
            </div>
          ))
        ) : items.length === 0 ? (
          <p className="text-center text-slate-600 text-sm py-12">No categories yet</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_2fr_80px_80px] gap-4 items-center px-4 py-3 border-b border-slate-800/50 hover:bg-slate-800/20 transition group">
              <p className="text-sm font-medium text-white">{item.name}</p>
              <p className="text-xs text-slate-500 truncate">{item.description || "—"}</p>
              <p className="text-xs text-slate-500">{item.courseCount ?? 0}</p>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(item)}
                  className="text-[10px] font-semibold text-indigo-300 bg-indigo-900/40 hover:bg-indigo-900/70 px-2 py-1 rounded-lg transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(item)}
                  className="text-[10px] font-semibold text-red-400 bg-red-900/20 hover:bg-red-900/50 px-2 py-1 rounded-lg transition"
                >
                  Del
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {deleteTarget && (
        <ConfirmDeleteModal
          label={deleteTarget.name}
          loading={deleting === deleteTarget.id}
          onConfirm={() => handleDelete(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
