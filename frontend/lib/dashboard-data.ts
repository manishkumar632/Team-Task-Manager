import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  CalendarClock,
  Activity,
  TrendingUp,
  AlertTriangle,
  Circle,
  CheckCircle2,
  Flame,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  icon: LucideIcon;
  href: string;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Projects", icon: FolderKanban, href: "/projects" },
  { label: "My Tasks", icon: CheckSquare, href: "/tasks" },
  { label: "Team Members", icon: Users, href: "/team" },
  { label: "Deadlines", icon: CalendarClock, href: "/deadlines" },
  { label: "Activity Timeline", icon: Activity, href: "/activity" },
  { label: "Progress Tracking", icon: TrendingUp, href: "/progress" },
  { label: "Overdue Alerts", icon: AlertTriangle, href: "/overdue" },
];

export type TeamMember = {
  name: string;
  initials: string;
  color: string;
};

export const team: TeamMember[] = [
  { name: "Anna Stewart", initials: "AS", color: "bg-[oklch(0.88_0.06_285)]" },
  { name: "Volter Anderson", initials: "VA", color: "bg-[oklch(0.88_0.05_230)]" },
  { name: "Alice Miller", initials: "AM", color: "bg-[oklch(0.88_0.06_350)]" },
  { name: "Monica Peters", initials: "MP", color: "bg-[oklch(0.88_0.06_160)]" },
  { name: "Liam Carter", initials: "LC", color: "bg-[oklch(0.88_0.06_75)]" },
];

export type Project = {
  name: string;
  tag: string;
  tagBg: string;
  progress: number;
  due: string;
  members: string[];
};

export const projects: Project[] = [
  {
    name: "Mobile App Redesign",
    tag: "Design",
    tagBg: "bg-[oklch(0.94_0.05_285)] text-[oklch(0.4_0.15_285)]",
    progress: 72,
    due: "May 18",
    members: ["AS", "VA", "AM"],
  },
  {
    name: "Marketing Website v2",
    tag: "Web",
    tagBg: "bg-[oklch(0.94_0.05_230)] text-[oklch(0.4_0.15_230)]",
    progress: 48,
    due: "May 24",
    members: ["MP", "LC"],
  },
  {
    name: "Onboarding Flow",
    tag: "Product",
    tagBg: "bg-[oklch(0.94_0.05_350)] text-[oklch(0.45_0.15_350)]",
    progress: 91,
    due: "May 12",
    members: ["VA", "AS"],
  },
];

export type TaskBucket = {
  label: string;
  count: number;
  accent: string;
  icon: LucideIcon;
};

export const taskBuckets: TaskBucket[] = [
  { label: "To Do", count: 14, accent: "bg-[oklch(0.94_0.05_230)] text-[oklch(0.4_0.15_230)]", icon: Circle },
  { label: "In Progress", count: 8, accent: "bg-[oklch(0.94_0.06_285)] text-[oklch(0.4_0.18_285)]", icon: Activity },
  { label: "Done", count: 27, accent: "bg-[oklch(0.94_0.07_160)] text-[oklch(0.38_0.13_160)]", icon: CheckCircle2 },
  { label: "Overdue", count: 3, accent: "bg-[oklch(0.94_0.07_20)] text-[oklch(0.5_0.18_20)]", icon: Flame },
];

export type TodayTask = { time: string; title: string; tag: string };
export const todayTasks: TodayTask[] = [
  { time: "09:30", title: "Design review with Anna", tag: "Design" },
  { time: "11:00", title: "Sprint planning standup", tag: "Team" },
  { time: "14:30", title: "Ship onboarding v2 build", tag: "Product" },
];

export type Update = { who: string; text: string; when: string };
export const updates: Update[] = [
  { who: "Anna", text: "moved Login screen to In Progress", when: "2m" },
  { who: "Volter", text: "completed API auth refactor", when: "18m" },
  { who: "Alice", text: "left a comment on Onboarding", when: "1h" },
  { who: "Monica", text: "uploaded 3 new assets to Brand", when: "3h" },
];

export type OverdueItem = { t: string; d: string };
export const overdueItems: OverdueItem[] = [
  { t: "Update billing screen", d: "2 days ago" },
  { t: "QA: payment flow", d: "1 day ago" },
  { t: "Send sprint report", d: "5 hours ago" },
];

export const barData = [38, 64, 52, 88, 46, 70, 58];
export const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const currentUser = {
  name: "Volter Anderson",
  short: "Volter A.",
  initials: "VA",
  role: "Admin",
  plan: "Premium",
};