"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { EmailTemplate } from "./types";
import { useApiFetch } from "./api";
import { mapEmailTemplate } from "./mappers";
import ConfirmDeleteModal from "./confirmDeleteModal";

function EmailTemplateModal({
  template,
  onClose,
  onSaved,
}: {
  template: EmailTemplate | null;
  onClose: () => void;
  onSaved: (t: EmailTemplate) => void;
}) {
  const apiFetch = useApiFetch();

  const [formName, setFormName] = useState(template?.name ?? "");
  const [formSubject, setFormSubject] = useState(
    template?.subject ?? ""
  );
  const [formBody, setFormBody] = useState(template?.body ?? "");
  const [formActive, setFormActive] = useState(
    template?.isActive ?? true
  );

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!formSubject.trim()) {
      toast.error("Subject is required");
      return;
    }

    if (!formBody.trim()) {
      toast.error("Body is required");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: formName,
        subject: formSubject,
        body: formBody,
        description: "",
        isActive: formActive,
      };

      if (template?.id) {
        await apiFetch(`/api/EmailTemplate/${template.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });

        onSaved({
          ...template,
          name: formName,
          subject: formSubject,
          body: formBody,
          isActive: formActive,
        });

        toast.success("Template updated!");
      } else {
        const res = await apiFetch<any>(
          "/api/EmailTemplate",
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );

        onSaved(
          mapEmailTemplate(res.data ?? res.Data ?? res)
        );

        toast.success("Template created!");
      }

      onClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl z-10 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-white">
              {template
                ? "Edit template"
                : "New email template"}
            </h3>

            <p className="text-[11px] text-slate-500 mt-0.5">
              Configure the email content
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white text-xl leading-none transition"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              Template name{" "}
              <span className="text-red-400">*</span>
            </label>

            <input
              value={formName}
              onChange={(e) =>
                setFormName(e.target.value)
              }
              placeholder="e.g. Welcome Assignment"
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              Subject{" "}
              <span className="text-red-400">*</span>
            </label>

            <input
              value={formSubject}
              onChange={(e) =>
                setFormSubject(e.target.value)
              }
              placeholder="e.g. You've been assigned a new course"
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              Body <span className="text-red-400">*</span>
            </label>

            <textarea
              value={formBody}
              onChange={(e) =>
                setFormBody(e.target.value)
              }
              rows={8}
              placeholder="Hi {EmployeeName},&#10;&#10;You have been assigned the course {CourseName}…"
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition resize-none font-mono"
            />
          </div>

          <div className="flex items-center justify-between bg-slate-800/50 rounded-xl px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-white">
                Active
              </p>

              <p className="text-[10px] text-slate-500">
                This template will be used when triggered
              </p>
            </div>

            <button
              onClick={() =>
                setFormActive((v) => !v)
              }
              className={`relative w-11 h-6 rounded-full transition-colors ${
                formActive
                  ? "bg-indigo-600"
                  : "bg-slate-700"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                  formActive ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 py-2.5 rounded-xl transition flex items-center justify-center gap-2"
          >
            {saving && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}

            {saving
              ? "Saving…"
              : template
              ? "Update template"
              : "Create template"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EmailTemplatesSection() {
  const apiFetch = useApiFetch();

  const [items, setItems] = useState<
    EmailTemplate[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [modalItem, setModalItem] =
    useState<EmailTemplate | null | "new">(null);

  const [deleting, setDeleting] = useState<
    string | null
  >(null);

  const [deleteTarget, setDeleteTarget] =
    useState<EmailTemplate | null>(null);

  const load = useCallback(() => {
    setLoading(true);

    apiFetch<any>("/api/EmailTemplate")
      .then((r) => {
        const list = r.Data ?? r.data ?? r ?? [];

        setItems(
          Array.isArray(list)
            ? list.map(mapEmailTemplate)
            : []
        );
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [apiFetch]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaved = (t: EmailTemplate) => {
    setItems((p) => {
      const exists = p.find(
        (x) => x.id === t.id
      );

      return exists
        ? p.map((x) =>
            x.id === t.id ? t : x
          )
        : [t, ...p];
    });
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);

    try {
      await apiFetch(`/api/EmailTemplate/${id}`, {
        method: "DELETE",
      });

      setItems((p) =>
        p.filter((x) => x.id !== id)
      );

      toast.success("Template deleted.");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleting(null);
      setDeleteTarget(null);
    }
  };

  const toggleActive = async (
    t: EmailTemplate
  ) => {
    try {
      await apiFetch(`/api/EmailTemplate/${t.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          isActive: !t.isActive,
        }),
      });

      setItems((p) =>
        p.map((x) =>
          x.id === t.id
            ? {
                ...x,
                isActive: !x.isActive,
              }
            : x
        )
      );
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          onClick={() =>
            setModalItem("new")
          }
          className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition"
        >
          + New template
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3">
          {Array.from({ length: 3 }).map(
            (_, i) => (
              <div
                key={i}
                className="h-24 bg-slate-800 rounded-2xl animate-pulse"
              />
            )
          )}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 py-16 text-center text-slate-600 text-sm">
          No templates yet
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <div
              key={t.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-white truncate">
                      {t.name}
                    </p>

                    {!t.isActive && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-slate-800 text-slate-500 border-slate-700 shrink-0">
                        Inactive
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 truncate">
                    <span className="text-slate-600 mr-1">
                      Subject:
                    </span>
                    {t.subject}
                  </p>

                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">
                    {t.body}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleActive(t);
                    }}
                    className={`relative w-9 h-5 rounded-full transition-colors ${
                      t.isActive
                        ? "bg-indigo-600"
                        : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                        t.isActive
                          ? "left-4"
                          : "left-0.5"
                      }`}
                    />
                  </button>

                  <button
                    onClick={() =>
                      setModalItem(t)
                    }
                    className="text-[10px] font-semibold text-indigo-300 bg-indigo-900/40 hover:bg-indigo-900/70 px-2.5 py-1.5 rounded-lg transition opacity-0 group-hover:opacity-100"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      setDeleteTarget(t)
                    }
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
          template={
            modalItem === "new"
              ? null
              : modalItem
          }
          onClose={() =>
            setModalItem(null)
          }
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          label={deleteTarget.name}
          loading={
            deleting === deleteTarget.id
          }
          onConfirm={() =>
            handleDelete(deleteTarget.id)
          }
          onCancel={() =>
            setDeleteTarget(null)
          }
        />
      )}
    </div>
  );
}