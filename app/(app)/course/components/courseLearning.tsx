"use client";

import Link from "next/link";
import { categoryColors } from "./color"; 
import{ CurrentlyLearningProps } from "@/types/types";




function getCategoryColor(category: string) {
  return categoryColors[category] || "from-slate-300 to-slate-400";
}

export default function CurrentlyLearning({ courses = [] }: CurrentlyLearningProps) {
  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm">
        No active courses. Start learning 🚀
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Currently Learning
        </h2>
        <button className="text-xs text-teal-600 hover:underline">
          See all
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((course) => (
          <div
            key={course.assignmentId}
            className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all"
          >
            {/* ✅ CATEGORY COLOR APPLIED */}
            <div
              className={`h-28 bg-gradient-to-br ${getCategoryColor(
                course.courseCategory
              )} rounded-xl mb-4 flex items-end p-3`}
            >
              <span className="text-[10px] text-black/80">
                {course.courseCategory}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-sm text-gray-900 leading-snug">
              {course.courseTitle}
            </h3>

            {/* Meta */}
            <p className="text-xs text-slate-500 mt-1">
              {course.providerName} • {course.durationHours} hrs
            </p>

            {/* Progress */}
            <div className="mt-4">
              <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                <span>Progress</span>
                <span>{Math.round(course.progressPercentage)}%</span>
              </div>

              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full transition-all duration-300"
                  style={{ width: `${course.progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Button */}
            <Link
              href={`/course/${course.courseId}`}
              className="mt-4 block w-full py-2 text-center text-xs font-medium bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition"
            >
              Continue
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}