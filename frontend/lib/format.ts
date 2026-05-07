import { getInitials } from "./user-utils";
import type { Member } from "./api";

export function memberInitials(m: Pick<Member, "name" | "email">) {
  return getInitials(m.name, m.email);
}

export function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatDateTime(d: string | null | undefined): string {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function relativeTime(iso: string): string {
  const now = Date.now();
  const t = new Date(iso).getTime();
  const sec = Math.round((now - t) / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function isOverdue(due: string | null | undefined, status?: string): boolean {
  if (!due) return false;
  if (status === "done") return false;
  return new Date(due).getTime() < Date.now();
}

export function tagBg(color: string): string {
  switch (color) {
    case "blue":
      return "bg-[oklch(0.94_0.05_230)] text-[oklch(0.4_0.15_230)]";
    case "pink":
      return "bg-[oklch(0.94_0.05_350)] text-[oklch(0.45_0.15_350)]";
    case "green":
      return "bg-[oklch(0.94_0.07_160)] text-[oklch(0.38_0.13_160)]";
    case "amber":
      return "bg-[oklch(0.94_0.07_75)] text-[oklch(0.45_0.15_75)]";
    case "rose":
      return "bg-[oklch(0.94_0.07_20)] text-[oklch(0.5_0.18_20)]";
    case "violet":
    default:
      return "bg-[oklch(0.94_0.05_285)] text-[oklch(0.4_0.15_285)]";
  }
}

export const COLOR_OPTIONS = ["violet", "blue", "pink", "green", "amber", "rose"] as const;
export type ColorOption = (typeof COLOR_OPTIONS)[number];

export function priorityBadge(p: "low" | "medium" | "high"): string {
  switch (p) {
    case "high":
      return "bg-[oklch(0.94_0.07_20)] text-[oklch(0.5_0.18_20)]";
    case "low":
      return "bg-[oklch(0.94_0.05_230)] text-[oklch(0.4_0.15_230)]";
    case "medium":
    default:
      return "bg-[oklch(0.94_0.06_75)] text-[oklch(0.45_0.15_75)]";
  }
}

export function statusBadge(s: "todo" | "in_progress" | "done"): {
  label: string;
  className: string;
} {
  if (s === "done")
    return {
      label: "Done",
      className: "bg-[oklch(0.94_0.07_160)] text-[oklch(0.38_0.13_160)]",
    };
  if (s === "in_progress")
    return {
      label: "In Progress",
      className: "bg-[oklch(0.94_0.06_285)] text-[oklch(0.4_0.18_285)]",
    };
  return {
    label: "To Do",
    className: "bg-[oklch(0.94_0.05_230)] text-[oklch(0.4_0.15_230)]",
  };
}
