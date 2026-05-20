"use client";

import { useSession } from "next-auth/react";
import { useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";

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