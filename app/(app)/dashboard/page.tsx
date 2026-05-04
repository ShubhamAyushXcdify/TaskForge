
// "use client";

// import { useState, useMemo, useCallback, useEffect, useRef } from "react";

// // ─── Types ───────────────────────────────────────────────────────────────────

// interface DashboardStats {
//   assigned: number;
//   completed: number;
//   inProgress: number;
//   notStarted: number;
//   completionRate: number;
//   totalHoursSpent: number;
//   avgScore: number | null;
// }

// interface DayHours {
//   day: string;
//   hours: number;
// }

// interface WeeklyHours {
//   thisWeek: DayHours[];
//   lastWeek: DayHours[];
// }

// interface CategoryBreakdown {
//   category: string;
//   count: number;
//   percentage: number;
// }

// interface Activity {
//   id: string;
//   type: "completed" | "started" | "certificate" | "assigned";
//   title: string;
//   timestamp: string;
// }

// interface Todo {
//   id: string;
//   title: string;
//   completed: boolean;
// }

// // ─── Sub-components (unchanged UI) ───────────────────────────────────────────

// interface CompDonut {
//   assigned: number;
//   completed: number;
//   inProgress: number;
//   rate: number;
//   size?: "sm" | "lg";
// }

// function CompletionDonut({ completed, inProgress, assigned, rate, size = "lg" }: CompDonut) {
//   const r = 70;
//   const circ = 2 * Math.PI * r;
//   const completedDash = assigned > 0 ? (completed / assigned) * circ : 0;
//   const inProgressDash = assigned > 0 ? (inProgress / assigned) * circ : 0;
//   const notStarted = assigned - completed - inProgress;

//   return (
//     <>
//       <svg viewBox="0 0 200 200" className={size === "lg" ? "w-full h-44 mb-3" : "w-full h-24 mb-1"}>
//         <circle cx="100" cy="100" r={r} fill="none" stroke="#E0F2F1" strokeWidth="20" />
//         <circle cx="100" cy="100" r={r} fill="none" stroke="#1AA291" strokeWidth="20"
//           strokeDasharray={`${completedDash} ${circ}`} strokeLinecap="round"
//           style={{ transformOrigin: "center", transform: "rotate(-90deg)" }} />
//         <circle cx="100" cy="100" r={r} fill="none" stroke="#5DCAA5" strokeWidth="20"
//           strokeDasharray={`${inProgressDash} ${circ}`} strokeDashoffset={-completedDash}
//           strokeLinecap="round"
//           style={{ transformOrigin: "center", transform: "rotate(-90deg)" }} />
//         <circle cx="100" cy="100" r="45" fill="white" />
//         <text x="100" y="105" textAnchor="middle" fontSize={size === "lg" ? "24" : "22"}
//           fontWeight="700" fill="#0F6E56">{rate}%</text>
//       </svg>

//       {size === "lg" && (
//         <div className="space-y-1.5 text-xs">
//           {[
//             { color: "bg-teal-600", label: "Completed",   count: completed  },
//             { color: "bg-teal-400", label: "In progress", count: inProgress },
//             { color: "bg-teal-100", label: "Not started", count: notStarted },
//           ].map(({ color, label, count }) => (
//             <div key={label} className="flex items-center gap-2">
//               <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
//               <span className="text-teal-800">{label}</span>
//               <span className="ml-auto text-teal-400 font-medium">{count}</span>
//             </div>
//           ))}
//         </div>
//       )}

//       {size === "sm" && (
//         <p className="text-[10px] text-teal-500">{completed} done · {inProgress} active</p>
//       )}
//     </>
//   );
// }

// function CategoryDonut({
//   data,
//   size = "lg",
// }: {
//   data: CategoryBreakdown[];
//   size?: "sm" | "lg";
// }) {
//   const r = 60;
//   const circ = 2 * Math.PI * r;
//   const colors = ["#1AA291", "#5DCAA5", "#9FE1CB", "#C8EDE0"];
//   const bgColors = ["bg-teal-600", "bg-teal-400", "bg-teal-200", "bg-teal-100"];
//   let offset = 0;

//   return (
//     <>
//       <svg viewBox="0 0 200 200" className={size === "lg" ? "w-full h-40 mb-3" : "w-full h-24"}>
//         <circle cx="100" cy="100" r={r} fill="none" stroke="#E0F2F1" strokeWidth="26" />
//         {data.map(({ percentage }, i) => {
//           const dash = (percentage / 100) * circ;
//           const el = (
//             <circle key={i} cx="100" cy="100" r={r} fill="none"
//               stroke={colors[i] ?? "#E0F2F1"} strokeWidth="26"
//               strokeDasharray={`${dash} ${circ}`} strokeDashoffset={-offset}
//               strokeLinecap="butt"
//               style={{ transformOrigin: "center", transform: "rotate(-90deg)" }} />
//           );
//           offset += dash;
//           return el;
//         })}
//         <circle cx="100" cy="100" r="44" fill="white" />
//         <text x="100" y="106" textAnchor="middle" fontSize="18" fontWeight="700" fill="#0F6E56">
//           {data[0]?.percentage ?? 0}%
//         </text>
//       </svg>

//       {size === "lg" && (
//         <div className="space-y-1.5 text-xs">
//           {data.map(({ category, count, percentage }, i) => (
//             <div key={category} className="flex items-center gap-2">
//               <span className={`w-2.5 h-2.5 rounded shrink-0 ${bgColors[i] ?? "bg-teal-100"}`} />
//               <span className="text-teal-800">{category}</span>
//               <span className="ml-auto text-teal-400">{percentage}% · {count} courses</span>
//             </div>
//           ))}
//         </div>
//       )}
//     </>
//   );
// }

// // ─── Page ────────────────────────────────────────────────────────────────────

// type ChartKey = "peak" | "category" | "trend";

// export default function Dashboard() {
//   const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

//   // State
//   const [stats, setStats] = useState<DashboardStats | null>(null);
//   const [weeklyHours, setWeeklyHours] = useState<WeeklyHours | null>(null);
//   const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
//   const [activity, setActivity] = useState<Activity[]>([]);
//   const [todos, setTodos] = useState<Todo[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const [expandedChart, setExpandedChart] = useState<ChartKey | null>(null);
//   const [showActivity, setShowActivity] = useState(false);
//   const activityRef = useRef<HTMLDivElement>(null);

//   // Fetch all dashboard data
//   useEffect(() => {
//     if (!backendUrl) {
//       setError("Backend URL not configured");
//       setLoading(false);
//       return;
//     }

//     const opts: RequestInit = { method: "GET", credentials: "include" };

//     async function fetchAll() {
//       try {
//         const [statsRes, weeklyRes, catRes, actRes, todoRes] = await Promise.all([
//           fetch(`${backendUrl}/api/dashboard/stats`, opts),
//           fetch(`${backendUrl}/api/dashboard/weekly-hours`, opts),
//           fetch(`${backendUrl}/api/dashboard/category-breakdown`, opts),
//           fetch(`${backendUrl}/api/dashboard/activity`, opts),
//           fetch(`${backendUrl}/api/todos`, opts),
//         ]);

//         const [statsData, weeklyData, catData, actData, todoData] = await Promise.all([
//           statsRes.json(),
//           weeklyRes.json(),
//           catRes.json(),
//           actRes.json(),
//           todoRes.json(),
//         ]);

//         if (statsData.success)  setStats(statsData.data);
//         if (weeklyData.success) setWeeklyHours(weeklyData.data);
//         if (catData.success)    setCategories(catData.data || []);
//         if (actData.success)    setActivity(actData.data || []);
//         if (todoData.success)   setTodos(todoData.data || []);
//       } catch {
//         setError("Failed to load dashboard");
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchAll();
//   }, [backendUrl]);

//   // Close activity dropdown on outside click
//   useEffect(() => {
//     function onOutside(e: MouseEvent) {
//       if (activityRef.current && !activityRef.current.contains(e.target as Node)) {
//         setShowActivity(false);
//       }
//     }
//     if (showActivity) document.addEventListener("mousedown", onOutside);
//     return () => document.removeEventListener("mousedown", onOutside);
//   }, [showActivity]);

//   // Toggle todo — optimistic update + PATCH
//   const toggleTodo = useCallback(async (id: string) => {
//     setTodos((prev) =>
//       prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
//     );
//     try {
//       const current = todos.find((t) => t.id === id);
//       await fetch(`${backendUrl}/api/todos/${id}`, {
//         method: "PATCH",
//         credentials: "include",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ completed: !current?.completed }),
//       });
//     } catch {
//       // Revert on failure
//       setTodos((prev) =>
//         prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
//       );
//     }
//   }, [todos, backendUrl]);

//   const toggleChart = useCallback((key: ChartKey) => {
//     setExpandedChart((prev) => (prev === key ? null : key));
//   }, []);

//   // Build SVG chart points from API data
//   const chartPoints = useMemo(() => {
//     if (!weeklyHours) return { thisWeek: "", lastWeek: "", dots: [], labels: [] };

//     const days = weeklyHours.thisWeek;
//     const maxH = Math.max(...days.map((d) => d.hours), ...weeklyHours.lastWeek.map((d) => d.hours), 1);

//     // Map hours to SVG y coords (170 = 0h, 15 = max)
//     const toY = (h: number) => 170 - ((h / maxH) * 155);
//     const xs = [80, 210, 370, 480, 580, 680];

//     const thisPath = days
//       .map((d, i) => `${i === 0 ? "M" : "L"} ${xs[i]} ${toY(d.hours)}`)
//       .join(" ");

//     const lastPath = weeklyHours.lastWeek
//       .map((d, i) => `${i === 0 ? "M" : "L"} ${xs[i]} ${toY(d.hours)}`)
//       .join(" ");

//     const dots = days.map((d, i) => ({ x: xs[i], y: toY(d.hours) }));
//     const labels = days.map((d, i) => ({ label: d.day, x: xs[i] }));

//     return { thisWeek: thisPath, lastWeek: lastPath, dots, labels };
//   }, [weeklyHours]);

//   const smallCard = (key: ChartKey) =>
//     `bg-white rounded-2xl p-4 border shadow-sm cursor-pointer select-none transition-all ${
//       expandedChart === key
//         ? "border-teal-400 ring-1 ring-teal-200"
//         : "border-teal-100 hover:border-teal-300 hover:shadow-md"
//     }`;

//   if (loading) return <div className="p-12 text-center text-slate-500">Loading dashboard...</div>;
//   if (error || !stats) return <div className="p-12 text-center text-red-500">{error ?? "Failed to load"}</div>;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/40 pb-12">

//       {/* ── Top bar ────────────────────────────────────────────────────────── */}
//       <div className="max-w-7xl mx-auto px-6 pt-5">
//         <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white rounded-2xl px-5 py-3.5 flex justify-between items-center shadow-sm">
//           <div>
//             <p className="text-[11px] opacity-70 font-medium">Good morning</p>
//             <h1 className="text-lg font-semibold leading-none mt-0.5">Manil</h1>
//           </div>
//           <div className="flex items-center gap-2.5">
//             <span className="bg-teal-600/80 px-3 py-1 rounded-full text-[11px] font-medium flex items-center gap-1">
//               🔥 12-day streak
//             </span>

//             {/* Activity dropdown */}
//             <div className="relative" ref={activityRef}>
//               <button
//                 onClick={() => setShowActivity((v) => !v)}
//                 aria-label="View recent activity"
//                 className={`w-8 h-8 rounded-full text-sm flex items-center justify-center transition ${
//                   showActivity ? "bg-teal-100 text-teal-700" : "bg-white text-teal-700 hover:bg-teal-50"
//                 }`}
//               >
//                 📋
//               </button>
//               {showActivity && (
//                 <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-teal-100 z-50">
//                   <div className="px-4 py-2.5 border-b border-teal-100 flex justify-between items-center">
//                     <span className="text-xs font-semibold text-teal-900">Recent Activity</span>
//                     <button onClick={() => setShowActivity(false)} className="text-teal-400 hover:text-teal-600 leading-none text-base">✕</button>
//                   </div>
//                   <div className="max-h-64 overflow-y-auto divide-y divide-teal-50">
//                     {activity.map((a) => (
//                       <div key={a.id} className="flex gap-2.5 px-4 py-2.5">
//                         <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${
//                           a.type === "completed" || a.type === "certificate" ? "bg-teal-500" : "bg-amber-400"
//                         }`} />
//                         <div>
//                           <p className="text-[11px] text-teal-900 leading-snug">{a.title}</p>
//                           <p className="text-[10px] text-teal-400 mt-0.5">
//                             {new Date(a.timestamp).toLocaleDateString("en-US", {
//                               month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
//                             })}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                   <div className="px-4 py-2 border-t border-teal-100 text-center">
//                     <button className="text-[11px] font-semibold text-teal-600 hover:text-teal-700">View all →</button>
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="w-8 h-8 rounded-full bg-white text-teal-700 flex items-center justify-center font-bold text-[11px]">
//               M
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ── Body ───────────────────────────────────────────────────────────── */}
//       <div className="max-w-7xl mx-auto px-6 pt-4">

//         {/* Stat cards — from /api/dashboard/stats */}
//         <div className="grid grid-cols-6 gap-3 mb-5">
//           {[
//             { label: "Assigned",    value: stats.assigned,                          sub: "Total courses",  hi: false },
//             { label: "Completed",   value: stats.completed,                         sub: `${stats.completionRate}% done`, hi: true  },
//             { label: "In Progress", value: stats.inProgress,                        sub: "Active now",     hi: false },
//             { label: "Not Started", value: stats.notStarted,                        sub: "Pending",        hi: false },
//             { label: "Hours Spent", value: `${stats.totalHoursSpent}h`,             sub: "Total learning", hi: false },
//             { label: "Avg Score",   value: stats.avgScore != null ? `${stats.avgScore}%` : "—", sub: "Quiz average", hi: false },
//           ].map(({ label, value, sub, hi }) => (
//             <div key={label} className={`rounded-xl px-3.5 py-3 border shadow-sm ${
//               hi ? "bg-gradient-to-br from-teal-600 to-teal-700 border-teal-700" : "bg-white border-teal-100"
//             }`}>
//               <p className={`text-[9px] font-bold uppercase tracking-widest mb-1.5 ${hi ? "text-teal-200" : "text-teal-500"}`}>
//                 {label}
//               </p>
//               <p className={`text-lg font-bold leading-none ${hi ? "text-white" : "text-teal-800"}`}>
//                 {value}
//               </p>
//               <p className={`text-[10px] mt-1.5 ${hi ? "text-teal-200" : "text-teal-500"}`}>{sub}</p>
//             </div>
//           ))}
//         </div>

//         {/* Main grid */}
//         <div className="grid grid-cols-3 gap-5">

//           {/* ── Left ───────────────────────────────────────────────────────── */}
//           <div className="col-span-2 flex flex-col gap-5">

//             {/* Weekly line chart — from /api/dashboard/weekly-hours */}
//             <div className="bg-white rounded-2xl p-5 border border-teal-100 shadow-sm">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-sm font-semibold text-teal-900">Weekly learning hours</h3>
//                 <div className="flex items-center gap-4 text-[10px] text-teal-400">
//                   <span className="flex items-center gap-1.5">
//                     <span className="inline-block w-4 h-[2px] rounded bg-teal-200" />Last week
//                   </span>
//                   <span className="flex items-center gap-1.5">
//                     <span className="inline-block w-4 h-[2px] rounded bg-teal-500" />This week
//                   </span>
//                 </div>
//               </div>
//               <div className="relative h-48">
//                 <svg width="100%" height="100%" viewBox="0 0 700 190" preserveAspectRatio="none" className="absolute inset-0">
//                   {[15, 55, 95, 135, 170].map((y) => (
//                     <line key={y} x1="50" y1={y} x2="690" y2={y} stroke="#F0FBF7" strokeWidth="1" />
//                   ))}
//                   {[["6h",15],["4h",55],["2h",95],["1h",135],["0",170]].map(([l,y]) => (
//                     <text key={String(y)} x="44" y={Number(y)+4} fontSize="10" fill="#9FE1CB" textAnchor="end">{l}</text>
//                   ))}
//                   {/* Last week line */}
//                   {weeklyHours && (
//                     <path d={chartPoints.lastWeek} fill="none" stroke="#C8EDE0" strokeWidth="2" strokeLinecap="round" />
//                   )}
//                   {/* This week line */}
//                   {weeklyHours && (
//                     <path d={chartPoints.thisWeek} fill="none" stroke="#1AA291" strokeWidth="2.5" strokeLinecap="round" />
//                   )}
//                   {/* Dots */}
//                   {chartPoints.dots.map(({ x, y }) => (
//                     <circle key={x} cx={x} cy={y} r="3.5" fill="#1AA291" stroke="white" strokeWidth="2" />
//                   ))}
//                   {/* Day labels */}
//                   {chartPoints.labels.map(({ label, x }) => (
//                     <text key={x} x={x} y="186" fontSize="10" fill="#9FE1CB" textAnchor="middle">{label}</text>
//                   ))}
//                 </svg>
//               </div>
//             </div>

//             {/* 3 small charts */}
//             <div className="grid grid-cols-3 gap-4">

//               {/* Peak hours */}
//               <div className={smallCard("peak")} onClick={() => toggleChart("peak")}>
//                 {expandedChart === "peak" ? (
//                   <>
//                     <p className="text-[9px] font-bold text-teal-400 uppercase tracking-widest mb-1">← swapped</p>
//                     <p className="text-xs font-semibold text-teal-900 mb-2">Completion</p>
//                     <CompletionDonut {...stats} rate={stats.completionRate} size="sm" />
//                   </>
//                 ) : (
//                   <>
//                     <p className="text-xs font-semibold text-teal-900 mb-3">Peak hours</p>
//                     <div className="flex items-end justify-between gap-[3px] h-20">
//                       {[30,44,56,65,78,92,86,70,48].map((h, i) => (
//                         <div key={i} className="flex-1 bg-gradient-to-t from-teal-500 to-teal-300 rounded-t-sm" style={{ height: `${h}%` }} />
//                       ))}
//                     </div>
//                     <p className="text-[10px] text-teal-400 mt-2">Peak: 2–4 pm</p>
//                   </>
//                 )}
//               </div>

//               {/* Categories — from /api/dashboard/category-breakdown */}
//               <div className={smallCard("category")} onClick={() => toggleChart("category")}>
//                 {expandedChart === "category" ? (
//                   <>
//                     <p className="text-[9px] font-bold text-teal-400 uppercase tracking-widest mb-1">← swapped</p>
//                     <p className="text-xs font-semibold text-teal-900 mb-2">Completion</p>
//                     <CompletionDonut {...stats} rate={stats.completionRate} size="sm" />
//                   </>
//                 ) : (
//                   <>
//                     <p className="text-xs font-semibold text-teal-900 mb-2">Categories</p>
//                     <CategoryDonut data={categories} size="sm" />
//                     <p className="text-[10px] text-teal-400 mt-1">
//                       {categories[0]?.category ?? "—"} dominant
//                     </p>
//                   </>
//                 )}
//               </div>

//               {/* Monthly trend */}
//               <div className={smallCard("trend")} onClick={() => toggleChart("trend")}>
//                 {expandedChart === "trend" ? (
//                   <>
//                     <p className="text-[9px] font-bold text-teal-400 uppercase tracking-widest mb-1">← swapped</p>
//                     <p className="text-xs font-semibold text-teal-900 mb-2">Completion</p>
//                     <CompletionDonut {...stats} rate={stats.completionRate} size="sm" />
//                   </>
//                 ) : (
//                   <>
//                     <p className="text-xs font-semibold text-teal-900 mb-3">Monthly trend</p>
//                     <svg viewBox="0 0 150 80" className="w-full h-20">
//                       <polyline points="10,60 35,48 60,36 85,22 110,14 135,7"
//                         fill="none" stroke="#1AA291" strokeWidth="2.5"
//                         strokeLinecap="round" strokeLinejoin="round" />
//                       {[[10,60],[35,48],[60,36],[85,22],[110,14],[135,7]].map(([cx,cy]) => (
//                         <circle key={cx} cx={cx} cy={cy} r="3" fill="#1AA291" stroke="white" strokeWidth="1.5" />
//                       ))}
//                     </svg>
//                     <p className="text-[10px] text-teal-400 mt-1">+22% vs last month</p>
//                   </>
//                 )}
//               </div>

//             </div>
//           </div>

//           {/* ── Right sidebar ──────────────────────────────────────────────── */}
//           <div className="flex flex-col gap-5">

//             {/* Completion overview / swapped chart */}
//             <div className={`bg-white rounded-2xl p-5 border shadow-sm transition-all ${
//               expandedChart ? "border-teal-400 ring-1 ring-teal-200" : "border-teal-100"
//             }`}>
//               {!expandedChart && (
//                 <>
//                   <h3 className="text-xs font-semibold text-teal-900 mb-3">Completion overview</h3>
//                   <CompletionDonut {...stats} rate={stats.completionRate} size="lg" />
//                 </>
//               )}

//               {expandedChart === "peak" && (
//                 <>
//                   <div className="flex justify-between items-center mb-3">
//                     <h3 className="text-xs font-semibold text-teal-900">Peak learning hours</h3>
//                     <button onClick={() => setExpandedChart(null)} className="text-[10px] text-teal-400 hover:text-teal-600">✕ close</button>
//                   </div>
//                   <div className="space-y-1.5">
//                     {["9am","10am","11am","12pm","1pm","2pm","3pm","4pm","5pm"].map((h, i) => (
//                       <div key={h} className="flex items-center gap-2">
//                         <span className="text-[10px] text-teal-500 w-9 font-medium shrink-0">{h}</span>
//                         <div className="flex-1 h-4 bg-teal-50 rounded-full overflow-hidden">
//                           <div className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full"
//                             style={{ width: `${25 + i * 8}%` }} />
//                         </div>
//                         <span className="text-[10px] text-teal-400 w-8 text-right shrink-0">
//                           {(1.2 + i * 0.3).toFixed(1)}h
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                   <p className="text-[10px] text-teal-400 mt-3 pt-2.5 border-t border-teal-50">📍 Peak: 2–4 pm weekdays</p>
//                 </>
//               )}

//               {expandedChart === "category" && (
//                 <>
//                   <div className="flex justify-between items-center mb-2">
//                     <h3 className="text-xs font-semibold text-teal-900">Course categories</h3>
//                     <button onClick={() => setExpandedChart(null)} className="text-[10px] text-teal-400 hover:text-teal-600">✕ close</button>
//                   </div>
//                   <CategoryDonut data={categories} size="lg" />
//                 </>
//               )}

//               {expandedChart === "trend" && (
//                 <>
//                   <div className="flex justify-between items-center mb-3">
//                     <h3 className="text-xs font-semibold text-teal-900">Monthly progress</h3>
//                     <button onClick={() => setExpandedChart(null)} className="text-[10px] text-teal-400 hover:text-teal-600">✕ close</button>
//                   </div>
//                   <div className="flex items-end justify-between gap-1.5 mb-2" style={{ height: 180 }}>
//                     {[{m:"Nov",v:35},{m:"Dec",v:45},{m:"Jan",v:52},{m:"Feb",v:68},{m:"Mar",v:72},{m:"Apr",v:82}].map((d) => (
//                       <div key={d.m} className="flex-1 flex flex-col items-center gap-1">
//                         <div className="w-full bg-gradient-to-t from-teal-500 to-teal-300 rounded-t-md"
//                           style={{ height: `${d.v * 1.7}px` }} />
//                         <span className="text-[9px] text-teal-500 font-medium">{d.m}</span>
//                       </div>
//                     ))}
//                   </div>
//                   <p className="text-[10px] text-teal-400 pt-2.5 border-t border-teal-50">📈 +22% vs last month</p>
//                 </>
//               )}
//             </div>

//             {/* To-do — from /api/todos, PATCH on toggle */}
//             <div className="bg-white rounded-2xl p-5 border border-teal-100 shadow-sm">
//               <div className="flex justify-between items-center mb-3">
//                 <h3 className="text-xs font-semibold text-teal-900">To-do</h3>
//                 <button className="text-[11px] font-medium text-teal-600 hover:text-teal-700 transition">+ Add</button>
//               </div>

//               <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
//                 {todos.map((todo) => (
//                   <div
//                     key={todo.id}
//                     role="checkbox"
//                     aria-checked={todo.completed}
//                     tabIndex={0}
//                     onKeyDown={(e) => e.key === " " && toggleTodo(todo.id)}
//                     onClick={() => toggleTodo(todo.id)}
//                     className="flex gap-2.5 p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100/80 transition cursor-pointer group select-none"
//                   >
//                     <div className={`w-4 h-4 rounded-[4px] border-2 shrink-0 mt-0.5 flex items-center justify-center transition ${
//                       todo.completed
//                         ? "bg-teal-600 border-teal-600"
//                         : "border-teal-300 group-hover:border-teal-400"
//                     }`}>
//                       {todo.completed && (
//                         <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
//                           <path fillRule="evenodd" clipRule="evenodd"
//                             d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
//                         </svg>
//                       )}
//                     </div>
//                     <p className={`text-xs leading-snug transition flex-1 min-w-0 ${
//                       todo.completed ? "text-teal-400 line-through" : "text-teal-900"
//                     }`}>
//                       {todo.title}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </div>

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  assigned: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  completionRate: number;
  totalHoursSpent: number;
  avgScore: number | null;
}

interface DayHours {
  day: string;
  hours: number;
}

interface WeeklyHours {
  thisWeek: DayHours[];
  lastWeek: DayHours[];
}

interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
}

interface Activity {
  id: string;
  type: "completed" | "started" | "certificate" | "assigned";
  title: string;
  timestamp: string;
}

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

// ─── SAFE JSON FIX (🔥 IMPORTANT) ─────────────────────────────────────────────

async function safeJson(res: Response) {
  try {
    if (!res.ok) return null;
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function isOk(res: any): boolean {
  return res?.Success === true || res?.success === true;
}

function getData(res: any): any {
  return res?.Data ?? res?.data;
}

// ─── MAPPERS ──────────────────────────────────────────────────────────────────

function mapStats(d: any): DashboardStats {
  return {
    assigned: d.Assigned ?? d.assigned ?? 0,
    completed: d.Completed ?? d.completed ?? 0,
    inProgress: d.InProgress ?? d.inProgress ?? 0,
    notStarted: d.NotStarted ?? d.notStarted ?? 0,
    completionRate: d.CompletionRate ?? d.completionRate ?? 0,
    totalHoursSpent: d.TotalHoursSpent ?? d.totalHoursSpent ?? 0,
    avgScore: d.AvgScore ?? d.avgScore ?? null,
  };
}

function mapDayHours(d: any): DayHours {
  return { day: d.Day ?? d.day ?? "", hours: d.Hours ?? d.hours ?? 0 };
}

function mapCategory(d: any): CategoryBreakdown {
  return {
    category: d.Category ?? d.category ?? "",
    count: d.Count ?? d.count ?? 0,
    percentage: d.Percentage ?? d.percentage ?? 0,
  };
}

function mapActivity(d: any): Activity {
  return {
    id: d.Id ?? d.id ?? "",
    type: d.Type ?? d.type ?? "started",
    title: d.Title ?? d.title ?? "",
    timestamp: d.Timestamp ?? d.timestamp ?? "",
  };
}

function mapTodo(d: any): Todo {
  return {
    id: d.Id ?? d.id ?? "",
    title: d.Title ?? d.title ?? "",
    completed: d.Completed ?? d.completed ?? false,
  };
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { data: session } = useSession();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [weeklyHours, setWeeklyHours] = useState<WeeklyHours | null>(null);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── FETCH FIXED ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!backendUrl) {
      setError("Backend URL not configured");
      setLoading(false);
      return;
    }

    const opts: RequestInit = {
      method: "GET",
      credentials: "include",
    };

    async function fetchAll() {
      try {
        const [statsRes, weeklyRes, catRes, actRes, todoRes] =
          await Promise.all([
            fetch(`${backendUrl}/api/Dashboard/stats`, opts),
            fetch(`${backendUrl}/api/Dashboard/weekly-hours`, opts),
            fetch(`${backendUrl}/api/Dashboard/category-breakdown`, opts),
            fetch(`${backendUrl}/api/Dashboard/activity`, opts),
            fetch(`${backendUrl}/api/todos`, opts),
          ]);

        const [statsRaw, weeklyRaw, catRaw, actRaw, todoRaw] =
          await Promise.all([
            safeJson(statsRes),
            safeJson(weeklyRes),
            safeJson(catRes),
            safeJson(actRes),
            safeJson(todoRes),
          ]);

        // STATS fallback
        setStats(
          statsRaw && isOk(statsRaw) && getData(statsRaw)
            ? mapStats(getData(statsRaw))
            : {
                assigned: 0,
                completed: 0,
                inProgress: 0,
                notStarted: 0,
                completionRate: 0,
                totalHoursSpent: 0,
                avgScore: null,
              }
        );

        // WEEKLY fallback
        if (weeklyRaw && isOk(weeklyRaw) && getData(weeklyRaw)) {
          const d = getData(weeklyRaw);
          setWeeklyHours({
            thisWeek: (d.ThisWeek ?? d.thisWeek ?? []).map(mapDayHours),
            lastWeek: (d.LastWeek ?? d.lastWeek ?? []).map(mapDayHours),
          });
        } else {
          setWeeklyHours({ thisWeek: [], lastWeek: [] });
        }

        setCategories(
          catRaw && isOk(catRaw)
            ? (getData(catRaw) ?? []).map(mapCategory)
            : []
        );

        setActivity(
          actRaw && isOk(actRaw)
            ? (getData(actRaw) ?? []).map(mapActivity)
            : []
        );

        setTodos(
          todoRaw && isOk(todoRaw)
            ? (getData(todoRaw) ?? []).map(mapTodo)
            : []
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [backendUrl]);

  // ── UI (UNCHANGED EXCEPT FALLBACKS) ────────────────────────────────────────

  if (loading) return <div className="p-6">Loading...</div>;

  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 space-y-6">

      <div>Assigned: {stats?.assigned}</div>
      <div>Completed: {stats?.completed}</div>

      <div>
        <h3>Weekly</h3>
        {weeklyHours?.thisWeek.length === 0 ? (
          <p>No data</p>
        ) : (
          weeklyHours?.thisWeek.map((d) => (
            <div key={d.day}>{d.day} - {d.hours}</div>
          ))
        )}
      </div>

      <div>
        <h3>Categories</h3>
        {categories.length === 0 ? (
          <p>No categories</p>
        ) : (
          categories.map((c) => (
            <div key={c.category}>{c.category}</div>
          ))
        )}
      </div>

      <div>
        <h3>Todos</h3>
        {todos.length === 0 ? (
          <p>No todos</p>
        ) : (
          todos.map((t) => (
            <div key={t.id}>{t.title}</div>
          ))
        )}
      </div>

      <div>
        <h3>Activity</h3>
        {activity.length === 0 ? (
          <p>No activity</p>
        ) : (
          activity.map((a) => (
            <div key={a.id}>{a.title}</div>
          ))
        )}
      </div>

    </div>
  );
}