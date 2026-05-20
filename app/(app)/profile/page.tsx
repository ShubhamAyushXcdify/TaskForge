"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import type { MyCourse, DashboardStats } from "@/types/types";

const safeJsonParse = async (res: Response): Promise<any> => {
  if (res.status === 204) return { success: true };
  const text = await res.text();
  return text ? JSON.parse(text) : { success: res.ok };
};

interface CertificateUploadResponse {
  success: boolean;
  message: string;
  assignmentId: string;
  courseTitle: string;
  certificateUrl: string;
  status: "Completed";
  completedAt: string;
}

interface EditForm {
  name: string;
  newPassword: string;
  confirmPassword: string;
}

function resolveCertUrl(raw: string | undefined | null, backendUrl: string): string | null {
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  const clean = raw.replace(/^wwwroot\//, "/").replace(/^\/?/, "/");
  return `${backendUrl}${clean}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { data: session } = useSession();

  const [myCourses, setMyCourses] = useState<MyCourse[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Certificate upload
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState<EditForm>({
    name: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
  const token = session?.user?.token;
  const user = session?.user;

  // ── Derived display values ──────────────────────────────────────────────────

  const fullName = user?.name?.trim() || "User";

  // FIX: log this in dev to find the right field name if still getting 405
  const employeeId: string = user?.employeeCode || "";

  const initials = useMemo(
    () =>
      fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U",
    [fullName]
  );

  // FIX: correct filter — both "InProgress" and "Assigned" shown together
  const { completedCourses, inProgressCourses } = useMemo(
    () => ({
      completedCourses: myCourses.filter((c) => c.status === "Completed"),
      inProgressCourses: myCourses.filter(
        (c) => c.status === "InProgress" || c.status === "Assigned"
      ),
    }),
    [myCourses]
  );

  const skillsData = useMemo(() => {
    const map = new Map<string, { total: number; completed: number }>();
    myCourses.forEach((c) => {
      const cat = c.courseCategory;
      if (!map.has(cat)) map.set(cat, { total: 0, completed: 0 });
      const d = map.get(cat)!;
      d.total++;
      if (c.status === "Completed") d.completed++;
    });
    return Array.from(map.entries())
      .slice(0, 5)
      .map(([category, d]) => ({
        category,
        ...d,
        progress: d.total ? Math.round((d.completed / d.total) * 100) : 0,
      }));
  }, [myCourses]);

  // ── Data fetch ──────────────────────────────────────────────────────────────

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

        // FIX: removed the stray `await Promise.all` that was outside this function
        const [coursesData, statsData] = await Promise.all([
          coursesRes.json(),
          statsRes.json(),
        ]);

        if (coursesData?.success) {
          const raw: MyCourse[] = coursesData.data?.assignments ?? [];
          const courses = raw.map((c) => {
            const rawUrl =
              c.certificateUrl ||
              localStorage.getItem(`cert_${c.assignmentId}`) ||
              undefined;
            return {
              ...c,
              certificateUrl: resolveCertUrl(rawUrl, backendUrl) ?? undefined,
            };
          });
          setMyCourses(courses);
        }

        if (statsData?.success) {
          setStats(statsData.data);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, backendUrl]);

  // Sync edit form when session loads
  useEffect(() => {
    if (fullName && fullName !== "User") {
      setEditForm((prev) => ({ ...prev, name: fullName }));
    }
  }, [fullName]);

  // ── Certificate upload ──────────────────────────────────────────────────────

  const handleUploadClick = useCallback((assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !selectedAssignmentId || !token || !backendUrl) return;

      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF file only");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File must be under 10 MB");
        return;
      }

      setUploadingId(selectedAssignmentId);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(
          `${backendUrl}/api/assignments/${selectedAssignmentId}/certificate`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        );

        const data: CertificateUploadResponse = await res.json();

        if (data.success) {
          toast.success("Certificate uploaded!", {
            description: `${data.courseTitle} marked as completed`,
          });

          const resolvedUrl =
            resolveCertUrl(data.certificateUrl, backendUrl) ?? data.certificateUrl;
          localStorage.setItem(`cert_${selectedAssignmentId}`, resolvedUrl);

          setMyCourses((prev) =>
            prev.map((c) =>
              c.assignmentId === selectedAssignmentId
                ? {
                    ...c,
                    status: "Completed" as const,
                    completedAt: data.completedAt,
                    certificateUrl: resolvedUrl,
                  }
                : c
            )
          );
        } else {
          toast.error(data.message || "Upload failed");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to upload certificate");
      } finally {
        setUploadingId(null);
        setSelectedAssignmentId(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [selectedAssignmentId, token, backendUrl]
  );

  // ── Save Profile ────────────────────────────────────────────────────────────

  const handleSaveProfile = useCallback(async () => {
    // FIX: debug log — remove once confirmed working
    console.log("session user →", JSON.stringify(user));
    console.log("employeeId →", employeeId);

    if (!employeeId) {
      toast.error("Employee ID not found. Please logout and login again.");
      return;
    }

    // FIX: also check trimmed name is non-empty before comparing
    const trimmedName = editForm.name.trim();
    const nameChanged = trimmedName.length > 0 && trimmedName !== fullName;
    const passwordChanged = editForm.newPassword.length > 0;

    if (!nameChanged && !passwordChanged) {
      toast.info("No changes to save");
      return;
    }

    if (passwordChanged) {
      if (editForm.newPassword.length < 8) {
        toast.error("New password must be at least 8 characters");
        return;
      }
      if (editForm.newPassword !== editForm.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }

    setSaving(true);
    try {
      const payload: Record<string, string> = {};
      if (nameChanged) payload.name = trimmedName;
      if (passwordChanged) payload.newPassword = editForm.newPassword;

      const res = await fetch(`${backendUrl}/api/Employee/${employeeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // FIX: log raw status so you can see exactly what the server returns
      console.log("PATCH status →", res.status);

      const data = await safeJsonParse(res);
      console.log("PATCH response →", data);

      if (res.ok && (data?.success !== false)) {
        toast.success("Profile updated successfully!");
        setEditOpen(false);
        setEditForm((prev) => ({ ...prev, newPassword: "", confirmPassword: "" }));
      } else {
        toast.error(data?.message || `Update failed (${res.status})`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }, [editForm, fullName, token, backendUrl, employeeId, user]);

  // ── Loading state ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50/40">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 text-sm tracking-wide">Loading profile…</span>
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/40 pb-16">
      {/* Hidden file input for certificate upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white rounded-3xl px-6 sm:px-8 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold border border-white/30 shrink-0 select-none">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-semibold leading-tight">{fullName}</h1>
              <p className="text-teal-100 text-sm mt-0.5">{user?.email}</p>
              {employeeId && (
                <span className="inline-block mt-2 text-xs font-mono bg-white/15 border border-white/20 text-white px-3 py-1 rounded-full">
                  EMP&nbsp;ID: {employeeId}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => setEditOpen(true)}
            className="bg-white text-teal-700 px-5 py-2.5 rounded-2xl text-sm font-semibold hover:bg-teal-50 active:scale-95 transition-all flex items-center gap-2 shrink-0"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit Profile
          </button>
        </div>
      </div>

      {/* ── Main grid ─────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-3xl p-6 border border-teal-100 shadow-sm">
            <p className="uppercase text-xs font-bold tracking-widest text-teal-500 mb-5">
              All-time Summary
            </p>
            <div className="space-y-4">
              <StatRow label="Courses Completed" value={stats?.completed ?? 0} />
              <StatRow label="Hours Learned" value={`${stats?.totalHoursSpent ?? 0}h`} />
              <StatRow label="Completion Rate" value={`${stats?.completionRate ?? 0}%`} />
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-3xl p-6 border border-teal-100 shadow-sm">
            <p className="uppercase text-xs font-bold tracking-widest text-teal-500 mb-5">
              Skills
            </p>
            {skillsData.length > 0 ? (
              skillsData.map((skill, i) => (
                <div key={i} className="mb-5 last:mb-0">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-700 truncate max-w-[65%]">
                      {skill.category}
                    </span>
                    <span className="text-teal-600 text-xs font-medium">
                      {skill.completed}/{skill.total}
                    </span>
                  </div>
                  <div className="h-2 bg-teal-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full transition-all duration-700"
                      style={{ width: `${skill.progress}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm text-center py-6">No skills data yet</p>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* ── Certificates ────────────────────────────────────────────── */}
          <div className="bg-white rounded-3xl p-6 border border-teal-100 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <p className="uppercase text-xs font-bold tracking-widest text-teal-500">
                Certificates
              </p>
              <span className="bg-teal-100 text-teal-700 px-3 py-1 text-xs rounded-full font-semibold">
                {completedCourses.length}
              </span>
            </div>

            {completedCourses.length > 0 ? (
              <div className="space-y-3">
                {completedCourses.map((course) => {
                  const certUrl = course.certificateUrl ?? null;
                  return (
                    <div
                      key={course.assignmentId}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border border-teal-100"
                    >
                      <div className="w-11 h-11 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center text-xl shadow-sm shrink-0">
                        🏆
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">
                          {course.courseTitle}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{course.providerName}</p>
                        {course.completedAt && (
                          <p className="text-xs text-teal-600 mt-0.5">
                            {new Date(course.completedAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        )}
                      </div>

                      {certUrl && (
                        <a
                          href={certUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-semibold bg-teal-600 text-white px-3 py-2 rounded-xl hover:bg-teal-700 active:scale-95 transition-all shrink-0"
                          title="View Certificate"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path
                              fillRule="evenodd"
                              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          View
                        </a>
                      )}

                      {certUrl ? (
                        <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-2 rounded-xl text-xs font-semibold shrink-0">
                          <span className="text-sm">✅</span>
                          Done
                        </div>
                      ) : (
                        <button
                          onClick={() => handleUploadClick(course.assignmentId)}
                          disabled={uploadingId === course.assignmentId}
                          title="Upload Certificate"
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 shrink-0 ${
                            uploadingId === course.assignmentId
                              ? "bg-teal-400 text-white cursor-wait"
                              : "bg-teal-600 hover:bg-teal-700 text-white"
                          }`}
                        >
                          {uploadingId === course.assignmentId ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                  fillRule="evenodd"
                                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Upload
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center gap-3 text-slate-400">
                <div className="text-4xl">🎓</div>
                <p className="text-sm">No certificates earned yet.</p>
              </div>
            )}
          </div>

          {/* ── Learning History ─────────────────────────────────────────── */}
          <div className="bg-white rounded-3xl p-6 border border-teal-100 shadow-sm">
            <p className="uppercase text-xs font-bold tracking-widest text-teal-500 mb-5">
              Learning History
            </p>

            {/* In Progress + Assigned */}
            {inProgressCourses.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <p className="text-amber-600 font-semibold text-sm">
                    In Progress ({inProgressCourses.length})
                  </p>
                </div>
                <div className="space-y-2">
                  {inProgressCourses.map((course) => (
                    <div
                      key={course.assignmentId}
                      className="flex items-center gap-3 bg-amber-50 px-5 py-4 rounded-2xl border border-amber-100"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">{course.courseTitle}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{course.providerName}</p>
                        {/* Show badge if Assigned vs InProgress */}
                        {course.status === "Assigned" && (
                          <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                            Assigned
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="hidden sm:block w-20 h-1.5 bg-amber-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${course.progressPercentage ?? 0}%` }}
                          />
                        </div>
                        <span className="text-amber-600 font-semibold text-sm w-10 text-right">
                          {course.progressPercentage ?? 0}%
                        </span>

                        {/* Upload cert button */}
                        <button
                          onClick={() => handleUploadClick(course.assignmentId)}
                          disabled={uploadingId === course.assignmentId}
                          title="Upload Certificate"
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                            uploadingId === course.assignmentId
                              ? "bg-amber-400 cursor-wait"
                              : "bg-amber-500 hover:bg-amber-600"
                          } text-white shrink-0`}
                        >
                          {uploadingId === course.assignmentId ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed */}
            {completedCourses.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <p className="text-emerald-600 font-semibold text-sm">
                    Completed ({completedCourses.length})
                  </p>
                </div>
                <div className="space-y-2">
                  {completedCourses.map((course) => (
                    <div
                      key={course.assignmentId}
                      className="flex justify-between items-center bg-emerald-50 px-5 py-4 rounded-2xl border border-emerald-100"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 truncate">{course.courseTitle}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{course.providerName}</p>
                      </div>
                      <span className="text-emerald-600 font-bold text-sm shrink-0 ml-4">
                        100%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {myCourses.length === 0 && (
              <div className="py-14 flex flex-col items-center gap-3 text-slate-400">
                <div className="text-4xl">📚</div>
                <p className="text-sm">No courses assigned yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Edit Profile Panel ─────────────────────────────────────────────── */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => !saving && setEditOpen(false)}
          />

          {/* Panel */}
          <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 bg-teal-700 text-white flex justify-between items-center shrink-0">
              <div>
                <h2 className="font-semibold text-lg">Edit Profile</h2>
                <p className="text-teal-200 text-xs mt-0.5">Update your name or password</p>
              </div>
              <button
                onClick={() => !saving && setEditOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 transition text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Fields */}
            <div className="flex-1 overflow-auto px-6 py-6 space-y-6">

              {/* Employee ID – read-only */}
              {employeeId && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-teal-500 block mb-1.5">
                    Employee ID
                  </label>
                  <div className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-100 text-slate-500 font-mono text-sm select-all">
                    {employeeId}
                  </div>
                </div>
              )}

              {/* Email – always read-only */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-teal-500 block mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email ?? ""}
                  disabled
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed text-sm"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-teal-500 block mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 bg-slate-50 text-slate-800 text-sm transition"
                />
              </div>

              {/* Change Password */}
              <div className="border-t border-dashed border-slate-200 pt-2">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Change Password
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowPasswords((p) => !p)}
                    className="text-xs text-teal-600 hover:underline"
                  >
                    {showPasswords ? "Hide" : "Show"} fields
                  </button>
                </div>

                {showPasswords && (
                  <div className="space-y-4">
                    <PasswordInput
                      label="New Password"
                      value={editForm.newPassword}
                      onChange={(v) => setEditForm((p) => ({ ...p, newPassword: v }))}
                      placeholder="Min. 8 characters"
                    />
                    <PasswordInput
                      label="Confirm New Password"
                      value={editForm.confirmPassword}
                      onChange={(v) => setEditForm((p) => ({ ...p, confirmPassword: v }))}
                      placeholder="Re-enter new password"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t bg-white flex gap-3 shrink-0">
              <button
                onClick={() => setEditOpen(false)}
                disabled={saving}
                className="flex-1 py-3 text-sm font-semibold border border-slate-200 rounded-2xl hover:bg-slate-50 disabled:opacity-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 py-3 text-sm font-semibold bg-teal-600 text-white rounded-2xl hover:bg-teal-700 disabled:opacity-60 transition flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-600 text-sm">{label}</span>
      <span className="font-bold text-lg text-slate-800">{value}</span>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-widest text-teal-500 block mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-10 rounded-2xl border border-slate-200 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 bg-slate-50 text-slate-800 text-sm transition"
        />
        <button
          type="button"
          onClick={() => setShow((p) => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
          tabIndex={-1}
        >
          {show ? (
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                clipRule="evenodd"
              />
              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}