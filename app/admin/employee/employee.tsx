"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useApiFetch } from "./api";
import { Employee } from "./type";
import { toast } from "sonner";
import { SkeletonRow } from "./skeletonRow";
import { initials, statusCfg } from "./utils";
import AddEmployeeModal from "./addEmployeeModal";
import EmployeeDrawer from "./employeeDrawer";

export default function Employees() {
  const apiFetch = useApiFetch();
  const [employees, setEmployees]       = useState<Employee[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [search, setSearch]             = useState("");
  const [sortBy, setSortBy]             = useState<"name" | "completed" | "pending" | "overdue">("name");
  const [filterStatus, setFilterStatus] = useState<"all" | "Active" | "Inactive" >("all");
  const [showAdd, setShowAdd]           = useState(false);
  const [drawerEmpId, setDrawerEmpId]   = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiFetch<any>("/api/admin/employees")
     .then((d) => {
  const mappedEmployees: Employee[] = (d.employees ?? []).map((e: any) => ({
    id:               e.id,
    userId:           e.userId,
    employeeCode:     e.employeeCode,
    firstName:        e.firstName,
    lastName:         e.lastName,
    email:            e.email,
    role:             e.role
                          ? { id: e.role.id ?? "", name: e.role.name ?? "Employee" }
                          : { id: "", name: "Employee" },
    managerId:        e.managerId ?? null,
    managerName:      e.managerName && e.managerName !== "N/A" ? e.managerName : null,
    employmentStatus: e.employmentStatus,
    isActive:         e.isActive,
    createdAt:        e.createdAt,
    stats: {
      assigned:   e.stats?.assigned   ?? 0,
      completed:  e.stats?.completed  ?? 0,
      inProgress: e.stats?.inProgress ?? 0,
      pending:    e.stats?.pending    ?? 0,
      overdue:    e.stats?.overdue    ?? 0,
    },
  }));

  setEmployees(mappedEmployees);
})
      .catch((err) => {
        setError(err.message);
        toast.error(err.message ?? "Failed to load employees.");
      })
      .finally(() => setLoading(false));
  }, [apiFetch]);

  const handleCreated      = useCallback((emp: Employee) => setEmployees((p) => [emp, ...p]), []);
  const handleStatusChange = useCallback(
    (id: string, status: Employee["employmentStatus"]) =>
      setEmployees((p) => p.map((e) => e.id === id ? { ...e, employmentStatus: status, isActive: status === "Active" } : e)),
    []
  );
  
  const handleEmployeeUpdated = useCallback(
    (updated: Partial<Employee> & { id: string }) =>
      setEmployees((p) => p.map((e) => e.id === updated.id ? { ...e, ...updated } : e)),
    []
  );

  const filtered = useMemo(() => {
    return employees
      .filter((u) => {
        const q = search.toLowerCase();
        const matchSearch =
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.employeeCode.toLowerCase().includes(q);
        return matchSearch && (filterStatus === "all" || u.employmentStatus === filterStatus);
      })
      .sort((a, b) => {
        if (sortBy === "completed") return b.stats.completed - a.stats.completed;
        if (sortBy === "pending")   return b.stats.pending   - a.stats.pending;
        if (sortBy === "overdue")   return b.stats.overdue   - a.stats.overdue;
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      });
  }, [employees, search, sortBy, filterStatus]);

  const overdueCount = useMemo(() => employees.filter((e) => e.stats.overdue > 0).length, [employees]);

  return (
    <>
      <div className="space-y-5">

        {!loading && overdueCount > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span>🚨</span>
              <p className="text-sm text-red-300">
                <span className="font-bold">{overdueCount}</span>{" "}
                {overdueCount === 1 ? "employee has" : "employees have"} overdue courses
              </p>
            </div>
            <button onClick={() => setSortBy("overdue")}
              className="text-xs font-semibold text-red-300 bg-red-500/20 hover:bg-red-500/30 px-3 py-1.5 rounded-lg transition">
              Sort by overdue →
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative min-w-[220px] max-w-xs flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, code…"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 pl-9 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition" />
          </div>
          <div className="flex items-center gap-1.5">
            {(["all", "Active", "Inactive"] as const).map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`text-xs px-3 py-1.5 rounded-lg transition ${filterStatus === s ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">Sort:</span>
            {(["name", "completed", "pending", "overdue"] as const).map((s) => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`text-xs px-3 py-1.5 rounded-lg capitalize transition ${sortBy === s ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                {s}
              </button>
            ))}
          </div>
          <button onClick={() => setShowAdd(true)}
            className="ml-auto flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition">
            + Add employee
          </button>
        </div>

        {error && !loading && (
          <div className="bg-red-950/30 border border-red-900/50 rounded-2xl p-6 text-center">
            <p className="text-sm text-red-300">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-3 text-xs text-red-400 underline">Retry</button>
          </div>
        )}

        {!error && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/50">
                  {[
                    { label: "Employee",    align: "left"   },
                    { label: "Status",      align: "left"   },
                    { label: "Completed",   align: "center" },
                    { label: "In Progress", align: "center" },
                    { label: "Pending",     align: "center" },
                    { label: "Overdue",     align: "center" },
                    { label: "Progress",    align: "left"   },
                    { label: "",            align: "right"  },
                  ].map(({ label, align }) => (
                    <th key={label} className={`px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-500 text-${align}`}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                  : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={8} className="text-center py-16 text-slate-600 text-sm">
                        {employees.length === 0 ? "No employees yet. Add your first one." : "No employees match your search."}
                      </td>
                    </tr>
                  )
                  : filtered.map((emp) => {
                      const pct = emp.stats.assigned > 0
                        ? Math.round((emp.stats.completed / emp.stats.assigned) * 100) : 0;
                      const cfg = statusCfg[emp.employmentStatus];
                      return (
                        <tr key={`${emp.id}-${emp.employeeCode}`} onClick={() => setDrawerEmpId(emp.id)} 
                        className="hover:bg-slate-800/40 transition cursor-pointer">

                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0">
                                {initials(emp.firstName, emp.lastName)}
                              </div>
                              <div>
                                <p className="font-medium text-white text-sm">{emp.firstName} {emp.lastName}</p>
                                <p className="text-[10px] text-slate-500">{emp.employeeCode} · {emp.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg?.dot}`} />
                              <span className={`text-xs ${cfg?.text}`}>{emp.employmentStatus}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center"><span className="text-teal-400 font-semibold">{emp.stats.completed}</span></td>
                          <td className="px-4 py-3.5 text-center"><span className="text-indigo-400 font-semibold">{emp.stats.inProgress}</span></td>
                          <td className="px-4 py-3.5 text-center"><span className="text-slate-400 font-semibold">{emp.stats.pending}</span></td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`font-semibold ${emp.stats.overdue > 0 ? "text-red-400" : "text-slate-600"}`}>
                              {emp.stats.overdue}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-teal-500" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-[10px] text-slate-500 w-7">{pct}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button onClick={(e) => { e.stopPropagation(); setDrawerEmpId(emp.id); }}
                              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition">
                              View →
                            </button>
                          </td>
                        </tr>
                      );
                    })
                }
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && (
          <p className="text-xs text-slate-600">{filtered.length} of {employees.length} employees shown</p>
        )}
      </div>

      {showAdd && <AddEmployeeModal onClose={() => setShowAdd(false)} onCreated={handleCreated} />}
      {drawerEmpId && (
        <EmployeeDrawer
          employeeId={drawerEmpId}
          onClose={() => setDrawerEmpId(null)}
          onStatusChange={handleStatusChange}
          onEmployeeUpdated={handleEmployeeUpdated}
        />
      )}
    </>
  );
}
