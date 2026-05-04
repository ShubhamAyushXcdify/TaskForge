"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

import CourseCard from "@/app/(app)/course/components/courseCard";
import CurrentlyLearning from "@/app/(app)/course/components/courseLearning";
import{CourseAssignment} from "@/types/types";



export default function CoursePage() {
  const { data: session } = useSession();

  const [myAssignments, setMyAssignments] = useState<CourseAssignment[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseError, setCourseError] = useState<string | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    async function fetchData() {
      try {
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        if (session?.user?.token) {
          headers["Authorization"] = `Bearer ${session.user.token}`;
        }

        // 🔥 MyCourses
        const myRes = await fetch(`${backendUrl}/api/Course/MyCourses`, {
          headers,
        });

        const myData = await myRes.json();

        if (myData?.Success) {
          const assignments = myData.Data?.Assignments || [];

          const mapped = assignments.map((a: any) => ({
            assignmentId: a.AssignmentId,
            courseId: a.CourseId,
            courseTitle: a.CourseTitle,
            courseCategory: a.CourseCategory,
            providerName: a.ProviderName,
            durationHours: a.DurationHours,
            progressPercentage: a.ProgressPercentage,
            status: a.Status,
          }));

          setMyAssignments(mapped);
        }

        // 🔥 AllCourses (optional)
        try {
          const allRes = await fetch(`${backendUrl}/api/Course`, {
            headers,
          });

          const allData = await allRes.json();

          if (allData?.Success) {
            setAllCourses(allData.Data || []);
          }
        } catch {
          setCourseError("Courses unavailable right now");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (session !== undefined) {
      fetchData();
    }
  }, [backendUrl, session]);

  const currentlyLearning = myAssignments.filter(
    (c) =>
      c.status === "InProgress" &&
      c.progressPercentage > 0 &&
      c.progressPercentage < 100
  );

  const trending = [...allCourses].slice(0, 5);
  const recommended = [...allCourses].slice(2, 7);
  const recentlyViewed = [...allCourses].slice(1, 6);

  if (loading)
    return <div className="p-12 text-center">Loading courses...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-10">

        {/* Header */}
        <h1 className="text-3xl font-semibold text-gray-900">Courses</h1>

        
        {currentlyLearning.length > 0 && (
          <div className="bg-teal-600 text-white rounded-xl px-5 py-4 flex justify-between items-center">
            <div>
              <p className="text-xs opacity-80">Continue learning</p>
              <h3 className="text-base font-semibold">
                {currentlyLearning[0].courseTitle}
              </h3>
            </div>

            <Link
              href={`/course/${currentlyLearning[0].courseId}`}
              className="bg-white text-teal-600 px-4 py-2 text-xs rounded-lg font-medium hover:bg-gray-100 transition"
            >
              Resume
            </Link>
          </div>
        )}

        {/* Currently Learning */}
        <CurrentlyLearning courses={currentlyLearning} />

        {/* Other Sections */}
        {courseError ? (
          <div className="p-6 bg-white rounded-2xl text-center text-slate-500">
            {courseError}
          </div>
        ) : (
          <>
            <Section title="Trending" courses={trending} badge="Trending" />
            <Section title="Recommended" courses={recommended} badge="For you" />
            <Section title="Recently Viewed" courses={recentlyViewed} />
          </>
        )}
      </div>
    </div>
  );
}


function Section({
  title,
  courses,
  badge,
}: {
  title: string;
  courses: any[];
  badge?: string;
}) {
  if (!courses.length) return null;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {courses.map((course) => (
          <CourseCard
            key={"id" in course ? course.id : course.assignmentId}
            course={course}
            badge={badge}
          />
        ))}
      </div>
    </div>
  );
}