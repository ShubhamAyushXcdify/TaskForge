"use client";
import { useSession } from "next-auth/react";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface EditableEmployee {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeCode: string;
  role: { id: string; name: string };
  employmentStatus: "Active" | "Inactive" | "Resigned";
}

interface Role {
  id: string;
  name: string;
}

export interface EditProfileModalProps {
  employee: EditableEmployee;
  onClose: () => void;
  onUpdated: (updated: EditableEmployee) => void;
}

// ─── API hook ─────────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

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

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="text-[10px] text-red-400 mt-1">{error}</p>}
    </div>
  );
}

const inputCls = (hasError?: boolean) =>
  `w-full bg-slate-800 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition
   ${hasError ? "border-red-500" : "border-slate-700 focus:border-indigo-500"}`;

// ─── Component ────────────────────────────────────────────────────────────────
export function EditProfileModal({
  employee,
  onClose,
  onUpdated,
}: EditProfileModalProps) {
  const apiFetch = useApiFetch();

  // ── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    employeeCode: employee.employeeCode,
    roleId: employee.role.id,
    password: "",
    confirmPassword: "",
  });

  type FormKey = keyof typeof form;
  const [errors, setErrors] = useState<Partial<Record<FormKey, string>>>({});
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // ── Load roles ──────────────────────────────────────────────────────────────
 useEffect(() => {
  apiFetch<{ success: boolean; data: { id: string; name: string }[] }>("/api/Role")
    .then((res) =>
      setRoles(
        (res.data ?? []).map((r) => ({
          id: r.id,
          name: r.name,
        }))
      )
    )
    .catch(() => toast.error("Could not load roles."));
}, [apiFetch]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const set =
    (k: FormKey) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
      setErrors((er) => ({ ...er, [k]: "" }));
    };
  // ── Submit ──────────────────────────────────────────────────────────────────

 const handleSubmit = useCallback(async () => {
  const e: Partial<Record<keyof typeof form, string>> = {};
  if (!form.firstName.trim()) e.firstName = "Required";
  if (!form.lastName.trim())  e.lastName  = "Required";
  if (!form.email.trim())     e.email     = "Required";
  if (!form.employeeCode.trim()) e.employeeCode = "Required";
  if (!form.roleId.trim())    e.roleId    = "Required";
  if (form.password && form.password.length < 6) e.password = "Minimum 6 characters";
  setErrors(e);
  if (Object.keys(e).length > 0) return;

  setLoading(true);
  try {
   
    const data = await apiFetch<any>(`/api/admin/employees/${employee.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        FirstName: form.firstName,
        LastName:  form.lastName,
        Email:     form.email,
        RoleId:    form.roleId,
        ...(form.password.trim() && { Password: form.password.trim() }),
      }),
    });

    if (!data?.success) {
      toast.error(data?.message || "Update failed");
      return;
    }

    const updatedRole = roles.find((r) => r.id === form.roleId) ?? employee.role;
    onUpdated({
      ...employee,
      firstName:    form.firstName,
      lastName:     form.lastName,
      email:        form.email,
      employeeCode: form.employeeCode,
      role:         updatedRole,
    });

    toast.success("Employee updated successfully");
    onClose();
  } catch (err: any) {
    toast.error(err.message ?? "Failed to update employee.");
  } finally {
    setLoading(false);
  }
}, [form, employee, roles, apiFetch, onUpdated, onClose]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-white">Edit employee</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {employee.firstName} {employee.lastName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white text-xl leading-none transition"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            {(["firstName", "lastName"] as const).map((key) => (
              <Field
                key={key}
                label={key === "firstName" ? "First name" : "Last name"}
                required
                error={errors[key]}
              >
                <input
                  value={form[key]}
                  onChange={set(key)}
                  placeholder={key === "firstName" ? "First" : "Last"}
                  className={inputCls(!!errors[key])}
                />
              </Field>
            ))}
          </div>

          {/* Email */}
          <Field label="Email" required error={errors.email}>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="employee@company.com"
              className={inputCls(!!errors.email)}
            />
          </Field>

          {/* Employee code */}
          <Field label="Employee code" required error={errors.employeeCode}>
            <input
              value={form.employeeCode}
              onChange={set("employeeCode")}
              placeholder="EMP045"
              className={inputCls(!!errors.employeeCode)}
            />
          </Field>

          {/* Role */}
          <Field label="Role" required error={errors.roleId}>
            <select
              value={form.roleId}
              onChange={set("roleId")}
              className={`${inputCls(!!errors.roleId)} appearance-none`}
            >
              <option value="">Select role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>

          {/* Password section */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Change password
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowPass((v) => !v);
                  setForm((f) => ({ ...f, password: "", confirmPassword: "" }));
                  setErrors((er) => ({ ...er, password: "", confirmPassword: "" }));
                }}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 transition"
              >
                {showPass ? "Cancel" : "Change →"}
              </button>
            </div>
            {showPass ? (
              <div className="space-y-3">
                <Field label="New password" error={errors.password}>
                  <input
                    type="password"
                    value={form.password}
                    onChange={set("password")}
                    placeholder="Min 6 characters"
                    className={inputCls(!!errors.password)}
                    autoComplete="new-password"
                  />
                </Field>
                <Field label="Confirm password" error={errors.confirmPassword}>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={set("confirmPassword")}
                    placeholder="Repeat new password"
                    className={inputCls(!!errors.confirmPassword)}
                    autoComplete="new-password"
                  />
                </Field>
              </div>
            ) : (
              <p className="text-[11px] text-slate-600">
                Leave blank to keep the current password
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed py-2.5 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {loading ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}