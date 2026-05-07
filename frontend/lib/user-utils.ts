import type { AuthUser } from "./auth-context";

export function getInitials(name?: string | null, email?: string | null): string {
  const source = (name && name.trim()) || (email ? email.split("@")[0] : "");
  if (!source) return "U";
  const parts = source.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getDisplayName(user: AuthUser | null): string {
  if (!user) return "";
  if (user.name && user.name.trim()) return user.name;
  return user.email?.split("@")[0] ?? "User";
}

export function getShortName(user: AuthUser | null): string {
  const full = getDisplayName(user);
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return full;
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export function getRoleLabel(user: AuthUser | null): string {
  if (!user) return "";
  return user.role === "admin" ? "Admin" : "Member";
}
