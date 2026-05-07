"use client";

import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useAuth } from "@/lib/auth-context";
import { uploadAvatarToCloudinary } from "@/lib/api";
import { getInitials } from "@/lib/user-utils";

const PLANS: Array<{ id: "free" | "pro" | "premium"; label: string; blurb: string }> = [
  { id: "free",    label: "Free",    blurb: "Solo workflows, basic tasks." },
  { id: "pro",     label: "Pro",     blurb: "Team boards, deadlines, activity feed." },
  { id: "premium", label: "Premium", blurb: "AI summaries, advanced analytics, SSO." },
];

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!user) return null;

  const onSave = async () => {
    setSaving(true); setError(null); setSuccess(null);
    try {
      await updateProfile({ name: name.trim() });
      setSuccess("Profile updated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    } finally { setSaving(false); }
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError(null); setSuccess(null);
    try {
      const url = await uploadAvatarToCloudinary(file);
      await updateProfile({ avatar_url: url });
      setSuccess("Avatar updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const onPlan = async (plan: "free" | "pro" | "premium") => {
    setSaving(true); setError(null); setSuccess(null);
    try {
      await updateProfile({ plan });
      setSuccess(`Switched to ${plan}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally { setSaving(false); }
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your profile, avatar, and plan." />

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Avatar card */}
        <section className="rounded-2xl bg-card border border-border/60 p-6 shadow-[var(--shadow-card)] flex flex-col items-center text-center gap-4">
          <div className="size-28 rounded-full bg-[oklch(0.88_0.06_285)] grid place-items-center text-xl font-semibold text-[oklch(0.35_0.15_285)] overflow-hidden">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt={user.name} className="size-full object-cover" />
            ) : getInitials(user.name, user.email)}
          </div>
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <label className="inline-flex items-center gap-2 px-4 h-10 rounded-full bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:opacity-90 disabled:opacity-50">
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {uploading ? "Uploading…" : "Upload avatar"}
            <input type="file" accept="image/*" onChange={onUpload} className="hidden" disabled={uploading} />
          </label>
          <p className="text-[11px] text-muted-foreground">Stored on Cloudinary; URL saved to your profile.</p>
        </section>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl bg-card border border-border/60 p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-lg font-semibold mb-4">Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium">Display name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80}
                  className="h-11 px-4 rounded-xl bg-background border border-border/60 text-sm outline-none focus:border-ring" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium">Email</span>
                <input value={user.email} disabled
                  className="h-11 px-4 rounded-xl bg-muted/50 border border-border/60 text-sm text-muted-foreground" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium">Role</span>
                <input value={user.role} disabled
                  className="h-11 px-4 rounded-xl bg-muted/50 border border-border/60 text-sm text-muted-foreground capitalize" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium">Member since</span>
                <input value={new Date(user.created_at).toLocaleDateString()} disabled
                  className="h-11 px-4 rounded-xl bg-muted/50 border border-border/60 text-sm text-muted-foreground" />
              </label>
            </div>
            <div className="flex items-center gap-3 mt-5">
              <button onClick={onSave} disabled={saving || !name.trim() || name === user.name}
                className="h-10 px-5 rounded-full bg-[image:var(--gradient-primary)] text-white text-sm font-medium disabled:opacity-50">
                {saving ? "Saving…" : "Save changes"}
              </button>
              {success && <p className="text-xs text-[oklch(0.5_0.13_160)]">{success}</p>}
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
          </section>

          <section className="rounded-2xl bg-card border border-border/60 p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-lg font-semibold mb-4">Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PLANS.map((p) => {
                const active = user.plan === p.id;
                return (
                  <button key={p.id} onClick={() => onPlan(p.id)} disabled={active || saving}
                    className={`text-left rounded-2xl border p-4 transition ${
                      active
                        ? "border-primary bg-[image:var(--gradient-soft)]"
                        : "border-border/60 hover:border-primary/40"
                    }`}>
                    <p className="font-semibold">{p.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{p.blurb}</p>
                    <p className={`text-[11px] mt-2 font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
                      {active ? "Current plan" : "Switch"}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
