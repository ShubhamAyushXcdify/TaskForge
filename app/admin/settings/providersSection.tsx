"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useApiFetch } from "./api";
import { Provider } from "./types";
import { mapProvider } from "./mappers";
import ConfirmDeleteModal from "./confirmDeleteModal";

export default function ProvidersSection() {
  const apiFetch = useApiFetch();
  const [items,   setItems]   = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Provider | null>(null);

  const [editId,       setEditId]       = useState<string | null>(null);
  const [showForm,     setShowForm]     = useState(false);
  const [formName,     setFormName]     = useState("");
  const [formWebsite,  setFormWebsite]  = useState("");

  const load = useCallback(() => {
    setLoading(true);
    apiFetch<any>("/api/CourseProvider")
      .then((r) => {
        const list = r.Data ?? r.data ?? r ?? [];
        setItems(Array.isArray(list) ? list.map(mapProvider) : []);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [apiFetch]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditId(null); setFormName(""); setFormWebsite(""); setShowForm(true); };
  const openEdit = (p: Provider) => { setEditId(p.id); setFormName(p.name); setFormWebsite(p.website ?? ""); setShowForm(true); };
  const cancelForm = () => { setShowForm(false); setEditId(null); };

  const handleSave = async () => {
    if (!formName.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      if (editId) {
        await apiFetch(`/api/CourseProvider/${editId}`, {
          method: "PATCH",
          body: JSON.stringify({ Name: formName, Website: formWebsite }),
        });
        setItems((p) => p.map((x) => x.id === editId ? { ...x, name: formName, website: formWebsite } : x));
        toast.success("Provider updated!");
      } else {
        const res = await apiFetch<any>("/api/CourseProvider", {
          method: "POST",
          body: JSON.stringify({ Name: formName, Website: formWebsite }),
        });
        setItems((p) => [mapProvider(res.data ?? res.Data ?? res), ...p]);
        toast.success("Provider created!");
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
      await apiFetch(`/api/CourseProvider/${id}`, { method: "DELETE" });
      setItems((p) => p.filter((x) => x.id !== id));
      toast.success("Provider deleted.");
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
        <p className="text-xs text-slate-500">{items.length} providers</p>
        <button onClick={openNew} className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition">
          + New provider
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 space-y-4">
          <p className="text-xs font-semibold text-white">{editId ? "Edit provider" : "New provider"}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Udemy"
                className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Website</label>
              <input
                value={formWebsite}
                onChange={(e) => setFormWebsite(e.target.value)}
                placeholder="https://udemy.com"
                className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={cancelForm} className="text-sm font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-xl transition">Cancel</button>
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

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="grid grid-cols-[1fr_2fr_80px_80px] gap-4 px-4 py-2.5 border-b border-slate-800 bg-slate-800/30">
          {["Name", "Website", "Courses", ""].map((h) => (
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
          <p className="text-center text-slate-600 text-sm py-12">No providers yet</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_2fr_80px_80px] gap-4 items-center px-4 py-3 border-b border-slate-800/50 hover:bg-slate-800/20 transition group">
              <p className="text-sm font-medium text-white">{item.name}</p>
              <a
                href={item.website}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-indigo-400 hover:underline truncate"
              >
                {item.website || "—"}
              </a>
              <p className="text-xs text-slate-500">{item.courseCount ?? 0}</p>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(item)} className="text-[10px] font-semibold text-indigo-300 bg-indigo-900/40 hover:bg-indigo-900/70 px-2 py-1 rounded-lg transition">Edit</button>
                <button onClick={() => setDeleteTarget(item)} className="text-[10px] font-semibold text-red-400 bg-red-900/20 hover:bg-red-900/50 px-2 py-1 rounded-lg transition">Del</button>
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