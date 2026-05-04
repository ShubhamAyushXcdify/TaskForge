export type Course = {
  id: number;
  title: string;
  category: string;
  duration: string;
  level: string;
  progress: number;
  hoursSpent: number;
  totalHours: number;
  completed: boolean;
  dueDate: string;
};

export type Todo = {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  priority: string;
};

export type Activity = {
  id: string;
  type: string;
  title: string;
  timestamp: string;
};

export type ChartKey = "peak" | "category" | "trend";

export type CompDonut = {
  completed: number;
  inProgress: number;
  assigned: number;
  rate: number;
  size?: "sm" | "lg";
}

export type Lesson = {
  id: string;
  title: string;
  duration: string;
  type: "video" | "reading" | "quiz" | "project" | "certificate";
  completed: boolean;
}

export type Section = {
  id: string;
  title: string;
  lessons: Lesson[];
}

export type Quiz = {
  id: string;
  title: string;
  score: number | null;
  maxScore: number;
  attempts: number;
  passed: boolean;
}

export type RelatedCourse = {
  id: number;
  title: string;
  category: string;
  duration: string;
  level: string;
  progress: number;
}

export type CourseAssignment = {
  assignmentId: string;
  courseId: string;
  courseTitle: string;
  courseCategory: string;
  providerName: string;
  durationHours: number;
  progressPercentage: number;
  status: string;
}

export type AllCourse = {
  id: string;
  title: string;
  category: string;
}

export type CourseSummary = CourseAssignment | AllCourse;

export type CourseCardProps = {
  course: CourseSummary;
  badge?: string;
}

export type CurrentlyLearningProps = {
  courses: CourseAssignment[];
}