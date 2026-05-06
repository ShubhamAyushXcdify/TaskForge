import Link from "next/link";
import { categoryColors } from "./color";
import { CourseCardProps } from "@/types/types";

function getCategoryColor(category: string) {
  return categoryColors[category] || "from-slate-200 to-slate-300";
}

export default function CourseCard({ course, badge }: CourseCardProps) {
  const title = "courseTitle" in course ? course.courseTitle : course.title;
  const category = "courseCategory" in course ? course.courseCategory : course.category;
  const courseId = "courseId" in course ? course.courseId : course.id;
  const progress =
    "progressPercentage" in course ? course.progressPercentage : 0;
  const provider = "providerName" in course ? course.providerName : null;
  const duration = "durationHours" in course ? course.durationHours : null;

  return (
    <Link
      href={`/course/${courseId}`}
      className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-teal-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex flex-col"
    >
      {/* Color banner */}
      <div
        className={`h-32 bg-gradient-to-br ${getCategoryColor(category)} flex flex-col justify-between p-3`}
      >
        {badge && (
          <span className="self-start text-[10px] bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full font-semibold text-teal-700 tracking-wide">
            {badge}
          </span>
        )}
        <span className="text-[11px] font-medium text-black/60 bg-white/40 backdrop-blur-sm self-start px-2 py-0.5 rounded-md">
          {category}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-1.5">
        <h3 className="font-semibold text-[13px] leading-snug text-gray-900 line-clamp-2 group-hover:text-teal-700 transition-colors">
          {title}
        </h3>

        {(provider || duration) && (
          <p className="text-[11px] text-slate-400 font-medium">
            {provider}
            {provider && duration ? " · " : ""}
            {duration ? `${duration}h` : ""}
          </p>
        )}

        {/* Progress bar if in-progress */}
        {progress > 0 && progress < 100 && (
          <div className="mt-auto pt-2">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* View course CTA */}
        <div className="mt-3 pt-2.5 border-t border-slate-50 text-center">
          <span className="text-[11px] font-semibold text-teal-600 group-hover:text-teal-700 transition-colors">
            View Course →
          </span>
        </div>
      </div>
    </Link>
  );
}