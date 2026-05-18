"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";


// import Overview      from "./components/admin/Overview";
import Employees     from "./employee/employee";
import Courses       from "./courses/course";
import AssignmentList from "./assignments/assignmentList";
// import Reports       from "./components/Reports";
import Settings      from "./components/setting";
// import Notifications from "./components/notification";

import { Overview, Reports, Notifications } from "./components/notification";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "overview" | "assignments" | "employees" | "courses" | "reports" | "settings" | "notifications";

// ─── Nav config ───────────────────────────────────────────────────────────────

const navItems: { icon: string; label: string; tab: Tab; badge?: string }[] = [
  { icon: "▦",  label: "Overview",      tab: "overview"       },
  { icon: "📋", label: "Assignments",   tab: "assignments"   },
  { icon: "👥", label: "Employees",     tab: "employees"      },
  { icon: "📚", label: "Courses",       tab: "courses"        },
  { icon: "📈", label: "Reports",       tab: "reports"        },
  { icon: "⚙️", label: "Settings",      tab: "settings"       },
  { icon: "🔔", label: "Notifications", tab: "notifications"  },
];

const tabSubtitles: Record<Tab, string> = {
  overview:      "Platform health at a glance",
  assignments:   "Track and manage all course assignments",
  employees:     "Manage employee learning progress",
  courses:       "Manage your course catalogue",
  reports:       "Analytics & department insights",
  settings:      "Categories, providers & system config",
  notifications: "Send announcements to employees",
};



export default function AdminPage() {
  const [activeTab, setActiveTab]             = useState<Tab>("overview");
  const [profileOpen, setProfileOpen]         = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed]   = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  const user = session?.user;

  const fullName = user?.name?.trim() || "User";
  const initials = fullName .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";


  // Close profile dropdown on outside click
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [profileOpen]);

  const handleLogout = useCallback(() => {
    setShowLogoutConfirm(false);
    signOut({ callbackUrl: "/login", redirect: true });
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-950 text-white">

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside
        className={`shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? "w-16" : "w-60"
        }`}
      >
        {/* Logo */}
        <div className={`border-b border-slate-800 flex items-center justify-between ${sidebarCollapsed ? "px-3 py-5" : "px-6 py-5"}`}>
          {!sidebarCollapsed && (
            <div>
              <span className="text-xl font-bold tracking-tight">
                Task<span className="text-indigo-400">Forge</span>
              </span>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium uppercase tracking-widest">
                Admin Console
              </p>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed((v) => !v)}
            className="text-slate-500 hover:text-white transition p-1 rounded-lg hover:bg-slate-800"
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? "→" : "←"}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5">
          {navItems.map(({ icon, label, tab, badge }) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                title={sidebarCollapsed ? label : undefined}
                className={`flex items-center gap-3 w-full rounded-xl text-sm font-medium transition-all
                  ${sidebarCollapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2.5"}
                  ${isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
              >
                <span className="text-base w-5 text-center shrink-0">{icon}</span>
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left">{label}</span>
                    {badge && (
                      <span className="text-[9px] font-bold uppercase tracking-widest bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded-md">
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Admin badge */}
        <div className={`border-t border-slate-800 ${sidebarCollapsed ? "px-2 py-4" : "px-4 py-4"}`}>
          {sidebarCollapsed ? (
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold mx-auto">
              {initials}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white">{fullName}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto min-w-0">

        {/* Top header */}
        <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold capitalize">
              {navItems.find((n) => n.tab === activeTab)?.label}
            </h2>
            <p className="text-xs text-slate-500">{tabSubtitles[activeTab]}</p>
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
              {initials}
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-700">
                  <p className="text-xs font-semibold text-white">{fullName}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{user?.email}</p>
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
          {activeTab === "overview"      && <Overview      />}
          {activeTab === "assignments"   && <AssignmentList   />}
          {activeTab === "employees"     && <Employees     />}
          {activeTab === "courses"       && <Courses       />}
          {activeTab === "reports"       && <Reports       />}
          {activeTab === "settings"      && <Settings      />}
          {activeTab === "notifications" && <Notifications />}
        </div>
      </main>

      {/* ── Logout modal ─────────────────────────────────────────────────────── */}
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
                <p className="text-[11px] text-slate-400 mt-0.5">
                  You'll be redirected to the login page.
                </p>
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