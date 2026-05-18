import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useApiFetch } from "./api";
import { Employee, Role } from "./type";


export default function AddEmployeeModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (emp: Employee) => void;
}) {
  const apiFetch = useApiFetch();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", employeeCode: "", roleId: "",
  });

  const [roles, setRoles]     = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<Partial<Record<keyof typeof form, string>>>({});

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

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
      setErrors((er) => ({ ...er, [k]: "" }));
    };

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.firstName.trim())    e.firstName    = "Required";
    if (!form.lastName.trim())     e.lastName     = "Required";
    if (!form.email.trim())        e.email        = "Required";
    if (!form.employeeCode.trim()) e.employeeCode = "Required";
    if (!form.password.trim())     e.password     = "Required";
    if (!form.roleId.trim())       e.roleId       = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const selectedRole = roles.find((r) => r.id === form.roleId);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await apiFetch<any>("/api/admin/employees", {
        method: "POST",
        body: JSON.stringify({
          firstName:    form.firstName,
          lastName:     form.lastName,
          email:        form.email,
          employeeCode: form.employeeCode,
          password:     form.password,
          roleId:       form.roleId,
        }),
      });
      toast.success(`${form.firstName} added — invitation sent!`);
      onCreated({
        id: data.id, userId: "",
        employeeCode: data.employeeCode ?? form.employeeCode,
        firstName: form.firstName, lastName: form.lastName,
        email: data.email ?? form.email,
        role: { id: form.roleId || "", name: selectedRole?.name ?? "Employee" },
        managerId: null, managerName: null,
        employmentStatus: "Active", isActive: true,
        createdAt: data.createdAt,
        stats: { assigned: 0, completed: 0, inProgress: 0, pending: 0, overdue: 0 },
      });
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to create employee.");
    } finally {
      setLoading(false);
    }
  }, [form, onCreated, onClose, apiFetch, selectedRole]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md z-10 flex flex-col max-h-[90vh]">

        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-white">Add new employee</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Invitation email sent automatically</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl leading-none transition">×</button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {(["firstName", "lastName"] as const).map((key) => (
              <div key={key}>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                  {key === "firstName" ? "First name" : "Last name"} <span className="text-red-400">*</span>
                </label>
                <input
                  value={form[key]}
                  onChange={set(key)}
                  placeholder={key === "firstName" ? "First Name" : "Last Name"}
                  className={`w-full bg-slate-800 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition
                    ${errors[key] ? "border-red-500" : "border-slate-700 focus:border-indigo-500"}`}
                />
                {errors[key] && <p className="text-[10px] text-red-400 mt-1">{errors[key]}</p>}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email" value={form.email} onChange={set("email")} placeholder="employee@company.com"
              className={`w-full bg-slate-800 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition
                ${errors.email ? "border-red-500" : "border-slate-700 focus:border-indigo-500"}`}
            />
            {errors.email && <p className="text-[10px] text-red-400 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              Password <span className="text-red-400">*</span>
            </label>
            <input
              type="password" value={form.password} onChange={set("password")} placeholder="Enter password"
              className={`w-full bg-slate-800 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition
                ${errors.password ? "border-red-500" : "border-slate-700 focus:border-indigo-500"}`}
            />
            {errors.password && <p className="text-[10px] text-red-400 mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              Employee code <span className="text-red-400">*</span>
            </label>
            <input
              value={form.employeeCode} onChange={set("employeeCode")} placeholder="EMP045"
              className={`w-full bg-slate-800 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition
                ${errors.employeeCode ? "border-red-500" : "border-slate-700 focus:border-indigo-500"}`}
            />
            {errors.employeeCode && <p className="text-[10px] text-red-400 mt-1">{errors.employeeCode}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              Role <span className="text-red-400">*</span>
            </label>
            <select
              value={form.roleId} onChange={set("roleId")}
              className={`w-full bg-slate-800 border rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition appearance-none
                ${errors.roleId ? "border-red-500" : "border-slate-700 focus:border-indigo-500"}`}
            >
              <option value="">Select role</option>
              {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            {errors.roleId && <p className="text-[10px] text-red-400 mt-1">{errors.roleId}</p>}
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
            {loading ? "Creating…" : "Add employee"}
          </button>
        </div>
      </div>
    </div>
  );
}