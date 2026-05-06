"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { categoryColors } from "@/app/(app)/course/components/color";
import type { CourseDetail,UserAssignment } from "@/types/types";


export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [assignment, setAssignment] = useState<UserAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    if (!id || session === undefined) return;

    async function fetchData() {
      try {
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (session?.user?.token) {
          headers["Authorization"] = `Bearer ${session.user.token}`;
        }

       
        const courseRes = await fetch(`${backendUrl}/api/Course/${id}`, { headers });
        const courseJson = await courseRes.json();

        if (courseJson?.Success) {
          setCourse(courseJson.Data);
        } else {
          setError(courseJson?.Message || "Failed to load course");
        }

        
        const myRes = await fetch(`${backendUrl}/api/Course/MyCourses`, { headers });
        const myJson = await myRes.json();

        if (myJson?.Success && myJson.Data?.Assignments) {
          const userAssignment = myJson.Data.Assignments.find(
            (a: any) => a.CourseId === id
          );
          if (userAssignment) {
            setAssignment({
              ProgressPercentage: userAssignment.ProgressPercentage || 0,
              Status: userAssignment.Status,
              CompletedAt: userAssignment.CompletedAt,
            });
          }
        }
      } catch (err) {
        console.error(err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, session, backendUrl]);

  const handleGoToCourse = () => {
    if (course?.ProviderWebsite) {
      window.open(course.ProviderWebsite, "_blank", "noopener,noreferrer");
    } else {
      alert("No external link available.");
    }
  };

  const handleRequestCourse = () => {
    if (!session?.user?.token) {
      alert("Please login to request this course");
      return;
    }
    setRequesting(true);
    setTimeout(() => {
      alert(`Request sent for "${course?.Title}"\nManager will review it soon.`);
      setRequesting(false);
    }, 700);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Loading course...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-red-500">
        {error || "Course not found"}
      </div>
    );
  }

  const bannerColor = categoryColors[course.CategoryName] || "from-slate-400 to-slate-600";
  const isEnrolled = !!assignment;
  const progress = assignment?.ProgressPercentage || 0;
  const isCompleted = assignment?.Status === "Completed";

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="max-w-4xl mx-auto px-6 pt-6">

        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href="/course" className="hover:text-teal-600">Courses</Link>
          <span>›</span>
          <span className="text-slate-600 line-clamp-1">{course.Title}</span>
        </nav>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Banner */}
          <div className={`h-56 bg-gradient-to-br ${bannerColor} relative`}>
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute bottom-0 left-0 right-0 p-7">
              <span className="inline-block px-4 py-1 bg-white/90 text-xs font-medium rounded-full mb-3">
                {course.CategoryName}
              </span>
              <h1 className="text-3xl font-semibold text-white leading-tight">
                {course.Title}
              </h1>
            </div>
          </div>

          <div className="p-7">
            <div className="flex flex-wrap gap-3 mb-7">
              <MetaPill icon="🏢" label={course.ProviderName} />
              <MetaPill icon="⏱" label={`${course.DurationHours} hours`} />
              <MetaPill icon="👥" label={`${course.TotalAssignments} enrolled`} />
            </div>

            {/* Progress Bar - if enrolled */}
            {isEnrolled && (
              <div className="mb-7 bg-slate-50 rounded-2xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">
                    {isCompleted ? "✅ Completed" : "Your Progress"}
                  </span>
                  <span className="font-semibold text-teal-600">{progress}%</span>
                </div>
                <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-600 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">ABOUT THIS COURSE</h3>
              <p className="text-slate-600 leading-relaxed">
                {course.Description || "No description available."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <button
                onClick={handleGoToCourse}
                className="flex-1 py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-2xl transition"
              >
                Go to Course →
              </button>

              {!isEnrolled && (
                <button
                  onClick={handleRequestCourse}
                  disabled={requesting}
                  className="px-7 py-4 border border-slate-300 hover:bg-slate-50 font-medium rounded-2xl transition whitespace-nowrap disabled:opacity-70"
                >
                  {requesting ? "Sending..." : "+ Request Course"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaPill({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 text-sm px-4 py-2 rounded-2xl">
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}