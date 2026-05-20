"use client";

import { useSession } from "next-auth/react";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

// ─── API ──────────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";

function useApiFetch() {
  const { data: session } = useSession();
  return useCallback(
    async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
      const res = await fetch(`${API_BASE}${path}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.token}`,
        },
        credentials: "include",
        ...options,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).message ?? `Request failed: ${res.status}`);
      }
      return res.json() as Promise<T>;
    },
    [session?.user?.token]
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
  description?: string;
  courseCount?: number;
}

interface Provider {
  id: string;
  name: string;
  website?: string;
  courseCount?: number;
}

interface EmailTemplate {
  id: string;
  name: string;
  type: "AssignmentNotification" | "DueDateReminder" | "CompletionCertificate" | "Custom";
  subject: string;
  body: string;
  isActive: boolean;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  userCount?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapCategory(raw: any): Category {
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

function mapProvider(raw: any): Provider {
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

function mapEmailTemplate(raw: any): EmailTemplate {
  return {
    id:       raw.id       ?? raw.Id       ?? "",
    name:     raw.name     ?? raw.Name     ?? "—",
    type:     raw.type     ?? raw.Type     ?? "Custom",
    subject:  raw.subject  ?? raw.Subject  ?? "",
    body:     raw.body     ?? raw.Body     ?? "",
    isActive: raw.isActive ?? raw.IsActive ?? true,
  };
}

function mapRole(raw: any): Role {
  return {
    id:          raw.id          ?? raw.id          ?? "",
    name:        raw.name        ?? raw.ame        ?? "—",
    description: raw.description ?? raw.Description ?? "Role",
    userCount:   raw.userCount   ?? raw.UserCount   ?? 0,
  };
}

// ─── Tab type ─────────────────────────────────────────────────────────────────

type Tab = "categories" | "providers" | "emailTemplates" | "roles";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "categories",     label: "Categories",      icon: "⊞" },
  { key: "providers",      label: "Providers",       icon: "🏢" },
  { key: "emailTemplates", label: "Email Templates", icon: "✉" },
  // { key: "roles",          label: "Roles",           icon: "🛡" },
];

const EMAIL_TYPES = ["AssignmentNotification", "DueDateReminder", "CompletionCertificate", "Custom"] as const;
const EMAIL_TYPE_LABELS: Record<string, string> = {
  AssignmentNotification: "Assignment Notification",
  DueDateReminder:        "Due Date Reminder",
  CompletionCertificate:  "Completion Certificate",
  Custom:                 "Custom",
};
const EMAIL_TYPE_COLORS: Record<string, string> = {
  AssignmentNotification: "bg-indigo-900/50 text-indigo-300 border-indigo-800/50",
  DueDateReminder:        "bg-orange-900/50 text-orange-300 border-orange-800/50",
  CompletionCertificate:  "bg-teal-900/50 text-teal-300 border-teal-800/50",
  Custom:                 "bg-slate-800 text-slate-400 border-slate-700",
};

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────

function ConfirmDeleteModal({
  label,
  onConfirm,
  onCancel,
  loading,
}: {
  label: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm z-10 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-900/40 text-red-400 flex items-center justify-center text-lg shrink-0">⚠</div>
          <div>
            <p className="text-sm font-semibold text-white">Delete "{label}"?</p>
            <p className="text-[11px] text-slate-500 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl transition">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 py-2.5 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Categories Section ───────────────────────────────────────────────────────

function CategoriesSection() {
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
          method: "PUT",
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

// ─── Providers Section ────────────────────────────────────────────────────────

function ProvidersSection() {
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
          method: "PUT",
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

// ─── Email Templates Section ──────────────────────────────────────────────────

function EmailTemplateModal({
  template,
  onClose,
  onSaved,
}: {
  template: EmailTemplate | null; // null = new
  onClose: () => void;
  onSaved: (t: EmailTemplate) => void;
}) {
  const apiFetch = useApiFetch();
  const [formName,    setFormName]    = useState(template?.name    ?? "");
  const [formType,    setFormType]    = useState(template?.type    ?? "Custom");
  const [formSubject, setFormSubject] = useState(template?.subject ?? "");
  const [formBody,    setFormBody]    = useState(template?.body    ?? "");
  const [formActive,  setFormActive]  = useState(template?.isActive ?? true);
  const [saving,      setSaving]      = useState(false);

  const handleSave = async () => {
    if (!formName.trim())    { toast.error("Name is required");    return; }
    if (!formSubject.trim()) { toast.error("Subject is required"); return; }
    if (!formBody.trim())    { toast.error("Body is required");    return; }
    setSaving(true);
    try {
      const payload = {
        Name:     formName,
        Type:     formType,
        Subject:  formSubject,
        Body:     formBody,
        IsActive: formActive,
      };
      if (template?.id) {
        await apiFetch(`/api/admin/email-templates/${template.id}`, { method: "PUT", body: JSON.stringify(payload) });
        onSaved({ ...template, name: formName, type: formType as any, subject: formSubject, body: formBody, isActive: formActive });
        toast.success("Template updated!");
      } else {
        const res = await apiFetch<any>("/api/admin/email-templates", { method: "POST", body: JSON.stringify(payload) });
        onSaved(mapEmailTemplate(res.data ?? res.Data ?? res));
        toast.success("Template created!");
      }
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  // Variable chips for template body
  const VARIABLES = ["{EmployeeName}", "{CourseName}", "{DueDate}", "{CompanyName}", "{LoginUrl}"];

  const insertVariable = (v: string) => setFormBody((b) => b + v);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl z-10 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-white">{template ? "Edit template" : "New email template"}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Configure the email content and type</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl leading-none transition">×</button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Name + Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                Template name <span className="text-red-400">*</span>
              </label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Welcome Assignment"
                className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition appearance-none"
              >
                {EMAIL_TYPES.map((t) => (
                  <option key={t} value={t}>{EMAIL_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              Subject <span className="text-red-400">*</span>
            </label>
            <input
              value={formSubject}
              onChange={(e) => setFormSubject(e.target.value)}
              placeholder="e.g. You've been assigned a new course"
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition"
            />
          </div>

          {/* Variables */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Insert variable</label>
            <div className="flex flex-wrap gap-2">
              {VARIABLES.map((v) => (
                <button
                  key={v}
                  onClick={() => insertVariable(v)}
                  className="text-[10px] font-mono font-semibold px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 rounded-lg transition"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              Body <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formBody}
              onChange={(e) => setFormBody(e.target.value)}
              rows={8}
              placeholder="Hi {EmployeeName},&#10;&#10;You have been assigned the course {CourseName}…"
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition resize-none font-mono"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between bg-slate-800/50 rounded-xl px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-white">Active</p>
              <p className="text-[10px] text-slate-500">This template will be used when triggered</p>
            </div>
            <button
              onClick={() => setFormActive((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${formActive ? "bg-indigo-600" : "bg-slate-700"}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${formActive ? "left-6" : "left-1"}`} />
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl transition">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 py-2.5 rounded-xl transition flex items-center justify-center gap-2"
          >
            {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {saving ? "Saving…" : template ? "Update template" : "Create template"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmailTemplatesSection() {
  const apiFetch = useApiFetch();
  const [items,        setItems]        = useState<EmailTemplate[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [modalItem,    setModalItem]    = useState<EmailTemplate | null | "new">(null);
  const [deleting,     setDeleting]     = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmailTemplate | null>(null);
  const [typeFilter,   setTypeFilter]   = useState<string>("all");

  const load = useCallback(() => {
    setLoading(true);
    apiFetch<any>("/api/admin/email-templates")
      .then((r) => {
        const list = r.Data ?? r.data ?? r ?? [];
        setItems(Array.isArray(list) ? list.map(mapEmailTemplate) : []);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [apiFetch]);

  useEffect(() => { load(); }, [load]);

  const handleSaved = (t: EmailTemplate) => {
    setItems((p) => {
      const exists = p.find((x) => x.id === t.id);
      return exists ? p.map((x) => x.id === t.id ? t : x) : [t, ...p];
    });
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await apiFetch(`/api/admin/email-templates/${id}`, { method: "DELETE" });
      setItems((p) => p.filter((x) => x.id !== id));
      toast.success("Template deleted.");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleting(null);
      setDeleteTarget(null);
    }
  };

  const toggleActive = async (t: EmailTemplate) => {
    try {
      await apiFetch(`/api/admin/email-templates/${t.id}`, {
        method: "PATCH",
        body: JSON.stringify({ IsActive: !t.isActive }),
      });
      setItems((p) => p.map((x) => x.id === t.id ? { ...x, isActive: !x.isActive } : x));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const filtered = typeFilter === "all" ? items : items.filter((t) => t.type === typeFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Type filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setTypeFilter("all")}
            className={`text-xs px-3 py-1.5 rounded-lg transition ${typeFilter === "all" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
          >
            All
          </button>
          {EMAIL_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`text-xs px-3 py-1.5 rounded-lg transition ${typeFilter === t ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
            >
              {EMAIL_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
        <button
          onClick={() => setModalItem("new")}
          className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition"
        >
          + New template
        </button>
      </div>

      {/* Cards grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 py-16 text-center text-slate-600 text-sm">
          No templates {typeFilter !== "all" ? "of this type" : "yet"}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-white truncate">{t.name}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${EMAIL_TYPE_COLORS[t.type]}`}>
                      {EMAIL_TYPE_LABELS[t.type]}
                    </span>
                    {!t.isActive && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-slate-800 text-slate-500 border-slate-700 shrink-0">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate">
                    <span className="text-slate-600 mr-1">Subject:</span>{t.subject}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">{t.body}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Active toggle */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleActive(t); }}
                    className={`relative w-9 h-5 rounded-full transition-colors ${t.isActive ? "bg-indigo-600" : "bg-slate-700"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${t.isActive ? "left-4" : "left-0.5"}`} />
                  </button>
                  <button
                    onClick={() => setModalItem(t)}
                    className="text-[10px] font-semibold text-indigo-300 bg-indigo-900/40 hover:bg-indigo-900/70 px-2.5 py-1.5 rounded-lg transition opacity-0 group-hover:opacity-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(t)}
                    className="text-[10px] font-semibold text-red-400 bg-red-900/20 hover:bg-red-900/50 px-2.5 py-1.5 rounded-lg transition opacity-0 group-hover:opacity-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalItem !== null && (
        <EmailTemplateModal
          template={modalItem === "new" ? null : modalItem}
          onClose={() => setModalItem(null)}
          onSaved={handleSaved}
        />
      )}

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

// ─── Roles Section ────────────────────────────────────────────────────────────

function RolesSection() {
  const apiFetch = useApiFetch();
  const [items,        setItems]        = useState<Role[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [deleting,     setDeleting]     = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);

  const [editId,    setEditId]    = useState<string | null>(null);
  const [showForm,  setShowForm]  = useState(false);
  const [formName,  setFormName]  = useState("");
  const [formDesc,  setFormDesc]  = useState("");

  const ROLE_COLORS: Record<string, string> = {
    Admin:    "bg-violet-900/50 text-violet-300 border-violet-800/50",
    Manager:  "bg-blue-900/50 text-blue-300 border-blue-800/50",
    Employee: "bg-teal-900/50 text-teal-300 border-teal-800/50",
  };

  const load = useCallback(() => {
    setLoading(true);
    apiFetch<any>("/api/Role")
      .then((r) => {
        const list = r.Data ?? r.data ?? r ?? [];
        setItems(Array.isArray(list) ? list.map(mapRole) : []);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [apiFetch]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditId(null); setFormName(""); setFormDesc(""); setShowForm(true); };
  const openEdit = (r: Role) => { setEditId(r.id); setFormName(r.name); setFormDesc(r.description ?? ""); setShowForm(true); };
  const cancelForm = () => { setShowForm(false); setEditId(null); };

  const handleSave = async () => {
    if (!formName.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      if (editId) {
        await apiFetch(`/api/Role/${editId}`, {
          method: "PUT",
          body: JSON.stringify({ Name: formName, Description: formDesc }),
        });
        setItems((p) => p.map((x) => x.id === editId ? { ...x, name: formName, description: formDesc } : x));
        toast.success("Role updated!");
      } else {
        const res = await apiFetch<any>("/api/Role", {
          method: "POST",
          body: JSON.stringify({ Name: formName, Description: formDesc }),
        });
        setItems((p) => [mapRole(res.data ?? res.Data ?? res), ...p]);
        toast.success("Role created!");
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
      await apiFetch(`/api/Role/${id}`, { method: "DELETE" });
      setItems((p) => p.filter((x) => x.id !== id));
      toast.success("Role deleted.");
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
        <p className="text-xs text-slate-500">{items.length} roles</p>
        <button onClick={openNew} className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition">
          + New role
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 space-y-4">
          <p className="text-xs font-semibold text-white">{editId ? "Edit role" : "New role"}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                Role name <span className="text-red-400">*</span>
              </label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Manager"
                className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Description</label>
              <input
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="What this role can do"
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

      {/* Roles grid */}
      {loading ? (
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 py-16 text-center text-slate-600 text-sm">No roles yet</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((role) => (
            <div key={role.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition group relative">
              <div className="flex items-start justify-between mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ROLE_COLORS[role.name] ?? "bg-slate-800 text-slate-400 border-slate-700"}`}>
                  {role.name}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(role)} className="text-[10px] font-semibold text-indigo-300 bg-indigo-900/40 hover:bg-indigo-900/70 px-2 py-1 rounded-lg transition">Edit</button>
                  <button onClick={() => setDeleteTarget(role)} className="text-[10px] font-semibold text-red-400 bg-red-900/20 hover:bg-red-900/50 px-2 py-1 rounded-lg transition">Del</button>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1">{role.description || "No description"}</p>
              {role.userCount !== undefined && (
                <p className="text-[11px] text-slate-600 mt-3">
                  <span className="text-slate-400 font-semibold">{role.userCount}</span> users
                </p>
              )}
            </div>
          ))}
        </div>
      )}

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

// ─── Main Settings Page ───────────────────────────────────────────────────────

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>("categories");

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-800/50 rounded-2xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === tab.key
                ? "bg-slate-900 text-white shadow"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div>
        {activeTab === "categories"     && <CategoriesSection />}
        {activeTab === "providers"      && <ProvidersSection />}
        {activeTab === "emailTemplates" && <EmailTemplatesSection />}
        {/* {activeTab === "roles"          && <RolesSection />} */}
      </div>
    </div>
  );
}