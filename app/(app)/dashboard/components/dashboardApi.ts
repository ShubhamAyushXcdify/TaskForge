import type {DashboardStats, DayHours,CategoryBreakdown,Activity,Todo,WeeklyHours, } from "@/app/(app)/dashboard/components//dashboard";

export class UnauthorizedError extends Error {
  constructor() { super("Unauthorized"); }
}


export const isOk    = (r: any) => r?.Success === true || r?.success === true;
export const getData = (r: any) => r?.Data ?? r?.data ?? null;



export const mapStats = (d: any): DashboardStats => ({
  assigned:       d.Assigned       ?? d.assigned       ?? 0,
  completed:      d.Completed      ?? d.completed      ?? 0,
  inProgress:     d.InProgress     ?? d.inProgress     ?? 0,
  notStarted:     d.NotStarted     ?? d.notStarted     ?? 0,
  completionRate: d.CompletionRate ?? d.completionRate ?? 0,
  totalHoursSpent:d.TotalHoursSpent?? d.totalHoursSpent?? 0,
  avgScore:       d.AvgScore       ?? d.avgScore       ?? null,
});

export const mapDay = (d: any): DayHours => ({
  day:   d.Day   ?? d.day   ?? "",
  hours: d.Hours ?? d.hours ?? 0,
});

export const mapCat = (d: any): CategoryBreakdown => ({
  category:   d.Category   ?? d.category   ?? "",
  count:      d.Count      ?? d.count      ?? 0,
  percentage: d.Percentage ?? d.percentage ?? 0,
});

export const mapAct = (d: any): Activity => ({
  id:        d.Id        ?? d.id        ?? "",
  type:      d.Type      ?? d.type      ?? "started",
  title:     d.Title     ?? d.title     ?? "",
  timestamp: d.Timestamp ?? d.timestamp ?? "",
});



export const mapTodo = (d: any): Todo => ({
  id:          d.Id          ?? d.id          ?? "",
  title:       d.Title       ?? d.title       ?? "",
  isCompleted: d.IsCompleted ?? d.isCompleted ?? d.Completed ?? d.completed ?? false,
  dueDate:     d.DueDate     ?? d.dueDate,
  createdAt:   d.CreatedAt   ?? d.createdAt,
});



export async function safeFetch(url: string, token?: string): Promise<any> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const res = await fetch(url, { headers });
    if (res.status === 401) throw new UnauthorizedError();
    if (!res.ok) return null;
    return await res.json();
  } catch (e){
    throw e;
  }
}



export async function fetchTodos(backendUrl: string, token?: string): Promise<Todo[]> {
  const json = await safeFetch(`${backendUrl}/api/Todo`, token);
  if (!isOk(json)) return [];
  return (getData(json) ?? []).map(mapTodo);
}

export async function createTodo(
  backendUrl: string,
  title: string,
  token?: string
): Promise<Todo | null> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const res = await fetch(`${backendUrl}/api/Todo`, {
      method: "POST",
      headers,
      body: JSON.stringify({ Title: title }),
    });
    if (res.status === 401) throw new UnauthorizedError();
    const json = await res.json();
    if (isOk(json) && getData(json)) return mapTodo(getData(json));
    return null;
  } catch (e) {
    throw e;
  }
}

export async function toggleTodoApi(
  backendUrl: string,
  id: string,
  isCompleted: boolean,
  token?: string
): Promise<boolean> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const res = await fetch(`${backendUrl}/api/Todo/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ IsCompleted: isCompleted }),
    });
    if (res.status === 401) throw new UnauthorizedError();
    return res.ok;
  } catch (e) {
    throw e;
  }
}
