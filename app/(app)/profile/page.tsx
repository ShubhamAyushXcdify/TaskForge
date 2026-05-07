"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";  
import type { MyCourse, DashboardStats } from "@/types/types";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [myCourses, setMyCourses] = useState<MyCourse[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const token = session?.user?.token;
  const user = session?.user;

  const fullName = user?.name?.trim() || "User1";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  useEffect(() => {
    if (!token || !backendUrl) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const [coursesRes, statsRes] = await Promise.all([
          fetch(`${backendUrl}/api/Course/MyCourses`, { headers }),
          fetch(`${backendUrl}/api/Dashboard/stats`, { headers }),
        ]);

        const coursesData = await coursesRes.json();
        const statsData = await statsRes.json();

        if (coursesData?.Success) setMyCourses(coursesData.Data?.Assignments || []);
        if (statsData?.Success) setStats(statsData.Data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, backendUrl]);

  const completedCourses = myCourses.filter((c) => c.Status === "Completed");
  const inProgressCourses = myCourses.filter((c) => c.Status === "InProgress");

  
  const handleSaveProfile = () => {
    // TODO: Add actual API call here later
    toast.success("Profile updated successfully!", {
      description: "Your changes have been saved.",
    });
    setEditOpen(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/40 pb-16">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-6 pt-8">
        <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white rounded-3xl px-8 py-7 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold border border-white/30 shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{fullName}</h1>
              <p className="text-teal-100 text-sm mt-0.5">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => setEditOpen(true)}
            className="bg-white text-teal-700 px-5 py-2.5 rounded-2xl text-sm font-semibold hover:bg-teal-50 transition flex items-center gap-2"
          >
            ✏️ Edit Profile
          </button>
        </div>
      </div>

      {/* Rest of your page (unchanged) */}
      <div className="max-w-5xl mx-auto px-6 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Summary & Skills */}
        <div className="lg:col-span-1 space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-3xl p-6 border border-teal-100 shadow-sm">
            <p className="uppercase text-xs font-bold tracking-widest text-teal-500 mb-5">All-time Summary</p>
            <div className="space-y-5">
              <div className="flex justify-between">
                <span className="text-slate-600">Courses Completed</span>
                <span className="font-semibold text-xl">{stats?.Completed || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Hours Learned</span>
                <span className="font-semibold text-xl">{stats?.TotalHoursSpent || 0}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Completion Rate</span>
                <span className="font-semibold text-xl">{stats?.CompletionRate || 0}%</span>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-3xl p-6 border border-teal-100 shadow-sm">
            <p className="uppercase text-xs font-bold tracking-widest text-teal-500 mb-4">Skills</p>
            {Array.from(new Set(myCourses.map(c => c.CourseCategory))).slice(0, 5).map((cat, i) => {
              const count = myCourses.filter(c => c.CourseCategory === cat).length;
              const completed = myCourses.filter(c => c.CourseCategory === cat && c.Status === "Completed").length;
              const progress = count ? Math.round((completed / count) * 100) : 0;

              return (
                <div key={i} className="mb-6 last:mb-0">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span>{cat}</span>
                    <span className="text-teal-600 text-xs">{completed}/{count}</span>
                  </div>
                  <div className="h-2 bg-teal-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-600 rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column - Certificates & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Certificates */}
          <div className="bg-white rounded-3xl p-6 border border-teal-100 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <p className="uppercase text-xs font-bold tracking-widest text-teal-500">Certificates</p>
              <span className="bg-teal-100 text-teal-700 px-3 py-1 text-xs rounded-full font-medium">
                {completedCourses.length}
              </span>
            </div>

            {completedCourses.length > 0 ? (
              completedCourses.map((course) => (
                <div key={course.AssignmentId} className="flex gap-4 p-4 bg-teal-50 rounded-2xl mb-3 last:mb-0">
                  <div className="w-11 h-11 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center text-2xl">🏆</div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{course.CourseTitle}</p>
                    <p className="text-xs text-slate-500">{course.ProviderName}</p>
                  </div>
                  <div className="text-xs text-slate-500 self-center">
                    {course.CompletedAt && new Date(course.CompletedAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 py-8 text-center">No certificates earned yet.</p>
            )}
          </div>

          {/* Learning History */}
          <div className="bg-white rounded-3xl p-6 border border-teal-100 shadow-sm">
            <p className="uppercase text-xs font-bold tracking-widest text-teal-500 mb-5">Learning History</p>

            {inProgressCourses.length > 0 && (
              <div className="mb-8">
                <p className="text-amber-600 font-medium mb-3">In Progress ({inProgressCourses.length})</p>
                <div className="space-y-3">
                  {inProgressCourses.map((c) => (
                    <div key={c.AssignmentId} className="flex justify-between bg-amber-50 px-5 py-4 rounded-2xl">
                      <div>
                        <p className="font-medium">{c.CourseTitle}</p>
                        <p className="text-xs text-slate-500">{c.ProviderName}</p>
                      </div>
                      <span className="text-amber-600 font-semibold">{c.ProgressPercentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {completedCourses.length > 0 && (
              <div>
                <p className="text-emerald-600 font-medium mb-3">Completed ({completedCourses.length})</p>
                <div className="space-y-3">
                  {completedCourses.map((c) => (
                    <div key={c.AssignmentId} className="flex justify-between bg-emerald-50 px-5 py-4 rounded-2xl">
                      <div>
                        <p className="font-medium">{c.CourseTitle}</p>
                        <p className="text-xs text-slate-500">{c.ProviderName}</p>
                      </div>
                      <span className="text-emerald-600 font-bold">100%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {myCourses.length === 0 && (
              <p className="text-center text-slate-500 py-12">No courses assigned yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Panel */}
      {editOpen && (
  <div className="fixed inset-0 z-50 flex">
    <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setEditOpen(false)} />
    <div className="w-96 bg-white h-full shadow-2xl flex flex-col">

      {/* Header */}
      <div className="p-6 border-b bg-teal-700 text-white flex justify-between items-center">
        <h2 className="font-semibold text-lg">Edit Profile</h2>
        <button onClick={() => setEditOpen(false)} className="text-2xl leading-none hover:opacity-70">×</button>
      </div>

      {/* Scrollable Fields */}
      <div className="flex-1 p-6 space-y-5 overflow-auto">

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-teal-500 block mb-1.5">Full Name</label>
          <input
            type="text"
            defaultValue={fullName}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-teal-400 bg-slate-50 text-slate-800"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-teal-500 block mb-1.5">Email</label>
          <input
            type="email"
            defaultValue={user?.email || ""}
            disabled
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-teal-500 block mb-1.5">Date of Birth</label>
          <input
            type="date"
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-teal-400 bg-slate-50 text-slate-800"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-teal-500 block mb-1.5">Phone Number</label>
          <input
            type="tel"
            placeholder="+91 XXXXX-XXXXX"
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-teal-400 bg-slate-50 text-slate-800"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-teal-500 block mb-1.5">Emergency Contact</label>
          <input
            type="tel"
            placeholder="Emergency Contact Number"
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-teal-400 bg-slate-50 text-slate-800"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-teal-500 block mb-1.5">Bio</label>
          <textarea
            rows={3}
            placeholder="Tell us about yourself..."
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-teal-400 bg-slate-50 text-slate-800 resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-teal-500 block mb-3">Notifications</label>
          <div className="space-y-3">
            {["Email notifications", "Weekly progress digest", "Course reminders"].map((label, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-sm text-slate-700">{label}</span>
                <div className="w-9 h-5 bg-teal-600 rounded-full relative cursor-pointer shrink-0">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer Buttons */}
      <div className="p-6 border-t flex gap-3 bg-white">
        <button
          onClick={() => setEditOpen(false)}
          className="flex-1 py-3 text-sm font-semibold border border-slate-200 rounded-2xl hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveProfile}
          className="flex-1 py-3 text-sm font-semibold bg-teal-600 text-white rounded-2xl hover:bg-teal-700 transition"
        >
          Save Changes
        </button>
      </div>

    </div>
  </div>
)}
    </div>
  );
}