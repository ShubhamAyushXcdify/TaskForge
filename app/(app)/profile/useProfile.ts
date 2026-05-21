"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import type { MyCourse, DashboardStats } from "@/types/types";
import { resolveCertUrl, getFullName, getEmployeeCode, getUserId } from "./profileUtils";

interface CertificateUploadResponse {
  success: boolean;
  message: string;
  assignmentId: string;
  courseTitle: string;
  certificateUrl: string;
  status: "Completed";
  completedAt: string;
}

// ─── useProfileData ────────────────────────────────────────────────────────────

export function useProfileData() {
  const { data: session } = useSession();
  const [myCourses, setMyCourses] = useState<MyCourse[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
  const token = session?.user?.token;
  const user = session?.user;

  const fullName = getFullName(user);
  const employeeCode = getEmployeeCode(user);
  const userId = getUserId(user);

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

  const completedCourses = useMemo(
    () => myCourses.filter((c) => c.status === "Completed"),
    [myCourses]
  );

  const inProgressCourses = useMemo(
    () => myCourses.filter((c) => c.status === "InProgress" || c.status === "Assigned"),
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

  return {
    user,
    fullName,
    employeeCode,
    userId,
    myCourses,
    setMyCourses,
    stats,
    loading,
    completedCourses,
    inProgressCourses,
    skillsData,
    token,
    backendUrl,
  };
}

// ─── useCertificateUpload ──────────────────────────────────────────────────────

export function useCertificateUpload(
  token: string | undefined,
  backendUrl: string,
  setMyCourses: React.Dispatch<React.SetStateAction<MyCourse[]>>
) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

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
    [selectedAssignmentId, token, backendUrl, setMyCourses]
  );

  return { fileInputRef, uploadingId, handleUploadClick, handleFileChange };
}
