"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import CourseCard from "@/app/(app)/course/components/courseCard";
import { CourseAssignment } from "@/types/types";
import { useApiFetch } from "@/app/admin/courses/api";

export default function CoursePage() {
  const { data: session, status } = useSession();
  const [myAssignments, setMyAssignments] = useState<CourseAssignment[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseError, setCourseError] = useState<string | null>(null);

  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
// const apiFetch = useApiFetch();
//   const fetchData = useCallback(async () => {
    
//     if (status === "loading" || !session?.user?.token) {
//       setLoading(status === "loading");
//       return;
//     }

//     try {
//       setLoading(true);
//       setCourseError(null);

//       const headers: HeadersInit = {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${session.user.token}`
//       };

//       const [myData, allData] = await Promise.all([
//         apiFetch(`${backendUrl}/api/Course/MyCourses`, { headers }),
//         apiFetch(`${backendUrl}/api/Course`, { headers }),
//       ]);

 
//      if (myData?.success) {
//   setMyAssignments(
//     (myData.data?.assignments || []).map((a: any) => ({
//             assignmentId: a.assignmentId,
//             courseId: a.courseId,
//             courseTitle: a.courseTitle,
//             courseCategory: a.courseCategory,
//             providerName: a.providerName,
//             durationHours: a.durationHours,
//             progressPercentage: a.progressPercentage || 0,
//             status:
//   a.Status ||
//   a.status ||
//   a.assignmentStatus ||
//   a.assignmentStatus ||
//   "notstarted",
//           }))
//         );
//       }

//       if (allData?.success) {
//   const shuffled = allData.data.sort(() => Math.random() - 0.5);
//         setAllCourses(shuffled || []);
//       }
//     } catch (err) {
//       setCourseError("Failed to load courses");
//     } finally {
//       setLoading(false);
//     }
//   }, [backendUrl, session?.user?.token, status]);

const apiFetch = useApiFetch(); // 👈 moved here

const fetchData = useCallback(async () => {
  if (status === "loading" || !session?.user?.token) {
    setLoading(status === "loading");
    return;
  }

  try {
    setLoading(true);
    setCourseError(null);

    const [myData, allData] = await Promise.all([
      apiFetch<any>("/api/Course/MyCourses"),
      apiFetch<any>("/api/Course"),
    ]);

    if (myData?.success) {
      setMyAssignments(
        (myData.data?.assignments || []).map((a: any) => ({
          assignmentId: a.assignmentId,
          courseId: a.courseId,
          courseTitle: a.courseTitle,
          courseCategory: a.courseCategory,
          providerName: a.providerName,
          durationHours: a.durationHours,
          progressPercentage: a.progressPercentage || 0,
          status: a.Status || a.status || a.assignmentStatus || "notstarted",
        }))
      );
    }

    if (allData?.success) {
      setAllCourses(allData.data.sort(() => Math.random() - 0.5));
    }
  } catch (err) {
    setCourseError("Failed to load courses");
  } finally {
    setLoading(false);
  }
}, [apiFetch, session?.user?.token, status]); // 👈 apiFetch in deps

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const normalizedAllCourses = allCourses.map(course => ({
  id: course.id,
  courseId: course.id,
  courseTitle: course.title,
  courseCategory: course.category,
  providerName: course.providerName,
  durationHours: course.durationHours,
  progressPercentage: 0,
  status: "NotStarted"
}));
  const normalizeStatus = (status: string = "") =>
  status.replace(/\s/g, "").toLowerCase();

  // Filter logic

 const currentlyLearning = myAssignments.filter((c) => {
  const status = normalizeStatus(c.status);

  return [
    "inprogress",
    "notstarted",
    "pending",
    "overdue",
    "assigned",
  ].includes(status);
});
  const trending = normalizedAllCourses.slice(0,5);
  const recommended = normalizedAllCourses.slice(2,7);


  const filterCourses = (courses: any[]) => {
    return courses.filter(course => {
      const title = course.courseTitle || course.Title || '';
      const category = course.courseCategory || course.Category || course.CategoryName || '';
      
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  
  const allCategories = ["All", ...Array.from(new Set([
    ...myAssignments.map(c => c.courseCategory),
    ...normalizedAllCourses.map(c => c.courseCategory)
  ]))];

  const filteredCurrentlyLearning = filterCourses(currentlyLearning);
  const filteredTrending = filterCourses(trending);
  const filteredRecommended = filterCourses(recommended);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading courses…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Header: Courses + Search + Category */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-100">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Courses</h1>
          
          <div className="relative flex-1 max-w-lg">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm text-sm"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg hover:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm bg-white text-sm"
            >
              <span className="font-medium">{selectedCategory}</span>
              <svg className={`w-3.5 h-3.5 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showCategoryDropdown && (
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 max-h-48 overflow-auto">
                {allCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowCategoryDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Resume Banner */}
        {currentlyLearning.length > 0 && filteredCurrentlyLearning.length > 0 && (
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl px-5 py-4 flex justify-between items-center shadow-lg">
            <div>
              <p className="text-xs font-medium opacity-90 uppercase tracking-wider mb-1">
                Continue learning
              </p>
              <h3 className="text-sm font-semibold leading-tight">
                {filteredCurrentlyLearning[0].courseTitle}
              </h3>
              <p className="text-xs opacity-80 mt-1">
                {Math.round(filteredCurrentlyLearning[0].progressPercentage)}% complete
              </p>
            </div>
            <Link
              href={`/course/${filteredCurrentlyLearning[0].courseId}`}
              className="shrink-0 bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 text-xs rounded-lg font-semibold hover:bg-white/30 transition-all shadow-sm"
            >
              Resume
            </Link>
          </div>
        )}

        {/* Currently Learning */}
        {filteredCurrentlyLearning.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              Currently Learning
              <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                {filteredCurrentlyLearning.length}
              </span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredCurrentlyLearning.map((course) => (
                <CourseCard 
                  key={course.assignmentId} 
                  course={course} 
                  badge="In Progress"
                />
              ))}
            </div>
          </div>
        )}

        {/* Recommended */}
        {filteredRecommended.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recommended for You</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredRecommended.map((course) => (
                <CourseCard 
                  key={course.courseId || course.id} 
                  course={course} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Trending */}
        {filteredTrending.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Trending</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredTrending.map((course) => (
                <CourseCard 
                  key={course.courseId || course.id} 
                  course={course} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Error/Empty State */}
        {courseError ? (
          <div className="p-12 bg-white rounded-xl text-center text-slate-400 border border-slate-100 shadow-sm">
            <svg className="w-12 h-12 mx-auto mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-base font-semibold text-slate-900 mb-3">{courseError}</h3>
            <button
              onClick={fetchData}
              className="px-5 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition text-sm"
            >
              Retry
            </button>
          </div>
        ) : (
          filteredCurrentlyLearning.length === 0 &&
          filteredRecommended.length === 0 &&
          filteredTrending.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No courses found</h3>
              <p className="text-sm mb-6 max-w-sm mx-auto">Try adjusting your search or category selection</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
                className="px-6 py-2.5 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition shadow-sm text-sm"
              >
                Clear Filters
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}