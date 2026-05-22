import { signOut } from "next-auth/react";

export async function apiFetch(url: string, token?: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (res.status === 401) {
    await signOut({ redirect: false });
    window.location.href = "/login";
    return null;
  }

  return res;
}