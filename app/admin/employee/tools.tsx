// components/employees/EmployeesToolbar.tsx

"use client";

interface EmployeesToolbarProps {
  search: string;
  setSearch: (v: string) => void;

  sortBy: "name" | "completed" | "pending" | "overdue";
  setSortBy: (
    v: "name" | "completed" | "pending" | "overdue"
  ) => void;

  filterStatus: "all" | "Active" | "Inactive" | "Resigned";
  setFilterStatus: (
    v: "all" | "Active" | "Inactive" | "Resigned"
  ) => void;

  onAddEmployee: () => void;
}

export function EmployeesToolbar({
  search,
  setSearch,
  sortBy,
  setSortBy,
  filterStatus,
  setFilterStatus,
  onAddEmployee,
}: EmployeesToolbarProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">

      {/* Search */}
      <div className="relative min-w-[220px] max-w-xs flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
          🔍
        </span>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, code…"
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 pl-9 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
        />
      </div>

      {/* Filter */}
      <div className="flex items-center gap-1.5">
        {(["all", "Active", "Inactive", "Resigned"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`text-xs px-3 py-1.5 rounded-lg transition ${
              filterStatus === s
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-slate-500">Sort:</span>

        {(["name", "completed", "pending", "overdue"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className={`text-xs px-3 py-1.5 rounded-lg capitalize transition ${
              sortBy === s
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Add */}
      <button
        onClick={onAddEmployee}
        className="ml-auto flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition"
      >
        + Add employee
      </button>
    </div>
  );
}