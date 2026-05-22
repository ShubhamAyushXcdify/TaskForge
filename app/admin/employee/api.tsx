"use client";

import { signOut, useSession } from "next-auth/react";
import { useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export function useApiFetch() {
  const { data: session } = useSession();

  return useCallback(
    async function apiFetch<T>(
      path: string,
      options?: RequestInit
    ): Promise<T> {
     const res = await fetch(`${API_BASE}${path}`, {
  credentials: "include",
  ...options,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.user?.token}`,
    ...options?.headers, 
  },
});
       if (res.status === 401) {
              await signOut({ redirect: false });
              window.location.href = "/login";
              throw new Error("Session expired");
            }
      

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? `Request failed: ${res.status}`);
      }

      return res.json();
    },
    [session?.user?.token]
  );
}