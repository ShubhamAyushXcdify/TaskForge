"use client";

import { useMemo } from "react";
import { useEditProfile } from "./useEditProfile";
import { useCertificateUpload, useProfileData } from "./useProfile";
import { buildInitials } from "./profileUtils";
import { CourseUploadButton, SkillBar, StatRow } from "./ProfileUI";
import { EditProfilePanel } from "./EditProfilePanel";


export default function ProfilePage() {
  const {
    user,
    fullName,
    employeeCode,
    myCourses,
    setMyCourses,
    stats,
    loading,
    completedCourses,
    inProgressCourses,
    skillsData,
    token,
    backendUrl,
  } = useProfileData();

  const { fileInputRef, uploadingId, handleUploadClick, handleFileChange } =
    useCertificateUpload(token, backendUrl, setMyCourses);

  const {
    editOpen,
    setEditOpen,
    saving,
    editForm,
    setEditForm,
    showPasswords,
    setShowPasswords,
    handleSaveProfile,
  } = useEditProfile({ fullName, token, backendUrl });

  const initials = useMemo(() => buildInitials(fullName), [fullName]);

  // ── Loading ─────────────────────────────────────────────────────────────────
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
      {/* Hidden file input */}
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
              {employeeCode && (
                <span className="inline-block mt-2 text-xs font-mono bg-white/15 border border-white/20 text-white px-3 py-1 rounded-full">
                  {employeeCode}
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
              skillsData.map((skill, i) => <SkillBar key={i} {...skill} />)
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

                      {certUrl ? (
                        <>
                          <a
                            href={certUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-semibold bg-teal-600 text-white px-3 py-2 rounded-xl hover:bg-teal-700 active:scale-95 transition-all shrink-0"
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
                          <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-2 rounded-xl text-xs font-semibold shrink-0">
                            <span className="text-sm">✅</span> Done
                          </div>
                        </>
                      ) : (
                        <button
                          onClick={() => handleUploadClick(course.assignmentId)}
                          disabled={uploadingId === course.assignmentId}
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
                        <CourseUploadButton
                          assignmentId={course.assignmentId}
                          uploadingId={uploadingId}
                          onUpload={handleUploadClick}
                          variant="amber"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
        <EditProfilePanel
          user={user}
          employeeCode={employeeCode}
          editForm={editForm}
          setEditForm={setEditForm}
          saving={saving}
          showPasswords={showPasswords}
          setShowPasswords={setShowPasswords}
          onSave={handleSaveProfile}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}