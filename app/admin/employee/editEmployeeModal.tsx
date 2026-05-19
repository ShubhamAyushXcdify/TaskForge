"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

import { useApiFetch } from "./api";
import { Role } from "./type";

export interface EditableEmployee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeCode: string;
  role: {
    id: string;
    name: string;
  };
}

export function EditProfileModal({
  employee,
  onClose,
  onUpdated,
}: {
  employee: EditableEmployee;
  onClose: () => void;
  onUpdated: (updated: EditableEmployee) => void;
}) {
  const apiFetch = useApiFetch();

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    employeeCode: employee.employeeCode,
    roleId: employee.role.id,
    password: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof form, string>>
  >({});

  // ─── Load roles ────────────────────────────────────────────────────────────

  useEffect(() => {
    apiFetch<{ Success: boolean; Data: { Id: string; Name: string }[] }>(
      "/api/Role"
    )
      .then((res) => {
        setRoles(
          (res.Data ?? []).map((r) => ({
            id: r.Id,
            name: r.Name,
          }))
        );
      })
      .catch(() => toast.error("Could not load roles."));
  }, [apiFetch]);

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((p) => ({
        ...p,
        [key]: e.target.value,
      }));

      setErrors((p) => ({
        ...p,
        [key]: "",
      }));
    };

  const validate = () => {
    const e: Partial<Record<keyof typeof form, string>> = {};

    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim()) e.email = "Required";
    if (!form.employeeCode.trim()) e.employeeCode = "Required";
    if (!form.roleId.trim()) e.roleId = "Required";

    if (form.password && form.password.length < 6) {
      e.password = "Minimum 6 characters";
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  // ─── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      // await apiFetch(`/api/admin/employees/${employee.id}`, {
      //   method: "PATCH",
      //   body: JSON.stringify({
      //     firstName: form.firstName,
      //     lastName: form.lastName,
      //     email: form.email,
      //     employeeCode: form.employeeCode,
      //     roleId: form.roleId,
      //     ...(form.password
      //       ? {
      //           password: form.password,
      //         }
      //       : {}),
      //   }),
      // });
await apiFetch(`/api/admin/employees/${employee.id}`, {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    FirstName: form.firstName,
    LastName: form.lastName,
    Email: form.email,
    RoleId: form.roleId,
    ...(form.password && {
      Password: form.password,
    }),
  }),
});


      const updatedRole =
        roles.find((r) => r.id === form.roleId) ?? employee.role;

      const updatedEmployee: EditableEmployee = {
        ...employee,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        employeeCode: form.employeeCode,
        role: updatedRole,
      };

      onUpdated(updatedEmployee);

      toast.success("Employee updated successfully");
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to update employee.");
    } finally {
      setLoading(false);
    }
  }, [form, employee, roles, apiFetch, onUpdated, onClose]);

  // ─── UI ────────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md z-10 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Edit employee
            </h3>

            <p className="text-[11px] text-slate-500 mt-0.5">
              Update employee details
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

          {/* Names */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                value={form.firstName}
                onChange={set("firstName")}
                placeholder="First name"
                className={`w-full bg-slate-800 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition
                ${
                  errors.firstName
                    ? "border-red-500"
                    : "border-slate-700 focus:border-indigo-500"
                }`}
              />

              {errors.firstName && (
                <p className="text-[10px] text-red-400 mt-1">
                  {errors.firstName}
                </p>
              )}
            </div>

            <div>
              <input
                value={form.lastName}
                onChange={set("lastName")}
                placeholder="Last name"
                className={`w-full bg-slate-800 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition
                ${
                  errors.lastName
                    ? "border-red-500"
                    : "border-slate-700 focus:border-indigo-500"
                }`}
              />

              {errors.lastName && (
                <p className="text-[10px] text-red-400 mt-1">
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="employee@company.com"
              className={`w-full bg-slate-800 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition
              ${
                errors.email
                  ? "border-red-500"
                  : "border-slate-700 focus:border-indigo-500"
              }`}
            />

            {errors.email && (
              <p className="text-[10px] text-red-400 mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Employee code */}
          <div>
            <input
              value={form.employeeCode}
              onChange={set("employeeCode")}
              placeholder="EMP001"
              className={`w-full bg-slate-800 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition
              ${
                errors.employeeCode
                  ? "border-red-500"
                  : "border-slate-700 focus:border-indigo-500"
              }`}
            />

            {errors.employeeCode && (
              <p className="text-[10px] text-red-400 mt-1">
                {errors.employeeCode}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <select
              value={form.roleId}
              onChange={set("roleId")}
              className={`w-full bg-slate-800 border rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition appearance-none
              ${
                errors.roleId
                  ? "border-red-500"
                  : "border-slate-700 focus:border-indigo-500"
              }`}
            >
              <option value="">Select role</option>

              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>

            {errors.roleId && (
              <p className="text-[10px] text-red-400 mt-1">
                {errors.roleId}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder="New password (optional)"
              className={`w-full bg-slate-800 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition
              ${
                errors.password
                  ? "border-red-500"
                  : "border-slate-700 focus:border-indigo-500"
              }`}
            />

            {errors.password && (
              <p className="text-[10px] text-red-400 mt-1">
                {errors.password}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
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

            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}