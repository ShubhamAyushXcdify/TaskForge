"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";   // ← Added this
import adminData from "./data.json";
import usersData from "@/data/user.json";
import courseJsonData from "@/data/course.json";

// ─── Types matching your JSON ─────────────────────────────────────────────────

interface User {
  id: number;
  name: string;
  completed: number;
  inProgress: number;
  pending: number;
  totalCourses: number;
}

interface Course {
  id: number;
  title: string;
  category: string;
  duration: string;
  level: string;
  progress: number;
  hoursSpent: number;
  totalHours: number;
  completed: boolean;
  dueDate: string;
}

type Tab = "overview" | "employees" | "courses" | "reports" | "notifications";

// ─── Data ─────────────────────────────────────────────────────────────────────

const users: User[] = Array.isArray(usersData) ? usersData : [];
const courses: Course[] = Array.isArray((courseJsonData as any).courses)
  ? (courseJsonData as any).courses
  : [];

// ─── Constants ────────────────────────────────────────────────────────────────

const navItems: { icon: string; label: string; tab: Tab }[] = [
  { icon: "▦",  label: "Overview",      tab: "overview"      },
  { icon: "👥", label: "Employees",     tab: "employees"     },
  { icon: "📚", label: "Courses",       tab: "courses"       },
  { icon: "📈", label: "Reports",       tab: "reports"       },
  { icon: "🔔", label: "Notifications", tab: "notifications" },
];

const categoryColor: Record<string, string> = {
  Frontend:     "bg-teal-900/60 text-teal-300",
  Backend:      "bg-blue-900/60 text-blue-300",
  Cloud:        "bg-sky-900/60 text-sky-300",
  DevOps:       "bg-purple-900/60 text-purple-300",
  "Soft Skills":"bg-green-900/60 text-green-300",
  Analytics:    "bg-orange-900/60 text-orange-300",
};

const activityDot: Record<string, string> = {
  completed: "bg-teal-400",
  enrolled:  "bg-indigo-400",
  quiz:      "bg-amber-400",
  cert:      "bg-yellow-400",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [activeTab, setActiveTab]       = useState<Tab>("overview");
  const [profileOpen, setProfileOpen]   = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [profileOpen]);

  // Updated Logout Handler using NextAuth
  const handleLogout = useCallback(() => {
    setShowLogoutConfirm(false);

    signOut({
      callbackUrl: "/login",
      redirect: true,
    });
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-950 text-white">

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside className="w-60 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-800">
          <span className="text-xl font-bold tracking-tight">
            Task<span className="text-indigo-400">Forge</span>
          </span>
          <p className="text-[10px] text-slate-500 mt-0.5 font-medium uppercase tracking-widest">Admin Console</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ icon, label, tab }) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <span className="text-base w-5 text-center">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        {/* Admin badge */}
        <div className="px-4 py-4 border-t border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">AD</div>
            <div>
              <p className="text-xs font-semibold text-white">Admin</p>
              <p className="text-[10px] text-slate-500">admin@company.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">

        {/* Top header */}
        <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold capitalize">{activeTab}</h2>
            <p className="text-xs text-slate-500">
              {activeTab === "overview"      && "Platform health at a glance"}
              {activeTab === "employees"     && "Manage employee learning progress"}
              {activeTab === "courses"       && "Manage course catalogue"}
              {activeTab === "reports"       && "Analytics & department insights"}
              {activeTab === "notifications" && "Send announcements to employees"}
            </p>
          </div>

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((v) => !v)}
              aria-label="Admin profile"
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                profileOpen
                  ? "bg-indigo-500 text-white ring-2 ring-indigo-400"
                  : "bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50"
              }`}
            >
              AD
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-700">
                  <p className="text-xs font-semibold text-white">Admin</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">admin@company.com</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { setProfileOpen(false); setActiveTab("overview"); }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition"
                  >
                    <span>⚙️</span>
                    <span>Settings</span>
                  </button>
                </div>
                <div className="border-t border-slate-700 py-1">
                  <button
                    onClick={() => { setProfileOpen(false); setShowLogoutConfirm(true); }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-950/50 hover:text-red-300 transition"
                  >
                    <span>🚪</span>
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab content */}
        <div className="p-8">
          {activeTab === "overview"      && <Overview />}
          {activeTab === "employees"     && <Employees />}
          {activeTab === "courses"       && <Courses />}
          {activeTab === "reports"       && <Reports />}
          {activeTab === "notifications" && <Notifications />}
        </div>
      </main>

      {/* ── Logout confirmation modal ───────────────────────────────────────── */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 w-80 z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-xl shrink-0">
                🚪
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Log out?</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">You'll be redirected to the login page.</p>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 py-2.5 rounded-xl transition"
              >
                Yes, log out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────

function Overview() {
  const { stats, recentActivity, departmentProgress } = adminData;

  return (
    <div className="space-y-7">

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Employees", value: stats.totalUsers,        sub: `${stats.activeUsers} active`,           accent: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
          { label: "Active Courses",  value: stats.activeCourses,     sub: "across all depts",                      accent: "text-teal-400",   bg: "bg-teal-500/10 border-teal-500/20"     },
          { label: "Completion Rate", value: `${stats.completionRate}%`, sub: "+4% vs last month",                  accent: "text-emerald-400",bg: "bg-emerald-500/10 border-emerald-500/20"},
          { label: "Avg Quiz Score",  value: `${stats.avgScore}%`,    sub: `${stats.certificatesIssued} certs issued`, accent: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/20"   },
        ].map(({ label, value, sub, accent, bg }) => (
          <div key={label} className={`rounded-2xl p-5 border ${bg}`}>
            <p className="text-xs text-slate-400 font-medium mb-3">{label}</p>
            <p className={`text-3xl font-bold ${accent}`}>{value}</p>
            <p className="text-[11px] text-slate-500 mt-1.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">

        {/* Course completion by category */}
        <div className="col-span-1 bg-slate-900 rounded-2xl border border-slate-800 p-5">
          <p className="text-xs font-semibold text-slate-300 mb-1">Completion by category</p>
          <p className="text-[10px] text-slate-500 mb-4">Based on assigned courses</p>
          <div className="space-y-3">
            {(() => {
              // Group courses by category and compute completion rate
              const map: Record<string, { total: number; done: number }> = {};
              courses.forEach((c) => {
                if (!map[c.category]) map[c.category] = { total: 0, done: 0 };
                map[c.category].total += 1;
                if (c.completed) map[c.category].done += 1;
              });
              return Object.entries(map).map(([cat, { total, done }]) => {
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between items-center text-[11px] mb-1">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${categoryColor[cat] ?? "bg-slate-700 text-slate-300"}`}>{cat}</span>
                      <span className="text-slate-400">{done}/{total} · <span className="text-white font-semibold">{pct}%</span></span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-teal-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Dept progress */}
        <div className="col-span-1 bg-slate-900 rounded-2xl border border-slate-800 p-5">
          <p className="text-xs font-semibold text-slate-300 mb-1">Department completion</p>
          <p className="text-[10px] text-slate-500 mb-4">% of courses completed</p>
          <div className="space-y-3">
            {departmentProgress.map((d) => (
              <div key={d.dept}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-300">{d.dept}</span>
                  <span className="text-slate-500">{d.completion}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-teal-500"
                    style={{ width: `${d.completion}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="col-span-1 bg-slate-900 rounded-2xl border border-slate-800 p-5">
          <p className="text-xs font-semibold text-slate-300 mb-1">Recent activity</p>
          <p className="text-[10px] text-slate-500 mb-4">Live platform events</p>
          <div className="space-y-3">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex gap-2.5">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${activityDot[a.type] ?? "bg-slate-500"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-200 leading-snug">
                    <span className="font-medium">{a.user}</span> {a.action}{" "}
                    <span className="text-slate-400 italic">{a.course}</span>
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending attention */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-amber-400 text-lg">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-300">{stats.pendingTasks} employees have overdue courses</p>
            <p className="text-[11px] text-amber-500/70 mt-0.5">Send a reminder or view details</p>
          </div>
        </div>
        <button className="text-xs font-semibold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 px-4 py-1.5 rounded-lg transition">
          View employees →
        </button>
      </div>

    </div>
  );
}

// ─── Employees ────────────────────────────────────────────────────────────────

// ─── Employees ────────────────────────────────────────────────────────────────

function Employees() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "completed" | "pending">("name");

  const filtered = useMemo(() => {
    return users
      .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === "completed") return b.completed - a.completed;
        if (sortBy === "pending")   return b.pending - a.pending;
        return a.name.localeCompare(b.name);
      });
  }, [search, sortBy]);

  return (
    <div className="space-y-5">

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees…"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 pl-9 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          <span className="absolute left-3 top-2.5 text-slate-500 text-sm">🔍</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Sort:</span>
          {(["name","completed","pending"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`text-xs px-3 py-1.5 rounded-lg transition capitalize ${
                sortBy === s ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition">
          + Add employee
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-800/50">
              <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">Employee</th>
              <th className="text-center px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">Completed</th>
              <th className="text-center px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">In Progress</th>
              <th className="text-center px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">Pending</th>
              <th className="text-center px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">Total</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">Progress</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.map((emp) => {
              const pct = emp.totalCourses > 0
                ? Math.round((emp.completed / emp.totalCourses) * 100)
                : 0;
              return (
                <tr key={emp.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0">
                        {emp.name.split(" ").map((n: string) => n[0]).join("")}
                      </div>
                      <span className="font-medium text-white text-sm">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="text-teal-400 font-semibold">{emp.completed}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="text-indigo-400 font-semibold">{emp.inProgress}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`font-semibold ${emp.pending > 3 ? "text-red-400" : "text-slate-400"}`}>
                      {emp.pending}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="text-slate-400">{emp.totalCourses}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-teal-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500">{pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition">View →</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-600">{filtered.length} of {users.length} employees shown</p>
    </div>
  );
}

// ─── Course assignment dummy data ─────────────────────────────────────────────
// Replace with real API data when available

const courseAssignments: Record<number, { assigned: number; completed: number; pending: number }> = {
  1:  { assigned: 32, completed: 14, pending: 18 },
  2:  { assigned: 28, completed: 10, pending: 18 },
  3:  { assigned: 25, completed: 18, pending: 7  },
  4:  { assigned: 40, completed: 31, pending: 9  },
  5:  { assigned: 22, completed: 8,  pending: 14 },
  6:  { assigned: 18, completed: 15, pending: 3  },
  7:  { assigned: 30, completed: 5,  pending: 25 },
  8:  { assigned: 15, completed: 12, pending: 3  },
  9:  { assigned: 20, completed: 9,  pending: 11 },
  10: { assigned: 12, completed: 3,  pending: 9  },
  11: { assigned: 35, completed: 20, pending: 15 },
  12: { assigned: 24, completed: 14, pending: 10 },
};

// ─── Courses ──────────────────────────────────────────────────────────────────

function Courses() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() =>
    courses.filter((c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
    ),
    [search]
  );

  const levelBadge: Record<string, string> = {
    Beginner:     "bg-emerald-900/50 text-emerald-400",
    Intermediate: "bg-amber-900/50 text-amber-400",
    Advanced:     "bg-rose-900/50 text-rose-400",
  };

  return (
    <div className="space-y-5">

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses…"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 pl-9 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          <span className="absolute left-3 top-2.5 text-slate-500 text-sm">🔍</span>
        </div>
        <p className="text-xs text-slate-500">{filtered.length} courses</p>
        <button className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition">
          + Add course
        </button>
      </div>

      {/* Course cards */}
      <div className="grid grid-cols-3 gap-4">
        {filtered.map((course) => {
          const assign = courseAssignments[course.id] ?? { assigned: 0, completed: 0, pending: 0 };
          const completionPct = assign.assigned > 0
            ? Math.round((assign.completed / assign.assigned) * 100)
            : 0;

          return (
            <div key={course.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-5 hover:border-slate-700 transition-all group flex flex-col gap-3">

              {/* Top row — category + level */}
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${categoryColor[course.category] ?? "bg-slate-700 text-slate-300"}`}>
                  {course.category}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${levelBadge[course.level] ?? "bg-slate-700 text-slate-300"}`}>
                  {course.level}
                </span>
              </div>

              {/* Title + duration */}
              <div>
                <h4 className="text-sm font-semibold text-white leading-snug">{course.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">⏱ {course.duration}</p>
              </div>

              {/* Assigned / Completed / Pending counts */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="bg-slate-800/60 rounded-xl p-2.5 text-center">
                  <p className="text-[9px] text-slate-500 uppercase tracking-wide mb-0.5">Assigned</p>
                  <p className="text-base font-bold text-white">{assign.assigned}</p>
                </div>
                <div className="bg-teal-900/30 rounded-xl p-2.5 text-center">
                  <p className="text-[9px] text-teal-600 uppercase tracking-wide mb-0.5">Completed</p>
                  <p className="text-base font-bold text-teal-400">{assign.completed}</p>
                </div>
                <div className={`rounded-xl p-2.5 text-center ${assign.pending > 10 ? "bg-red-900/20" : "bg-slate-800/60"}`}>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wide mb-0.5">Pending</p>
                  <p className={`text-base font-bold ${assign.pending > 10 ? "text-red-400" : "text-slate-300"}`}>{assign.pending}</p>
                </div>
              </div>

              {/* Completion bar */}
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-slate-600">Completion rate</span>
                  <span className="text-slate-400 font-medium">{completionPct}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full transition-all"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>

              {/* Actions — show on hover */}
              <div className="flex gap-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="flex-1 text-[11px] font-semibold text-indigo-300 bg-indigo-900/40 hover:bg-indigo-900/70 py-1.5 rounded-lg transition">
                  Edit
                </button>
                <button className="flex-1 text-[11px] font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 py-1.5 rounded-lg transition">
                  Assign
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-600">
          <p className="text-sm">No courses match your search.</p>
        </div>
      )}
    </div>
  );
}

// ─── Reports ──────────────────────────────────────────────────────────────────

function Reports() {
  const { stats, departmentProgress } = adminData;

  const topDept  = [...departmentProgress].sort((a, b) => b.completion - a.completion)[0];
  const lowDept  = [...departmentProgress].sort((a, b) => a.completion - b.completion)[0];
  const maxComp  = Math.max(...departmentProgress.map((d) => d.completion));

  return (
    <div className="space-y-6">

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total hours logged",  value: stats.totalHoursLogged.toLocaleString() + "h", icon: "⏱" },
          { label: "Certificates issued", value: stats.certificatesIssued,                       icon: "🏆" },
          { label: "Top department",      value: topDept.dept,                                   icon: "🥇" },
          { label: "Needs attention",     value: lowDept.dept,                                   icon: "⚠️" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-slate-900 rounded-2xl border border-slate-800 px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <span>{icon}</span>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">{label}</p>
            </div>
            <p className="text-xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Dept bar chart */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
          <p className="text-xs font-semibold text-slate-300 mb-1">Department completion rates</p>
          <p className="text-[10px] text-slate-500 mb-5">% of total assigned courses completed</p>
          <div className="space-y-3">
            {[...departmentProgress].sort((a, b) => b.completion - a.completion).map((d) => (
              <div key={d.dept} className="flex items-center gap-3">
                <span className="text-[11px] text-slate-400 w-24 shrink-0">{d.dept}</span>
                <div className="flex-1 h-5 bg-slate-800 rounded-md overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-teal-500 rounded-md flex items-center justify-end pr-2 transition-all"
                    style={{ width: `${(d.completion / maxComp) * 100}%` }}
                  >
                    <span className="text-[9px] font-bold text-white">{d.completion}%</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-600 w-12 text-right">{d.users} users</span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary stats */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
          <p className="text-xs font-semibold text-slate-300 mb-1">Platform summary</p>
          <p className="text-[10px] text-slate-500 mb-5">All-time metrics</p>
          <div className="space-y-4">
            {[
              { label: "Overall completion rate", value: stats.completionRate, max: 100, color: "from-teal-600 to-teal-400" },
              { label: "Average quiz score",       value: stats.avgScore,       max: 100, color: "from-indigo-600 to-indigo-400" },
              { label: "Active user rate",         value: Math.round((stats.activeUsers / stats.totalUsers) * 100), max: 100, color: "from-purple-600 to-purple-400" },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">{label}</span>
                  <span className="font-bold text-white">{value}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button className="w-full text-xs font-semibold text-indigo-300 bg-indigo-900/40 hover:bg-indigo-900/70 py-2.5 rounded-xl transition">
              Export full report →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Notifications ────────────────────────────────────────────────────────────

function Notifications() {
  const [title,   setTitle]   = useState("");
  const [message, setMessage] = useState("");
  const [target,  setTarget]  = useState("all");
  const [sent,    setSent]    = useState(false);

  const handleSend = useCallback(() => {
    if (!title.trim() || !message.trim()) return;
    setSent(true);
    setTitle("");
    setMessage("");
    setTimeout(() => setSent(false), 3000);
  }, [title, message]);

  return (
    <div className="grid grid-cols-2 gap-6">

      {/* Compose */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
        <div>
          <p className="text-xs font-semibold text-slate-300 mb-1">Compose announcement</p>
          <p className="text-[10px] text-slate-500">Sends as an in-app notification to selected employees</p>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1.5">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Compliance deadline reminder"
            className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1.5">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Write your message…"
            className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none resize-none transition"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1.5">Send to</label>
          <div className="flex gap-2 flex-wrap">
            {["all","engineering","design","marketing","operations"].map((t) => (
              <button
                key={t}
                onClick={() => setTarget(t)}
                className={`text-xs px-3 py-1.5 rounded-lg capitalize transition ${
                  target === t ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {t === "all" ? "All employees" : t}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSend}
          disabled={!title.trim() || !message.trim()}
          className="w-full text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-2.5 rounded-xl transition"
        >
          {sent ? "✓ Sent!" : "Send notification"}
        </button>
      </div>

      {/* History */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
        <p className="text-xs font-semibold text-slate-300 mb-1">Past announcements</p>
        <p className="text-[10px] text-slate-500 mb-5">Previously sent notifications</p>
        <div className="space-y-3">
          {adminData.notifications.map((n) => (
            <div key={n.id} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <div className="flex justify-between items-start mb-1.5">
                <p className="text-sm font-semibold text-white">{n.title}</p>
                <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                  {new Date(n.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
              <p className="text-[10px] text-slate-600 mt-2">Reached {n.reach} employees</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}