import { categoryColors } from "./color";
import{CourseCardProps} from "@/types/types";



function getCategoryColor(category: string) {
  return categoryColors[category] || "from-slate-400 to-slate-600";
}

export default function CourseCard({ course, badge }: CourseCardProps) {
  const title = 'courseTitle' in course ? course.courseTitle : course.title;
  const category = 'courseCategory' in course ? course.courseCategory : course.category;

  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
      <div
        className={`h-36 bg-gradient-to-br ${getCategoryColor(category)} flex items-end p-4`}
      >
        <span className="text-black text-xs opacity-80">{category}</span>
      </div>

      {badge && (
        <span className="absolute top-3 left-3 text-[10px] bg-white/90 backdrop-blur px-2 py-1 rounded-full font-medium text-teal-700">
          {badge}
        </span>
      )}

      <div className="p-5">
        <h3 className="font-semibold text-base leading-tight line-clamp-2">{title}</h3>
      </div>

      <button className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 bg-white text-sm py-2 rounded-xl shadow">
        View Course
      </button>
    </div>
  );
}