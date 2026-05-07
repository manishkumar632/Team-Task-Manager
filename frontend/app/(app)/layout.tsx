"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/sidebar";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-screen bg-[var(--background)] text-foreground font-sans p-4 gap-4">
      <Sidebar />
      <main className="flex-1 min-w-0 px-2 lg:px-6 py-2">{children}</main>
    </div>
  );
}
