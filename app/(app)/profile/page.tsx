"use client";

import React, { useState, useCallback } from "react";
import profileData from "./profile.json";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Skill        { name: string; level: number; courses: number; }
interface Certificate  { id: string; title: string; issuedDate: string; issuer: string; }
interface Badge        { id: string; icon: string; title: string; description: string; earned: boolean; }
interface CourseEntry  { id: number; title: string; category: string; completedDate: string | null; score: number | null; status: string; }
interface Preferences  { emailNotifications: boolean; weeklyDigest: boolean; courseReminders: boolean; learningGoalHours: number; }

// ─── Constants ────────────────────────────────────────────────────────────────

const categoryColor: Record<string, string> = {
  Frontend:     "bg-teal-100 text-teal-700",
  Backend:      "bg-blue-100 text-blue-700",
  DevOps:       "bg-purple-100 text-purple-700",
  Cloud:        "bg-sky-100 text-sky-700",
  Analytics:    "bg-orange-100 text-orange-700",
  "Data Science":"bg-pink-100 text-pink-700",
  "Soft Skills": "bg-green-100 text-green-700",
};

const categoryBar: Record<string, string> = {
  Frontend:     "bg-teal-500",
  Backend:      "bg-blue-500",
  DevOps:       "bg-purple-500",
  Cloud:        "bg-sky-500",
  Analytics:    "bg-orange-500",
  "Data Science":"bg-pink-500",
  "Soft Skills": "bg-green-500",
};

const heatmapColor = (v: number) => {
  if (v === 0) return "bg-teal-100";
  if (v === 1) return "bg-teal-200";
  if (v === 2) return "bg-teal-300";
  if (v === 3) return "bg-teal-400";
  return "bg-teal-600";
};

const days  = ["M","T","W","T","F","S","S"];
const months = ["Nov","Dec","Jan","Feb","Mar","Apr"];

// ─── Toggle Switch ─────────────────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      className={`relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-1 ${
        on ? "bg-teal-600" : "bg-slate-200"
      }`}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
        on ? "translate-x-4" : "translate-x-0.5"
      }`} />
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, skills, certificates, badges, courseHistory, activityHeatmap } = profileData;

  const [editOpen,  setEditOpen]  = useState(false);
  const [bio,       setBio]       = useState(user.bio);
  const [goalHours, setGoalHours] = useState(profileData.preferences.learningGoalHours);
  const [prefs,     setPrefs]     = useState<Preferences>(profileData.preferences);
  const [saved,     setSaved]     = useState(false);

  const handleSave = useCallback(() => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setEditOpen(false);
  }, []);

  const togglePref = useCallback((key: keyof Omit<Preferences, "learningGoalHours">) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }, []);

  const completedCourses = courseHistory.filter((c) => c.status === "completed");
  const inProgressCourses = courseHistory.filter((c) => c.status === "in_progress");

  const joinedFormatted = new Date(user.joinedDate).toLocaleDateString("en-US", {
    month: "long", year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/40 pb-16">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white rounded-2xl px-6 py-5 flex items-center justify-between shadow-sm">

          {/* Left: Avatar + name + meta */}
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-white text-xl font-bold shrink-0`}>
              {user.initials}
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">{user.name}</h1>
              <p className="text-sm text-teal-100">{user.role} · {user.department}</p>
              <div className="flex items-center gap-3 mt-1 text-[10px] text-teal-200 flex-wrap">
                <span>📍 {user.location}</span>
                <span>📧 {user.email}</span>
                <span>🗓 Joined {joinedFormatted}</span>
              </div>
            </div>
          </div>

          {/* Right: streak + edit */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full text-[11px] font-medium text-white">
              🔥 {user.streak}-day streak
            </div>
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1.5 bg-white text-teal-700 hover:bg-teal-50 text-[11px] font-semibold px-3 py-1.5 rounded-full transition shadow-sm"
            >
              ✏️ Edit profile
            </button>
          </div>

        </div>

        {/* Bio just below the card */}
        
        {/* {bio && (
          <p className="text-xs text-teal-600 mt-3 px-1 max-w-xl leading-relaxed">{bio}</p>
        )} */}
      </div>

      {/* ── Body grid ────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 pt-5 grid grid-cols-3 gap-5">

        {/* ── Left column ─────────────────────────────────────────────────────── */}
        <div className="col-span-1 flex flex-col gap-5">

          {/* Quick stats - compact, non-redundant with dashboard */}
          <div className="bg-white rounded-2xl p-4 border border-teal-100 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-3">All-time summary</p>
            <div className="space-y-2.5">
              {[
                { icon: "🎓", label: "Courses completed", value: user.totalCoursesCompleted },
                { icon: "⏱",  label: "Hours learned",     value: `${user.totalHoursLearned}h` },
                { icon: "📜", label: "Certificates",      value: user.totalCertificates },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs text-teal-700">
                    <span>{icon}</span>{label}
                  </span>
                  <span className="text-sm font-bold text-teal-900">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills progress */}
          <div className="bg-white rounded-2xl p-4 border border-teal-100 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-3">Skills</p>
            <div className="space-y-3">
              {(skills as Skill[]).map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-teal-800">{skill.name}</span>
                    <span className="text-[10px] text-teal-400">{skill.level}% · {skill.courses} courses</span>
                  </div>
                  <div className="h-1.5 bg-teal-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${categoryBar[skill.name] ?? "bg-teal-500"}`}
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="bg-white rounded-2xl p-4 border border-teal-100 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-3">Badges</p>
            <div className="grid grid-cols-3 gap-2">
              {(badges as Badge[]).map((badge) => (
                <div
                  key={badge.id}
                  title={badge.description}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl text-center transition ${
                    badge.earned
                      ? "bg-teal-50 border border-teal-200"
                      : "bg-slate-50 border border-slate-100 opacity-40 grayscale"
                  }`}
                >
                  <span className="text-xl">{badge.icon}</span>
                  <p className="text-[9px] font-semibold text-teal-800 leading-tight">{badge.title}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── Right column ────────────────────────────────────────────────────── */}
        <div className="col-span-2 flex flex-col gap-5">

          {/* Activity heatmap */}
          <div className="bg-white rounded-2xl p-5 border border-teal-100 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400">Learning activity</p>
              <p className="text-[10px] text-teal-400">Last 16 weeks</p>
            </div>

            <div className="overflow-x-auto">
              <div style={{ width: "fit-content" }}>
                {/* Month labels */}
                <div className="flex mb-1" style={{ paddingLeft: "20px" }}>
                  {months.map((m, i) => (
                    <div
                      key={i}
                      className="text-[9px] text-teal-400 font-medium"
                      style={{ width: `${Math.ceil(activityHeatmap.weeks.length / months.length) * 17}px` }}
                    >
                      {m}
                    </div>
                  ))}
                </div>

                <div className="flex gap-0">
                  {/* Day labels */}
                  <div className="flex flex-col gap-[3px] mr-1 mt-0.5">
                    {days.map((d, i) => (
                      <div
                        key={i}
                        className="text-[9px] text-teal-400 text-right leading-none flex items-center justify-end"
                        style={{ width: "14px", height: "14px" }}
                      >
                        {i % 2 === 0 ? d : ""}
                      </div>
                    ))}
                  </div>

                  {/* Grid — fixed 14×14 cells */}
                  <div className="flex gap-[3px]">
                    {activityHeatmap.weeks.map((week, wi) => (
                      <div key={wi} className="flex flex-col gap-[3px]">
                        {week.map((val, di) => (
                          <div
                            key={di}
                            title={`${val} lesson${val !== 1 ? "s" : ""}`}
                            className={`rounded-sm ${heatmapColor(val)}`}
                            style={{ width: "14px", height: "14px", flexShrink: 0 }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-1.5 mt-3 justify-end">
              <span className="text-[9px] text-teal-400">Less</span>
              {[0, 1, 2, 3, 4].map((v) => (
                <div key={v} className={`rounded-sm ${heatmapColor(v)}`} style={{ width: "12px", height: "12px" }} />
              ))}
              <span className="text-[9px] text-teal-400">More</span>
            </div>
          </div>

          {/* Certificates */}
          <div className="bg-white rounded-2xl p-5 border border-teal-100 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-3">
              Certificates earned
              <span className="ml-2 bg-teal-100 text-teal-600 px-1.5 py-0.5 rounded-full text-[9px]">
                {certificates.length}
              </span>
            </p>
            <div className="space-y-2">
              {(certificates as Certificate[]).map((cert) => (
                <div key={cert.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-teal-50/60 hover:bg-teal-50 transition group">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-400 flex items-center justify-center text-base shadow-sm shrink-0">
                    🏆
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-teal-900 truncate">{cert.title}</p>
                    <p className="text-[10px] text-teal-400">
                      {cert.issuer} · {new Date(cert.issuedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <button className="text-[10px] font-semibold text-teal-600 hover:text-teal-700 opacity-0 group-hover:opacity-100 transition shrink-0">
                    Download ↓
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Course history */}
          <div className="bg-white rounded-2xl p-5 border border-teal-100 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-3">Learning history</p>

            {/* Completed */}
            <p className="text-[10px] font-semibold text-teal-500 mb-2">
              Completed <span className="text-teal-400 font-normal">({completedCourses.length})</span>
            </p>
            <div className="space-y-1.5 mb-4">
              {completedCourses.map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-teal-50 transition">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                  <span className="text-xs font-medium text-teal-900 flex-1 truncate">{c.title}</span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${categoryColor[c.category] ?? "bg-teal-100 text-teal-700"}`}>
                    {c.category}
                  </span>
                  {c.score !== null && (
                    <span className="text-[10px] font-bold text-teal-600 w-10 text-right">{c.score}%</span>
                  )}
                  {c.completedDate && (
                    <span className="text-[10px] text-teal-400 shrink-0">
                      {new Date(c.completedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* In progress */}
            <p className="text-[10px] font-semibold text-teal-500 mb-2">
              In progress <span className="text-teal-400 font-normal">({inProgressCourses.length})</span>
            </p>
            <div className="space-y-1.5">
              {inProgressCourses.map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-teal-50 transition">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-xs font-medium text-teal-800 flex-1 truncate">{c.title}</span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${categoryColor[c.category] ?? "bg-teal-100 text-teal-700"}`}>
                    {c.category}
                  </span>
                  <span className="text-[10px] text-amber-500 font-medium shrink-0">In progress</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Edit profile panel (slide-over) ──────────────────────────────────── */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/30 backdrop-blur-sm"
            onClick={() => setEditOpen(false)}
          />
          {/* Panel */}
          <div className="w-96 bg-white h-full shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-teal-100 flex justify-between items-center bg-teal-700 text-white">
              <h2 className="text-sm font-semibold">Edit profile</h2>
              <button onClick={() => setEditOpen(false)} className="text-teal-200 hover:text-white transition text-lg leading-none">✕</button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">

              {/* Bio */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-teal-400 block mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  maxLength={200}
                  className="w-full text-xs text-teal-900 bg-teal-50 border border-teal-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-200 transition"
                  placeholder="Write a short bio…"
                />
                <p className="text-[10px] text-teal-400 mt-1 text-right">{bio.length}/200</p>
              </div>

              {/* Learning goal */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-teal-400 block mb-2">
                  Weekly learning goal
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1} max={20} value={goalHours}
                    onChange={(e) => setGoalHours(Number(e.target.value))}
                    className="flex-1 accent-teal-600"
                  />
                  <span className="text-sm font-bold text-teal-900 w-12 text-right">{goalHours}h/wk</span>
                </div>
              </div>

              {/* Notification preferences */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-teal-400 block mb-3">
                  Notifications
                </label>
                <div className="space-y-3">
                  {([
                    { key: "emailNotifications", label: "Email notifications",  sub: "Get updates via email" },
                    { key: "weeklyDigest",        label: "Weekly digest",        sub: "Summary every Monday" },
                    { key: "courseReminders",     label: "Course reminders",     sub: "Nudges for due courses" },
                  ] as { key: keyof Omit<Preferences,"learningGoalHours">; label: string; sub: string }[]).map(({ key, label, sub }) => (
                    <div key={key} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-teal-900">{label}</p>
                        <p className="text-[10px] text-teal-400">{sub}</p>
                      </div>
                      <Toggle on={prefs[key]} onToggle={() => togglePref(key)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Account info (read-only) */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-teal-400 block mb-2">
                  Account
                </label>
                <div className="space-y-2">
                  {[
                    { label: "Email",      value: user.email },
                    { label: "Department", value: user.department },
                    { label: "Role",       value: user.role },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center py-1.5 border-b border-teal-50">
                      <span className="text-[10px] text-teal-400">{label}</span>
                      <span className="text-xs text-teal-700 font-medium">{value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-teal-400 mt-2">Contact HR to update account details.</p>
              </div>

            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-teal-100 flex gap-2">
              <button
                onClick={() => setEditOpen(false)}
                className="flex-1 text-xs font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 py-2.5 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 py-2.5 rounded-xl transition shadow-sm"
              >
                {saved ? "Saved ✓" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}