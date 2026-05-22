"use client";

import { signOut, useSession } from "next-auth/react";
import { useCallback } from "react";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export function useApiFetch() {
  const { data: session } = useSession();
  
  return useCallback(
    async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
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
        throw new Error((err as any).message ?? `Request failed: ${res.status}`);
      }
      
      return await res.json() as T;
    },
    [session?.user?.token]
  );
}