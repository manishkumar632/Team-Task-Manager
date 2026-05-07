import { apiFetch, getToken } from "./auth-context";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// ─── Types ────────────────────────────────────────────────────────────────
export type Member = {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
};

export type TeamMember = Member & {
  role: "admin" | "member";
  created_at: string;
  open_tasks: number;
  done_tasks: number;
};

export type Project = {
  id: string;
  name: string;
  tag: string;
  color: string;
  owner_id: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  members: Member[];
  task_total: number;
  task_done: number;
  progress: number;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  project_id: string | null;
  assignee_id: string | null;
  creator_id: string;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  project: { id: string; name: string; tag: string; color: string } | null;
  assignee: Member | null;
  creator: Member | null;
};

export type Activity = {
  id: string;
  verb: string;
  target_type: string;
  target_id: string | null;
  message: string;
  created_at: string;
  actor: Member;
};

export type StatsOverview = {
  buckets: { todo: number; in_progress: number; done: number; overdue: number };
  week: { days: string[]; completed: number[] };
  sprint: { done: number; active: number; backlog: number; pct: number };
  counts: { tasks_total: number; my_tasks: number };
};

// ─── API ──────────────────────────────────────────────────────────────────
export const api = {
  // Projects
  listProjects: () =>
    apiFetch<{ projects: Project[] }>("/api/projects").then((r) => r.projects),
  createProject: (input: {
    name: string;
    tag?: string;
    color?: string;
    due_date?: string | null;
    member_ids?: string[];
  }) =>
    apiFetch<{ project: Project }>("/api/projects", {
      method: "POST",
      body: JSON.stringify(input),
    }).then((r) => r.project),
  updateProject: (id: string, patch: Partial<{
    name: string; tag: string; color: string; due_date: string | null; member_ids: string[];
  }>) =>
    apiFetch<{ project: Project }>(`/api/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }).then((r) => r.project),
  deleteProject: (id: string) =>
    apiFetch<void>(`/api/projects/${id}`, { method: "DELETE" }),

  // Tasks
  listTasks: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch<{ tasks: Task[] }>(`/api/tasks${qs ? `?${qs}` : ""}`).then(
      (r) => r.tasks
    );
  },
  createTask: (input: {
    title: string;
    description?: string | null;
    status?: Task["status"];
    priority?: Task["priority"];
    project_id?: string | null;
    assignee_id?: string | null;
    due_date?: string | null;
  }) =>
    apiFetch<{ task: Task }>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(input),
    }).then((r) => r.task),
  updateTask: (id: string, patch: Partial<Omit<Task, "id" | "created_at" | "updated_at" | "creator_id" | "project" | "assignee" | "creator">>) =>
    apiFetch<{ task: Task }>(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }).then((r) => r.task),
  deleteTask: (id: string) =>
    apiFetch<void>(`/api/tasks/${id}`, { method: "DELETE" }),

  // Team
  listTeam: () =>
    apiFetch<{ members: TeamMember[] }>("/api/team").then((r) => r.members),

  // Activity
  listActivity: (limit = 50) =>
    apiFetch<{ activity: Activity[] }>(`/api/activity?limit=${limit}`).then(
      (r) => r.activity
    ),

  // Stats
  overview: () =>
    apiFetch<StatsOverview>("/api/stats/overview"),
};

// ─── Cloudinary upload (browser → backend signature → Cloudinary) ─────────
export type CloudinarySignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
};

export async function uploadAvatarToCloudinary(file: File): Promise<string> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  // 1. Get signed payload from our backend.
  const sig = await apiFetch<CloudinarySignature>(
    "/api/uploads/cloudinary-signature",
    { method: "POST", body: JSON.stringify({}) }
  );

  // 2. Upload directly to Cloudinary's REST endpoint with that signature.
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", String(sig.timestamp));
  form.append("folder", sig.folder);
  form.append("signature", sig.signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
    { method: "POST", body: form }
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "Cloudinary upload failed");
  }
  return data.secure_url as string;
}

export { API_URL };
