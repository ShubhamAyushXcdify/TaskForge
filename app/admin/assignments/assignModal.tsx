"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useApiFetch } from "./apiFetch";
import { Assignment, CourseOption, Employee } from "./types";
import { mapCourse, mapEmployee } from "./mappers";
import { initials2 } from "./utils";
interface AssignModalProps {
  onClose: () => void;
  onAssigned: (assignments: Assignment[]) => void;
}

export default function AssignModal({ onClose, onAssigned }: AssignModalProps) {
  const apiFetch = useApiFetch();

  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [empSearch, setEmpSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ course?: string; employees?: string }>({});

  useEffect(() => {
    setLoadingData(true);
    
    // apiFetch<any>("/api/admin/employees").then((response) => {
    //   const list = response.success ? response.employees : (response.data ?? response.data ?? response ?? []);
    //   const employeesList = Array.isArray(list) ? list.map(mapEmployee) : [];
    //   setEmployees(employeesList);
    //   toast.success(`Loaded ${employeesList.length} employees`);
    //   return employeesList;
    // }).catch(() => {
    //   toast.error("Failed to load employees");
    //   setEmployees([]);
    //   return [];

    apiFetch<any>("/api/admin/employees")
  .then((response) => {
    console.log("EMP RESPONSE:", response);

    const rawEmployees =
      response?.employees ||
      response?.data ||
      response?.Data ||
      [];

    const employeesList = Array.isArray(rawEmployees)
      ? rawEmployees.map(mapEmployee)
      : [];

    setEmployees(employeesList);

    toast.success(`Loaded ${employeesList.length} employees`);

    return employeesList;
  })
  .catch(() => {
    toast.error("Failed to load employees");
    setEmployees([]);
    return [];
    }).then(() => {
      return apiFetch<any>("/api/admin/courses");
    }).then((response) => {
      const list = response.Success ? response.Data : (response.data ?? response ?? []);
      const coursesList = Array.isArray(list) ? list.map(mapCourse) : [];
      setCourses(coursesList);
      toast.success(`Loaded ${coursesList.length} courses`);
    }).catch(() => {
      toast.error("Failed to load courses");
      setCourses([]);
    }).finally(() => {
      setLoadingData(false);
    });
  }, [apiFetch]);

  const filteredEmps = useMemo(() => {
    if (empSearch === "") return employees;
    const q = empSearch.toLowerCase();
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.code.toLowerCase().includes(q) ||
        (e.department ?? "").toLowerCase().includes(q)
    );
  }, [employees, empSearch]);

  const toggleEmployee = (id: string) =>
    setSelectedEmployees((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    );

  const selectAll = () => setSelectedEmployees(filteredEmps.map((e) => e.id));
  const clearAll = () => setSelectedEmployees([]);

  const validate = () => {
    const e: { course?: string; employees?: string } = {};
    if (!selectedCourseId) e.course = "Please select a course";
    if (selectedEmployees.length === 0) e.employees = "Select at least one employee";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await apiFetch<any>("/api/admin/assignments", {
        method: "POST",
        body: JSON.stringify({
          CourseId: selectedCourseId,
          EmployeeIds: selectedEmployees,
          DueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        }),
      });

      const course = courses.find((c) => c.id === selectedCourseId);
      const newAssignments: Assignment[] = selectedEmployees.map((empId) => {
        const emp = employees.find((e) => e.id === empId);
        return {
          assignmentId: `temp-${empId}-${selectedCourseId}`,
          courseId: selectedCourseId,
          courseTitle: course?.title ?? "—",
          courseCategory: course?.category ?? "—",
          courseDurationHours: course?.durationHours ?? 0,
          employeeId: empId,
          employeeName: emp?.name ?? "—",
          employeeCode: emp?.code ?? "",
          employeeDepartment: emp?.department ?? "—",
          status: "Assigned",
          progressPercentage: 0,
          dueDate: dueDate || null,
          startedAt: null,
          completedAt: null,
          lastAccessedAt: null,
        };
      });

      toast.success(`Assigned "${course?.title}" to ${selectedEmployees.length} employee${selectedEmployees.length > 1 ? "s" : ""}!`);
      onAssigned(newAssignments);
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to create assignments.");
    } finally {
      setLoading(false);
    }
  }, [selectedCourseId, selectedEmployees, dueDate, courses, employees, apiFetch, onAssigned, onClose]);

return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg z-10 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-white">Assign course</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {loadingData ? "Loading..." : `${courses.length} courses, ${employees.length} employees`}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl leading-none transition">×</button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Course picker */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              Course <span className="text-red-400">*</span>
            </label>
            {loadingData ? (
              <div className="h-10 bg-slate-800 rounded-xl animate-pulse" />
            ) : (
              <select
                value={selectedCourseId}
                onChange={(e) => { setSelectedCourseId(e.target.value); setErrors((x) => ({ ...x, course: "" })); }}
                className={`w-full bg-slate-800 border rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition appearance-none
                  ${errors.course ? "border-red-500" : "border-slate-700 focus:border-indigo-500"}`}
              >
                <option value="">Select a course…</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title} ({c.durationHours}h)</option>
                ))}
              </select>
            )}
            {errors.course && <p className="text-[10px] text-red-400 mt-1">{errors.course}</p>}
          </div>

          {/* Due date */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              Due date <span className="text-slate-600 normal-case">(optional)</span>
            </label>
            <input
              type="date"
              value={dueDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition"
            />
          </div>

          {/* Employee multi-select */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Employees <span className="text-red-400">*</span>
                {selectedEmployees.length > 0 && (
                  <span className="text-indigo-400 ml-1.5 normal-case font-normal">{selectedEmployees.length} selected</span>
                )}
              </label>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-[10px] text-indigo-400 hover:text-indigo-300 transition" disabled={loadingData || filteredEmps.length === 0}>
                  Select all
                </button>
                <button onClick={clearAll} className="text-[10px] text-slate-500 hover:text-slate-400 transition">
                  Clear
                </button>
              </div>
            </div>
            {errors.employees && <p className="text-[10px] text-red-400 mb-1">{errors.employees}</p>}

            <input
              value={empSearch}
              onChange={(e) => setEmpSearch(e.target.value)}
              placeholder="Search employees…"
              className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-600 outline-none transition mb-2"
              disabled={loadingData}
            />

            <div className={`border rounded-xl overflow-hidden ${errors.employees ? "border-red-500/50" : "border-slate-700/50"}`}>
              {loadingData ? (
                <div className="p-4 space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-9 bg-slate-800 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : filteredEmps.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  {empSearch ? "No employees found" : employees.length === 0 ? "No employees loaded" : "No employees available"}
                </p>
              ) : (
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-800/50">
                  {filteredEmps.map((emp) => {
                    const checked = selectedEmployees.includes(emp.id);
                    return (
                      <button
                        key={emp.id}
                        onClick={() => toggleEmployee(emp.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition
                          ${checked ? "bg-indigo-900/20" : "hover:bg-slate-800/50"}`}
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition
                          ${checked ? "bg-indigo-600 border-indigo-600" : "border-slate-600"}`}
                        >
                          {checked && (
                            <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 fill-white">
                              <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                            </svg>
                          )}
                        </div>
                        <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {initials2(emp.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate">{emp.name}</p>
                          <p className="text-[10px] text-slate-500">{emp.code}{emp.department && emp.department !== "—" ? ` · ${emp.department}` : ""}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl transition">
            Cancel
          </button>
          <button
            onClick={handleSubmit} 
            disabled={loading || loadingData}
            className="flex-1 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed py-2.5 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {loading ? "Assigning…" : `Assign${selectedEmployees.length > 0 ? ` (${selectedEmployees.length})` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}