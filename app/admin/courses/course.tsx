"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import { useApiFetch, mapCourse } from "./api";
import { Course } from "./types";
import SkeletonCard from "./skeletonCard";
import AddCourseModal from "./addCourseModal";
import EditCourseModal from "./editCourseModal";
import CourseDrawer from "./courseDrawer";
import { categoryColor, defaultCatColor } from "./utils";


export default function Courses() {
  const apiFetch = useApiFetch();

  const [courses,       setCourses]       = useState<Course[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [search,        setSearch]        = useState("");
  const [filterCat,     setFilterCat]     = useState("all");
  const [filterStatus,  setFilterStatus]  = useState<"all" | "active" | "inactive">("all");
  const [showAdd,       setShowAdd]       = useState(false);
  const [editCourse,    setEditCourse]    = useState<Course | null>(null);
  const [drawerCourseId, setDrawerCourseId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiFetch<any>("/api/admin/courses")
      .then((d) => {
        // API returns { Success, Data: [...] }
        const list: any[] = d.Data ?? d.data ?? d.courses ?? d ?? [];
        setCourses((Array.isArray(list) ? list : []).map(mapCourse));
      })
      .catch((err) => {
        setError(err.message);
        toast.error(err.message ?? "Failed to load courses.");
      })
      .finally(() => setLoading(false));
  }, [apiFetch]);

  const handleCreated = useCallback((c: Course) => setCourses((p) => [c, ...p]), []);
  const handleUpdated = useCallback((c: Course) => setCourses((p) => p.map((x) => x.id === c.id ? c : x)), []);
  const handleDeleted = useCallback((id: string) => setCourses((p) => p.filter((x) => x.id !== id)), []);

  const categories = useMemo(() => {
    const cats = new Set(courses.map((c) => c.category.name));
    return ["all", ...Array.from(cats).sort()];
  }, [courses]);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        c.title.toLowerCase().includes(q) ||
        c.category.name.toLowerCase().includes(q) ||
        c.provider.name.toLowerCase().includes(q);
      const matchCat    = filterCat === "all" || c.category.name === filterCat;
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "active"   &&  c.isActive) ||
        (filterStatus === "inactive" && !c.isActive);
      return matchSearch && matchCat && matchStatus;
    });
  }, [courses, search, filterCat, filterStatus]);

  return (
    <>
      <div className="space-y-5">

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative min-w-[220px] max-w-xs flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, category, provider…"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 pl-9 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat} onClick={() => setFilterCat(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg capitalize transition ${
                  filterCat === cat ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>

          {/* Active filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">Sort:</span>
            {(["all", "active", "inactive"] as const).map((s) => (
              <button
                key={s} onClick={() => setFilterStatus(s)}
                className={`text-xs px-3 py-1.5 rounded-lg capitalize transition ${
                  filterStatus === s ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            
            <p className="text-xs text-slate-500">{filtered.length} courses</p>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition"
            >
              + Add course
            </button>
          </div>
        </div>

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-950/30 border border-red-900/50 rounded-2xl p-6 text-center">
            <p className="text-sm text-red-300">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-3 text-xs text-red-400 underline">Retry</button>
          </div>
        )}

        {/* Grid */}
        {!error && (
          <div className="grid grid-cols-3 gap-4">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : filtered.length === 0
              ? (
                <div className="col-span-3 text-center py-16 text-slate-600 text-sm">
                  {courses.length === 0 ? "No courses yet. Add your first one." : "No courses match your search."}
                </div>
              )
              : filtered.map((course) => {
                  const catColor = categoryColor[course.category.name] ?? defaultCatColor;
                  return (
                    <div
                      key={course.id}
                      onClick={() => setDrawerCourseId(course.id)}
                      className="bg-slate-900 rounded-2xl border border-slate-800 p-5 hover:border-slate-700 transition-all group flex flex-col gap-3 cursor-pointer"
                    >
                      {/* Top badges */}
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catColor}`}>
                          {course.category.name}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          course.isActive ? "bg-emerald-900/40 text-emerald-400" : "bg-slate-800 text-slate-500"
                        }`}>
                          {course.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      {/* Title + meta */}
                      <div>
                        <h4 className="text-sm font-semibold text-white leading-snug">{course.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">⏱ {course.durationHours}h · {course.provider.name}</p>
                      </div>

                      {/* Stat boxes */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-slate-800/60 rounded-xl p-2.5 text-center">
                          <p className="text-[9px] text-slate-500 uppercase tracking-wide mb-0.5">Assigned</p>
                          <p className="text-base font-bold text-white">{course.stats.assigned}</p>
                        </div>
                        <div className="bg-teal-900/30 rounded-xl p-2.5 text-center">
                          <p className="text-[9px] text-teal-600 uppercase tracking-wide mb-0.5">Done</p>
                          <p className="text-base font-bold text-teal-400">{course.stats.completed}</p>
                        </div>
                        <div className={`rounded-xl p-2.5 text-center ${course.stats.pending > 10 ? "bg-red-900/20" : "bg-slate-800/60"}`}>
                          <p className="text-[9px] text-slate-500 uppercase tracking-wide mb-0.5">Pending</p>
                          <p className={`text-base font-bold ${course.stats.pending > 10 ? "text-red-400" : "text-slate-300"}`}>
                            {course.stats.pending}
                          </p>
                        </div>
                      </div>

                      {/* Completion bar */}
                      <div>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-slate-600">Completion</span>
                          <span className="text-slate-400 font-medium">{course.stats.completionRate.toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full"
                            style={{ width: `${course.stats.completionRate}%` }}
                          />
                        </div>
                      </div>

                      {/* Hover actions */}
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditCourse(course); }}
                          className="flex-1 text-[11px] font-semibold text-indigo-300 bg-indigo-900/40 hover:bg-indigo-900/70 py-1.5 rounded-lg transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDrawerCourseId(course.id); }}
                          className="flex-1 text-[11px] font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 py-1.5 rounded-lg transition"
                        >
                          View details
                        </button>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        )}

        {!loading && !error && (
          <p className="text-xs text-slate-600">{filtered.length} of {courses.length} courses shown</p>
        )}
      </div>

      {showAdd && <AddCourseModal onClose={() => setShowAdd(false)} onCreated={handleCreated} />}
      {editCourse && (
        <EditCourseModal
          course={editCourse}
          onClose={() => setEditCourse(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}
      {drawerCourseId && (
        <CourseDrawer
          courseId={drawerCourseId}
          onClose={() => setDrawerCourseId(null)}
          onEditClick={(c) => { setDrawerCourseId(null); setEditCourse(c); }}
        />
      )}
    </>
  );
}