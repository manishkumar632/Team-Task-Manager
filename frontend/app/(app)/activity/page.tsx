"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { api, type Activity } from "@/lib/api";
import { memberInitials, relativeTime } from "@/lib/format";

export default function ActivityPage() {
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listActivity(100).then(setItems).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader title="Activity Timeline" subtitle="Everything that happened across the workspace." />
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
          No activity yet — create projects and tasks to see updates here.
        </div>
      ) : (
        <ol className="relative pl-6 border-l border-border/60 flex flex-col gap-5">
          {items.map((a) => (
            <li key={a.id} className="relative">
              <span className="absolute -left-[31px] top-1 size-3 rounded-full bg-primary ring-4 ring-background" />
              <div className="rounded-2xl bg-card border border-border/60 p-4 shadow-[var(--shadow-card)] flex items-start gap-3">
                <div className="size-9 rounded-full bg-[oklch(0.92_0.04_285)] text-[oklch(0.35_0.15_285)] grid place-items-center text-xs font-semibold overflow-hidden shrink-0">
                  {a.actor.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.actor.avatar_url} alt={a.actor.name} className="size-full object-cover" />
                  ) : memberInitials(a.actor)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{a.actor.name}</span>{" "}
                    <span className="text-muted-foreground">{a.message}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{relativeTime(a.created_at)} ago</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
