"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { api, type TeamMember } from "@/lib/api";
import { memberInitials } from "@/lib/format";

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listTeam().then(setMembers).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader title="Team Members" subtitle="Everyone in your workspace." />
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {members.map((m) => (
            <div key={m.id} className="rounded-2xl bg-card border border-border/60 p-5 shadow-[var(--shadow-card)] flex items-center gap-4">
              <div className="size-14 rounded-full bg-[oklch(0.88_0.06_285)] grid place-items-center text-sm font-semibold text-[oklch(0.35_0.15_285)] overflow-hidden">
                {m.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.avatar_url} alt={m.name} className="size-full object-cover" />
                ) : memberInitials(m)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{m.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{m.email}</p>
                <p className="text-[11px] mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                    {m.role}
                  </span>
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p><span className="font-semibold text-foreground">{m.open_tasks}</span> open</p>
                <p><span className="font-semibold text-foreground">{m.done_tasks}</span> done</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
