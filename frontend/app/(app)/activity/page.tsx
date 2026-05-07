"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, Loader2, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { api, type Activity } from "@/lib/api";
import { memberInitials, relativeTime } from "@/lib/format";
import { Select } from "@/components/ui/select";

const PAGE_SIZE = 25;
const VERBS: { value: string; label: string }[] = [
  { value: "", label: "All actions" },
  { value: "created", label: "Created" },
  { value: "updated", label: "Updated" },
  { value: "completed", label: "Completed" },
  { value: "moved", label: "Moved" },
  { value: "deleted", label: "Deleted" },
];

export default function ActivityPage() {
  const [items, setItems] = useState<Activity[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [verb, setVerb] = useState("");
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // debounce search
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(id);
  }, [query]);

  const fetchPage = useCallback(
    async (opts: { reset?: boolean; before?: string | null } = {}) => {
      const isReset = opts.reset ?? true;
      if (isReset) setLoading(true);
      else setLoadingMore(true);
      setError(null);
      try {
        const res = await api.listActivityPage({
          limit: PAGE_SIZE,
          before: opts.before ?? undefined,
          q: debounced || undefined,
          verb: verb || undefined,
        });
        setItems((prev) => (isReset ? res.activity : [...prev, ...res.activity]));
        setCursor(res.nextCursor);
        setHasMore(!!res.nextCursor);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load activity");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [debounced, verb]
  );

  // initial + filter changes
  useEffect(() => {
    fetchPage({ reset: true });
  }, [fetchPage]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && cursor) {
          fetchPage({ reset: false, before: cursor });
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loading, loadingMore, cursor, fetchPage]);

  const grouped = useMemo(() => {
    const groups: { label: string; items: Activity[] }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const labelFor = (iso: string) => {
      const d = new Date(iso);
      d.setHours(0, 0, 0, 0);
      if (d.getTime() === today.getTime()) return "Today";
      if (d.getTime() === yesterday.getTime()) return "Yesterday";
      return new Date(iso).toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: d.getFullYear() === today.getFullYear() ? undefined : "numeric",
      });
    };
    for (const a of items) {
      const lbl = labelFor(a.created_at);
      const last = groups[groups.length - 1];
      if (last && last.label === lbl) last.items.push(a);
      else groups.push({ label: lbl, items: [a] });
    }
    return groups;
  }, [items]);

  return (
    <>
      <PageHeader
        title="Activity Timeline"
        subtitle="Everything that happened across the workspace."
        action={
          <button
            onClick={() => fetchPage({ reset: true })}
            disabled={loading}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-border/60 text-sm hover:bg-muted disabled:opacity-50"
            aria-label="Refresh"
            title="Refresh"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        }
      />

      <div className="mb-5 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search activity…"
            className="w-full h-11 pl-10 pr-4 rounded-full bg-card border border-border/60 text-sm outline-none focus:border-ring"
          />
        </div>
        <Select
          className="sm:w-48"
          variant="pill"
          value={verb}
          onChange={setVerb}
          options={VERBS}
          ariaLabel="Filter by action"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => fetchPage({ reset: true })} className="underline text-xs">Retry</button>
        </div>
      )}

      {loading ? (
        <ul className="flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="rounded-2xl bg-card border border-border/60 p-4 animate-pulse h-20" />
          ))}
        </ul>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
          {debounced || verb
            ? "No activity matches your filters."
            : "No activity yet — create projects and tasks to see updates here."}
        </div>
      ) : (
        <>
          {grouped.map((g) => (
            <section key={g.label} className="mb-6">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 sticky top-0 bg-background/80 backdrop-blur py-1 z-10">
                {g.label}
              </h2>
              <ol className="relative pl-6 border-l border-border/60 flex flex-col gap-4">
                {g.items.map((a) => (
                  <li key={a.id} className="relative">
                    <span className="absolute -left-[31px] top-2 size-3 rounded-full bg-primary ring-4 ring-background" />
                    <div className="rounded-2xl bg-card border border-border/60 p-4 shadow-[var(--shadow-card)] flex items-start gap-3">
                      <div className="size-9 rounded-full bg-[oklch(0.92_0.04_285)] text-[oklch(0.35_0.15_285)] grid place-items-center text-xs font-semibold overflow-hidden shrink-0">
                        {a.actor?.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.actor.avatar_url} alt={a.actor.name} className="size-full object-cover" />
                        ) : (
                          a.actor ? memberInitials(a.actor) : "?"
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm break-words">
                          <span className="font-medium">{a.actor?.name ?? "Someone"}</span>{" "}
                          <span className="text-muted-foreground">{a.message}</span>
                        </p>
                        <p
                          className="text-[11px] text-muted-foreground mt-0.5"
                          title={new Date(a.created_at).toLocaleString()}
                        >
                          {relativeTime(a.created_at)} ago
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}

          <div ref={sentinelRef} />
          {loadingMore && (
            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground gap-2">
              <Loader2 className="size-4 animate-spin" /> Loading more…
            </div>
          )}
          {!hasMore && items.length > PAGE_SIZE && (
            <p className="text-center text-xs text-muted-foreground py-6">You&apos;ve reached the end.</p>
          )}
          {hasMore && !loadingMore && (
            <div className="flex justify-center py-6">
              <button
                onClick={() => cursor && fetchPage({ reset: false, before: cursor })}
                className="h-10 px-5 rounded-full border border-border/60 text-sm hover:bg-muted"
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
