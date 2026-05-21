export const safeJsonParse = async (res: Response): Promise<any> => {
  if (res.status === 204) return { success: true };
  const text = await res.text();
  return text ? JSON.parse(text) : { success: res.ok };
};

export function resolveCertUrl(
  raw: string | undefined | null,
  backendUrl: string
): string | null {
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  const clean = raw.replace(/^wwwroot\//, "/").replace(/^\/?/, "/");
  return `${backendUrl}${clean}`;
}


export function getFullName(user: any): string {
  const first = (user?.firstName ?? "").trim();
  const last = (user?.lastName ?? "").trim();
  if (first || last) return `${first} ${last}`.trim();
  return (user?.name ?? "User").trim() || "User";
}


export function getEmployeeCode(user: any): string {
  return (
    user?.employeeCode ??
    user?.employeeId ??
    user?.empId ??
    ""
  );
}

export function getUserId(user: any): string {
  return user?.userId ?? user?.id ?? "";
}

export function buildInitials(fullName: string): string {
  return (
    fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"
  );
}
