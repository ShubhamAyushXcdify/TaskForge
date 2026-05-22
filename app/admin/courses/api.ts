"use client";

import { useCallback } from "react";
import { signOut, useSession } from "next-auth/react";
import { Course } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export function useApiFetch() {
  const { data: session } = useSession();

  return useCallback(
    async function apiFetch<T>(
      path: string,
      options?: RequestInit
    ): Promise<T> {
      const res = await fetch(`${API_BASE}${path}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.token}`,
        },
        credentials: "include",
        ...options,
      });
       if (res.status === 401) {
        await signOut({ redirect: false });
        window.location.href = "/login";
        throw new Error("Session expired");
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));

        throw new Error(
          (err as any).message ?? `Request failed: ${res.status}`
        );
      }

      return res.json() as Promise<T>;
    },
    [session?.user?.token]
  );
}

export function mapCourse(raw: any): Course {
  return {
    id: raw.Id ?? raw.id,
    title: raw.Title ?? raw.title,
    description: raw.Description ?? raw.description ?? "",

    category: {
      id: raw.Category?.Id ?? raw.category?.id ?? "",
      name: raw.Category?.Name ?? raw.category?.name ?? "—",
    },

    provider: {
      id: raw.Provider?.Id ?? raw.provider?.id ?? "",
      name: raw.Provider?.Name ?? raw.provider?.name ?? "—",
    },

    durationHours: raw.DurationHours ?? raw.durationHours ?? 0,
    isActive: raw.IsActive ?? raw.isActive ?? true,
    createdAt: raw.CreatedAt ?? raw.createdAt ?? "",

    stats: {
      assigned: raw.Stats?.Assigned ?? raw.stats?.assigned ?? 0,
      completed: raw.Stats?.Completed ?? raw.stats?.completed ?? 0,
      inProgress: raw.Stats?.InProgress ?? raw.stats?.inProgress ?? 0,
      pending: raw.Stats?.Pending ?? raw.stats?.pending ?? 0,
      completionRate:
        raw.Stats?.CompletionRate ??
        raw.stats?.completionRate ??
        0,
    },
  };
}